/**
 * Product Search Edge Function for Lorem Curae
 *
 * Proxies Serper.dev API to search Google Shopping and Google Search
 * for skincare products and reviews. Returns structured WebProduct[]
 * or WebReview[] data.
 *
 * Three search types:
 * - "compatible": Google Shopping for products compatible with a scanned product
 * - "similar": Google Shopping for alternatives to a scanned product
 * - "reviews": Google Search for review snippets of a specific product
 *
 * Features:
 * - 24h server-side caching via web_search_cache table
 * - Query hash deduplication (SHA-256)
 * - Auth required (consistent with other AI Edge Functions)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SERPER_API_URL_SHOPPING = 'https://google.serper.dev/shopping';
const SERPER_API_URL_SEARCH = 'https://google.serper.dev/search';
const CACHE_TTL_HOURS = 24;

// ---------------------------------------------------------------------------
// Types (server-side — mirrors src/types/webSearch.ts shapes)
// ---------------------------------------------------------------------------

interface SearchRequest {
  type: 'compatible' | 'similar' | 'reviews' | 'retailer_reviews' | 'buy';
  scannedProduct?: {
    name: string;
    brand: string;
    category: string;
    ingredients?: string[];
  };
  userProfile?: {
    skinType?: string;
    concerns?: string[];
    sensitivity?: string;
  };
  categoryFilter?: string;
  productName?: string;
  productBrand?: string;
  retailerDomain?: string;
}

interface WebProduct {
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  externalUrl: string;
  merchant: string;
  category: string;
  source: 'web';
}

interface WebReview {
  content: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  date?: string;
  extractedRating?: number;
  relevanceScore: number;
}

// ---------------------------------------------------------------------------
// Utility: SHA-256 hash for cache keys
// ---------------------------------------------------------------------------

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Utility: Infer product category from title keywords
// ---------------------------------------------------------------------------

function inferCategoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('eye cream') || t.includes('eye gel') || t.includes('eye serum') || t.includes('eye care') || t.includes('under eye')) return 'eye cream';
  if (t.includes('sunscreen') || t.includes('sun screen') || /\bspf\s*\d/.test(t) || t.includes('sun protection') || t.includes('uv protect')) return 'sunscreen';
  if (t.includes('mask') || t.includes('masque') || t.includes('sheet mask') || t.includes('clay mask')) return 'mask';
  if (t.includes('cleanser') || t.includes('face wash') || t.includes('cleansing foam') || t.includes('cleansing gel') || t.includes('facial wash') || t.includes('micellar')) return 'cleanser';
  if (t.includes('toner') || t.includes('toning water') || t.includes('facial mist')) return 'toner';
  if (t.includes('serum') || t.includes('ampoule')) return 'serum';
  if (t.includes('moisturizer') || t.includes('moisturiser') || t.includes('face cream') || t.includes('day cream') || t.includes('night cream') || t.includes('hydrating cream') || t.includes('face lotion')) return 'moisturizer';
  return 'treatment';
}

// ---------------------------------------------------------------------------
// Utility: Extract domain from URL
// ---------------------------------------------------------------------------

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// Utility: Parse price string to number
// ---------------------------------------------------------------------------

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ---------------------------------------------------------------------------
// Utility: Parse brand from product title
// ---------------------------------------------------------------------------

function parseBrand(title: string, merchant: string): string {
  // Common pattern: "BrandName ProductName - Size"
  // Try to extract brand as the first word or known segment
  const cleaned = title.replace(/\s*-\s*.*$/, '').trim();
  const words = cleaned.split(/\s+/);

  // If first word is capitalized and short-ish, likely a brand
  if (words.length > 1 && words[0].length <= 20) {
    // Check for multi-word brands (e.g., "La Roche-Posay", "The Ordinary")
    if (words[0] === 'The' || words[0] === 'La' || words[0] === 'Dr.') {
      return words.slice(0, 2).join(' ');
    }
    return words[0];
  }

  return merchant || 'Unknown';
}

// ---------------------------------------------------------------------------
// Utility: Clean product title (strip merchant suffix, sizes, etc.)
// ---------------------------------------------------------------------------

function cleanProductTitle(title: string): string {
  return title
    .replace(/\s*[-–|]\s*(Amazon|Walmart|Target|Sephora|Ulta|CVS|Walgreens).*$/i, '')
    .replace(/\s*,\s*\d+(\.\d+)?\s*(oz|ml|fl\s*oz|g)\b.*$/i, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Utility: Extract rating from review snippet
// ---------------------------------------------------------------------------

function extractRating(text: string): number | undefined {
  // Match patterns like "4.5/5", "4.5 out of 5", "4.5 stars", "★★★★☆"
  const patterns = [
    /(\d\.?\d?)\s*\/\s*5/,
    /(\d\.?\d?)\s*out\s*of\s*5/i,
    /(\d\.?\d?)\s*stars?/i,
    /rating[:\s]*(\d\.?\d?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const rating = parseFloat(match[1]);
      if (rating >= 1 && rating <= 5) return rating;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Utility: Score review relevance against user profile
// ---------------------------------------------------------------------------

function scoreReviewRelevance(
  snippet: string,
  title: string,
  userProfile?: { skinType?: string; concerns?: string[]; sensitivity?: string },
): number {
  if (!userProfile) return 50; // neutral score without profile

  const text = `${title} ${snippet}`.toLowerCase();
  let score = 30; // base

  // Skin type match
  if (userProfile.skinType) {
    const skinLower = userProfile.skinType.toLowerCase();
    if (text.includes(skinLower)) score += 25;
    // Partial matches (e.g., "oily" in "oily-combination")
    if (skinLower === 'combination' && (text.includes('combo') || text.includes('combination'))) score += 25;
  }

  // Concern matches
  if (userProfile.concerns) {
    for (const concern of userProfile.concerns) {
      if (text.includes(concern.toLowerCase())) score += 15;
    }
  }

  // Sensitivity match
  if (userProfile.sensitivity === 'high' || userProfile.sensitivity === 'very high') {
    if (text.includes('sensitive')) score += 10;
  }

  // Bonus for review-quality indicators
  if (text.includes('review') || text.includes('tried') || text.includes('experience')) score += 5;
  if (text.includes('before and after') || text.includes('results')) score += 5;

  return Math.min(score, 100);
}

// ---------------------------------------------------------------------------
// Query builders
// ---------------------------------------------------------------------------

function buildCompatibleQuery(req: SearchRequest): string {
  const parts: string[] = [];

  if (req.categoryFilter && req.categoryFilter !== 'all') {
    parts.push(req.categoryFilter);
  } else if (req.scannedProduct?.category) {
    parts.push('skincare');
  }

  if (req.userProfile?.skinType) {
    parts.push(`for ${req.userProfile.skinType} skin`);
  }

  if (req.userProfile?.concerns?.length) {
    parts.push(req.userProfile.concerns.slice(0, 2).join(' '));
  }

  // Fallback if no personalization data
  if (parts.length === 0 && req.scannedProduct) {
    parts.push(`skincare compatible with ${req.scannedProduct.name}`);
  }

  return parts.join(' ').trim();
}

function buildSimilarQuery(req: SearchRequest): string {
  if (!req.scannedProduct) return 'skincare products';

  const { brand, name } = req.scannedProduct;
  return `products similar to ${brand} ${name}`;
}

function buildReviewQuery(req: SearchRequest): string {
  const product = req.productName || req.scannedProduct?.name || '';
  const brand = req.productBrand || req.scannedProduct?.brand || '';
  const parts = [`${brand} ${product} review`.trim()];

  if (req.userProfile?.skinType) {
    parts.push(`${req.userProfile.skinType} skin`);
  }

  return parts.join(' ');
}

function buildBuyQuery(req: SearchRequest): string {
  const product = req.productName || req.scannedProduct?.name || '';
  const brand = req.productBrand || req.scannedProduct?.brand || '';
  const query = `${brand} ${product}`.trim();
  return query || 'skincare product';
}

function buildRetailerReviewQuery(req: SearchRequest): string {
  const product = req.productName || req.scannedProduct?.name || '';
  const brand = req.productBrand || req.scannedProduct?.brand || '';
  const parts = [`${brand} ${product} review`.trim()];

  if (req.userProfile?.skinType) {
    parts.push(`${req.userProfile.skinType} skin`);
  }

  // site: restriction to the specific retailer domain
  if (req.retailerDomain) {
    parts.push(`site:${req.retailerDomain}`);
  }

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Serper API callers
// ---------------------------------------------------------------------------

async function callSerperShopping(
  query: string,
  apiKey: string,
  num = 10,
): Promise<{ shopping: Array<Record<string, unknown>> } | null> {
  try {
    const response = await fetch(SERPER_API_URL_SHOPPING, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'us', num }),
    });

    if (!response.ok) {
      console.error('[product-search] Serper Shopping error:', response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[product-search] Serper Shopping call failed:', error);
    return null;
  }
}

async function callSerperSearch(
  query: string,
  apiKey: string,
  num = 10,
): Promise<{ organic: Array<Record<string, unknown>> } | null> {
  try {
    const response = await fetch(SERPER_API_URL_SEARCH, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, gl: 'us', num }),
    });

    if (!response.ok) {
      console.error('[product-search] Serper Search error:', response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[product-search] Serper Search call failed:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Result mappers
// ---------------------------------------------------------------------------

function mapShoppingResults(
  items: Array<Record<string, unknown>>,
  category: string | null,
): WebProduct[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .filter(item => item.title && item.link)
    .map(item => {
      const title = String(item.title || '');
      const merchant = String(item.source || '');

      return {
        name: cleanProductTitle(title),
        brand: parseBrand(title, merchant),
        price: parsePrice(String(item.price || '')),
        image: String(item.imageUrl || ''),
        rating: typeof item.rating === 'number' ? item.rating : 0,
        reviewCount: typeof item.ratingCount === 'number' ? item.ratingCount : 0,
        externalUrl: String(item.link || ''),
        merchant,
        category: category ?? inferCategoryFromTitle(title),
        source: 'web' as const,
      };
    })
    .filter(p => p.name.length > 0);
}

function mapSearchResults(
  items: Array<Record<string, unknown>>,
  userProfile?: SearchRequest['userProfile'],
): WebReview[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .filter(item => item.snippet && item.link)
    .map(item => {
      const snippet = String(item.snippet || '');
      const title = String(item.title || '');
      const link = String(item.link || '');

      return {
        content: snippet,
        sourceUrl: link,
        sourceTitle: title,
        sourceDomain: extractDomain(link),
        date: item.date ? String(item.date) : undefined,
        extractedRating: extractRating(`${title} ${snippet}`),
        relevanceScore: scoreReviewRelevance(snippet, title, userProfile),
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ---------------------------------------------------------------------------
// Cache layer
// ---------------------------------------------------------------------------

async function getCachedResults(
  supabase: ReturnType<typeof createClient>,
  queryHash: string,
): Promise<{ results: unknown; found: boolean }> {
  try {
    const { data, error } = await supabase
      .from('web_search_cache')
      .select('results, created_at')
      .eq('query_hash', queryHash)
      .single();

    if (error || !data) return { results: null, found: false };

    // Check TTL
    const createdAt = new Date(data.created_at);
    const age = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    if (age > CACHE_TTL_HOURS) {
      // Stale — delete and return miss
      await supabase.from('web_search_cache').delete().eq('query_hash', queryHash);
      return { results: null, found: false };
    }

    return { results: data.results, found: true };
  } catch {
    return { results: null, found: false };
  }
}

async function setCachedResults(
  supabase: ReturnType<typeof createClient>,
  queryHash: string,
  searchType: string,
  queryText: string,
  results: unknown,
): Promise<void> {
  try {
    const resultArray = Array.isArray(results) ? results : [];
    await supabase.from('web_search_cache').upsert({
      query_hash: queryHash,
      search_type: searchType,
      query_text: queryText,
      results: resultArray,
      result_count: resultArray.length,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[product-search] Cache write failed:', error);
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    // Auth check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Parse request
    const body: SearchRequest = await req.json();

    if (!body.type || !['compatible', 'similar', 'reviews', 'retailer_reviews', 'buy'].includes(body.type)) {
      return new Response(
        JSON.stringify({ error: `Invalid search type: "${body.type}"` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Serper API key
    const serperKey = Deno.env.get('SERPER_API_KEY');
    if (!serperKey) {
      console.error('[product-search] SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, type: body.type, error: 'Search service not configured', cached: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Service role client for cache operations (bypasses RLS)
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Build query
    let query: string;
    switch (body.type) {
      case 'compatible':
        query = buildCompatibleQuery(body);
        break;
      case 'similar':
        query = buildSimilarQuery(body);
        break;
      case 'reviews':
        query = buildReviewQuery(body);
        break;
      case 'retailer_reviews':
        query = buildRetailerReviewQuery(body);
        break;
      case 'buy':
        query = buildBuyQuery(body);
        break;
    }

    console.log(`[product-search] ${body.type} query: "${query}"`);
    const t0 = Date.now();

    // Check cache
    const cacheKey = await sha256(`${body.type}:${query}`);
    const cached = await getCachedResults(supabaseService, cacheKey);
    console.log(`[product-search] Cache check: ${Date.now() - t0}ms (hit: ${cached.found})`);

    if (cached.found) {

      const response: Record<string, unknown> = {
        success: true,
        type: body.type,
        cached: true,
      };

      if (body.type === 'reviews' || body.type === 'retailer_reviews') {
        response.reviews = cached.results;
      } else {
        response.products = cached.results;
      }

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Call Serper
    const t1 = Date.now();
    let results: WebProduct[] | WebReview[];

    // Use fewer results for retailer reviews (5 is plenty for per-site search)
    const numResults = body.type === 'retailer_reviews' ? 5 : body.type === 'similar' ? 8 : body.type === 'buy' ? 15 : body.type === 'compatible' ? 20 : 10;

    if (body.type === 'reviews' || body.type === 'retailer_reviews') {
      const serperData = await callSerperSearch(query, serperKey, numResults);
      if (!serperData) {
        return new Response(
          JSON.stringify({ success: false, type: body.type, error: 'Search service unavailable', cached: false }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      results = mapSearchResults(serperData.organic || [], body.userProfile);
    } else {
      // Explicit filter → stamp all results with that category.
      // No filter ('all') → infer category per product from title.
      const categoryOverride = body.categoryFilter && body.categoryFilter !== 'all'
        ? body.categoryFilter
        : null;

      const serperData = await callSerperShopping(query, serperKey, numResults);
      if (!serperData) {
        return new Response(
          JSON.stringify({ success: false, type: body.type, error: 'Search service unavailable', cached: false }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      results = mapShoppingResults(serperData.shopping || [], categoryOverride);
    }
    console.log(`[product-search] Serper call: ${Date.now() - t1}ms (${results.length} results)`);

    // Write to cache (fire-and-forget)
    setCachedResults(supabaseService, cacheKey, body.type, query, results).catch(() => {});

    // Return results
    const response: Record<string, unknown> = {
      success: true,
      type: body.type,
      cached: false,
    };

    if (body.type === 'reviews' || body.type === 'retailer_reviews') {
      response.reviews = results;
    } else {
      response.products = results;
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[product-search] Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

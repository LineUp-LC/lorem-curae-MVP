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
const CACHE_TTL_HOURS_REVIEWS = 24;
const CACHE_TTL_HOURS_SHOPPING = 168; // 7 days for product metadata
const PRODUCT_CACHE_TTL_DAYS = 7;

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
  inStock?: boolean;
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
// Utility: Normalize a brand/merchant name to a comparable slug
// ---------------------------------------------------------------------------

function normalizeNameSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // strip spaces, apostrophes, hyphens, etc.
}

// ---------------------------------------------------------------------------
// Utility: Resolve brand homepage URL from brand name
// ---------------------------------------------------------------------------

// Overrides for brands whose normalized slug doesn't match their real domain
const BRAND_DOMAIN_OVERRIDES: Record<string, string> = {
  'larochemposay': 'laroche-posay.us',
  'loreal':        'lorealparisusa.com',
  'lorealparis':   'lorealparisusa.com',
};

function getBrandUrl(brand: string): string {
  const slug = normalizeNameSlug(brand);
  const domain = BRAND_DOMAIN_OVERRIDES[slug] ?? `${slug}.com`;
  return `https://www.${domain}`;
}

// Mass-market brands distributed primarily through retailers — no meaningful DTC store.
// Products from these brands will NOT show a "View on [Brand]" CTA.
const RETAILER_ONLY_BRANDS = new Set([
  'neutrogena', 'cerave', 'aveeno', 'olay', 'garnier',
  'dove', 'nivea', 'vaseline', 'ponds', 'cleanandclear',
  'stives', 'lubriderm', 'eucerin', 'aquaphor', 'jergens',
  'loreal', 'lorealparis', 'maybelline', 'covergirl', 'revlon',
  'elf', 'e.l.f', 'nyx',
]);

// ---------------------------------------------------------------------------
// Utility: Parse brand from product title
// ---------------------------------------------------------------------------

// Explicitly known multi-word brands that the heuristic would miss
const MULTI_WORD_BRANDS = [
  'Youth To The People',
  'Drunk Elephant',
  'Sunday Riley',
  'Peter Thomas Roth',
  'First Aid Beauty',
  'One Love Organics',
  'Tatcha',
  'Fresh',
  'Allies of Skin',
  'Alpha-H',
];

// Words that appear in product names, not brand names — heuristic stops here
const PRODUCT_NAME_WORDS = new Set([
  'Serum', 'Cream', 'Moisturizer', 'Cleanser', 'Toner', 'Mask', 'Oil',
  'Lotion', 'Gel', 'Foam', 'Balm', 'Mist', 'Spray', 'Essence', 'Ampoule',
  'Treatment', 'Sunscreen', 'Spf', 'Retinol', 'Vitamin', 'Hyaluronic',
  'Niacinamide', 'Peptide', 'Exfoliant', 'Scrub', 'Peel', 'Brightening',
  'Hydrating', 'Anti', 'Daily', 'Night', 'Day', 'Eye', 'Face', 'Skin',
  'Advanced', 'Ultra', 'Super', 'Intense', 'Rich', 'Gentle', 'Soothing',
]);

function parseBrand(title: string, merchant: string): string {
  const cleaned = title.replace(/\s*-\s*.*$/, '').trim();

  // Check explicit multi-word brand list first (case-insensitive prefix match)
  for (const brand of MULTI_WORD_BRANDS) {
    if (cleaned.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }

  const words = cleaned.split(/\s+/);
  if (words.length < 2) return merchant || 'Unknown';

  // "The X", "La X", "Dr. X" — 2-word brand
  if (words[0] === 'The' || words[0] === 'La' || words[0] === 'Dr.' || words[0] === 'Le') {
    return words.slice(0, 2).join(' ');
  }

  // Heuristic: if second word is Title Case and not a product descriptor, treat first two as brand
  const second = words[1];
  if (
    second.length > 1 &&
    second[0] === second[0].toUpperCase() &&
    second[0] !== second[0].toLowerCase() &&
    !PRODUCT_NAME_WORDS.has(second)
  ) {
    return words.slice(0, 2).join(' ');
  }

  return words[0].length <= 20 ? words[0] : (merchant || 'Unknown');
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
  // Strip brand prefix when productName already leads with it (compatible search names include brand)
  const cleanProduct = brand && product.toLowerCase().startsWith(brand.toLowerCase())
    ? product.slice(brand.length).trim()
    : product;
  const query = `${brand} ${cleanProduct}`.trim();
  return query ? `buy ${query}` : 'buy skincare product';
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
// Utility: Infer stock status from Serper delivery field + title
// ---------------------------------------------------------------------------

const OUT_OF_STOCK_PATTERNS = /\b(out of stock|sold out|unavailable|discontinued|back\s*order)\b/i;

function inferStockStatus(delivery?: string, title?: string): boolean | undefined {
  // Check title for explicit out-of-stock signals (e.g. "Sold Out" in product title)
  if (title && OUT_OF_STOCK_PATTERNS.test(title)) return false;
  if (!delivery) return undefined;
  // Check delivery field for out-of-stock signals
  if (OUT_OF_STOCK_PATTERNS.test(delivery)) return false;
  // Delivery field contains price, date, or "free" → in stock
  if (/(\$|free|delivery|shipping|\d+\s*(day|business))/i.test(delivery)) return true;
  return undefined; // unknown
}

// ---------------------------------------------------------------------------
// Result mappers
// ---------------------------------------------------------------------------

function mapShoppingResults(
  items: Array<Record<string, unknown>>,
  category: string | null,
  preserveRetailerLinks = false,
): WebProduct[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .filter(item => item.title && item.link)
    .map(item => {
      const title = String(item.title || '');
      const merchant = String(item.source || '');
      const delivery = item.delivery ? String(item.delivery) : undefined;

      const brand = parseBrand(title, merchant);
      const isBrandDirect = !preserveRetailerLinks && !RETAILER_ONLY_BRANDS.has(normalizeNameSlug(brand));
      return {
        name: cleanProductTitle(title),
        brand,
        price: parsePrice(String(item.price || '')),
        image: String(item.imageUrl || ''),
        rating: typeof item.rating === 'number' ? item.rating : 0,
        reviewCount: typeof item.ratingCount === 'number' ? item.ratingCount : 0,
        externalUrl: isBrandDirect ? getBrandUrl(brand) : String(item.link || ''),
        merchant,
        category: category ?? inferCategoryFromTitle(title),
        source: 'web' as const,
        inStock: inferStockStatus(delivery, title),
        isBrandDirect,
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
  searchType: string,
): Promise<{ results: unknown; found: boolean }> {
  try {
    const { data, error } = await supabase
      .from('web_search_cache')
      .select('results, created_at')
      .eq('query_hash', queryHash)
      .single();

    if (error || !data) return { results: null, found: false };

    // Type-aware TTL: 7 days for shopping results, 24h for reviews
    const ttlHours = (searchType === 'reviews' || searchType === 'retailer_reviews')
      ? CACHE_TTL_HOURS_REVIEWS
      : CACHE_TTL_HOURS_SHOPPING;

    const createdAt = new Date(data.created_at);
    const age = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    if (age > ttlHours) {
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
// Write-through: upsert Serper shopping results into products + retailers
// ---------------------------------------------------------------------------

function generateSlug(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

async function upsertProductsFromShopping(
  supabase: ReturnType<typeof createClient>,
  products: WebProduct[],
  query: string,
): Promise<void> {
  if (!products.length) return;

  let written = 0;
  let failed = 0;

  try {
    for (const wp of products) {
      if (!wp.brand || !wp.name || !wp.merchant) continue;

      try {
        const slug = generateSlug(wp.brand, wp.name);

        // Upsert product (dedup on brand+name via slug uniqueness)
        // Omit hit_count from upsert so it's not reset on conflict (defaults to 0 on insert)
        const { data: productRow, error: pErr } = await supabase
          .from('products')
          .upsert(
            {
              slug,
              name: wp.name,
              brand: wp.brand,
              category: wp.category || 'treatment',
              price: wp.price || 0,
              rating: wp.rating || 0,
              review_count: wp.reviewCount || 0,
              image: wp.image || '',
              source: 'serper',
              status: 'published',
              search_query: query,
              serper_last_fetched_at: new Date().toISOString(),
            },
            { onConflict: 'slug' },
          )
          .select('id, hit_count')
          .single();

        if (pErr || !productRow) { failed++; continue; }

        // Increment hit_count (Supabase JS can't do SQL expressions, so read+write)
        supabase
          .from('products')
          .update({ hit_count: (productRow.hit_count || 0) + 1 })
          .eq('id', productRow.id)
          .then(() => {})
          .catch((err: Error) => console.warn(`[product-search] hit_count increment failed for ${slug}:`, err?.message));

        const productId = productRow.id;

        // Upsert retailer (dedup on merchant slug)
        const retailerSlug = wp.merchant
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: retailerRow, error: rErr } = await supabase
          .from('retailers')
          .upsert(
            { slug: retailerSlug, name: wp.merchant },
            { onConflict: 'slug' },
          )
          .select('id')
          .single();

        if (rErr || !retailerRow) { failed++; continue; }

        // Upsert retailer price (use parsed stock status, default true for unknown)
        await supabase
          .from('retailer_prices')
          .upsert(
            {
              product_id: productId,
              retailer_id: retailerRow.id,
              price: wp.price || 0,
              shipping_cost: 0,
              total_price: wp.price || 0,
              in_stock: wp.inStock ?? true,
              url: wp.externalUrl || '',
              source: 'serper',
              source_query: query,
              last_updated: new Date().toISOString(),
            },
            { onConflict: 'product_id,retailer_id' },
          );

        written++;
      } catch {
        failed++;
      }
    }

    if (written > 0 || failed > 0) {
      console.log(`[product-search] Write-through: ${written} upserted, ${failed} failed`);
    }
  } catch (error) {
    console.error('[product-search] Write-through failed:', error);
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
    const cached = await getCachedResults(supabaseService, cacheKey, body.type);
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
    const numResults = body.type === 'retailer_reviews' ? 5 : body.type === 'similar' ? 8 : body.type === 'buy' ? 30 : body.type === 'compatible' ? 20 : 10;

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
      results = mapShoppingResults(serperData.shopping || [], categoryOverride, body.type === 'buy');

      // Write-through: upsert shopping results into products + retailers tables (fire-and-forget)
      upsertProductsFromShopping(supabaseService, results as WebProduct[], query).catch(() => {});
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

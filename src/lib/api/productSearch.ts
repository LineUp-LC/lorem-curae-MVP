/**
 * Product Search Client
 *
 * Client-side caller for the product-search Edge Function.
 * Three functions: compatible products, similar products, reviews.
 *
 * - Auth required (guest users get null — caller should fall back to local catalog)
 * - Client-side rate limiting: max 10 calls per scan session
 * - Results cached in-memory per session (no localStorage)
 */

import { supabase } from '../supabase-browser';
import type {
  WebProduct,
  WebReview,
  WebSearchRequest,
  WebSearchResponse,
} from '../../types/webSearch';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PRODUCT_SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-search`;

/** Max Serper calls per scan session (client-side enforcement) */
const MAX_CALLS_PER_SESSION = 10;

// ---------------------------------------------------------------------------
// Session-level state
// ---------------------------------------------------------------------------

let sessionCallCount = 0;

/** In-memory cache: cacheKey → result */
const sessionCache = new Map<string, WebSearchResponse>();

/** Reset call counter (call when starting a new scan) */
export function resetSearchSession(): void {
  sessionCallCount = 0;
  sessionCache.clear();
}

// ---------------------------------------------------------------------------
// Core caller
// ---------------------------------------------------------------------------

async function callProductSearch(body: WebSearchRequest): Promise<WebSearchResponse> {
  // Rate limit check
  if (sessionCallCount >= MAX_CALLS_PER_SESSION) {
    return {
      success: false,
      type: body.type,
      cached: false,
      error: 'Search limit reached for this session',
    };
  }

  // Auth check — retry once after 1s if session not yet hydrated
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    await new Promise(r => setTimeout(r, 1000));
    ({ data: { session } } = await supabase.auth.getSession());
  }
  if (!session?.access_token) {
    console.warn('[WebSearch] Auth check failed — no session after retry');
    return {
      success: false,
      type: body.type,
      cached: false,
      error: 'Authentication required',
    };
  }

  // Build cache key from request params
  const cacheKey = JSON.stringify(body);
  const cached = sessionCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // Call Edge Function
  sessionCallCount++;

  try {
    console.log('[WebSearch] Calling Edge Function:', PRODUCT_SEARCH_URL, 'body:', JSON.stringify(body));
    const response = await fetch(PRODUCT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    console.log('[WebSearch] Response status:', response.status, 'ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[productSearch] Edge Function error:', response.status, errorText);

      // Don't count auth failures against rate limit
      if (response.status === 401) sessionCallCount--;

      return {
        success: false,
        type: body.type,
        cached: false,
        error: `Search failed (${response.status})`,
      };
    }

    const data: WebSearchResponse = await response.json();
    console.log('[WebSearch] Parsed response:', JSON.stringify(data).substring(0, 500));

    // Cache successful results
    if (data.success) {
      sessionCache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error('[productSearch] Network error:', error);
    return {
      success: false,
      type: body.type,
      cached: false,
      error: 'Search service unavailable',
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for compatible products (Google Shopping).
 * Returns WebProduct[] or null on failure.
 */
export async function searchCompatibleProducts(
  scannedProduct: { name: string; brand: string; category: string; ingredients?: string[] },
  userProfile?: { skinType?: string; concerns?: string[]; sensitivity?: string },
  categoryFilter?: string,
): Promise<WebProduct[] | null> {
  const result = await callProductSearch({
    type: 'compatible',
    scannedProduct,
    userProfile,
    categoryFilter,
  });

  if (!result.success || !result.products) return null;
  return result.products;
}

/**
 * Search for similar/alternative products (Google Shopping).
 * Returns WebProduct[] or null on failure.
 */
export async function searchSimilarProducts(
  scannedProduct: { name: string; brand: string; category: string },
): Promise<WebProduct[] | null> {
  const result = await callProductSearch({
    type: 'similar',
    scannedProduct,
  });

  if (!result.success || !result.products) return null;
  return result.products;
}

/**
 * Search for product reviews (Google Search).
 * Returns WebReview[] or null on failure.
 */
export async function searchProductReviews(
  productName: string,
  productBrand: string,
  userProfile?: { skinType?: string; concerns?: string[]; sensitivity?: string },
): Promise<WebReview[] | null> {
  const result = await callProductSearch({
    type: 'reviews',
    productName,
    productBrand,
    userProfile,
  });

  if (!result.success || !result.reviews) return null;
  return result.reviews;
}

/**
 * Search for product reviews on a specific retailer site (Google Search with site: restriction).
 * Returns WebReview[] or null on failure.
 */
export async function searchRetailerReviews(
  productName: string,
  productBrand: string,
  retailerDomain: string,
  userProfile?: { skinType?: string; concerns?: string[]; sensitivity?: string },
): Promise<WebReview[] | null> {
  const result = await callProductSearch({
    type: 'retailer_reviews',
    productName,
    productBrand,
    retailerDomain,
    userProfile,
  });

  if (!result.success || !result.reviews) return null;
  return result.reviews;
}

/**
 * Get current session call count (for UI display).
 */
export function getSearchCallCount(): number {
  return sessionCallCount;
}

/**
 * Check if more search calls are available this session.
 */
export function canSearch(): boolean {
  return sessionCallCount < MAX_CALLS_PER_SESSION;
}

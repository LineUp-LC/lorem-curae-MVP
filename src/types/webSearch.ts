/**
 * Types for Serper.dev web search integration.
 *
 * WebProduct and WebReview are intentionally separate from Product and
 * ProductReview — Serper results lack structured fields (ingredients,
 * skin types, concerns) that our canonical types require.
 */

// ---------------------------------------------------------------------------
// Search request types (sent to product-search Edge Function)
// ---------------------------------------------------------------------------

export type WebSearchType = 'compatible' | 'similar' | 'reviews' | 'retailer_reviews';

export interface WebSearchRequest {
  type: WebSearchType;
  /** Scanned product info (required for compatible/similar) */
  scannedProduct?: {
    name: string;
    brand: string;
    category: string;
    ingredients?: string[];
  };
  /** User skin profile for query personalization */
  userProfile?: {
    skinType?: string;
    concerns?: string[];
    sensitivity?: string;
  };
  /** Category filter for compatible products search */
  categoryFilter?: string;
  /** Product name for review searches */
  productName?: string;
  /** Product brand for review searches */
  productBrand?: string;
  /** Retailer domain for site-restricted review searches */
  retailerDomain?: string;
}

// ---------------------------------------------------------------------------
// Serper API response shapes (raw — mapped before returning to client)
// ---------------------------------------------------------------------------

export interface SerperShoppingItem {
  title: string;
  source: string;
  link: string;
  price: string;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
  delivery?: string;
  position: number;
}

export interface SerperShoppingResponse {
  shopping: SerperShoppingItem[];
  searchParameters: { q: string; gl: string; num: number; type: string };
  credits?: number;
}

export interface SerperOrganicItem {
  title: string;
  link: string;
  snippet: string;
  position: number;
  date?: string;
}

export interface SerperSearchResponse {
  organic: SerperOrganicItem[];
  searchParameters: { q: string; gl: string; num: number };
  credits?: number;
}

// ---------------------------------------------------------------------------
// Mapped types (returned to client)
// ---------------------------------------------------------------------------

/** A product found via Google Shopping — no fabricated fields. */
export interface WebProduct {
  /** Cleaned product name (merchant suffix stripped) */
  name: string;
  /** Parsed brand (first segment of title, or merchant name) */
  brand: string;
  /** Numeric price parsed from string (e.g., "$15.99" → 15.99) */
  price: number;
  /** Product image URL from Google Shopping */
  image: string;
  /** Star rating (0-5) */
  rating: number;
  /** Number of reviews on the source site */
  reviewCount: number;
  /** Direct link to the product on the source site */
  externalUrl: string;
  /** Merchant/retailer name (e.g., "Amazon", "Sephora") */
  merchant: string;
  /** Product category — inferred from search query, not from Serper */
  category: string;
  /** Always 'web' — distinguishes from catalog products */
  source: 'web';
}

/** A review snippet found via Google Search. */
export interface WebReview {
  /** Review text excerpt from Google snippet */
  content: string;
  /** URL of the review page */
  sourceUrl: string;
  /** Page title (e.g., "CeraVe Review — Is It Worth It?") */
  sourceTitle: string;
  /** Domain name (e.g., "reddit.com", "allure.com") */
  sourceDomain: string;
  /** Publication date if available */
  date?: string;
  /** Rating extracted from snippet text (regex: X/5 or X stars) */
  extractedRating?: number;
  /** Keyword match score against user profile (0-100) */
  relevanceScore: number;
}

// ---------------------------------------------------------------------------
// Edge Function response
// ---------------------------------------------------------------------------

export interface WebSearchResponse {
  success: boolean;
  type: WebSearchType;
  products?: WebProduct[];
  reviews?: WebReview[];
  cached: boolean;
  error?: string;
}

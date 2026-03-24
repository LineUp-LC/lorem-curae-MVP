// src/lib/utils/affiliateLinks.ts
// Affiliate-ready URL builder — pass-through for MVP.
// Future: append affiliate tags per retailer domain (Amazon Associates, etc.)

/**
 * Wrap an external product URL for future affiliate tag injection.
 * Currently returns the raw URL unchanged.
 * When affiliate partnerships are active, this function will append
 * retailer-specific tracking parameters (e.g., ?tag=loremcurae-20 for Amazon).
 */
export function buildAffiliateUrl(url: string, _retailerDomain?: string): string {
  return url;
}

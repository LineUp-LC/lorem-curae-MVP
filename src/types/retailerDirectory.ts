// src/types/retailerDirectory.ts
// Types for the hardcoded retailer directory used by "Where to Buy" feature.

export interface KnownRetailer {
  name: string;
  domain: string;
  faviconUrl: string;
  trustpilotScore: number;
  trustpilotReviewCount: number;
  shippingEstimate: string;
  /** USD threshold for free shipping, or null if no free shipping offer */
  freeShippingThreshold: number | null;
  freeReturns: boolean;
  returnWindow: string;
  skincareSpecialist: boolean;
  /** Future: Curae partner retailers get a badge + priority sort */
  isCuraePartner: boolean;
  /** ISO date of last manual data verification */
  lastUpdated: string;
}

export type TrustBadgeType =
  | 'fast-shipping'
  | 'free-shipping'
  | 'free-returns'
  | 'easy-returns'
  | 'beauty-authority'
  | 'curae-partner';

export interface TrustBadge {
  type: TrustBadgeType;
  label: string;
  icon: string;
  colorClasses: string;
}

export type RetailerSortKey = 'best' | 'price-asc' | 'price-desc' | 'shipping' | 'returns';

/** Assembled retailer listing for the "Where to Buy" sheet */
export interface RetailerListing {
  retailerName: string;
  domain: string;
  price: number;
  url: string;
  productRating: number;
  productReviewCount: number;
  knownRetailer: KnownRetailer | null;
  trustBadges: TrustBadge[];
  bestForYouScore: number;
  /** Stock status: true = in stock, false = out of stock, undefined = unknown */
  inStock?: boolean;
}

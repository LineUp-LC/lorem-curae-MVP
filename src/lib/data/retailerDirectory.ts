// src/lib/data/retailerDirectory.ts
// Hardcoded retailer metadata for the "Where to Buy" feature.
// Data verified manually — update lastUpdated when refreshing.

import type {
  KnownRetailer,
  TrustBadge,
  RetailerListing,
  RetailerSortKey,
} from '../../types/retailerDirectory';
import type { WebProduct } from '../../types/webSearch';

// ---------------------------------------------------------------------------
// Retailer database
// ---------------------------------------------------------------------------

const KNOWN_RETAILERS: Record<string, KnownRetailer> = {
  'amazon.com': {
    name: 'Amazon',
    domain: 'amazon.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
    trustpilotScore: 1.7,
    trustpilotReviewCount: 220000,
    shippingEstimate: '1-2 days (Prime)',
    freeShippingThreshold: 35,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'sephora.com': {
    name: 'Sephora',
    domain: 'sephora.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=sephora.com&sz=32',
    trustpilotScore: 1.5,
    trustpilotReviewCount: 8500,
    shippingEstimate: '3-5 days',
    freeShippingThreshold: 50,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'ulta.com': {
    name: 'Ulta',
    domain: 'ulta.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=ulta.com&sz=32',
    trustpilotScore: 1.6,
    trustpilotReviewCount: 5200,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 35,
    freeReturns: true,
    returnWindow: '60 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'target.com': {
    name: 'Target',
    domain: 'target.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=target.com&sz=32',
    trustpilotScore: 1.2,
    trustpilotReviewCount: 12000,
    shippingEstimate: '2-5 days',
    freeShippingThreshold: 35,
    freeReturns: true,
    returnWindow: '90 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'walmart.com': {
    name: 'Walmart',
    domain: 'walmart.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=32',
    trustpilotScore: 1.4,
    trustpilotReviewCount: 35000,
    shippingEstimate: '2-5 days',
    freeShippingThreshold: 35,
    freeReturns: true,
    returnWindow: '90 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'dermstore.com': {
    name: 'Dermstore',
    domain: 'dermstore.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=dermstore.com&sz=32',
    trustpilotScore: 1.3,
    trustpilotReviewCount: 3100,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 50,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'nordstrom.com': {
    name: 'Nordstrom',
    domain: 'nordstrom.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=nordstrom.com&sz=32',
    trustpilotScore: 2.0,
    trustpilotReviewCount: 4700,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 0,
    freeReturns: true,
    returnWindow: 'No limit',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'cvs.com': {
    name: 'CVS',
    domain: 'cvs.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=cvs.com&sz=32',
    trustpilotScore: 1.3,
    trustpilotReviewCount: 6800,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 35,
    freeReturns: false,
    returnWindow: '30 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'walgreens.com': {
    name: 'Walgreens',
    domain: 'walgreens.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=walgreens.com&sz=32',
    trustpilotScore: 1.5,
    trustpilotReviewCount: 9200,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 35,
    freeReturns: false,
    returnWindow: '30 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'iherb.com': {
    name: 'iHerb',
    domain: 'iherb.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=iherb.com&sz=32',
    trustpilotScore: 4.2,
    trustpilotReviewCount: 42000,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 20,
    freeReturns: false,
    returnWindow: '60 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'yesstyle.com': {
    name: 'YesStyle',
    domain: 'yesstyle.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=yesstyle.com&sz=32',
    trustpilotScore: 3.3,
    trustpilotReviewCount: 18000,
    shippingEstimate: '7-21 days',
    freeShippingThreshold: 59,
    freeReturns: false,
    returnWindow: '14 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'stylevana.com': {
    name: 'Stylevana',
    domain: 'stylevana.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=stylevana.com&sz=32',
    trustpilotScore: 3.9,
    trustpilotReviewCount: 11000,
    shippingEstimate: '10-25 days',
    freeShippingThreshold: 48,
    freeReturns: false,
    returnWindow: '14 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'oliveyoung.com': {
    name: 'Olive Young',
    domain: 'oliveyoung.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=oliveyoung.com&sz=32',
    trustpilotScore: 3.5,
    trustpilotReviewCount: 2800,
    shippingEstimate: '5-14 days',
    freeShippingThreshold: 60,
    freeReturns: false,
    returnWindow: '30 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-23',
  },
  'boots.com': {
    name: 'Boots',
    domain: 'boots.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=boots.com&sz=32',
    trustpilotScore: 1.5,
    trustpilotReviewCount: 15000,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 25,
    freeReturns: true,
    returnWindow: '35 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
  'lookfantastic.com': {
    name: 'Lookfantastic',
    domain: 'lookfantastic.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=lookfantastic.com&sz=32',
    trustpilotScore: 3.3,
    trustpilotReviewCount: 55000,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 40,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
  'bluemercury.com': {
    name: 'Bluemercury',
    domain: 'bluemercury.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=bluemercury.com&sz=32',
    trustpilotScore: 2.1,
    trustpilotReviewCount: 1200,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 50,
    freeReturns: true,
    returnWindow: '60 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
  'spacenk.com': {
    name: 'Space NK',
    domain: 'spacenk.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=spacenk.com&sz=32',
    trustpilotScore: 1.8,
    trustpilotReviewCount: 4500,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 50,
    freeReturns: true,
    returnWindow: '28 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
  'beautylish.com': {
    name: 'Beautylish',
    domain: 'beautylish.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=beautylish.com&sz=32',
    trustpilotScore: 4.0,
    trustpilotReviewCount: 3200,
    shippingEstimate: '3-7 days',
    freeShippingThreshold: 35,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: true,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
  'revolve.com': {
    name: 'Revolve',
    domain: 'revolve.com',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=revolve.com&sz=32',
    trustpilotScore: 1.5,
    trustpilotReviewCount: 9800,
    shippingEstimate: '2-5 days',
    freeShippingThreshold: 0,
    freeReturns: true,
    returnWindow: '30 days',
    skincareSpecialist: false,
    isCuraePartner: false,
    lastUpdated: '2026-03-25',
  },
};

// ---------------------------------------------------------------------------
// Brand slug extraction for fuzzy domain matching
// ---------------------------------------------------------------------------

/** Known compound TLDs (country-code second-level domains) */
const COMPOUND_TLDS = new Set([
  'co.uk', 'co.jp', 'co.kr', 'co.in', 'co.nz', 'co.za', 'co.id', 'co.th',
  'com.au', 'com.br', 'com.mx', 'com.sg', 'com.my', 'com.ph', 'com.tw',
  'com.hk', 'com.tr', 'com.ar', 'com.co', 'com.pe', 'com.vn',
]);

/**
 * Extract the brand slug from a domain — strips www, TLD, and ccTLD.
 * Handles regional variants: sephora.sg → "sephora", amazon.co.uk → "amazon"
 * Strips apostrophes and special chars: "kiehl's" → "kiehls"
 */
export function extractBrandSlug(domainOrName: string): string {
  let d = domainOrName.toLowerCase().trim();
  // Strip protocol if present
  if (d.includes('://')) {
    try { d = new URL(d).hostname; } catch { /* keep as-is */ }
  }
  d = d.replace(/^www\./, '');

  // Check compound TLDs first (e.g. .co.uk, .com.au)
  for (const ctld of COMPOUND_TLDS) {
    if (d.endsWith(`.${ctld}`)) {
      d = d.slice(0, -(ctld.length + 1));
      break;
    }
  }

  // Strip simple TLD (.com, .sg, .fr, etc.)
  d = d.replace(/\.[a-z]{2,6}$/, '');

  // Strip regional suffixes: kiehls-us → kiehls, boots-uk → boots, "boots uk" → "boots"
  d = d.replace(/[-_\s](us|uk|ca|au|sg|fr|de|jp|kr|in|mx|br|eu|global|intl|int|middle[-_\s]east)$/, '');

  // Strip subdomains — keep only the last segment (brand name)
  const parts = d.split('.');
  d = parts[parts.length - 1];

  // Remove apostrophes and non-alphanumeric chars
  return d.replace(/[^a-z0-9]/g, '');
}

/** Pre-computed slug → domain map for O(1) fuzzy lookup in normalizeDomain */
const RETAILER_SLUG_MAP = new Map(
  Object.keys(KNOWN_RETAILERS).map(key => [extractBrandSlug(key), key]),
);

/**
 * Check if a web review matches a retailer for display in that retailer's card.
 * Matching strategy (in order):
 *   1. Exact domain match (sephora.com === sephora.com)
 *   2. Subdomain match (www.sephora.com ends with .sephora.com)
 *   3. Brand slug match (sephora.sg → "sephora" === sephora.com → "sephora")
 *   4. Retailer name in sourceDomain (e.g. "kiehls" in "kiehls.com")
 *   5. Retailer name in sourceTitle (e.g. "Sephora" in "CeraVe Review - Sephora")
 */
export function reviewMatchesRetailer(
  review: { sourceDomain?: string; sourceTitle?: string },
  retailerDomain: string,
  retailerName: string,
): boolean {
  const src = review.sourceDomain?.toLowerCase() ?? '';
  const domain = retailerDomain.toLowerCase();

  // 1. Exact domain
  if (src === domain) return true;

  // 2. Subdomain (www.sephora.com matches sephora.com)
  if (src.endsWith(`.${domain}`)) return true;

  // 3. Brand slug comparison (sephora.sg → "sephora" matches sephora.com → "sephora")
  if (src) {
    const reviewSlug = extractBrandSlug(src);
    const retailerSlug = extractBrandSlug(domain);
    if (reviewSlug && retailerSlug && reviewSlug === retailerSlug) return true;
  }

  // 4. Retailer name slug in sourceDomain (handles "kiehls.com" matching retailer "Kiehl's")
  // Require min 3 chars to avoid false positives from short names like "CVS" matching "reviews.com"
  const nameSlug = retailerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (nameSlug.length >= 3) {
    const namePattern = new RegExp(`(^|[^a-z0-9])${nameSlug}([^a-z0-9]|$)`);
    if (namePattern.test(src.replace(/[^a-z0-9]/g, ' '))) return true;

    // 5. Retailer name in sourceTitle (word-boundary match)
    const title = review.sourceTitle?.toLowerCase() ?? '';
    if (namePattern.test(title.replace(/[^a-z0-9]/g, ' '))) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/** Extract the root domain from a merchant name or URL */
function normalizeDomain(input: string): string {
  let d = input.toLowerCase().trim();
  // If it looks like a URL, extract host
  if (d.includes('://')) {
    try { d = new URL(d).hostname; } catch { /* keep as-is */ }
  }
  d = d.replace(/^www\./, '');
  // Match known domains by substring (e.g., "Amazon.com" → "amazon.com")
  for (const key of Object.keys(KNOWN_RETAILERS)) {
    if (d.includes(key) || key.includes(d)) return key;
  }
  // Try matching just the merchant name to a known retailer name
  const lower = input.toLowerCase().trim();
  for (const retailer of Object.values(KNOWN_RETAILERS)) {
    if (lower === retailer.name.toLowerCase()) return retailer.domain;
  }
  // Fuzzy match via brand slug (handles "Boots UK" → boots.com, "Olive Young Global" → oliveyoung.com)
  const inputSlug = extractBrandSlug(d);
  if (inputSlug.length >= 3) {
    const slugMatch = RETAILER_SLUG_MAP.get(inputSlug);
    if (slugMatch) return slugMatch;
  }
  return d;
}

export function lookupRetailer(merchantOrDomain: string): KnownRetailer | null {
  const domain = normalizeDomain(merchantOrDomain);
  return KNOWN_RETAILERS[domain] ?? null;
}

// ---------------------------------------------------------------------------
// Trust badges (Option C — badges only, no numeric scores)
// ---------------------------------------------------------------------------

const FAST_SHIPPING_THRESHOLD = '1-2'; // days prefix

export function getTrustBadges(retailer: KnownRetailer): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (retailer.shippingEstimate.startsWith(FAST_SHIPPING_THRESHOLD)) {
    badges.push({
      type: 'fast-shipping',
      label: 'Fast Shipping',
      icon: 'ri-truck-line',
      colorClasses: 'bg-sage/15 text-sage',
    });
  }

  if (retailer.freeShippingThreshold !== null && retailer.freeShippingThreshold <= 35) {
    badges.push({
      type: 'free-shipping',
      label: retailer.freeShippingThreshold === 0
        ? 'Free Shipping'
        : `Free Ship $${retailer.freeShippingThreshold}+`,
      icon: 'ri-gift-line',
      colorClasses: 'bg-sage/15 text-sage',
    });
  }

  if (retailer.freeReturns) {
    const days = parseInt(retailer.returnWindow) || 0;
    if (days >= 60) {
      badges.push({
        type: 'easy-returns',
        label: `${retailer.returnWindow} Returns`,
        icon: 'ri-refresh-line',
        colorClasses: 'bg-sage/15 text-sage',
      });
    } else {
      badges.push({
        type: 'free-returns',
        label: 'Free Returns',
        icon: 'ri-refresh-line',
        colorClasses: 'bg-cream text-warm-gray border border-blush',
      });
    }
  }

  if (retailer.skincareSpecialist) {
    badges.push({
      type: 'beauty-authority',
      label: 'Beauty Authority',
      icon: 'ri-heart-pulse-line',
      colorClasses: 'bg-primary/10 text-primary',
    });
  }

  if (retailer.isCuraePartner) {
    badges.push({
      type: 'curae-partner',
      label: 'Curae Partner',
      icon: 'ri-verified-badge-line',
      colorClasses: 'bg-primary/15 text-primary font-medium',
    });
  }

  return badges;
}

/** Return policy badge color: green for generous (60+ days), neutral otherwise */
export function getReturnPolicyColor(retailer: KnownRetailer): string {
  if (!retailer.freeReturns) return 'bg-cream text-warm-gray border border-blush';
  const days = parseInt(retailer.returnWindow) || 0;
  if (retailer.returnWindow === 'No limit' || days >= 60) return 'bg-sage/15 text-sage';
  return 'bg-cream text-warm-gray border border-blush';
}

// ---------------------------------------------------------------------------
// Affiliate-ready URL builder (#13 — re-exported from canonical location)
// ---------------------------------------------------------------------------

export { buildAffiliateUrl } from '../utils/affiliateLinks';

// ---------------------------------------------------------------------------
// Price normalization (Serper returns inconsistent formats)
// ---------------------------------------------------------------------------

export interface NormalizedPrice {
  display: string;
  value: number | null;
  isRange: boolean;
}

export function normalizePrice(rawPrice: string | null): NormalizedPrice {
  if (!rawPrice || rawPrice.trim() === '') {
    return { display: 'Check price', value: null, isRange: false };
  }

  const cleaned = rawPrice.trim();

  // Range: "From $12.00" or "$12.00 - $15.00"
  const rangeMatch = cleaned.match(/(?:from\s+)?\$?([\d,.]+)\s*[-–]\s*\$?([\d,.]+)/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1].replace(/,/g, ''));
    const high = parseFloat(rangeMatch[2].replace(/,/g, ''));
    if (!isNaN(low) && !isNaN(high)) {
      return { display: `$${low.toFixed(2)} – $${high.toFixed(2)}`, value: low, isRange: true };
    }
  }

  // "From $12.00"
  const fromMatch = cleaned.match(/from\s+\$?([\d,.]+)/i);
  if (fromMatch) {
    const val = parseFloat(fromMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) {
      return { display: `From $${val.toFixed(2)}`, value: val, isRange: true };
    }
  }

  // Standard: "$14.99", "14.99", "14.99 USD"
  const numMatch = cleaned.match(/\$?([\d,.]+)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      return { display: `$${val.toFixed(2)}`, value: val, isRange: false };
    }
  }

  return { display: 'Check price', value: null, isRange: false };
}

// ---------------------------------------------------------------------------
// Product name normalization for cross-retailer grouping
// ---------------------------------------------------------------------------

function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*[-–|]\s*(amazon|walmart|target|sephora|ulta|cvs|walgreens|nordstrom|dermstore).*$/i, '')
    .replace(/\s*,?\s*\d+(\.\d+)?\s*(oz|ml|fl\s*oz|g|ct|pack)\b.*$/i, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Check if two web products are the same item from different retailers */
export function isSameProduct(a: WebProduct, b: WebProduct): boolean {
  const nameA = normalizeProductName(a.name);
  const nameB = normalizeProductName(b.name);
  const brandA = a.brand.toLowerCase().trim();
  const brandB = b.brand.toLowerCase().trim();

  // Brand must match
  if (brandA !== brandB && !brandA.includes(brandB) && !brandB.includes(brandA)) return false;

  // Exact name match
  if (nameA === nameB) return true;

  // Containment match
  if (nameA.includes(nameB) || nameB.includes(nameA)) return true;

  // Word overlap: ≥70% of the shorter name's words appear in the longer
  const wordsA = new Set(nameA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(nameB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const minSize = Math.min(wordsA.size, wordsB.size);
  return intersection.length / minSize >= 0.7;
}

/** Find all web products matching the target across different retailers */
export function findRetailerListings(
  target: WebProduct,
  allProducts: WebProduct[],
): WebProduct[] {
  const matches = allProducts.filter(
    p => p.merchant !== target.merchant && isSameProduct(target, p),
  );
  // Include the original target at the front
  return [target, ...matches];
}

// ---------------------------------------------------------------------------
// "Best for You" sort score (#6 — smart default)
// ---------------------------------------------------------------------------

/** Shipping speed estimate in days (lower = better) */
function estimateShippingDays(retailer: KnownRetailer | null): number {
  if (!retailer) return 7;
  const match = retailer.shippingEstimate.match(/(\d+)/);
  return match ? parseInt(match[1]) : 7;
}

/**
 * Compute a 0-100 "Best for You" composite score.
 *
 * Weights:
 *   Price (30%) — lower price relative to max = higher score
 *   Shipping speed (20%) — fewer days = higher score
 *   Free returns (20%) — boolean bonus + return window generosity
 *   Skincare specialist (15%) — boolean bonus
 *   Review keyword matches (15%) — placeholder for future enrichment
 */
export function computeBestForYouScore(
  price: number,
  maxPrice: number,
  retailer: KnownRetailer | null,
): number {
  // Price component: 0-30 (lower is better)
  const priceScore = maxPrice > 0
    ? (1 - price / maxPrice) * 30
    : 15;

  // Shipping: 0-20
  const days = estimateShippingDays(retailer);
  const shippingScore = Math.max(0, (1 - days / 14)) * 20;

  // Returns: 0-20
  let returnsScore = 0;
  if (retailer?.freeReturns) {
    returnsScore = 10;
    const window = parseInt(retailer.returnWindow) || 0;
    if (retailer.returnWindow === 'No limit') returnsScore = 20;
    else if (window >= 60) returnsScore = 17;
    else if (window >= 30) returnsScore = 13;
  }

  // Skincare specialist: 0-15
  const specialistScore = retailer?.skincareSpecialist ? 15 : 0;

  // Curae partner bonus
  const partnerBonus = retailer?.isCuraePartner ? 5 : 0;

  return Math.min(100, Math.round(priceScore + shippingScore + returnsScore + specialistScore + partnerBonus));
}

// ---------------------------------------------------------------------------
// Build sorted + filtered retailer listings
// ---------------------------------------------------------------------------

export function buildRetailerListings(
  webProducts: WebProduct[],
  sortKey: RetailerSortKey = 'best',
  filters: { freeShipping?: boolean; freeReturns?: boolean } = {},
): RetailerListing[] {
  const maxPrice = Math.max(...webProducts.map(p => p.price).filter(p => p > 0), 1);

  let listings: RetailerListing[] = webProducts.map(wp => {
    const known = lookupRetailer(wp.merchant);
    const badges = known ? getTrustBadges(known) : [];
    const score = computeBestForYouScore(wp.price, maxPrice, known);

    return {
      retailerName: known?.name || wp.merchant,
      domain: known?.domain || wp.merchant.toLowerCase().replace(/\s+/g, ''),
      price: wp.price,
      url: wp.externalUrl,
      productRating: wp.rating,
      productReviewCount: wp.reviewCount,
      knownRetailer: known,
      trustBadges: badges,
      bestForYouScore: score,
      inStock: wp.inStock,
    };
  });

  // Apply filters
  if (filters.freeShipping) {
    listings = listings.filter(l =>
      l.knownRetailer?.freeShippingThreshold !== undefined &&
      l.knownRetailer.freeShippingThreshold !== null &&
      l.price >= (l.knownRetailer.freeShippingThreshold || 0),
    );
  }
  if (filters.freeReturns) {
    listings = listings.filter(l => l.knownRetailer?.freeReturns === true);
  }

  // Sort
  switch (sortKey) {
    case 'best':
      listings.sort((a, b) => b.bestForYouScore - a.bestForYouScore);
      break;
    case 'price-asc':
      listings.sort((a, b) => (a.price || 999) - (b.price || 999));
      break;
    case 'price-desc':
      listings.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'shipping':
      listings.sort((a, b) => estimateShippingDays(a.knownRetailer) - estimateShippingDays(b.knownRetailer));
      break;
    case 'returns': {
      const returnScore = (l: RetailerListing) => {
        if (!l.knownRetailer?.freeReturns) return 0;
        if (l.knownRetailer.returnWindow === 'No limit') return 999;
        return parseInt(l.knownRetailer.returnWindow) || 0;
      };
      listings.sort((a, b) => returnScore(b) - returnScore(a));
      break;
    }
  }

  // Stable sort: in-stock first, then out-of-stock/unknown (preserves sort order within groups)
  listings.sort((a, b) => {
    const aStock = a.inStock === false ? 1 : 0;
    const bStock = b.inStock === false ? 1 : 0;
    return aStock - bStock;
  });

  // Curae partners pinned first regardless of sort
  const partners = listings.filter(l => l.knownRetailer?.isCuraePartner);
  const rest = listings.filter(l => !l.knownRetailer?.isCuraePartner);
  return [...partners, ...rest];
}

/**
 * Retailer Pricing Utilities
 *
 * Freshness detection, price formatting, shipping/tax label generation.
 * All retailer pricing display logic must flow through these utilities —
 * no inline formatting in components.
 */

export type PriceFreshness = 'fresh' | 'aging' | 'stale' | 'very_stale' | 'unknown';

const MS_24H = 24 * 60 * 60 * 1000;
const MS_48H = 48 * 60 * 60 * 1000;
const MS_7D = 7 * 24 * 60 * 60 * 1000;

/**
 * Determine how fresh a retailer price is based on its lastUpdated timestamp.
 *
 * | Freshness  | Age         | UI treatment                        |
 * |------------|-------------|-------------------------------------|
 * | fresh      | < 24 h      | No qualifier                        |
 * | aging      | 24–48 h     | No qualifier (within tolerance)     |
 * | stale      | 48 h – 7 d  | "Price as of [date]"                |
 * | very_stale | > 7 d       | "Verify at retailer"                |
 * | unknown    | no timestamp | Treat as stale — show "Estimated"   |
 */
export function getPriceFreshness(lastUpdated?: string): PriceFreshness {
  if (!lastUpdated) return 'unknown';

  const updated = new Date(lastUpdated).getTime();
  if (Number.isNaN(updated)) return 'unknown';

  const age = Date.now() - updated;

  if (age < MS_24H) return 'fresh';
  if (age < MS_48H) return 'aging';
  if (age < MS_7D) return 'stale';
  return 'very_stale';
}

/**
 * Format a price with a freshness qualifier when needed.
 *
 * - fresh / aging → "$45.00"
 * - stale         → "Est. $45.00"
 * - very_stale    → "~$45.00"
 * - unknown       → "Est. $45.00"
 */
export function formatPriceLabel(price: number, freshness: PriceFreshness): string {
  const formatted = `$${price.toFixed(2)}`;

  switch (freshness) {
    case 'fresh':
    case 'aging':
      return formatted;
    case 'stale':
    case 'unknown':
      return `Est. ${formatted}`;
    case 'very_stale':
      return `~${formatted}`;
  }
}

/**
 * Generate a secondary freshness note for stale/very-stale prices.
 * Returns null when no note is needed.
 */
export function getFreshnessNote(
  freshness: PriceFreshness,
  lastUpdated?: string,
): string | null {
  if (freshness === 'stale' && lastUpdated) {
    const date = new Date(lastUpdated);
    return `Price as of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }
  if (freshness === 'very_stale') {
    return 'Verify at retailer';
  }
  return null;
}

/**
 * Format the shipping display string.
 *
 * Priority: retailer-provided shippingLabel → computed from cost → fallback.
 */
export function formatShippingLabel(
  shippingCost: number,
  shippingLabel?: string,
): string {
  if (shippingLabel) return shippingLabel;
  if (shippingCost === 0) return 'Free Shipping';
  return `$${shippingCost.toFixed(2)}`;
}

/**
 * Format the tax display string.
 *
 * - If taxIncluded is true → "Tax included"
 * - If estimatedTax is provided → "$X.XX est. tax"
 * - Otherwise → "Tax calculated at checkout"
 */
export function formatTaxLabel(
  estimatedTax?: number,
  taxIncluded?: boolean,
): string {
  if (taxIncluded) return 'Tax included';
  if (estimatedTax != null && estimatedTax > 0) return `$${estimatedTax.toFixed(2)} est. tax`;
  return 'Tax calculated at checkout';
}

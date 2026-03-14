# Retailer Architecture Rules

> Trigger: Read this file when working on retailer data, trust scores, pricing, sorting, or affiliate/sponsored logic.

---

## Trust Score Architecture

Trust scores must be:
- Derived from verifiable attributes (community reviews, fulfillment reliability, return policy, shipping consistency, authenticity guarantees)
- Displayed consistently across all surfaces using the same visual pattern (progress bar + numeric score)
- Explainable — the user must understand why a retailer has its score
- Never presented as an endorsement or guarantee

All trust score logic must live in shared utilities (`src/lib/utils/retailerSort.ts`). No inline score calculations.

> For user-facing retailer framing and rewards copy, see `CLAUDE_PRODUCT.md` Section 10.

---

## Retailer Data Architecture

All retailer data must:
- Use the canonical `Retailer` type from `src/types/retailer.ts`
- Include: id, name, logo, price, shipping, totalPrice, trustScore, deliveryDays, inStock, url, features
- Support optional fields: isAffiliate, isSponsored, secureCheckout, shippingLabel, taxIncluded, deepLink, source, lastUpdated
- Never use hard-coded retailer names or prices in components
- Scale from 3 retailers to 30+ without layout or performance issues

All retailer prices must:
- Originate from an auditable data source (affiliate feed, retailer API, or manual entry with timestamp)
- Include a `source` field: `'affiliate_feed'`, `'retailer_api'`, or `'manual'`
- Include a `lastUpdated` ISO timestamp for freshness detection
- Never be AI-generated, scraped, or user-submitted
- Never include fabricated tax estimates — display "Tax calculated at checkout" unless retailer provides tax-inclusive pricing

All pricing display logic must use shared utilities in `src/lib/utils/retailerPricing.ts`. No inline price formatting.

---

## Sorting & Filtering

Retailer sorting must:
- Use shared utility functions (`sortRetailers`, `getPriceRange`) — never inline
- Always pin sponsored retailers first, then sort by selected criteria
- Support sort keys: trust score, price low→high, price high→low, fastest delivery
- Support future sort keys without modifying components (add to the utility, not the UI)

Retailer filtering (future) must:
- Support budget range, shipping preference, location, trust score threshold
- Use shared filter utilities — never inline in components

---

## Sponsored & Affiliate Transparency

- Always label sponsored retailers with a visible badge
- Always label affiliate partners with a visible badge
- Never rank sponsored retailers higher in trust score — only pin them first in sort order
- Sponsored placement must be visually distinct but not deceptive
- Affiliate commission structure must never be visible to users beyond the rewards framing

---

## Price Freshness & Staleness

| Freshness | Age | UI Treatment |
|-----------|-----|-------------|
| Fresh | < 24 hours | Price displayed without qualifier |
| Aging | 24-48 hours | Price displayed without qualifier (within tolerance) |
| Stale | 48 hours - 7 days | Prefix with "Est." and show "Price as of [date]" |
| Very stale | > 7 days | Prefix with "~" and show "Verify at retailer" |
| Unknown | No timestamp | Treat as stale — prefix with "Est." |

Freshness logic must live in `src/lib/utils/retailerPricing.ts` (`getPriceFreshness`, `formatPriceLabel`, `getFreshnessNote`). No inline freshness calculations.

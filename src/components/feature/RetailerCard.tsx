// src/components/feature/RetailerCard.tsx
// Single retailer row in the "Where to Buy" sheet.

import type { RetailerListing, TrustBadge } from '../../types/retailerDirectory';
import { buildAffiliateUrl } from '../../lib/utils/affiliateLinks';

interface RetailerCardProps {
  listing: RetailerListing;
  onBuyClick: (listing: RetailerListing) => void;
  onExpandReviews: (listing: RetailerListing) => void;
  reviewsExpanded: boolean;
  keywordSummary?: { matchCount: number; totalReviews: number; topTerm: string } | null;
}

export default function RetailerCard({
  listing,
  onBuyClick,
  onExpandReviews,
  reviewsExpanded,
  keywordSummary,
}: RetailerCardProps) {
  const { retailerName, domain, price, url, knownRetailer, trustBadges, bestForYouScore, inStock } = listing;

  const priceDisplay = price > 0 ? `$${price.toFixed(2)}` : 'Check price';
  const returnDays = knownRetailer?.returnWindow ? parseInt(knownRetailer.returnWindow) : NaN;
  const isGenerousReturn = !isNaN(returnDays) && returnDays >= 60;

  return (
    <div className="border border-blush rounded-xl bg-white overflow-hidden">
      {/* Main row */}
      <div className="p-4 flex items-start gap-3">
        {/* Favicon + name */}
        <div className="flex-shrink-0 mt-0.5">
          {knownRetailer ? (
            <img
              src={knownRetailer.faviconUrl}
              alt={retailerName}
              className="w-8 h-8 rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
              <i className="ri-store-2-line text-warm-gray text-sm" />
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-deep text-sm truncate">{retailerName}</h3>
            {knownRetailer?.isCuraePartner && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/15 text-primary rounded-full whitespace-nowrap">
                Curae Partner
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-1">
            {inStock === true && (
              <span className="inline-flex items-center gap-1 text-[10px] text-sage font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                In Stock
              </span>
            )}
            {inStock === false && (
              <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                <span className="w-1.5 h-1.5 rounded-full bg-warm-gray/50" />
                Out of Stock
              </span>
            )}
            {inStock === undefined && (
              <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blush" />
                Check availability
              </span>
            )}
          </div>

          {/* Shipping + returns */}
          <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray">
            {knownRetailer && (
              <>
                <span className="flex items-center gap-1">
                  <i className="ri-truck-line" />
                  {knownRetailer.shippingEstimate}
                </span>
                {knownRetailer.returnWindow && (
                  <>
                    <span className="text-blush">·</span>
                    <span className={isGenerousReturn ? 'text-sage font-medium' : ''}>
                      <i className={`ri-refresh-line text-[10px] mr-0.5 ${isGenerousReturn ? 'text-sage' : ''}`} />
                      {knownRetailer.freeReturns ? 'Free returns' : 'Returns'} · {knownRetailer.returnWindow}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Trust badges */}
          {trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {trustBadges.map((badge: TrustBadge) => (
                <span
                  key={badge.type}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full ${badge.colorClasses}`}
                >
                  <i className={badge.icon} />
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + CTA column */}
        <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-lg font-bold text-deep leading-tight">{priceDisplay}</p>
            {bestForYouScore >= 70 && (
              <p className="text-[10px] text-sage font-medium mt-0.5">Best for you</p>
            )}
          </div>

          <a
            href={buildAffiliateUrl(url, domain)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(listing);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-full hover:bg-dark transition-colors"
          >
            Buy on {retailerName}
            <i className="ri-external-link-line text-[10px]" />
          </a>
        </div>
      </div>

      {/* Expandable reviews trigger — shown for ALL retailers (known + web-discovered) */}
      <button
        onClick={() => onExpandReviews(listing)}
        className="w-full flex items-center justify-between px-4 py-2 border-t border-blush/50 text-xs text-warm-gray hover:bg-cream/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <i className="ri-chat-3-line" />
          Reviews on {retailerName}
          {keywordSummary && keywordSummary.matchCount > 0 && (
            <span className="ml-1 text-primary font-medium">
              · {keywordSummary.matchCount} of {keywordSummary.totalReviews} mention &ldquo;{keywordSummary.topTerm}&rdquo;
            </span>
          )}
        </span>
        <i className={`ri-arrow-${reviewsExpanded ? 'up' : 'down'}-s-line text-sm transition-transform`} />
      </button>
    </div>
  );
}

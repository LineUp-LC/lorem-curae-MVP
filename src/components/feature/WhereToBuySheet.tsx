// src/components/feature/WhereToBuySheet.tsx
// Bottom sheet (mobile) / modal (desktop) for "Where to Buy" feature.

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { WebProduct, WebReview } from '../../types/webSearch';
import type { RetailerListing, RetailerSortKey } from '../../types/retailerDirectory';
import {
  buildRetailerListings,
  findRetailerListings,
} from '../../lib/data/retailerDirectory';
import RetailerCard from './RetailerCard';
import RetailerReviews from './RetailerReviews';
import RoutinePickerModal from './RoutinePickerModal';
import { searchWhereToBuy, searchProductReviews } from '../../lib/api/productSearch';
import { onAction } from '../../lib/utils/gamificationTriggers';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../../lib/utils/sessionState';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';

interface WhereToBuySheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** The product the user wants to buy */
  targetProduct: WebProduct;
  /** All web products from the current search (used to find same product on other retailers) */
  allWebProducts: WebProduct[];
  productName: string;
  productBrand: string;
  /** Callback after "Buy" click for post-purchase toast */
  onBuyIntent?: (listing: RetailerListing) => void;
  /** Whether product was scanned (shows "Ingredients verified" badge) */
  wasScanned?: boolean;
}

const SORT_OPTIONS: { key: RetailerSortKey; label: string }[] = [
  { key: 'best', label: 'Best for You' },
  { key: 'price-asc', label: 'Price: Low → High' },
  { key: 'price-desc', label: 'Price: High → Low' },
  { key: 'shipping', label: 'Fastest Shipping' },
  { key: 'returns', label: 'Best Returns' },
];

export default function WhereToBuySheet({
  isOpen,
  onClose,
  targetProduct,
  allWebProducts,
  productName,
  productBrand,
  onBuyIntent,
  wasScanned,
}: WhereToBuySheetProps) {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<RetailerSortKey>('best');
  const [freeShipping, setFreeShipping] = useState(false);
  const [freeReturns, setFreeReturns] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null);
  const [keywordSummaries, setKeywordSummaries] = useState<Record<string, { matchCount: number; totalReviews: number; topTerm: string }>>({});
  const [routinePromptListing, setRoutinePromptListing] = useState<RetailerListing | null>(null);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const gamificationFired = useRef(false);
  const routineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dedicated product search state (finds the product across many retailers)
  const [buyProducts, setBuyProducts] = useState<WebProduct[]>([]);
  const [buySearchDone, setBuySearchDone] = useState(false);
  const buySearchFiredRef = useRef<string | null>(null);

  // General Google reviews state
  const [googleReviews, setGoogleReviews] = useState<WebReview[] | null>(null);
  const [googleReviewsLoading, setGoogleReviewsLoading] = useState(false);
  const [googleReviewsOpen, setGoogleReviewsOpen] = useState(false);
  const googleReviewsFiredRef = useRef<string | null>(null);

  // Fire WHERE_TO_BUY gamification on first open
  useEffect(() => {
    if (isOpen && user?.id && !gamificationFired.current) {
      gamificationFired.current = true;
      onAction(user.id, 'WHERE_TO_BUY', {
        surveyCompleted: !!getEffectiveSkinType(),
      }).catch(() => {});
    }
  }, [isOpen, user?.id, productName]);

  // Dedicated product search — find this product across ALL retailers
  useEffect(() => {
    if (!isOpen || !user) return;
    const searchKey = `${productBrand}:${productName}`;
    if (buySearchFiredRef.current === searchKey) return;
    buySearchFiredRef.current = searchKey;

    searchWhereToBuy(productName, productBrand).then(results => {
      if (results) setBuyProducts(results);
      setBuySearchDone(true);
    }).catch(() => {
      setBuySearchDone(true);
    });
  }, [isOpen, user, productName, productBrand]);

  // Fetch general Google reviews on sheet open (not on expand)
  useEffect(() => {
    if (!isOpen || !user) return;
    const reviewKey = `${productBrand}:${productName}`;
    if (googleReviewsFiredRef.current === reviewKey) return;
    googleReviewsFiredRef.current = reviewKey;

    setGoogleReviewsLoading(true);
    const skinType = getEffectiveSkinType();
    const concerns = getEffectiveConcerns();
    const sensitivity = getEffectiveSensitivity();
    const userProfile = skinType || concerns.length > 0 || sensitivity
      ? { skinType: skinType ?? undefined, concerns, sensitivity: sensitivity ?? undefined }
      : undefined;

    searchProductReviews(productName, productBrand, userProfile).then(results => {
      setGoogleReviews(results);
    }).catch(() => {
      setGoogleReviews([]);
    }).finally(() => {
      setGoogleReviewsLoading(false);
    });
  }, [isOpen, user, productName, productBrand]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Merge: existing allWebProducts matches + dedicated buy search results (deduplicate by domain)
  const allRetailerProducts = useMemo(() => {
    if (!isOpen) return [];
    const fromExisting = findRetailerListings(targetProduct, allWebProducts);
    if (buyProducts.length === 0) return fromExisting;

    const seenDomains = new Set(fromExisting.map(p => {
      try { return new URL(p.externalUrl).hostname.replace('www.', ''); } catch { return p.merchant.toLowerCase(); }
    }));

    const additional = buyProducts.filter(p => {
      const domain = (() => {
        try { return new URL(p.externalUrl).hostname.replace('www.', ''); } catch { return p.merchant.toLowerCase(); }
      })();
      if (seenDomains.has(domain)) return false;
      seenDomains.add(domain);
      return true;
    });

    return [...fromExisting, ...additional];
  }, [isOpen, targetProduct, allWebProducts, buyProducts]);

  // Build sorted + filtered listings
  const listings = useMemo(
    () => buildRetailerListings(allRetailerProducts, sortKey, { freeShipping, freeReturns }),
    [allRetailerProducts, sortKey, freeShipping, freeReturns],
  );

  const handleBuyClick = useCallback((listing: RetailerListing) => {
    onBuyIntent?.(listing);
    // Post-purchase routine prompt after 3 seconds
    if (routineTimerRef.current) clearTimeout(routineTimerRef.current);
    routineTimerRef.current = setTimeout(() => {
      setRoutinePromptListing(listing);
    }, 3000);
  }, [onBuyIntent]);

  // Cleanup timer on unmount/close
  useEffect(() => {
    if (!isOpen) {
      setRoutinePromptListing(null);
      if (routineTimerRef.current) clearTimeout(routineTimerRef.current);
    }
    return () => { if (routineTimerRef.current) clearTimeout(routineTimerRef.current); };
  }, [isOpen]);

  const handleExpandReviews = useCallback((listing: RetailerListing) => {
    setExpandedReviews(prev => prev === listing.domain ? null : listing.domain);
  }, []);

  const handleKeywordMatches = useCallback((domain: string, matches: { term: string; count: number }[], totalReviews: number) => {
    if (matches.length === 0) return;
    setKeywordSummaries(prev => ({
      ...prev,
      [domain]: { matchCount: matches[0].count, totalReviews, topTerm: matches[0].term },
    }));
  }, []);

  if (!isOpen) return null;

  const retailerCount = listings.length;
  const isSearching = !buySearchDone && retailerCount === 0;

  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();
  const highlightProfile = {
    skinType: skinType ?? null,
    concerns,
    sensitivity: sensitivity ?? null,
    excludeNames: [productName, productBrand],
    highlightSentiment: true,
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-full md:max-w-lg md:rounded-2xl rounded-t-2xl bg-white max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col animate-enter-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-blush px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
              <i className="ri-store-2-line text-lg text-primary" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-deep">Where to Buy</h2>
              <p className="text-[11px] text-warm-gray">
                {isSearching
                  ? 'Searching retailers...'
                  : retailerCount === 0
                    ? 'Not available online'
                    : retailerCount === 1
                      ? `Available on ${listings[0].retailerName}`
                      : `Compare ${retailerCount} retailers`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Searching state */}
        {isSearching && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-sm text-warm-gray">Finding retailers for this product...</p>
          </div>
        )}

        {/* 0 retailers — Not available online (only after search completes) */}
        {!isSearching && retailerCount === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-cream rounded-full mb-4">
              <i className="ri-map-pin-line text-2xl text-warm-gray" />
            </div>
            <h3 className="font-serif font-bold text-deep text-lg mb-1">Not available online</h3>
            <p className="text-sm text-warm-gray mb-4">
              We couldn't find this product from any online retailer. It may be available at a store near you.
            </p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${productBrand} ${productName} store near me`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-dark transition-colors"
            >
              <i className="ri-map-pin-2-line" />
              Find nearby stores
            </a>
          </div>
        )}

        {/* 1+ retailers */}
        {retailerCount > 0 && (
          <>
            {/* Sort + filter bar (only for 2+ retailers) */}
            {retailerCount >= 2 && (
              <div className="px-4 py-2.5 border-b border-blush/50 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as RetailerSortKey)}
                  className="text-xs bg-cream border border-blush rounded-lg px-2 py-1.5 text-deep cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setFreeShipping(!freeShipping)}
                  className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    freeShipping
                      ? 'bg-sage/15 text-sage border-sage/30'
                      : 'bg-white text-warm-gray border-blush hover:bg-cream'
                  }`}
                >
                  <i className="ri-gift-line mr-1" />
                  Free Shipping
                </button>

                <button
                  onClick={() => setFreeReturns(!freeReturns)}
                  className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    freeReturns
                      ? 'bg-sage/15 text-sage border-sage/30'
                      : 'bg-white text-warm-gray border-blush hover:bg-cream'
                  }`}
                >
                  <i className="ri-refresh-line mr-1" />
                  Free Returns
                </button>
              </div>
            )}

            {/* Retailer list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {listings.map((listing) => (
                <div key={listing.domain}>
                  <RetailerCard
                    listing={listing}
                    onBuyClick={handleBuyClick}
                    onExpandReviews={handleExpandReviews}
                    reviewsExpanded={expandedReviews === listing.domain}
                    keywordSummary={keywordSummaries[listing.domain] ?? null}
                  />
                  {/* Lazy-loaded retailer reviews (only rendered when expanded) */}
                  {expandedReviews === listing.domain && (
                    <RetailerReviews
                      listing={listing}
                      productName={productName}
                      productBrand={productBrand}
                      webReviews={googleReviews ?? []}
                      onKeywordMatches={handleKeywordMatches}
                    />
                  )}
                </div>
              ))}

              {/* Filtered to zero */}
              {listings.length === 0 && retailerCount > 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-warm-gray">No retailers match your filters.</p>
                  <button
                    onClick={() => { setFreeShipping(false); setFreeReturns(false); }}
                    className="mt-2 text-xs text-primary hover:text-dark transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* General Google Reviews section */}
              <div className="pt-2 border-t border-blush/50">
                <button
                  onClick={() => setGoogleReviewsOpen(prev => !prev)}
                  className="w-full flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <i className="ri-chat-quote-line text-primary text-sm" />
                    <span className="text-xs font-medium text-deep">Reviews from across the web</span>
                    {googleReviews && googleReviews.length > 0 && (
                      <span className="text-[10px] text-warm-gray/70">({googleReviews.length})</span>
                    )}
                  </div>
                  <i className={`ri-arrow-${googleReviewsOpen ? 'up' : 'down'}-s-line text-warm-gray`} />
                </button>

                {googleReviewsOpen && (
                  <div className="space-y-2 pb-2">
                    {googleReviewsLoading && (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="p-2.5 rounded-lg bg-cream/50 border border-blush/30 animate-pulse">
                            <div className="h-3 bg-blush/40 rounded w-full mb-2" />
                            <div className="h-3 bg-blush/30 rounded w-3/4" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!googleReviewsLoading && googleReviews && googleReviews.length > 0 && (
                      googleReviews.slice(0, 6).map((review, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-white border border-blush/30">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-warm-gray leading-relaxed flex-1">
                              {highlightRelevantKeywords(review.content, highlightProfile)}
                            </p>
                            {review.extractedRating && (
                              <span className="flex-shrink-0 text-[10px] text-warm-gray whitespace-nowrap">
                                {review.extractedRating}/5 <i className="ri-star-fill text-primary/60" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-warm-gray/70">{review.sourceDomain}</span>
                            <a
                              href={review.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:text-dark transition-colors"
                            >
                              Read full review <i className="ri-external-link-line" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}

                    {!googleReviewsLoading && googleReviews && googleReviews.length === 0 && (
                      <p className="text-xs text-warm-gray text-center py-3">No web reviews found for this product.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Ingredient consistency badge */}
              {listings.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-2 pb-1 text-[10px] text-warm-gray">
                  <i className={wasScanned ? 'ri-check-double-line text-sage' : 'ri-information-line'} />
                  {wasScanned
                    ? 'Ingredients verified from your scan'
                    : 'Verify ingredients on retailer site'}
                </div>
              )}

              {/* Post-purchase routine prompt (appears 3s after buy click) */}
              {routinePromptListing && (
                <div className="mx-0 mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5 animate-enter-fade">
                  <p className="text-xs text-deep font-medium">When it arrives, add it to your routine?</p>
                  <button
                    onClick={() => {
                      setRoutineModalOpen(true);
                      setRoutinePromptListing(null);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary font-medium hover:text-dark transition-colors cursor-pointer"
                  >
                    <i className="ri-calendar-line" />
                    Add to routine
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Routine picker modal (post-purchase) */}
      {routineModalOpen && (
        <RoutinePickerModal
          isOpen={routineModalOpen}
          onClose={() => setRoutineModalOpen(false)}
          product={{
            id: -(Date.now() % 1_000_000),
            name: productName,
            brand: productBrand,
            category: targetProduct.category || undefined,
          }}
        />
      )}
    </div>
  );
}

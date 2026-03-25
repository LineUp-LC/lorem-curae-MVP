// src/components/feature/RetailerReviews.tsx
// Per-retailer keyword-matched reviews with lazy AI summary.
// Receives pre-fetched web reviews from parent — filters by domain client-side.

import { useState, useEffect, useMemo, useRef } from 'react';
import type { WebReview } from '../../types/webSearch';
import type { RetailerListing } from '../../types/retailerDirectory';
import { reviewMatchesRetailer } from '../../lib/data/retailerDirectory';
import { buildAIContext } from '../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../lib/ai/surfaceClient';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../../lib/utils/sessionState';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';

interface RetailerReviewsProps {
  listing: RetailerListing;
  productName: string;
  productBrand: string;
  /** Pre-fetched general web reviews (from parent) */
  webReviews: WebReview[];
  onKeywordMatches?: (domain: string, matches: KeywordMatch[], totalReviews: number) => void;
}

interface KeywordMatch {
  term: string;
  count: number;
}

/** Detect product page descriptions (not actual customer reviews) */
function isProductDescription(content: string): boolean {
  const lower = content.toLowerCase();
  const markers = [
    'what it is:',
    'skin type:',
    'highlighted ingredients:',
    'what it does:',
    'clinical results:',
    'how to use:',
    'suggested usage:',
    'size:',
    'about the brand',
    'free shipping',
    'add to basket',
    'add to cart',
    'items in your cart',
  ];
  return markers.some(m => lower.includes(m));
}

export default function RetailerReviews({
  listing,
  productName,
  productBrand,
  webReviews,
  onKeywordMatches,
}: RetailerReviewsProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const cancelledRef = useRef(false);
  const aiTriggeredRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();

  // Filter reviews: match by domain brand slug, subdomain, or retailer name.
  // Handles regional TLDs (sephora.sg → sephora.com) and name variations.
  const reviews = useMemo(() => {
    const filtered = webReviews.filter(r => !isProductDescription(r.content));
    return filtered.filter(r =>
      reviewMatchesRetailer(r, listing.domain, listing.retailerName),
    );
  }, [webReviews, listing.domain, listing.retailerName]);

  // Compute keyword matches from filtered reviews
  const keywordMatches = useMemo(() => {
    return computeKeywordMatches(reviews);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews, skinType, concerns, sensitivity]);

  // Notify parent of keyword matches
  useEffect(() => {
    if (reviews.length > 0 && keywordMatches.length > 0) {
      onKeywordMatches?.(listing.domain, keywordMatches, reviews.length);
    }
  }, [listing.domain, keywordMatches, reviews.length, onKeywordMatches]);

  // Auto-trigger AI summary once if we have reviews + user profile
  useEffect(() => {
    if (aiTriggeredRef.current) return;
    if (reviews.length > 0 && (skinType || concerns.length > 0)) {
      aiTriggeredRef.current = true;
      generateAiSummary(reviews, keywordMatches).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length, skinType, concerns.length]);

  function computeKeywordMatches(webReviews: WebReview[]): KeywordMatch[] {
    const terms: string[] = [];
    if (skinType) terms.push(skinType.toLowerCase());
    for (const c of concerns) terms.push(c.toLowerCase());
    if (sensitivity === 'high' || sensitivity === 'very high') terms.push('sensitive');

    if (terms.length === 0) return [];

    const matches: KeywordMatch[] = [];
    for (const term of terms) {
      let count = 0;
      for (const r of webReviews) {
        const text = `${r.sourceTitle} ${r.content}`.toLowerCase();
        if (text.includes(term)) count++;
      }
      if (count > 0) {
        matches.push({ term, count });
      }
    }
    return matches.sort((a, b) => b.count - a.count);
  }

  async function generateAiSummary(summaryReviews: WebReview[], matches: KeywordMatch[]) {
    setAiLoading(true);
    try {
      console.log('[RetailerReviews] AI summary call starting for', listing.retailerName);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI summary timeout')), 25000),
      );

      const aiPromise = (async () => {
        const ctx = buildAIContext('retailer_review_summary', {
          page: {
            mode: 'retailer_review_summary',
            productName,
            productBrand,
            retailerName: listing.retailerName,
            retailerDomain: listing.domain,
            reviews: summaryReviews.slice(0, 8).map(r => ({
              content: r.content,
              sourceTitle: r.sourceTitle,
              relevanceScore: r.relevanceScore,
              extractedRating: r.extractedRating,
            })),
            keywordMatches: matches,
          },
        });
        return await requestAIInsight(ctx);
      })();

      const result = await Promise.race([aiPromise, timeoutPromise]);
      if (cancelledRef.current) return;
      console.log('[RetailerReviews] AI summary result:', result.success, result.insight?.substring(0, 50));
      if (result.success && result.insight) {
        setAiSummary(result.insight);
      }
    } catch (err) {
      console.warn('[RetailerReviews] AI summary failed/timed out:', err);
    } finally {
      setAiLoading(false);
    }
  }

  const highlightProfile = {
    skinType: skinType ?? null,
    concerns,
    sensitivity: sensitivity ?? null,
    excludeNames: [productName, productBrand],
    highlightSentiment: true,
  };

  if (reviews.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-warm-gray text-center">
        No {listing.retailerName} reviews found in web results.
      </div>
    );
  }

  return (
    <div className="border-t border-blush/50 bg-cream/30">
      {/* Keyword match pills */}
      {keywordMatches.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-1.5">
          {keywordMatches.map(km => (
            <span
              key={km.term}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
            >
              <i className="ri-check-line text-[8px]" />
              {km.count} of {reviews.length} mention "{km.term}"
            </span>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {aiLoading && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 text-xs text-warm-gray">
            <NeuralBloomIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
            Summarizing reviews...
          </div>
        </div>
      )}

      {aiSummary && !aiLoading && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-white border border-blush/50">
          <div className="flex items-start gap-2">
            <NeuralBloomIcon className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-warm-gray leading-relaxed">
              {highlightRelevantKeywords(aiSummary, highlightProfile)}
            </p>
          </div>
        </div>
      )}

      {/* Review snippets */}
      <div className="px-4 py-3 space-y-2">
        {(showAll ? reviews : reviews.slice(0, 5)).map((review, i) => (
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
        ))}

        {!showAll && reviews.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-[10px] text-primary hover:text-dark transition-colors text-center pt-1 cursor-pointer"
          >
            +{reviews.length - 5} more review snippets <i className="ri-arrow-down-s-line" />
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full text-[10px] text-warm-gray hover:text-deep transition-colors text-center pt-1 cursor-pointer"
          >
            Show less <i className="ri-arrow-up-s-line" />
          </button>
        )}
      </div>
    </div>
  );
}

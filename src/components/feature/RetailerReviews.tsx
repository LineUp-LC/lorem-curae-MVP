// src/components/feature/RetailerReviews.tsx
// Per-retailer keyword-matched reviews with lazy AI summary.

import { useState, useEffect, useRef } from 'react';
import type { WebReview } from '../../types/webSearch';
import type { RetailerListing } from '../../types/retailerDirectory';
import { searchRetailerReviews } from '../../lib/api/productSearch';
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
  onKeywordMatches?: (domain: string, matches: KeywordMatch[], totalReviews: number) => void;
}

interface KeywordMatch {
  term: string;
  count: number;
}

export default function RetailerReviews({
  listing,
  productName,
  productBrand,
  onKeywordMatches,
}: RetailerReviewsProps) {
  const [reviews, setReviews] = useState<WebReview[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [keywordMatches, setKeywordMatches] = useState<KeywordMatch[]>([]);
  const fetchedRef = useRef(false);

  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();

  // Fetch reviews on mount (lazy — only when this component is rendered)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;

    async function fetchReviews() {
      setLoading(true);
      setError(null);

      const userProfile = skinType || concerns.length > 0 || sensitivity
        ? { skinType: skinType ?? undefined, concerns, sensitivity: sensitivity ?? undefined }
        : undefined;

      const result = await searchRetailerReviews(
        productName,
        productBrand,
        listing.domain,
        userProfile,
      );

      if (cancelled) return;

      if (!result) {
        setError('Could not load reviews for this retailer.');
        setLoading(false);
        return;
      }

      setReviews(result);

      // Compute keyword matches from review text
      const matches = computeKeywordMatches(result);
      setKeywordMatches(matches);
      onKeywordMatches?.(listing.domain, matches, result.length);

      setLoading(false);
      console.log('[RetailerReviews] Reviews fetched:', result?.length, 'loading set to false');

      // Auto-trigger AI summary if we have reviews + user profile
      if (result.length > 0 && (skinType || concerns.length > 0)) {
        generateAiSummary(result, matches).catch(() => {});
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.domain, productName, productBrand, skinType, concerns, sensitivity]);

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

  async function generateAiSummary(webReviews: WebReview[], matches: KeywordMatch[]) {
    setAiLoading(true);
    try {
      console.log('[RetailerReviews] AI summary call starting for', listing.retailerName);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI summary timeout')), 15000),
      );

      const aiPromise = (async () => {
        const ctx = buildAIContext('retailer_review_summary', {
          page: {
            mode: 'retailer_review_summary',
            productName,
            productBrand,
            retailerName: listing.retailerName,
            retailerDomain: listing.domain,
            reviews: webReviews.slice(0, 8).map(r => ({
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

  if (loading) {
    return (
      <div className="border-t border-blush/50 bg-cream/30 px-4 py-3 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-2.5 rounded-lg bg-white border border-blush/30 animate-pulse">
            <div className="h-3 bg-blush/40 rounded w-full mb-2" />
            <div className="h-3 bg-blush/30 rounded w-3/4 mb-2" />
            <div className="flex items-center justify-between mt-1.5">
              <div className="h-2 bg-blush/20 rounded w-16" />
              <div className="h-2 bg-blush/20 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-xs text-warm-gray text-center">
        {error}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-warm-gray text-center">
        No reviews found on {listing.retailerName} for this product.
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
        {reviews.slice(0, 5).map((review, i) => (
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

        {reviews.length > 5 && (
          <p className="text-[10px] text-warm-gray text-center pt-1">
            +{reviews.length - 5} more review snippets on {listing.retailerName}
          </p>
        )}
      </div>
    </div>
  );
}

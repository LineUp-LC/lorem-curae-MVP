/**
 * AIReviewSummary — Deterministic review evidence + optional AI narrative
 *
 * Always renders pre-computed evidence (no API needed):
 *   average rating, sentiment bar, top pros/cons, skin type distribution.
 * Below the deterministic card, calls summarizeReviewsForUser() for an
 * AI-generated narrative summary. Guest users see deterministic only.
 */

import { useState, useCallback, useMemo } from 'react';
import type { Product } from '../../types/product';
import type { MockReview } from '../../mocks/reviews';
import type { EnvironmentContext } from '../../lib/environment/context';
import type { AIInsightResult, AIInsightError } from '../../lib/ai/surfaceClient';
import { computeReviewSummaryEvidence } from '../../lib/ai/discoveryAssistant';
import { summarizeReviewsForUser } from '../../lib/ai/discoveryClient';
import { calculateSimilarityWeight } from '../../lib/utils/reviewSimilarity';
import type { ReviewProfile, UserProfile } from '../../lib/utils/reviewSimilarity';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveComplexion, getEffectiveSensitivity } from '../../lib/utils/sessionState';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIReviewSummaryProps {
  product: Product;
  reviews: MockReview[];
  environment?: EnvironmentContext | null;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIReviewSummary({
  product,
  reviews,
  environment,
  compact = false,
}: AIReviewSummaryProps) {
  const [aiResult, setAiResult] = useState<AIInsightResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Profile-aware review filtering — pass similar reviews to AI summary
  const { filteredReviews, filteredCount } = useMemo(() => {
    const skinType = getEffectiveSkinType();
    const concerns = getEffectiveConcerns();
    const complexion = getEffectiveComplexion();
    const sensitivity = getEffectiveSensitivity();

    // If no profile data, pass all reviews
    if (!skinType && concerns.length === 0) {
      return { filteredReviews: reviews, filteredCount: null };
    }

    const userProfile: UserProfile = {
      skinType: skinType || '',
      primaryConcerns: concerns,
      complexion,
      sensitivity,
      lifestyle: [],
      age: 0,
    };

    const similar = reviews.filter((r) => {
      const reviewProfile: ReviewProfile = {
        skinType: r.skinType,
        skinConcerns: r.skinConcerns,
        complexion: r.complexion,
        sensitivity: r.sensitivity,
        lifestyle: r.lifestyle,
        age: r.age,
      };
      return calculateSimilarityWeight(reviewProfile, userProfile).score >= 30;
    });

    // Graceful degradation: if 0 matches, pass all reviews
    if (similar.length === 0) {
      return { filteredReviews: reviews, filteredCount: null };
    }

    return { filteredReviews: similar, filteredCount: similar.length };
  }, [reviews]);

  // Deterministic evidence — always computed, no API needed
  const evidence = useMemo(() => computeReviewSummaryEvidence(reviews), [reviews]);

  // Nothing to show
  if (evidence.totalReviews === 0) return null;

  const { totalReviews, averageRating, sentimentBreakdown, topPros, topCons, skinTypeDistribution } = evidence;
  const sentimentTotal = sentimentBreakdown.positive + sentimentBreakdown.mixed + sentimentBreakdown.negative;

  // Fetch AI summary — uses profile-filtered reviews
  const fetchAISummary = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await summarizeReviewsForUser({ product, reviews: filteredReviews, environment });
      setAiResult(res.insight);
    } catch {
      setAiResult({ success: false, error: 'Failed to load AI summary' });
    } finally {
      setAiLoading(false);
    }
  }, [product, filteredReviews, environment]);

  const handleToggleAI = () => {
    const next = !showAI;
    setShowAI(next);
    if (next && !aiResult) {
      fetchAISummary();
    }
  };

  // Determine AI insight text
  let aiInsightText: string | undefined;
  if (aiResult?.success) {
    aiInsightText = aiResult.insight;
  } else if (aiResult && !aiResult.success && (aiResult as AIInsightError).fallbackInsight) {
    aiInsightText = (aiResult as AIInsightError).fallbackInsight;
  }

  // Star rendering
  const fullStars = Math.floor(averageRating);
  const hasHalf = averageRating - fullStars >= 0.25 && averageRating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div
      className="bg-cream/30 border border-blush/40 rounded-xl p-4"
      role="complementary"
      aria-label="Review summary"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <i className="ri-chat-quote-line text-xs text-primary" />
        </div>
        <span className="text-xs font-semibold text-deep">Review Summary</span>
        <span className="text-[10px] text-warm-gray ml-auto">{totalReviews} reviews</span>
      </div>

      {/* Average Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          {Array.from({ length: fullStars }).map((_, i) => (
            <i key={`full-${i}`} className="ri-star-fill text-sm text-yellow-400" />
          ))}
          {hasHalf && <i className="ri-star-half-fill text-sm text-yellow-400" />}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <i key={`empty-${i}`} className="ri-star-line text-sm text-blush" />
          ))}
        </div>
        <span className="text-sm font-semibold text-deep">{averageRating.toFixed(1)}</span>
      </div>

      {/* Sentiment Bar */}
      {sentimentTotal > 0 && (
        <div className="mb-3">
          <div className="flex h-2 rounded-full overflow-hidden bg-blush/20">
            {sentimentBreakdown.positive > 0 && (
              <div
                className="bg-primary/70 transition-all"
                style={{ width: `${(sentimentBreakdown.positive / sentimentTotal) * 100}%` }}
                title={`${sentimentBreakdown.positive} positive`}
              />
            )}
            {sentimentBreakdown.mixed > 0 && (
              <div
                className="bg-yellow-400/70 transition-all"
                style={{ width: `${(sentimentBreakdown.mixed / sentimentTotal) * 100}%` }}
                title={`${sentimentBreakdown.mixed} mixed`}
              />
            )}
            {sentimentBreakdown.negative > 0 && (
              <div
                className="bg-red-400/60 transition-all"
                style={{ width: `${(sentimentBreakdown.negative / sentimentTotal) * 100}%` }}
                title={`${sentimentBreakdown.negative} negative`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-warm-gray">{sentimentBreakdown.positive} positive</span>
            <span className="text-[10px] text-warm-gray">{sentimentBreakdown.mixed} mixed</span>
            <span className="text-[10px] text-warm-gray">{sentimentBreakdown.negative} negative</span>
          </div>
        </div>
      )}

      {/* Top Pros */}
      {topPros.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">Common positives</span>
          <ul className="mt-1 space-y-0.5">
            {topPros.map((pro, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <i className="ri-checkbox-circle-fill text-[10px] mt-0.5 text-primary/60 flex-shrink-0" />
                <span className="text-xs text-deep capitalize">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Cons */}
      {topCons.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">Common concerns</span>
          <ul className="mt-1 space-y-0.5">
            {topCons.map((con, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <i className="ri-error-warning-line text-[10px] mt-0.5 text-yellow-500/70 flex-shrink-0" />
                <span className="text-xs text-deep capitalize">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skin Type Distribution (non-compact only) */}
      {!compact && Object.keys(skinTypeDistribution).length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">Reviewer skin types</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(skinTypeDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream/60 text-[10px] font-medium text-warm-gray rounded-full border border-blush/30"
                >
                  {type} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      {/* AI Summary Toggle + Animated Content */}
      <div className="mt-2 pt-2 border-t border-blush/30">
        <button
          onClick={handleToggleAI}
          className="w-full flex items-center gap-2 text-xs text-primary hover:text-dark transition-colors"
        >
          <NeuralBloomIcon size={10} className="text-primary flex-shrink-0" />
          <span className="font-medium">AI-powered summary</span>
          {filteredCount !== null && (
            <span className="text-[10px] text-warm-gray font-normal">
              Based on {filteredCount} similar reviews
            </span>
          )}
          <i className={`ri-arrow-${showAI ? 'up' : 'down'}-s-line text-warm-gray ml-auto transition-transform duration-300`} />
        </button>

        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{ maxHeight: showAI ? '500px' : '0px', opacity: showAI ? 1 : 0 }}
        >
          <div className="pt-2.5">
            {aiLoading && (
              <div className="animate-pulse space-y-1.5">
                <div className="h-2.5 bg-blush/15 rounded w-full" />
                <div className="h-2.5 bg-blush/15 rounded w-4/5" />
                <div className="h-2.5 bg-blush/15 rounded w-3/5" />
              </div>
            )}

            {!aiLoading && aiInsightText && (
              <ul className="space-y-1.5">
                {aiInsightText
                  .split(/(?<=\.)\s+/)
                  .map(s => s.trim())
                  .filter(s => s.length > 0)
                  .map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-xs mt-0.5 flex-shrink-0 text-primary/60" />
                      <span className="text-xs text-deep leading-relaxed">
                        {highlightRelevantKeywords(bullet, {
                          skinType: getEffectiveSkinType(),
                          concerns: getEffectiveConcerns(),
                          sensitivity: getEffectiveSensitivity(),
                          excludeNames: [product.name, product.brand],
                          highlightSentiment: true,
                        })}
                      </span>
                    </li>
                  ))}
              </ul>
            )}

            {!aiLoading && !aiInsightText && aiResult && !aiResult.success && (
              <p className="text-xs text-warm-gray">
                {(aiResult as AIInsightError).error || 'Unable to generate summary right now.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

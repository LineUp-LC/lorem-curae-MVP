/**
 * ScanReviewPanel — profile-filtered reviews with AI summary for a compatible product.
 *
 * Shown inline when a user taps a compatible product in PostScanDiscovery.
 * 1. Fetches reviews (Supabase + mock fallback)
 * 2. Filters by user similarity using calculateSimilarityWeight
 * 3. Generates AI summary via curated_review_summary mode
 * 4. Renders summary block + collapsible individual reviews
 */

import { useState, useEffect } from 'react';
import type { Product } from '../../../types/product';
import type { ReviewForSummary } from '../../../lib/ai/surfaceContext';
import { fetchReviewsForProduct } from '../../../lib/data/reviews';
import { getReviewsForProduct } from '../../../mocks/reviews';
import {
  calculateSimilarityWeight,
  getTierBadgeInfo,
} from '../../../lib/utils/reviewSimilarity';
import type { MatchTier } from '../../../lib/utils/reviewSimilarity';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveComplexion,
  getEffectiveSensitivity,
  getEffectiveLifestyle,
} from '../../../lib/utils/sessionState';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { useAuth } from '../../../lib/auth/AuthContext';
import { highlightRelevantKeywords } from '../../../lib/utils/highlightKeywords';

interface ScanReviewPanelProps {
  product: Product;
}

interface ScoredReview {
  id: string;
  userName: string;
  rating: number;
  content: string;
  skinType: string;
  concerns: string[];
  pros?: string[];
  cons?: string[];
  usageDurationWeeks: number;
  score: number;
  matchTier: MatchTier;
  matchDetails: string[];
}

export default function ScanReviewPanel({ product }: ScanReviewPanelProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ScoredReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setLoading(true);

      const skinType = getEffectiveSkinType() || '';
      const concerns = getEffectiveConcerns();
      const complexion = getEffectiveComplexion();
      const sensitivity = getEffectiveSensitivity();
      const lifestyle = getEffectiveLifestyle();

      if (!skinType) {
        // No profile — can't compute similarity
        setReviews([]);
        setLoading(false);
        return;
      }

      const userProfile = {
        skinType,
        primaryConcerns: concerns,
        complexion,
        sensitivity,
        lifestyle,
        age: 25, // default — age not reliably available
      };

      // Fetch from Supabase + mock fallback
      let rawReviews: Array<{
        id: string;
        userName: string;
        rating: number;
        content: string;
        skinType: string;
        skinConcerns: string[];
        complexion?: string;
        sensitivity?: string;
        lifestyle?: string[];
        age?: number;
        pros?: string[];
        cons?: string[];
        usageDurationWeeks?: number;
      }> = [];

      // Supabase reviews
      if (user) {
        const supaReviews = await fetchReviewsForProduct(product.id);
        rawReviews = supaReviews.map(r => ({
          id: r.id,
          userName: 'User',
          rating: r.rating,
          content: r.content,
          skinType: r.skin_type || '',
          skinConcerns: r.skin_concerns || [],
          pros: r.pros,
          cons: r.cons,
          usageDurationWeeks: r.usage_duration_weeks || 4,
        }));
      }

      // Mock fallback / supplement
      const mockReviews = getReviewsForProduct(product.id);
      for (const mock of mockReviews) {
        // Avoid duplicates (mock IDs won't collide with Supabase UUIDs)
        const mockId = String(mock.id);
        if (!rawReviews.some(r => r.id === mockId)) {
          rawReviews.push({
            id: mockId,
            userName: mock.userName,
            rating: mock.rating,
            content: mock.content,
            skinType: mock.skinType || '',
            skinConcerns: mock.skinConcerns || [],
            complexion: mock.complexion,
            sensitivity: mock.sensitivity,
            lifestyle: mock.lifestyle,
            age: mock.age,
            pros: mock.pros,
            cons: mock.cons,
            usageDurationWeeks: mock.usageDurationWeeks || 4,
          });
        }
      }

      // Score and filter by similarity
      const scored: ScoredReview[] = rawReviews
        .map(r => {
          const sim = calculateSimilarityWeight(
            {
              skinType: r.skinType,
              skinConcerns: r.skinConcerns,
              complexion: r.complexion,
              sensitivity: r.sensitivity,
              lifestyle: r.lifestyle,
              age: r.age || 25,
            },
            userProfile,
          );
          return {
            id: r.id,
            userName: r.userName,
            rating: r.rating,
            content: r.content,
            skinType: r.skinType,
            concerns: r.skinConcerns,
            pros: r.pros,
            cons: r.cons,
            usageDurationWeeks: r.usageDurationWeeks || 4,
            score: sim.score,
            matchTier: sim.matchTier,
            matchDetails: sim.matchDetails,
          };
        })
        .filter(r => r.score >= 30) // Partial match minimum
        .sort((a, b) => b.score - a.score);

      if (!cancelled) {
        setReviews(scored);
        setLoading(false);
      }

      // Fetch AI summary if we have matching reviews
      if (scored.length > 0 && user && !cancelled) {
        setAiLoading(true);
        const positiveCount = scored.filter(r => r.rating >= 4).length;
        const avgRating = scored.reduce((s, r) => s + r.rating, 0) / scored.length;

        const reviewsForSummary: ReviewForSummary[] = scored.slice(0, 10).map(r => ({
          rating: r.rating,
          skinType: r.skinType,
          concerns: r.concerns,
          content: r.content,
          pros: r.pros,
          cons: r.cons,
          usageDurationWeeks: r.usageDurationWeeks,
        }));

        try {
          const ctx = buildAIContext('curated_review_summary', {
            page: {
              mode: 'curated_review_summary',
              product,
              reviews: reviewsForSummary,
              matchStats: {
                totalMatching: scored.length,
                avgRating,
                positivePercent: Math.round((positiveCount / scored.length) * 100),
              },
            },
          });

          const result = await requestAIInsight(ctx);
          if (!cancelled && result.success) {
            setAiSummary(result.insight);
          }
        } catch {
          // Silent fail — summary is supplementary
        } finally {
          if (!cancelled) setAiLoading(false);
        }
      }
    }

    loadReviews();
    return () => { cancelled = true; };
  }, [product, user]);

  if (loading) {
    return (
      <div className="border-t border-blush/50 px-4 py-4">
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-blush/40 rounded w-2/3" />
          <div className="h-3 bg-blush/40 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border-t border-blush/50 px-4 py-4">
        <p className="text-xs text-warm-gray text-center">
          No matching reviews found for your skin profile
        </p>
      </div>
    );
  }

  const visibleReviews = expanded ? reviews : [];

  return (
    <div className="border-t border-blush/50">
      {/* AI Summary */}
      {aiSummary && (
        <div className="mx-4 mt-3 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-1.5">
            <i className="ri-sparkling-line text-primary/60 text-sm mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-deep leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      )}
      {aiLoading && !aiSummary && (
        <div className="mx-4 mt-3 bg-primary/5 rounded-xl px-3 py-2.5">
          <div className="h-3 bg-primary/10 rounded animate-pulse w-4/5" />
        </div>
      )}

      {/* Collapsible reviews */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-warm-gray hover:text-primary transition-colors"
      >
        <span>{reviews.length} matching review{reviews.length !== 1 ? 's' : ''}</span>
        <i className={`ri-arrow-${expanded ? 'up' : 'down'}-s-line`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2.5">
          {visibleReviews.map(review => {
            const badge = getTierBadgeInfo(review.matchTier, review.score);
            const isMatchExpanded = expandedMatchId === review.id;
            const userSkinType = getEffectiveSkinType();

            return (
              <div key={review.id} className="bg-cream/50 border border-blush/30 rounded-lg p-3">
                {/* Header row: stars + name + badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <i
                            key={star}
                            className={`text-[10px] ${
                              star <= review.rating
                                ? 'ri-star-fill text-amber-500'
                                : 'ri-star-line text-blush'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-warm-gray truncate">
                        {review.userName}
                      </span>
                    </div>
                    {/* Reviewer profile: skin type + concerns */}
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      {review.skinType && (
                        <span className={`text-[10px] ${
                          userSkinType && review.skinType.toLowerCase() === userSkinType.toLowerCase()
                            ? 'text-primary font-medium'
                            : 'text-warm-gray'
                        }`}>
                          {review.skinType} skin
                        </span>
                      )}
                      {review.concerns.length > 0 && (
                        <>
                          <span className="text-warm-gray/30 text-[10px]">·</span>
                          <span className="text-[10px] text-warm-gray truncate">
                            {review.concerns.slice(0, 2).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {badge && (
                    <button
                      onClick={() => setExpandedMatchId(isMatchExpanded ? null : review.id)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${badge.color}`}
                    >
                      <i className={`${badge.icon} text-[9px]`} />
                      {badge.label}
                    </button>
                  )}
                </div>

                {/* Expandable match breakdown */}
                {isMatchExpanded && review.matchDetails.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {review.matchDetails.map((detail, i) => (
                      <span
                        key={i}
                        className="text-[9px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}

                {/* Review content with highlighting */}
                <p className="text-[11px] text-warm-gray mt-1.5 leading-relaxed line-clamp-3">
                  {highlightRelevantKeywords(review.content, {
                    skinType: getEffectiveSkinType(),
                    concerns: getEffectiveConcerns(),
                    sensitivity: getEffectiveSensitivity(),
                    excludeNames: [product.name, product.brand],
                  })}
                </p>

                {/* Pros/cons */}
                {(review.pros?.length || review.cons?.length) ? (
                  <div className="flex gap-3 mt-1.5">
                    {review.pros?.length ? (
                      <div className="flex items-center gap-0.5 text-[10px] text-sage">
                        <i className="ri-thumb-up-line" />
                        {review.pros.slice(0, 2).join(', ')}
                      </div>
                    ) : null}
                    {review.cons?.length ? (
                      <div className="flex items-center gap-0.5 text-[10px] text-yellow-700">
                        <i className="ri-thumb-down-line" />
                        {review.cons.slice(0, 2).join(', ')}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

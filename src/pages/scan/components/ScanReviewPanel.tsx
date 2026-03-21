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
import { matchesConcern } from '../../../lib/utils/matching';
import { isComplexionMatch } from '../../../lib/utils/reviewSimilarity';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

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
  complexion?: string;
  sensitivity?: string;
  lifestyle?: string[];
  age: number;
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
  const [matchPopupReview, setMatchPopupReview] = useState<ScoredReview | null>(null);

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
            complexion: r.complexion,
            sensitivity: r.sensitivity,
            lifestyle: r.lifestyle,
            age: r.age || 25,
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
            <NeuralBloomIcon className="w-3.5 h-3.5 text-primary/60 mt-0.5 flex-shrink-0" />
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
            const userSkinType = getEffectiveSkinType();
            const userConcerns = getEffectiveConcerns();

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
                    {/* Reviewer skin type + usage */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {review.skinType && (
                        <span className={`text-[10px] ${
                          userSkinType && review.skinType.toLowerCase() === userSkinType.toLowerCase()
                            ? 'text-primary font-medium'
                            : 'text-warm-gray'
                        }`}>
                          {review.skinType} skin
                        </span>
                      )}
                      <span className="text-[10px] text-warm-gray">· {review.usageDurationWeeks}w use</span>
                    </div>
                  </div>
                  {badge && (
                    <button
                      onClick={() => setMatchPopupReview(review)}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${badge.color}`}
                    >
                      <i className={`${badge.icon} text-[9px]`} />
                      {badge.label}
                    </button>
                  )}
                </div>

                {/* Concern pills — highlighted when matching user profile */}
                {review.concerns.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {review.concerns.map((concern, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 text-[10px] rounded-full ${
                          matchesConcern(concern, userConcerns)
                            ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium'
                            : 'bg-cream text-warm-gray'
                        }`}
                      >
                        {concern}
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
                      <div className="flex items-center gap-0.5 text-[10px] text-warm-gray">
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

      {/* Match Breakdown Modal — same pattern as ProductReviews */}
      {matchPopupReview && (() => {
        const r = matchPopupReview;
        const userSkinType = getEffectiveSkinType() || '';
        const userConcerns = getEffectiveConcerns();
        const userComplexion = getEffectiveComplexion();
        const userLifestyle = getEffectiveLifestyle();

        const skinTypeMatch = r.skinType.toLowerCase() === userSkinType.toLowerCase();
        let concernCount = 0;
        r.concerns.forEach(rc => {
          if (matchesConcern(rc, userConcerns)) concernCount++;
        });
        const complexionResult = isComplexionMatch(r.complexion || '', userComplexion);
        const complexionMatch = complexionResult !== 'none';
        const lifestyleMatch = !!(r.lifestyle && userLifestyle.length > 0 && r.lifestyle.some(l => userLifestyle.includes(l)));
        const ageMatch = Math.abs(r.age - 25) <= 5;

        const popupBadge = getTierBadgeInfo(r.matchTier, r.score);
        const rows = [
          { name: 'Skin Type', points: '+40', matched: skinTypeMatch, earned: skinTypeMatch ? 40 : 0, theirs: r.skinType, yours: userSkinType || '—' },
          { name: 'Concerns', points: '+15/ea', matched: concernCount > 0, earned: concernCount * 15, theirs: r.concerns.slice(0, 2).join(', '), yours: userConcerns.slice(0, 2).join(', '), note: `${concernCount} matched` },
          { name: 'Complexion', points: '+10', matched: complexionMatch, earned: complexionMatch ? 10 : 0, theirs: r.complexion || '—', yours: userComplexion || '—', note: complexionMatch ? (complexionResult === 'exact' ? 'exact' : '±1 tier') : undefined },
          { name: 'Lifestyle', points: '+5', matched: lifestyleMatch, earned: lifestyleMatch ? 5 : 0, theirs: r.lifestyle?.slice(0, 1).join('') || '—', yours: userLifestyle.slice(0, 1).join('') || '—' },
          { name: 'Age Range', points: '+5', matched: ageMatch, earned: ageMatch ? 5 : 0, theirs: `Age ${r.age}`, yours: 'Age 25', note: '±5 years' },
        ];

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-5 border-b border-blush/30 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-deep">Match Breakdown</h3>
                  <p className="text-xs text-warm-gray mt-0.5">{r.userName}&apos;s profile vs yours</p>
                </div>
                <button
                  onClick={() => setMatchPopupReview(null)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <div className="p-5">
                {popupBadge && (
                  <div className="flex justify-center mb-5">
                    <span className={`flex items-center space-x-1.5 px-4 py-2 ${popupBadge.color} text-sm font-semibold rounded-full`}>
                      <i className={popupBadge.icon} />
                      <span>{popupBadge.label}</span>
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {rows.map((row, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${row.matched ? 'bg-light/20 border border-primary-200' : 'bg-cream/50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${row.matched ? 'bg-primary/20 text-primary-700' : 'bg-blush/30 text-warm-gray/40'}`}>
                          <i className={row.matched ? 'ri-check-line text-sm' : 'ri-close-line text-sm'} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${row.matched ? 'text-deep' : 'text-warm-gray'}`}>{row.name}</p>
                          <p className="text-[11px] text-warm-gray/70">
                            {row.theirs} vs {row.yours}{row.note ? ` · ${row.note}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${row.matched ? 'text-primary-700' : 'text-warm-gray/40'}`}>
                        +{row.earned}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-blush/30 flex items-center justify-between">
                  <span className="text-sm font-semibold text-deep">Total Score</span>
                  <span className="text-lg font-bold text-primary">{Math.min(r.score, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

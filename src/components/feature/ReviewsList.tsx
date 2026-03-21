/**
 * ReviewsList — Fetches and displays product reviews from Supabase,
 * blended with mock data. Integrates reviewSimilarity.ts for
 * "Reviews from Similar Skin Types" section.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveComplexion,
  getEffectiveLifestyle,
} from '@/lib/utils/sessionState';
import {
  fetchReviewsForProduct,
  fetchUserReview,
  deleteReview,
} from '@/lib/data/reviews';
import {
  calculateSimilarityWeight,
  getTierBadgeInfo,
} from '@/lib/utils/reviewSimilarity';
import { matchesConcern } from '@/lib/utils/matching';
import { getReviewsForProduct } from '@/mocks/reviews';
import type { ProductReview } from '@/types/review';
import type { MockReview } from '@/mocks/reviews';
import ReviewForm from './ReviewForm';
import { highlightRelevantKeywords } from '@/lib/utils/highlightKeywords';
import { getEffectiveSensitivity } from '@/lib/utils/sessionState';

interface ReviewsListProps {
  productId: number;
  onReviewCountChange?: (count: number) => void;
}

type SortKey = 'recent' | 'highest' | 'helpful' | 'relevant';

/** Unified review shape for rendering */
interface DisplayReview {
  id: string;
  userId: string | null;
  rating: number;
  title: string | null;
  content: string;
  skinType: string | null;
  skinConcerns: string[];
  pros: string[];
  cons: string[];
  wouldRecommend: boolean | null;
  usageDurationWeeks: number | null;
  helpfulCount: number;
  createdAt: string;
  isOwn: boolean;
  isMock: boolean;
  /** Raw Supabase row for edit/delete */
  raw?: ProductReview;
}

function mockToDisplay(m: MockReview): DisplayReview {
  return {
    id: `mock-${m.id}`,
    userId: null,
    rating: m.rating,
    title: m.title,
    content: m.content,
    skinType: m.skinType,
    skinConcerns: m.skinConcerns,
    pros: m.pros ?? [],
    cons: m.cons ?? [],
    wouldRecommend: m.wouldRecommend ?? null,
    usageDurationWeeks: m.usageDurationWeeks ?? null,
    helpfulCount: m.helpful,
    createdAt: m.date,
    isOwn: false,
    isMock: true,
  };
}

function supabaseToDisplay(r: ProductReview, currentUserId?: string): DisplayReview {
  return {
    id: r.id,
    userId: r.user_id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    skinType: r.skin_type,
    skinConcerns: r.skin_concerns ?? [],
    pros: r.pros ?? [],
    cons: r.cons ?? [],
    wouldRecommend: r.would_recommend,
    usageDurationWeeks: r.usage_duration_weeks,
    helpfulCount: r.helpful_count ?? 0,
    createdAt: r.created_at,
    isOwn: !!currentUserId && r.user_id === currentUserId,
    isMock: false,
    raw: r,
  };
}

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function usageDurationLabel(weeks: number | null): string | null {
  if (weeks == null) return null;
  if (weeks <= 1) return '<1 week';
  if (weeks <= 4) return '1-4 weeks';
  if (weeks <= 12) return '1-3 months';
  if (weeks <= 24) return '3-6 months';
  return '6+ months';
}

export default function ReviewsList({
  productId,
  onReviewCountChange,
}: ReviewsListProps) {
  const { user } = useAuth();
  const isGuest = !user;

  const skinType = getEffectiveSkinType() || '';
  const concerns = getEffectiveConcerns();
  const complexion = getEffectiveComplexion() || '';
  const lifestyle = getEffectiveLifestyle();

  const hasProfile = !!(skinType || concerns.length > 0);

  const userProfile = useMemo(
    () => ({
      skinType,
      primaryConcerns: concerns,
      complexion,
      sensitivity: '',
      lifestyle,
      age: 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skinType, concerns.join(','), complexion, lifestyle.join(',')],
  );

  // State
  const [supabaseReviews, setSupabaseReviews] = useState<ProductReview[]>([]);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>(hasProfile ? 'relevant' : 'recent');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | undefined>(
    undefined,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const userId = user?.id;
  const loadReviews = useCallback(async () => {
    setLoading(true);
    const reviews = await fetchReviewsForProduct(productId);
    setSupabaseReviews(reviews);

    if (userId) {
      const own = await fetchUserReview(productId, userId);
      setUserReview(own);
    }

    setLoading(false);
  }, [productId, userId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Blend Supabase + mock reviews (Supabase takes priority)
  const allReviews: DisplayReview[] = useMemo(() => {
    const real = supabaseReviews.map((r) => supabaseToDisplay(r, user?.id));
    const mocks = getReviewsForProduct(productId).map(mockToDisplay);
    // Only include mocks if no real reviews exist yet
    const blended = real.length > 0 ? real : [...real, ...mocks];
    return blended;
  }, [supabaseReviews, productId, user?.id]);

  useEffect(() => {
    onReviewCountChange?.(allReviews.length);
  }, [allReviews.length, onReviewCountChange]);

  // Score all reviews for similarity
  const scoredReviews = useMemo(() => {
    return allReviews.map((r) => {
      if (!hasProfile || !r.skinType) {
        return { ...r, similarity: 0, matchTier: 'none' as const, matchDetails: [] as string[] };
      }
      const result = calculateSimilarityWeight(
        {
          skinType: r.skinType,
          skinConcerns: r.skinConcerns,
          complexion: '',
          lifestyle: [],
          age: 0,
        },
        userProfile,
      );
      return { ...r, similarity: result.score, matchTier: result.matchTier, matchDetails: result.matchDetails };
    });
  }, [allReviews, userProfile, hasProfile]);

  // Sort
  const sortedReviews = useMemo(() => {
    const copy = [...scoredReviews];
    switch (sortKey) {
      case 'recent':
        copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'highest':
        copy.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'helpful':
        copy.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'relevant':
        copy.sort((a, b) => b.similarity - a.similarity || b.rating - a.rating);
        break;
    }
    return copy;
  }, [scoredReviews, sortKey]);

  // Split into "Similar Skin" + "All"
  const highSimReviews = hasProfile
    ? sortedReviews.filter((r) => r.similarity >= 50).slice(0, 3)
    : [];
  const highSimIds = new Set(highSimReviews.map((r) => r.id));
  const remainingReviews = highSimReviews.length > 0
    ? sortedReviews.filter((r) => !highSimIds.has(r.id))
    : sortedReviews;

  const handleDelete = async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    if (success) {
      setDeleteConfirm(null);
      loadReviews();
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(undefined);
    loadReviews();
  };

  const handleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sort options
  const sortOptions: { key: SortKey; label: string; guestHidden?: boolean }[] = [
    { key: 'recent', label: 'Most Recent' },
    { key: 'highest', label: 'Highest Rated' },
    { key: 'helpful', label: 'Most Helpful' },
    { key: 'relevant', label: 'Most Relevant', guestHidden: !hasProfile },
  ];

  const renderReviewCard = (
    review: typeof scoredReviews[number],
    showMatchDetails?: boolean,
  ) => {
    const badge =
      review.matchTier !== 'none'
        ? getTierBadgeInfo(review.matchTier, review.similarity)
        : null;

    return (
      <div
        key={review.id}
        className={`rounded-xl p-4 border ${
          showMatchDetails
            ? 'bg-light/10 border-primary-200'
            : review.isOwn
              ? 'bg-primary/5 border-primary/20'
              : 'bg-white border-blush/40'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              {review.isOwn && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Your review
                </span>
              )}
              {badge && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${badge.color} text-[9px] font-medium rounded-full`}
                >
                  <i className={`${badge.icon} text-[9px]`} />
                  {badge.label}
                </span>
              )}
            </div>
            {/* Match detail tags */}
            {showMatchDetails && review.matchDetails.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {review.matchDetails.map((d, i) => (
                  <span
                    key={i}
                    className="text-[9px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={`text-xs ${
                      i < review.rating
                        ? 'ri-star-fill text-amber-500'
                        : 'ri-star-line text-amber-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-warm-gray">
                {review.skinType && (
                  <span
                    className={
                      review.skinType.toLowerCase() === skinType.toLowerCase()
                        ? 'text-primary font-medium'
                        : ''
                    }
                  >
                    {review.skinType} skin
                  </span>
                )}
                {review.usageDurationWeeks != null && (
                  <> · {usageDurationLabel(review.usageDurationWeeks)}</>
                )}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-warm-gray/60 flex-shrink-0">
            {formatRelativeDate(review.createdAt)}
          </span>
        </div>

        {/* Skin concerns */}
        {review.skinConcerns.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {review.skinConcerns.map((c, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 text-[10px] rounded-full ${
                  matchesConcern(c, concerns)
                    ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium'
                    : 'bg-cream text-warm-gray'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Title + content */}
        {review.title && (
          <h4 className="text-sm font-medium text-deep mb-1 line-clamp-1">
            {review.title}
          </h4>
        )}
        <p className="text-xs text-warm-gray leading-relaxed mb-2 line-clamp-4">
          {highlightRelevantKeywords(review.content, {
            skinType: skinType || undefined,
            concerns,
            sensitivity: getEffectiveSensitivity(),
          })}
        </p>

        {/* Pros / Cons */}
        {(review.pros.length > 0 || review.cons.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {review.pros.map((p, i) => (
              <span
                key={`pro-${i}`}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-sage/10 text-sage rounded-full"
              >
                <i className="ri-add-line text-[8px]" />
                {p}
              </span>
            ))}
            {review.cons.map((c, i) => (
              <span
                key={`con-${i}`}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] bg-yellow-50 text-yellow-700 rounded-full"
              >
                <i className="ri-subtract-line text-[8px]" />
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Would recommend */}
        {review.wouldRecommend != null && (
          <p className="text-[10px] text-warm-gray mb-2 flex items-center gap-1">
            <i
              className={
                review.wouldRecommend
                  ? 'ri-thumb-up-fill text-sage'
                  : 'ri-thumb-down-fill text-yellow-600'
              }
            />
            {review.wouldRecommend
              ? 'Would recommend'
              : 'Would not recommend'}
          </p>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-blush/30 flex items-center justify-between">
          <button
            onClick={() => handleHelpful(review.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer text-xs ${
              helpfulIds.has(review.id)
                ? 'bg-primary/10 text-primary'
                : 'text-warm-gray hover:bg-cream'
            }`}
          >
            <i
              className={
                helpfulIds.has(review.id)
                  ? 'ri-thumb-up-fill'
                  : 'ri-thumb-up-line'
              }
            />
            Helpful (
            {review.helpfulCount + (helpfulIds.has(review.id) ? 1 : 0)})
          </button>

          {/* Own review actions */}
          {review.isOwn && review.raw && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingReview(review.raw);
                  setShowForm(true);
                }}
                className="text-xs text-primary hover:text-dark cursor-pointer transition-colors"
              >
                Edit
              </button>
              {deleteConfirm === review.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-xs text-warm-gray cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(review.id)}
                  className="text-xs text-warm-gray hover:text-red-500 cursor-pointer transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <i className="ri-loader-4-line animate-spin text-2xl text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Write / Edit Review CTA */}
      <div className="mb-5">
        {isGuest ? (
          <div className="flex items-center gap-2 bg-cream/50 border border-blush/30 rounded-lg px-4 py-3">
            <i className="ri-edit-line text-warm-gray" />
            <span className="text-sm text-warm-gray">
              <Link
                to="/auth/login"
                className="text-primary hover:text-dark font-medium transition-colors"
              >
                Sign in
              </Link>{' '}
              to leave a review
            </span>
          </div>
        ) : showForm ? (
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSubmitSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(undefined);
            }}
          />
        ) : (
          <button
            onClick={() => {
              setEditingReview(userReview ?? undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <i className={userReview ? 'ri-edit-line' : 'ri-quill-pen-line'} />
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Sort controls */}
      {allReviews.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-warm-gray">Sort by:</span>
          {sortOptions
            .filter((o) => !o.guestHidden)
            .map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  sortKey === opt.key
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-white text-warm-gray border-blush/30 hover:border-blush'
                }`}
              >
                {opt.label}
              </button>
            ))}
        </div>
      )}

      {/* Reviews */}
      {allReviews.length === 0 ? (
        <div className="text-center py-12 bg-cream/30 rounded-xl border border-blush/30">
          <i className="ri-chat-smile-3-line text-4xl text-warm-gray/30 mb-3 block" />
          <p className="text-sm text-warm-gray mb-1">No reviews yet</p>
          <p className="text-xs text-warm-gray/60">
            Be the first to share your experience
          </p>
        </div>
      ) : (
        <>
          {/* Similar Skin Types section */}
          {highSimReviews.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-user-heart-line text-primary" />
                <h3 className="text-sm font-semibold text-deep">
                  Reviews from Similar Skin Types
                </h3>
                <span className="text-[10px] text-warm-gray bg-cream px-2 py-0.5 rounded-full">
                  {highSimReviews.length}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {highSimReviews.map((r) => renderReviewCard(r, true))}
              </div>
            </div>
          )}

          {/* All Reviews */}
          {highSimReviews.length > 0 && remainingReviews.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-deep">All Reviews</h3>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {remainingReviews.map((r) => renderReviewCard(r))}
          </div>
        </>
      )}
    </div>
  );
}

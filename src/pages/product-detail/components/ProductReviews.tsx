import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveComplexion, getEffectiveLifestyle } from '../../../lib/utils/sessionState';
import { calculateSimilarityWeight, getTierBadgeInfo, isComplexionMatch } from '../../../lib/utils/reviewSimilarity';
import { matchesConcern } from '../../../lib/utils/matching';
import Dropdown from '../../../components/ui/Dropdown';
import { getReviewsForProduct, type MockReview } from '../../../mocks/reviews';
import { generateReviewEnvironmentInsight, getFilterChipCounts, getSmartDefaultFilter, FILTER_LABELS, type FilterCategory } from '../../../lib/utils/reviewEnvironmentInsight';
import { deriveConditions } from '../../../lib/environment/productKnowledge';
import { aggregateReviewerEvidence } from '../../../lib/utils/reviewerEvidence';
import { buildReviewSummaryContext, formatReviewSummaryPrompt } from '../../../lib/utils/reviewSummaryContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { highlightRelevantKeywords } from '../../../lib/utils/highlightKeywords';
import type { EnvironmentContext } from '../../../lib/environment/context';
import type { Product } from '../../../types/product';

type Review = MockReview;

interface UserProfileData {
  skinType: string;
  concerns: string[];
  routine: {
    morning: string[];
    evening: string[];
  };
  routineNotes: string;
  nutritionMealPlan: string[];
  nutritionTracker: {
    calories: number;
    protein: number;
    vitamins: string[];
  };
}

interface ProductReviewsProps {
  productId: number;
  product?: Product;
  env?: EnvironmentContext;
  season?: string | null;
}

const ProductReviews = ({ productId, product, env, season }: ProductReviewsProps) => {
  const { user: authUser } = useAuth();
  const isGuest = !authUser;

  // Get user skin profile from sessionState (unified source of truth)
  const skinType = getEffectiveSkinType() || '';
  const effectiveConcerns = getEffectiveConcerns();
  const concerns = effectiveConcerns;

  const complexion = getEffectiveComplexion() || '';
  const lifestyle = getEffectiveLifestyle();

  const userSkinProfile = {
    skinType,
    primaryConcerns: concerns,
    complexion,
    lifestyle,
    age: 0,
    routineLength: '3-6 months'
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<Review | null>(null);
  const [matchPopupReview, setMatchPopupReview] = useState<Review | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');

  // Category filter chips (environment-aware smart default)
  const conditions = useMemo(() => env ? deriveConditions(env) : [], [env]);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(() =>
    getSmartDefaultFilter(conditions),
  );

  // User preference warm-prompt (persists via localStorage)
  const [preferenceText, setPreferenceText] = useState(() => {
    try {
      return localStorage.getItem('review_preference') || '';
    } catch { return ''; }
  });
  const [preferenceApplied, setPreferenceApplied] = useState(() => {
    try {
      return !!localStorage.getItem('review_preference');
    } catch { return false; }
  });

  // Escape key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (matchPopupReview) setMatchPopupReview(null);
        else if (showReportModal) { setShowReportModal(null); setReportReason(''); setReportDetails(''); }
        else if (showProfileModal) setShowProfileModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [matchPopupReview, showReportModal, showProfileModal]);

  const handleHelpfulClick = (reviewId: number) => {
    if (helpfulReviews.has(reviewId)) {
      setHelpfulReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    } else {
      setAnimatingReview(reviewId);
      setHelpfulReviews(prev => new Set(prev).add(reviewId));
      setTimeout(() => setAnimatingReview(null), 300);
    }
  };

  const handleReportReview = (reviewId: number) => {
    setShowReportModal(reviewId);
    setShowReportConfirm(null);
  };

  const handleSubmitReport = () => {
    if (showReportModal && reportReason) {
      setReportedReviews(prev => new Set(prev).add(showReportModal));
      setShowReportModal(null);
      setReportReason('');
      setReportDetails('');
    }
  };

  // Mock reviewer profile data
  const getReviewerProfile = (review: Review): UserProfileData => ({
    skinType: review.skinType,
    concerns: review.skinConcerns,
    routine: {
      morning: ['Gentle Cleanser', 'Vitamin C Serum', 'Moisturizer', 'Sunscreen SPF 50'],
      evening: ['Oil Cleanser', 'Gentle Cleanser', 'Retinol Serum', 'Night Cream']
    },
    routineNotes: `I've been focusing on ${review.skinConcerns[0]?.toLowerCase() || 'skincare'} for the past few months. Consistency is key!`,
    nutritionMealPlan: ['Green smoothie', 'Salmon salad', 'Grilled chicken with veggies'],
    nutritionTracker: {
      calories: 1800,
      protein: 65,
      vitamins: ['Vitamin C', 'Vitamin E', 'Omega-3']
    }
  });

  const handleReviewerClick = (review: Review) => {
    setSelectedReviewer(review);
    setShowProfileModal(true);
  };

  // All reviews data from shared module (canonical source of truth)
  const allReviews: Review[] = getReviewsForProduct(productId);

  // Build scored reviews for the environment insight utility
  const scoredReviews = useMemo(() => {
    if (!env) return [];
    const evidence = aggregateReviewerEvidence(productId, {
      skinType: userSkinProfile.skinType,
      primaryConcerns: userSkinProfile.primaryConcerns,
      complexion: userSkinProfile.complexion,
      sensitivity: '',
      lifestyle: userSkinProfile.lifestyle,
      age: userSkinProfile.age,
    });
    return evidence?.scoredReviews || [];
  }, [productId, userSkinProfile.skinType, userSkinProfile.primaryConcerns.join(',')]);

  // Get personalized reviews using shared Similarity Weight utility
  const personalizedReviews = allReviews
    .map(review => {
      const result = calculateSimilarityWeight(
        { skinType: review.skinType, skinConcerns: review.skinConcerns, complexion: review.complexion, lifestyle: review.lifestyle, age: review.age },
        { skinType: userSkinProfile.skinType, primaryConcerns: userSkinProfile.primaryConcerns, complexion: userSkinProfile.complexion, sensitivity: '', lifestyle: userSkinProfile.lifestyle, age: userSkinProfile.age }
      );
      return { ...review, similarityScore: result.score, matchTier: result.matchTier };
    })
    .filter(review => review.similarityScore >= 15)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 6);

  const featuredReviews = personalizedReviews.length > 0
    ? personalizedReviews
    : allReviews.slice(0, 6);

  // Review environment insight (keyword-driven summary + matched reviews)
  const appliedPref = preferenceApplied ? preferenceText : undefined;
  const reviewEnvInsight = useMemo(
    () => generateReviewEnvironmentInsight(scoredReviews, season, skinType, activeFilter, appliedPref),
    [scoredReviews, season, skinType, activeFilter, appliedPref],
  );

  // Chip counts for filter badges
  const chipCounts = useMemo(
    () => getFilterChipCounts(scoredReviews),
    [scoredReviews],
  );

  // AI-assisted review summary (authenticated users only)
  const [aiReviewSummary, setAiReviewSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!product || scoredReviews.length < 2 || isGuest) return;
    let cancelled = false;

    (async () => {
      try {
        const summaryInput = buildReviewSummaryContext(
          scoredReviews, reviewEnvInsight, env ?? null, skinType || null, concerns, product.name,
        );
        const question = formatReviewSummaryPrompt(summaryInput);
        const aiContext = buildAIContext('product_detail', {
          page: { mode: 'product_detail', product },
          environment: env,
        });
        const result = await requestAIInsight(aiContext, { question });
        if (!cancelled && result.success) {
          setAiReviewSummary(result.insight);
        }
      } catch {
        // Silently fall back to rule-based summary
      }
    })();

    return () => { cancelled = true; };
  }, [product?.id, scoredReviews.length, env?.season, skinType]);

  const totalReviews = allReviews.length;
  const averageRating = allReviews.length > 0
    ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
    : 0;

  const skinTypeLabel = skinType
    ? skinType.charAt(0).toUpperCase() + skinType.slice(1).toLowerCase() + ' skin'
    : null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    }
    return stars;
  };

  return (
    <div id="reviews" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-chat-3-line text-lg text-primary"></i>
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-deep">
              {skinTypeLabel
                ? <>What people with <span className="text-primary">{skinTypeLabel.toLowerCase()}</span> noticed</>
                : 'What people noticed'}
            </h2>
            <p className="text-xs text-warm-gray mt-0.5">Real experiences from verified buyers</p>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="bg-cream/50 rounded-xl p-5 mb-6 border border-blush/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Overall Rating */}
            <div className="text-center lg:col-span-2">
              <div className="text-5xl font-bold text-deep mb-1">
                {averageRating}
              </div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-xs text-warm-gray">
                {totalReviews} total reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="lg:col-span-3">
              <div className="space-y-2">
                {([5, 4, 3, 2, 1].map(s => ({ star: s, count: allReviews.filter(r => Math.round(r.rating) === s).length }))).map(({ star: rating, count }) => {
                  const percentage = (count / totalReviews) * 100;
                  return (
                    <Link
                      key={rating}
                      to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}&rating=${rating}`}
                      className="flex items-center space-x-3 hover:bg-cream/50 rounded-lg px-2 py-0.5 -mx-2 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-warm-gray w-6">
                        {rating}★
                      </span>
                      <div className="flex-1 h-1.5 bg-blush/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-warm-gray w-8 text-right">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Preference input + category filter chips */}
        <div className="mb-6">
          {/* "What matters most to you?" input */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={preferenceText}
                onChange={(e) => {
                  setPreferenceText(e.target.value.slice(0, 120));
                  if (preferenceApplied) setPreferenceApplied(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && preferenceText.trim()) {
                    try { localStorage.setItem('review_preference', preferenceText.trim()); } catch { /* ignore */ }
                    setPreferenceApplied(true);
                  }
                }}
                placeholder="What matters most to you? e.g., lightweight in humidity"
                aria-label="What matters most to you about this product"
                className="flex-1 text-sm text-deep bg-white border border-blush/50 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
              />
              {preferenceText.trim() && !preferenceApplied && (
                <button
                  onClick={() => {
                    try { localStorage.setItem('review_preference', preferenceText.trim()); } catch { /* ignore */ }
                    setPreferenceApplied(true);
                  }}
                  className="px-3 py-2.5 text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer flex-shrink-0"
                >
                  Apply
                </button>
              )}
              {preferenceApplied && (
                <button
                  onClick={() => {
                    setPreferenceText('');
                    setPreferenceApplied(false);
                    try { localStorage.removeItem('review_preference'); } catch { /* ignore */ }
                  }}
                  aria-label="Clear preference"
                  className="w-8 h-8 flex items-center justify-center text-warm-gray/50 hover:text-deep rounded-full hover:bg-cream transition-all cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>
            {preferenceApplied && (
              <p className="text-[10px] text-primary/70 mt-1">
                Reviews prioritized based on your preference
              </p>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'all' as FilterCategory, count: chipCounts.all },
              { key: 'climate' as FilterCategory, count: chipCounts.climate },
              { key: 'feel' as FilterCategory, count: chipCounts.feel },
              { key: 'wear_behavior' as FilterCategory, count: chipCounts.wear_behavior },
            ] as const).map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                  activeFilter === chip.key
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : chip.count === 0
                      ? 'bg-cream/50 text-warm-gray/40 border-blush/20'
                      : 'bg-cream text-warm-gray border-blush/30 hover:border-blush'
                }`}
              >
                {FILTER_LABELS[chip.key]}{chip.count > 0 ? ` (${chip.count})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Personalized summary + keyword chips */}
        {(aiReviewSummary || reviewEnvInsight) ? (
          <div className="mb-6">
            {/* AI-generated summary (authenticated) or rule-based fallback */}
            {aiReviewSummary ? (
              <div className="bg-cream/30 border border-blush/40 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-blush/30 rounded-full flex items-center justify-center">
                    <i className="ri-sparkling-line text-[10px] text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-warm-gray">
                    Review insights
                  </span>
                </div>
                <p className="text-sm text-deep leading-relaxed">
                  {aiReviewSummary}
                </p>
              </div>
            ) : reviewEnvInsight ? (
              <>
                {/* Fallback notice */}
                {reviewEnvInsight.isFallback && (
                  <p className="text-[10px] text-warm-gray/50 italic mb-2">
                    No reviews specifically mention {FILTER_LABELS[activeFilter].toLowerCase()} yet. Here's what similar users said overall.
                  </p>
                )}

                <p className="text-sm text-warm-gray leading-relaxed mb-3">
                  {reviewEnvInsight.summary}
                </p>

                {/* Guest nudge */}
                {isGuest && (
                  <p className="text-[10px] text-warm-gray/50 mt-1 flex items-center gap-1">
                    <i className="ri-information-line text-[10px]" />
                    Based on general guidance.
                    <Link to="/login" className="text-primary hover:text-deep transition-colors underline underline-offset-2">
                      Sign in
                    </Link>
                    {' '}for personalized review insights.
                  </p>
                )}
              </>
            ) : null}

            {/* Top keyword chips (shown for both AI and rule-based) */}
            {reviewEnvInsight && reviewEnvInsight.topKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {reviewEnvInsight.topKeywords.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center px-2.5 py-1 text-xs text-warm-gray bg-cream/60 border border-blush/30 rounded-full capitalize"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : scoredReviews.length > 0 ? (
          <p className="text-sm text-warm-gray/70 leading-relaxed italic mb-6">
            We haven't found reviews from people with a similar skin profile mentioning these conditions yet.
          </p>
        ) : null}

        {/* Review Cards — split into "People Like You" + "All Reviews" */}
        {(() => {
          const hasProfile = !!(skinType || concerns.length > 0);
          const highSimReviews = hasProfile
            ? personalizedReviews.filter(r => r.similarityScore >= 50).slice(0, 3)
            : [];
          const highSimIds = new Set(highSimReviews.map(r => r.id));
          const remainingReviews = highSimReviews.length > 0
            ? featuredReviews.filter(r => !highSimIds.has(r.id))
            : featuredReviews;

          const renderCard = (review: Review & { similarityScore?: number; matchTier?: string }, showMatchDetails?: boolean) => {
            const simResult = calculateSimilarityWeight(
              { skinType: review.skinType, skinConcerns: review.skinConcerns, complexion: review.complexion, lifestyle: review.lifestyle, age: review.age },
              { skinType: userSkinProfile.skinType, primaryConcerns: userSkinProfile.primaryConcerns, complexion: userSkinProfile.complexion, sensitivity: '', lifestyle: userSkinProfile.lifestyle, age: userSkinProfile.age }
            );
            const badge = simResult.matchTier !== 'none' ? getTierBadgeInfo(simResult.matchTier, simResult.score) : null;

            return (
              <>
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => handleReviewerClick(review)}
                    className="w-9 h-9 rounded-full overflow-hidden bg-cream flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                  >
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/36?text=U'; }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <button
                        onClick={() => handleReviewerClick(review)}
                        className="text-sm font-medium text-deep truncate hover:text-primary cursor-pointer transition-colors"
                      >
                        {review.userName}
                      </button>
                      {review.verified && (
                        <i className="ri-shield-check-fill text-[10px] text-warm-gray" title="Verified buyer"></i>
                      )}
                      {badge && (
                        <button
                          onClick={() => setMatchPopupReview(review)}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${badge.color} text-[9px] font-medium rounded-full hover:opacity-80 transition-opacity cursor-pointer`}
                        >
                          <i className={`${badge.icon} text-[9px]`}></i>
                          {badge.label}
                        </button>
                      )}
                    </div>
                    {/* Match detail tags (visible for high-similarity reviews) */}
                    {showMatchDetails && simResult.matchDetails.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {simResult.matchDetails.map((detail, i) => (
                          <span key={i} className="text-[9px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i
                            key={i}
                            className={`text-[10px] ${
                              i < review.rating
                                ? 'ri-star-fill text-amber-500'
                                : 'ri-star-line text-amber-500'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-[10px] text-warm-gray">
                        {review.skinType === userSkinProfile.skinType ? (
                          <span className="text-primary-700 font-medium">{review.skinType} skin</span>
                        ) : (
                          <span>{review.skinType} skin</span>
                        )} · {review.usageDurationWeeks}w use
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skin Concerns */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {review.skinConcerns.map((concern, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 text-[10px] rounded-full ${
                        matchesConcern(concern, userSkinProfile.primaryConcerns)
                          ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium'
                          : 'bg-cream text-warm-gray'
                      }`}
                    >
                      {concern}
                    </span>
                  ))}
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="text-sm font-medium text-deep mb-1 line-clamp-1">
                    {review.title}
                  </h4>
                )}
                <p className="text-xs text-warm-gray leading-relaxed mb-3 line-clamp-3">
                  {highlightRelevantKeywords(review.content, {
                    skinType: skinType || undefined,
                    concerns,
                    sensitivity: '',
                    excludeNames: product ? [product.name, product.brand] : [],
                  })}
                </p>

                {/* Review Footer */}
                <div className="pt-3 border-t border-blush/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleHelpfulClick(review.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer text-xs ${
                        helpfulReviews.has(review.id)
                          ? 'bg-primary/10 text-primary'
                          : 'text-warm-gray hover:bg-cream'
                      } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                      style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                    >
                      <i className={`${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                      <span>Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})</span>
                    </button>
                    {reportedReviews.has(review.id) ? (
                      <span className="text-[10px] text-warm-gray/60 flex items-center gap-0.5">
                        <i className="ri-flag-fill text-[10px]"></i>
                        Reported
                      </span>
                    ) : showReportConfirm === review.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-warm-gray">Report?</span>
                        <button
                          onClick={() => handleReportReview(review.id)}
                          className="text-[10px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowReportConfirm(null)}
                          className="text-[10px] text-warm-gray hover:text-deep cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReportConfirm(review.id)}
                        className="text-warm-gray/40 hover:text-warm-gray text-[10px] cursor-pointer flex items-center gap-0.5"
                        title="Report review"
                      >
                        <i className="ri-flag-line text-[10px]"></i>
                        Report
                      </button>
                    )}
                  </div>
                  <Link
                    to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
                    className="text-xs text-primary hover:text-dark font-medium cursor-pointer transition-colors flex items-center gap-0.5"
                  >
                    View full review
                    <i className="ri-arrow-right-s-line text-xs"></i>
                  </Link>
                </div>
              </>
            );
          };

          return (
            <>
              {/* "People Like You" section */}
              {highSimReviews.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-user-heart-line text-primary"></i>
                    <h3 className="text-sm font-semibold text-deep">Reviews from Similar Skin Types</h3>
                    <span className="text-[10px] text-warm-gray bg-cream px-2 py-0.5 rounded-full">{highSimReviews.length}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {highSimReviews.map((review) => (
                      <div key={review.id} className="rounded-xl p-4 border bg-light/10 border-primary-200">
                        {renderCard(review, true)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* "All Reviews" header (only when split exists) */}
              {highSimReviews.length > 0 && remainingReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-deep">All Reviews</h3>
                </div>
              )}

              {/* Remaining / all review cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {remainingReviews.map((review) => {
                  const isFullMatch = 'matchTier' in review && review.matchTier === 'full';
                  return (
                    <div key={review.id} className={`rounded-xl p-4 border ${isFullMatch ? 'bg-light/20 border-primary-300' : 'bg-white border-blush/40'}`}>
                      {renderCard(review)}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-primary hover:text-dark text-sm font-medium transition-colors cursor-pointer"
          >
            <span>Read All {totalReviews} Reviews</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>

      {/* Reviewer Profile Modal */}
      {showProfileModal && selectedReviewer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-blush/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedReviewer.userAvatar}
                  alt={selectedReviewer.userName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-deep">{selectedReviewer.userName}</h3>
                  <p className="text-sm text-warm-gray">{selectedReviewer.skinType} Skin · Age {selectedReviewer.age}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* My-Skin Profile */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2 text-sm">
                  <i className="ri-user-heart-line text-primary"></i>
                  My-Skin Profile
                </h4>
                <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                  <p className="text-sm text-warm-gray mb-2"><span className="font-medium text-deep">Skin Type:</span> {getReviewerProfile(selectedReviewer).skinType}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getReviewerProfile(selectedReviewer).concerns.map((concern, idx) => (
                      <span key={idx} className="px-3 py-1 bg-cream text-warm-gray text-xs font-medium rounded-full">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Routine */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2 text-sm">
                  <i className="ri-calendar-check-line text-primary"></i>
                  Daily Routine
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                    <p className="font-medium text-deep mb-2 flex items-center gap-2 text-sm">
                      <i className="ri-sun-line text-primary"></i> Morning
                    </p>
                    <ul className="space-y-1">
                      {getReviewerProfile(selectedReviewer).routine.morning.map((step, idx) => (
                        <li key={idx} className="text-xs text-warm-gray flex items-center gap-2">
                          <span className="w-5 h-5 bg-primary/10 text-primary rounded-full text-[10px] flex items-center justify-center">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                    <p className="font-medium text-deep mb-2 flex items-center gap-2 text-sm">
                      <i className="ri-moon-line text-primary"></i> Evening
                    </p>
                    <ul className="space-y-1">
                      {getReviewerProfile(selectedReviewer).routine.evening.map((step, idx) => (
                        <li key={idx} className="text-xs text-warm-gray flex items-center gap-2">
                          <span className="w-5 h-5 bg-primary/10 text-primary rounded-full text-[10px] flex items-center justify-center">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Routine Notes */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2 text-sm">
                  <i className="ri-sticky-note-line text-primary"></i>
                  Routine Notes
                </h4>
                <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                  <p className="text-xs text-warm-gray italic">"{getReviewerProfile(selectedReviewer).routineNotes}"</p>
                </div>
              </div>

              {/* Nutrition Meal Planner */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2 text-sm">
                  <i className="ri-restaurant-line text-primary"></i>
                  Nutrition Meal Plan
                </h4>
                <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                  <ul className="space-y-2">
                    {getReviewerProfile(selectedReviewer).nutritionMealPlan.map((meal, idx) => (
                      <li key={idx} className="text-xs text-warm-gray flex items-center gap-2">
                        <i className="ri-checkbox-circle-fill text-primary/60"></i>
                        {meal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nutrition Tracker */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2 text-sm">
                  <i className="ri-bar-chart-box-line text-primary"></i>
                  Nutrition Tracker
                </h4>
                <div className="bg-cream/50 rounded-xl p-4 border border-blush/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-primary">{getReviewerProfile(selectedReviewer).nutritionTracker.calories}</p>
                      <p className="text-[10px] text-warm-gray">Calories</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary">{getReviewerProfile(selectedReviewer).nutritionTracker.protein}g</p>
                      <p className="text-[10px] text-warm-gray">Protein</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-primary">{getReviewerProfile(selectedReviewer).nutritionTracker.vitamins.length}</p>
                      <p className="text-[10px] text-warm-gray">Key Vitamins</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-blush/30 flex items-center justify-between">
              <h3 className="text-lg font-bold text-deep">Report Review</h3>
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Reason for reporting</label>
                <Dropdown
                  id="report-reason"
                  value={reportReason}
                  onChange={setReportReason}
                  placeholder="Select a reason..."
                  options={[
                    { value: 'spam', label: 'Spam or fake review' },
                    { value: 'inappropriate', label: 'Inappropriate content' },
                    { value: 'misleading', label: 'Misleading information' },
                    { value: 'harassment', label: 'Harassment or bullying' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Additional details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more context..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-blush/50 bg-white text-deep text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-warm-gray/40"
                />
              </div>
            </div>
            <div className="p-6 border-t border-blush/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="px-4 py-2 text-warm-gray hover:text-deep transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
                  reportReason
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 text-warm-gray/60 cursor-not-allowed'
                }`}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Breakdown Popup */}
      {matchPopupReview && (() => {
        const r = matchPopupReview;
        const result = calculateSimilarityWeight(
          { skinType: r.skinType, skinConcerns: r.skinConcerns, complexion: r.complexion, lifestyle: r.lifestyle, age: r.age },
          { skinType: userSkinProfile.skinType, primaryConcerns: userSkinProfile.primaryConcerns, complexion: userSkinProfile.complexion, sensitivity: '', lifestyle: userSkinProfile.lifestyle, age: userSkinProfile.age }
        );
        const popupBadge = getTierBadgeInfo(result.matchTier, result.score);
        const skinTypeMatch = r.skinType.toLowerCase() === userSkinProfile.skinType.toLowerCase();
        let concernCount = 0;
        r.skinConcerns.forEach(rc => {
          if (matchesConcern(rc, userSkinProfile.primaryConcerns)) concernCount++;
        });
        const complexionResult = isComplexionMatch(r.complexion || '', userSkinProfile.complexion);
        const complexionMatch = complexionResult !== 'none';
        const lifestyleMatch = !!(r.lifestyle && userSkinProfile.lifestyle.length > 0 && r.lifestyle.some(l => userSkinProfile.lifestyle.includes(l)));
        const ageMatch = Math.abs(r.age - userSkinProfile.age) <= 5;

        const rows = [
          { name: 'Complexion', points: '+10', matched: complexionMatch, earned: complexionMatch ? 10 : 0, theirs: r.complexion || '—', yours: userSkinProfile.complexion || '—', note: complexionMatch ? (complexionResult === 'exact' ? 'exact' : '±1 tier') : undefined },
          { name: 'Skin Type', points: '+40', matched: skinTypeMatch, earned: skinTypeMatch ? 40 : 0, theirs: r.skinType, yours: userSkinProfile.skinType },
          { name: 'Concerns', points: '+15/ea', matched: concernCount > 0, earned: concernCount * 15, theirs: r.skinConcerns.slice(0, 2).join(', '), yours: userSkinProfile.primaryConcerns.slice(0, 2).join(', '), note: `${concernCount} matched` },
          { name: 'Age Range', points: '+5', matched: ageMatch, earned: ageMatch ? 5 : 0, theirs: `Age ${r.age}`, yours: `Age ${userSkinProfile.age}`, note: '±5 years' },
          { name: 'Lifestyle', points: '+5', matched: lifestyleMatch, earned: lifestyleMatch ? 5 : 0, theirs: r.lifestyle?.slice(0, 1).join('') || '—', yours: userSkinProfile.lifestyle.slice(0, 1).join('') || '—' },
        ];

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-5 border-b border-blush/30 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-deep">Match Breakdown</h3>
                  <p className="text-xs text-warm-gray mt-0.5">{r.userName}'s profile vs yours</p>
                </div>
                <button
                  onClick={() => setMatchPopupReview(null)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-5">
                {popupBadge && (
                  <div className="flex justify-center mb-5">
                    <span className={`flex items-center space-x-1.5 px-4 py-2 ${popupBadge.color} text-sm font-semibold rounded-full`}>
                      <i className={popupBadge.icon}></i>
                      <span>{popupBadge.label}</span>
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {rows.map((row, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${row.matched ? 'bg-light/20 border border-primary-200' : 'bg-cream/50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${row.matched ? 'bg-primary/20 text-primary-700' : 'bg-blush/30 text-warm-gray/40'}`}>
                          <i className={row.matched ? 'ri-check-line text-sm' : 'ri-close-line text-sm'}></i>
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
                  <span className="text-lg font-bold text-primary">{Math.min(result.score, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProductReviews;

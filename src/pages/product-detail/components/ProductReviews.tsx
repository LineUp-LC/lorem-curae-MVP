import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveComplexion, getEffectiveLifestyle } from '../../../lib/utils/sessionState';
import { calculateSimilarityWeight, getTierBadgeInfo, isComplexionMatch } from '../../../lib/utils/reviewSimilarity';
import { matchesConcern } from '../../../lib/utils/matching';
import Dropdown from '../../../components/ui/Dropdown';

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  skinType: string;
  skinConcerns: string[];
  complexion?: string;
  lifestyle?: string[];
  age: number;
  routineLength: string;
  // usageDurationWeeks replaces the submission date display.
  // Duration of product use is more meaningful than submission date
  // when evaluating product performance and results credibility.
  usageDurationWeeks: number;
}

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
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  // Get user skin profile from sessionState (unified source of truth)
  const rawSkinType = getEffectiveSkinType() || '';
  const rawConcerns = getEffectiveConcerns();
  const hasSurveyData = !!(rawSkinType || rawConcerns.length > 0);
  const skinType = rawSkinType || 'combination';
  const concerns = rawConcerns;

  const complexion = getEffectiveComplexion() || '';
  const lifestyle = getEffectiveLifestyle();

  const userSkinProfile = {
    skinType,
    primaryConcerns: concerns,
    complexion,
    lifestyle,
    age: 28,
    routineLength: '3-6 months'
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filterConcern, setFilterConcern] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [selectedReviewer, setSelectedReviewer] = useState<Review | null>(null);
  const [matchPopupReview, setMatchPopupReview] = useState<Review | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');

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
      // Remove from helpful
      setHelpfulReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    } else {
      // Add to helpful with animation
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
      // Here you would send to API: { reviewId: showReportModal, reason: reportReason, details: reportDetails }
      console.log('Report submitted:', { reviewId: showReportModal, reason: reportReason, details: reportDetails });
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

  // All reviews data with expanded skin profile information
  const allReviews: Review[] = [
    {
      id: 1,
      userName: 'Sarah M.',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Clear results for combination skin',
      content: 'I\'ve been using this serum for 3 months now and the difference has been significant. My T-zone is no longer oily by midday, and my cheeks feel hydrated. The texture is lightweight and absorbs quickly without any sticky residue. Perfect for my combination skin type!',
      date: '2024-01-15',
      verified: true,
      helpful: 24,
      skinType: 'combination',
      skinConcerns: ['Acne Prone', 'Lack of Hydration'],
      complexion: 'Type III',
      lifestyle: ['Active', 'Screen-heavy'],
      age: 29,
      routineLength: '3-6 months',
      usageDurationWeeks: 14
    },
    {
      id: 2,
      userName: 'Jessica R.',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Great for sensitive skin',
      content: 'As someone with very sensitive skin, I was hesitant to try this. But it\'s been gentle and effective. No irritation at all, and I\'ve noticed my redness has decreased significantly. Takes time to see results but worth the patience.',
      date: '2024-01-10',
      verified: true,
      helpful: 18,
      skinType: 'sensitive',
      skinConcerns: ['Damaged Skin Barrier', 'Rosacea'],
      complexion: 'Type II',
      lifestyle: ['Low-stress', 'Indoor'],
      age: 25,
      routineLength: '6+ months',
      usageDurationWeeks: 28
    },
    {
      id: 3,
      userName: 'Michael K.',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Finally found my holy grail serum',
      content: 'After trying countless serums, this one actually delivers. The niacinamide really helps with my enlarged pores, and the hyaluronic acid keeps my skin plump all day. Great for oily skin that needs hydration without heaviness.',
      date: '2024-01-08',
      verified: false,
      helpful: 31,
      skinType: 'oily',
      skinConcerns: ['Enlarged Pores', 'Congested skin'],
      complexion: 'Type IV',
      lifestyle: ['Active', 'Outdoor'],
      age: 32,
      routineLength: '1-3 months',
      usageDurationWeeks: 6
    },
    {
      id: 4,
      userName: 'Emma L.',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Perfect match for combination acne-prone skin',
      content: 'This serum has made a real difference for my combination skin with persistent breakouts. It controls oil in my T-zone while keeping my cheeks moisturized. The acne-fighting ingredients work without over-drying. Highly recommend for similar skin types!',
      date: '2024-01-20',
      verified: true,
      helpful: 35,
      skinType: 'combination',
      skinConcerns: ['Acne Prone', 'Uneven Skin Tone', 'Enlarged Pores'],
      complexion: 'Type III',
      lifestyle: ['Active', 'Screen-heavy'],
      age: 26,
      routineLength: '3-6 months',
      usageDurationWeeks: 16
    },
    {
      id: 5,
      userName: 'David C.',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Effective for dark spots and uneven tone',
      content: 'Been dealing with hyperpigmentation from old acne scars. This serum has noticeably faded the dark spots over 4 months of consistent use. The vitamin C and niacinamide combo works well. Patience is key with pigmentation issues.',
      date: '2024-01-12',
      verified: true,
      helpful: 22,
      skinType: 'combination',
      skinConcerns: ['Uneven Skin Tone', 'Scarring'],
      complexion: 'Type V',
      lifestyle: ['Active'],
      age: 30,
      routineLength: '3-6 months',
      usageDurationWeeks: 18
    },
    {
      id: 6,
      userName: 'Lisa K.',
      userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Good anti-aging benefits',
      content: 'At 45, I\'m always looking for products that help with fine lines and firmness. This serum has improved my skin texture and reduced some fine lines around my eyes. Takes consistent use to see results.',
      date: '2024-01-05',
      verified: true,
      helpful: 19,
      skinType: 'dry',
      skinConcerns: ['Signs of Aging', 'Dullness'],
      complexion: 'Type II',
      lifestyle: ['Low-stress'],
      age: 45,
      routineLength: '6+ months',
      usageDurationWeeks: 32
    }
  ];

  // Get personalized and general reviews using shared Similarity Weight utility (12.15)
  const personalizedReviews = hasSurveyData
    ? allReviews
      .map(review => {
        const result = calculateSimilarityWeight(
          { skinType: review.skinType, skinConcerns: review.skinConcerns, complexion: review.complexion, lifestyle: review.lifestyle, age: review.age },
          { skinType: userSkinProfile.skinType, primaryConcerns: userSkinProfile.primaryConcerns, complexion: userSkinProfile.complexion, sensitivity: '', lifestyle: userSkinProfile.lifestyle, age: userSkinProfile.age }
        );
        return { ...review, similarityScore: result.score, matchTier: result.matchTier };
      })
      .filter(review => review.similarityScore >= 15)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3)
    : [];

  // Apply user-selected filters
  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      const matchesConcern = filterConcern === 'all' || review.skinConcerns.includes(filterConcern);
      const matchesRating = review.rating >= filterRating;
      return matchesConcern && matchesRating;
    });
  }, [allReviews, filterConcern, filterRating]);

  const featuredReviews = personalizedReviews.length > 0 && filterConcern === 'all' && filterRating === 0
    ? personalizedReviews
    : filteredReviews.slice(0, 6);

  const totalReviews = 247;
  const averageRating = 4.3;

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
    <div id="reviews" className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center">
              <i className="ri-chat-3-line text-2xl text-taupe"></i>
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-deep-900">
                Community Reviews
              </h2>
              <p className="text-gray-600 mt-1">Real experiences from verified buyers</p>
            </div>
          </div>
        </div>

        {/* Personalization Banner */}
        {personalizedReviews.length > 0 && (
          <div className="bg-taupe-50 rounded-2xl p-6 mb-8 border border-taupe-200">
            <div>
              <h3 className="text-lg font-semibold text-deep-900 mb-1">
                Personalized for Your Skin
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Showing reviews from similar individuals with <strong>{userSkinProfile.skinType} skin</strong> concerned about{' '}
                <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong> that are looking into buying this product
              </p>
              <span className="text-xs text-primary-700 bg-light/30 border border-primary-300 px-2.5 py-1 rounded-full font-medium">
                {personalizedReviews.length} matching reviews found
              </span>
            </div>
          </div>
        )}

        {/* Rating Overview */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Overall Rating */}
            <div className="text-center lg:col-span-2">
              <div className="text-6xl font-bold text-deep-900 mb-2">
                {averageRating}
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600">
                {totalReviews} total reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="lg:col-span-3">
              <div className="space-y-3">
                {([{ star: 5, count: 98 }, { star: 4, count: 72 }, { star: 3, count: 41 }, { star: 2, count: 22 }, { star: 1, count: 14 }]).map(({ star: rating, count }) => {
                  const percentage = (count / totalReviews) * 100;
                  return (
                    <Link
                      key={rating}
                      to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}&rating=${rating}`}
                      className="flex items-center space-x-3 hover:bg-cream/50 rounded-lg px-2 py-0.5 -mx-2 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {rating}★
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Review Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-filter-3-line text-taupe"></i>
            <h3 className="text-lg font-semibold text-deep-900">Filter Reviews</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concern Filter */}
            <div>
              <label className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-2">
                Skin Concern
              </label>
              <Dropdown
                id="filter-concern"
                value={filterConcern}
                onChange={setFilterConcern}
                options={[
                  { value: 'all', label: 'All Concerns' },
                  ...userSkinProfile.primaryConcerns.map((concern) => ({ value: concern, label: concern })),
                ]}
              />
            </div>
            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-2">
                Minimum Rating
              </label>
              <Dropdown
                id="filter-rating"
                value={String(filterRating)}
                onChange={(value) => setFilterRating(Number(value))}
                options={[
                  { value: '0', label: 'All Ratings' },
                  { value: '5', label: '5 Stars Only' },
                  { value: '4', label: '4+ Stars' },
                  { value: '3', label: '3+ Stars' },
                  { value: '2', label: '2+ Stars' },
                  { value: '1', label: '1+ Stars' },
                ]}
              />
            </div>
          </div>
          {/* Clear filters */}
          {(filterConcern !== 'all' || filterRating > 0) && (
            <div className="mt-4 pt-4 border-t border-blush/50">
              <button
                onClick={() => {
                  setFilterConcern('all');
                  setFilterRating(0);
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-warm-gray hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <i className="ri-close-line"></i>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Featured Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredReviews.map((review) => {
            const similarityBadge = 'matchTier' in review
              ? getTierBadgeInfo(review.matchTier, review.similarityScore)
              : null;
            
            return (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                {/* Review Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <button
                    onClick={() => handleReviewerClick(review)}
                    className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-taupe-500 transition-all"
                  >
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleReviewerClick(review)}
                      className="font-semibold text-gray-900 truncate hover:text-taupe cursor-pointer transition-colors mb-1"
                    >
                      {review.userName}
                    </button>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1">
                      {review.verified && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-taupe-100 text-taupe-800 text-[10px] font-medium rounded-full flex-shrink-0">
                          <i className="ri-shield-check-fill"></i>
                          <span>Verified</span>
                        </span>
                      )}
                      {similarityBadge && (
                        <button
                          onClick={() => setMatchPopupReview(review)}
                          className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 ${similarityBadge.color} text-[10px] font-medium rounded-full flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}
                        >
                          <i className={similarityBadge.icon}></i>
                          <span>{similarityBadge.label}</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    {/* Duration of use shown instead of submission date —
                        product usage duration is more meaningful for evaluating
                        product performance and results credibility. */}
                    <p className="text-xs text-gray-500 mb-2">
                      {hasSurveyData && review.skinType === userSkinProfile.skinType ? (
                        <span className="text-primary-700 font-medium">{review.skinType} skin</span>
                      ) : (
                        <span>{review.skinType} skin</span>
                      )} • Age {review.age} • Used for {review.usageDurationWeeks} weeks
                    </p>
                    
                  </div>
                </div>

                {/* Skin Concerns */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {review.skinConcerns.map((concern, idx) => {
                      const isConcernMatch = hasSurveyData && matchesConcern(concern, userSkinProfile.primaryConcerns);
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs rounded-full ${
                            isConcernMatch
                              ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isConcernMatch && <i className="ri-check-line mr-0.5"></i>}
                          {concern}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Review Content */}
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {review.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4">
                  {review.content}
                </p>

                {/* Review Footer */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleHelpfulClick(review.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        helpfulReviews.has(review.id)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:bg-gray-100'
                      } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                      style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                    >
                      <i className={`${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                      <span className="text-sm">Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})</span>
                    </button>
                    <Link
                      to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
                      className="text-taupe hover:text-taupe-700 text-sm font-medium cursor-pointer"
                    >
                      Read full review
                    </Link>
                  </div>
                  <div className="pl-3">
                    {reportedReviews.has(review.id) ? (
                      <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                        <i className="ri-flag-fill text-xs"></i>
                        Reported
                      </span>
                    ) : showReportConfirm === review.id ? (
                      <div className="flex items-center gap-1.5">
                        <i className="ri-flag-line text-xs text-warm-gray/60"></i>
                        <span className="text-xs text-warm-gray">Report this review?</span>
                        <button
                          onClick={() => handleReportReview(review.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowReportConfirm(null)}
                          className="text-xs text-warm-gray hover:text-deep cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReportConfirm(review.id)}
                        className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer flex items-center gap-1"
                        title="Report review"
                      >
                        <i className="ri-flag-line text-xs"></i>
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-taupe hover:text-dark text-sm font-medium transition-colors cursor-pointer"
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
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedReviewer.userAvatar}
                  alt={selectedReviewer.userName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedReviewer.userName}</h3>
                  <p className="text-sm text-gray-500">{selectedReviewer.skinType} Skin • Age {selectedReviewer.age}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* My-Skin Profile */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2">
                  <i className="ri-user-heart-line text-taupe"></i>
                  My-Skin Profile
                </h4>
                <div className="bg-taupe-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Skin Type:</span> {getReviewerProfile(selectedReviewer).skinType}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getReviewerProfile(selectedReviewer).concerns.map((concern, idx) => (
                      <span key={idx} className="px-3 py-1 bg-taupe-100 text-taupe-700 text-xs font-medium rounded-full">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Routine */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2">
                  <i className="ri-calendar-check-line text-taupe"></i>
                  Daily Routine
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <i className="ri-sun-line"></i> Morning
                    </p>
                    <ul className="space-y-1">
                      {getReviewerProfile(selectedReviewer).routine.morning.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
                      <i className="ri-moon-line"></i> Evening
                    </p>
                    <ul className="space-y-1">
                      {getReviewerProfile(selectedReviewer).routine.evening.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs flex items-center justify-center">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Routine Notes */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2">
                  <i className="ri-sticky-note-line text-taupe"></i>
                  Routine Notes
                </h4>
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-sm text-gray-700 italic">"{getReviewerProfile(selectedReviewer).routineNotes}"</p>
                </div>
              </div>

              {/* Nutrition Meal Planner */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2">
                  <i className="ri-restaurant-line text-taupe"></i>
                  Nutrition Meal Plan
                </h4>
                <div className="bg-taupe-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {getReviewerProfile(selectedReviewer).nutritionMealPlan.map((meal, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <i className="ri-checkbox-circle-fill text-taupe-500"></i>
                        {meal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nutrition Tracker */}
              <div>
                <h4 className="font-semibold text-deep mb-3 flex items-center gap-2">
                  <i className="ri-bar-chart-box-line text-taupe"></i>
                  Nutrition Tracker
                </h4>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{getReviewerProfile(selectedReviewer).nutritionTracker.calories}</p>
                      <p className="text-xs text-gray-600">Calories</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{getReviewerProfile(selectedReviewer).nutritionTracker.protein}g</p>
                      <p className="text-xs text-gray-600">Protein</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{getReviewerProfile(selectedReviewer).nutritionTracker.vitamins.length}</p>
                      <p className="text-xs text-gray-600">Key Vitamins</p>
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
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Report Review</h3>
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
              >
                <i className="ri-close-line text-2xl"></i>
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
                  className="w-full px-4 py-3 rounded-lg border border-blush bg-white text-deep focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="px-4 py-2 text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  reportReason
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-deep">Match Breakdown</h3>
                  <p className="text-sm text-warm-gray mt-1">{r.userName}'s profile vs yours</p>
                </div>
                <button
                  onClick={() => setMatchPopupReview(null)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <div className="p-6">
                {popupBadge && (
                  <div className="flex justify-center mb-6">
                    <span className={`flex items-center space-x-1.5 px-4 py-2 ${popupBadge.color} text-sm font-semibold rounded-full`}>
                      <i className={popupBadge.icon}></i>
                      <span>{popupBadge.label}</span>
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {rows.map((row, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${row.matched ? 'bg-light/20 border border-primary-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${row.matched ? 'bg-primary/20 text-primary-700' : 'bg-gray-200 text-gray-400'}`}>
                          <i className={row.matched ? 'ri-check-line text-sm' : 'ri-close-line text-sm'}></i>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${row.matched ? 'text-deep' : 'text-warm-gray'}`}>{row.name}</p>
                          <p className="text-[11px] text-warm-gray/70">
                            {row.theirs} vs {row.yours}{row.note ? ` · ${row.note}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${row.matched ? 'text-primary-700' : 'text-gray-400'}`}>
                        +{row.earned}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
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
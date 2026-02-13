import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase-browser';

interface IngredientDetailProps {
  ingredientId: string;
  onBack: () => void;
}

interface Review {
  id: number;
  author: string;
  skinType: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  concerns?: string[];
  fitzpatrickType?: string;
}

// Fractional star component
const StarRating = ({ rating, size = 'text-lg', showNumeric = false, onClick }: {
  rating: number;
  size?: string;
  showNumeric?: boolean;
  onClick?: () => void;
}) => {
  const fullStars = Math.floor(rating);
  const fractionalPart = rating - fullStars;
  const emptyStars = 5 - fullStars - (fractionalPart > 0 ? 1 : 0);

  return (
    <div
      className={`flex items-center gap-1.5 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className={`ri-star-fill ${size} text-amber-400`}></i>
        ))}
        {/* Fractional star */}
        {fractionalPart > 0 && (
          <div className="relative">
            <i className={`ri-star-fill ${size} text-blush`}></i>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fractionalPart * 100}%` }}
            >
              <i className={`ri-star-fill ${size} text-amber-400`}></i>
            </div>
          </div>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className={`ri-star-fill ${size} text-blush`}></i>
        ))}
      </div>
      {showNumeric && (
        <span className={`font-semibold text-deep ml-1 ${size}`}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

const IngredientDetail = ({ ingredientId, onBack }: IngredientDetailProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSimilarProfileReviews, setShowSimilarProfileReviews] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const getHelpfulCount = (reviewId: number, originalCount: number) => {
    return originalCount + (helpfulReviews.has(reviewId) ? 1 : 0);
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

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedSurvey = localStorage.getItem('skinSurveyData');
    if (savedSurvey) {
      const surveyData = JSON.parse(savedSurvey);
      setUserProfile({
        skinType: surveyData.skinType?.[0] || '',
        concerns: surveyData.concerns || [],
        fitzpatrickType: surveyData.fitzpatrickType?.[0] || '',
      });
    }
  };

  // Mock data - in real app, fetch based on ingredientId
  const ingredient = {
    name: 'Hyaluronic Acid',
    scientificName: 'Sodium Hyaluronate',
    rating: 4.8,
    reviews: 1243,
    safetyRating: 'Excellent',
    icon: 'ri-drop-line',
    color: 'text-primary',
    bgColor: 'bg-light/20',
    description: 'Hyaluronic acid is a naturally occurring substance in the skin that has the remarkable ability to attract and hold vast amounts of moisture. It works as a humectant, drawing water from the environment and deeper layers of skin to hydrate the surface.',
    benefits: [
      'Provides intense hydration to all skin types',
      'Plumps skin and reduces appearance of fine lines',
      'Improves skin texture and elasticity',
      'Supports skin barrier function',
      'Non-comedogenic and suitable for sensitive skin',
    ],
    howToUse: 'Apply to damp skin after cleansing and before moisturizer. Use morning and evening for best results. Can be layered with other serums.',
    concentration: '0.5% - 2% is most effective',
    skinTypes: ['All Skin Types', 'Dry', 'Dehydrated', 'Sensitive', 'Mature'],
    concerns: ['Dehydration', 'Fine Lines', 'Dullness', 'Texture'],
    myths: [
      {
        myth: 'Hyaluronic acid dries out your skin',
        truth: 'When used correctly on damp skin, HA is incredibly hydrating. The myth comes from using it in very dry environments without proper moisturizer on top.',
      },
      {
        myth: 'Higher molecular weight is always better',
        truth: 'Different molecular weights serve different purposes. Low molecular weight penetrates deeper, while high molecular weight provides surface hydration. A combination is ideal.',
      },
    ],
  };

  const communityReviews: Review[] = [
    {
      id: 1,
      author: 'Emma L.',
      skinType: 'Dry',
      concerns: ['Dehydration', 'Fine Lines'],
      fitzpatrickType: 'II',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Game changer for my dehydrated skin! I noticed plumper, more hydrated skin within days. Now a staple in my routine.',
      helpful: 234,
    },
    {
      id: 2,
      author: 'Marcus T.',
      skinType: 'Combination',
      concerns: ['Dullness', 'Texture'],
      fitzpatrickType: 'IV',
      rating: 5,
      date: '1 month ago',
      comment: 'Works beautifully under moisturizer. Lightweight and absorbs quickly. My skin looks so much healthier.',
      helpful: 189,
    },
    {
      id: 3,
      author: 'Priya K.',
      skinType: 'Sensitive',
      concerns: ['Dehydration', 'Redness'],
      fitzpatrickType: 'V',
      rating: 4,
      date: '3 weeks ago',
      comment: 'Very gentle and effective. No irritation at all. Just remember to apply on damp skin for best results!',
      helpful: 156,
    },
    {
      id: 4,
      author: 'Sarah M.',
      skinType: 'Dry',
      concerns: ['Fine Lines', 'Dehydration'],
      fitzpatrickType: 'III',
      rating: 5,
      date: '1 week ago',
      comment: 'Perfect for my dry skin. I use it twice daily and my skin has never felt better. Highly recommend!',
      helpful: 98,
    },
    {
      id: 5,
      author: 'James R.',
      skinType: 'Normal',
      concerns: ['Texture', 'Dullness'],
      fitzpatrickType: 'II',
      rating: 4,
      date: '3 days ago',
      comment: 'Great product! Absorbs well and doesn\'t leave any sticky residue. My skin feels smooth and hydrated.',
      helpful: 45,
    },
  ];

  // EXAMPLE REVIEWS - Remove when user says "Remove examples from /ingredients reviews page"
  const exampleReviews: Review[] = [
    {
      id: 101,
      author: 'Jasmine W.',
      skinType: 'Combination',
      concerns: ['Acne', 'Dark Spots', 'Texture'],
      fitzpatrickType: 'IV',
      rating: 5,
      date: '5 days ago',
      comment: 'As someone with combination skin and post-inflammatory hyperpigmentation, this ingredient has been a lifesaver. I noticed my dark spots fading after just 3 weeks of consistent use. My T-zone stays balanced and my cheeks are finally hydrated without feeling greasy.',
      helpful: 312,
    },
    {
      id: 102,
      author: 'Aaliyah M.',
      skinType: 'Oily',
      concerns: ['Acne', 'Large Pores', 'Oiliness'],
      fitzpatrickType: 'V',
      rating: 5,
      date: '1 week ago',
      comment: 'Finally found something that works for my oily, acne-prone skin! This ingredient doesn\'t clog my pores and actually helps control oil production. My breakouts have reduced by 70% in the past month. The texture of my skin has improved dramatically.',
      helpful: 287,
    },
    {
      id: 103,
      author: 'Sofia R.',
      skinType: 'Dry',
      concerns: ['Dehydration', 'Sensitivity', 'Redness'],
      fitzpatrickType: 'II',
      rating: 4,
      date: '2 weeks ago',
      comment: 'My dry, sensitive skin loves this! No irritation whatsoever, which is rare for me. It provides deep hydration without any heaviness. The redness around my nose has calmed down significantly. I apply it on damp skin morning and night.',
      helpful: 245,
    },
    {
      id: 104,
      author: 'Kenji T.',
      skinType: 'Combination',
      concerns: ['Fine Lines', 'Dullness', 'Uneven Texture'],
      fitzpatrickType: 'III',
      rating: 5,
      date: '3 days ago',
      comment: 'This ingredient has transformed my skin texture. The fine lines around my eyes are less noticeable, and my overall complexion looks brighter and more even. I layer it with my other serums without any pilling. Highly recommend for anyone dealing with early signs of aging.',
      helpful: 198,
    },
  ];

  // Filter reviews from users with similar profiles
  const getSimilarProfileReviews = (): Review[] => {
    if (!userProfile) return [];

    // Combine example reviews with community reviews for filtering
    const allReviews = [...exampleReviews, ...communityReviews];

    return allReviews.filter(review => {
      const skinTypeMatch = review.skinType.toLowerCase() === userProfile.skinType?.toLowerCase();
      const concernsMatch = review.concerns?.some(c => 
        userProfile.concerns?.some((uc: string) => uc.toLowerCase() === c.toLowerCase())
      );
      const fitzpatrickMatch = review.fitzpatrickType === userProfile.fitzpatrickType;

      // Return reviews that match at least 2 out of 3 criteria
      const matches = [skinTypeMatch, concernsMatch, fitzpatrickMatch].filter(Boolean).length;
      return matches >= 2;
    });
  };

  const similarProfileReviews = getSimilarProfileReviews();
  const otherReviews = communityReviews.filter(r => !similarProfileReviews.includes(r));
  const allReviewsCombined = [...exampleReviews, ...communityReviews];

  // Check if a review is from similar skin profile
  const isSimilarSkinReview = (reviewId: number): boolean => {
    return similarProfileReviews.some(r => r.id === reviewId);
  };

  return (
    <div className="min-h-screen py-8 px-6 lg:px-12 bg-cream">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-warm-gray hover:text-primary mb-6 transition-colors cursor-pointer text-sm"
        >
          <i className="ri-arrow-left-line text-lg"></i>
          <span className="font-medium">Back to Library</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border border-blush/30 mb-6">
          {/* Clickable Rating - Top */}
          <button
            onClick={scrollToReviews}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-cream rounded-full hover:bg-blush/30 transition-colors cursor-pointer"
          >
            <StarRating rating={ingredient.rating} size="text-sm" showNumeric />
            <span className="text-xs text-warm-gray hover:text-primary transition-colors">
              ({ingredient.reviews} reviews)
            </span>
          </button>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className={`w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center ${ingredient.bgColor} rounded-xl flex-shrink-0`}>
              <i className={`${ingredient.icon} text-3xl lg:text-4xl ${ingredient.color}`}></i>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-deep mb-1">
                    {ingredient.name}
                  </h1>
                  <p className="text-sm text-warm-gray">{ingredient.scientificName}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  ingredient.safetyRating === 'Excellent'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  Safety: {ingredient.safetyRating}
                </div>
              </div>
              <p className="text-sm text-warm-gray leading-relaxed">
                {ingredient.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Benefits */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-4">Key Benefits</h2>
              <ul className="space-y-2.5">
                {ingredient.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <i className="ri-checkbox-circle-fill text-lg text-primary flex-shrink-0 mt-0.5"></i>
                    <span className="text-sm text-warm-gray">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Use */}
            <div className="bg-cream/50 rounded-2xl p-6 border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-3">How to Use</h2>
              <p className="text-sm text-warm-gray leading-relaxed mb-4">{ingredient.howToUse}</p>
              <div className="bg-white rounded-xl p-4 border-l-3 border-primary">
                <p className="text-xs font-semibold text-deep mb-1">Optimal Concentration</p>
                <p className="text-sm text-warm-gray">{ingredient.concentration}</p>
              </div>
            </div>

            {/* Myth Busting */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-4">Myth Busting</h2>
              <div className="space-y-5">
                {ingredient.myths.map((item, index) => (
                  <div key={index} className="border-l-3 border-primary pl-4">
                    <div className="flex items-start gap-2 mb-2">
                      <i className="ri-close-circle-line text-lg text-terracotta flex-shrink-0 mt-0.5"></i>
                      <p className="text-sm font-medium text-deep">{item.myth}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-lg text-primary flex-shrink-0 mt-0.5"></i>
                      <p className="text-sm text-warm-gray">{item.truth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Reviews */}
            <div ref={reviewsRef} className="bg-white rounded-2xl p-6 shadow-md border border-blush/30 scroll-mt-24">
              <h2 className="font-serif text-xl font-semibold text-deep mb-5">Community Reviews</h2>
              
              {/* Reviews from Similar Profiles */}
              {userProfile && similarProfileReviews.length > 0 && (
                <div className="mb-8">
                  {/* Similar Skin Reviews Label - Always at Top */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-sage rounded-full">
                        <i className="ri-user-heart-line text-white"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-sage">Similar Skin Reviews</h3>
                    </div>
                    <span className="text-xs bg-sage/20 text-sage px-3 py-1 rounded-full font-medium">
                      {similarProfileReviews.length} matches
                    </span>
                  </div>
                  
                  {/* Example Reviews Badge */}
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-light/30 text-primary-700 rounded-full text-xs font-medium">
                    <i className="ri-information-line"></i>
                    Example reviews included - Remove when you say "Remove examples from /ingredients reviews page"
                  </div>

                  <p className="text-sm text-warm-gray mb-4">
                    These reviews are from users with similar skin type, concerns, and profile attributes as you.
                  </p>
                  <div className="space-y-6">
                    {similarProfileReviews.map((review) => (
                      <div key={review.id} className="border-2 border-sage/20 rounded-xl p-6 bg-sage/10 relative">
                        {/* Similar Skin Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-full text-xs font-semibold shadow-md">
                            <i className="ri-user-heart-line text-sm"></i>
                            Similar Skin
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-32">
                            <p className="font-semibold text-deep">{review.author}</p>
                            <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                              <span>{review.skinType}</span>
                              {review.fitzpatrickType && (
                                <>
                                  <span>•</span>
                                  <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                                </>
                              )}
                            </div>
                            {review.concerns && review.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.concerns.map((concern, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-white px-2 py-1 rounded-full text-warm-gray"
                                  >
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
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
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Other Reviews */}
              {otherReviews.length > 0 && (
                <div>
                  {userProfile && similarProfileReviews.length > 0 && (
                    <h3 className="text-lg font-semibold text-deep mb-4 mt-8">All Reviews</h3>
                  )}
                  <div className="space-y-6">
                    {otherReviews.map((review) => (
                      <div key={review.id} className="border-b border-blush last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-deep">{review.author}</p>
                            <p className="text-sm text-warm-gray">{review.skinType} • {review.date}</p>
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
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
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAllReviewsModal(true)}
                className="w-full mt-5 py-2.5 border border-primary text-primary rounded-lg font-medium text-sm hover:bg-primary/5 transition-colors whitespace-nowrap cursor-pointer"
              >
                Read All Reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Best For */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-blush/30">
              <h3 className="font-medium text-deep text-sm mb-4">Best For</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-warm-gray mb-2">Skin Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.skinTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-warm-gray mb-2">Concerns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.concerns.map((concern, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-cream text-deep text-xs font-medium rounded-full"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-primary to-dark rounded-2xl p-5 text-white">
              <h3 className="font-serif text-lg font-semibold mb-2">Find Products</h3>
              <p className="text-white/80 text-xs mb-4">
                Discover products featuring this ingredient in our curated marketplace.
              </p>
              <a
                href="/marketplace"
                className="block w-full py-2.5 bg-white text-deep rounded-lg font-medium text-sm hover:bg-cream transition-colors whitespace-nowrap cursor-pointer text-center"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* All Reviews Modal */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 bg-deep/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush/30">
              <div>
                <h2 className="font-serif text-xl font-semibold text-deep">All Reviews</h2>
                <p className="text-xs text-warm-gray mt-1">{allReviewsCombined.length} total reviews</p>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Similar Skin Reviews Section - Always at Top */}
              {userProfile && similarProfileReviews.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-sage rounded-full">
                        <i className="ri-user-heart-line text-white"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-sage">Similar Skin Reviews</h3>
                    </div>
                    <span className="text-xs bg-sage/20 text-sage px-3 py-1 rounded-full font-medium">
                      {similarProfileReviews.length} matches
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray mb-4">
                    Reviews from users with similar skin type, concerns, and profile attributes as you.
                  </p>
                  <div className="space-y-6">
                    {similarProfileReviews.map((review) => (
                      <div key={review.id} className="border-2 border-sage/20 rounded-xl p-6 bg-sage/10 hover:shadow-md transition-shadow relative">
                        {/* Similar Skin Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-full text-xs font-semibold shadow-md">
                            <i className="ri-user-heart-line text-sm"></i>
                            Similar Skin
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-32">
                            <p className="font-semibold text-deep">{review.author}</p>
                            <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                              <span>{review.skinType}</span>
                              {review.fitzpatrickType && (
                                <>
                                  <span>•</span>
                                  <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                                </>
                              )}
                            </div>
                            {review.concerns && review.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.concerns.map((concern, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-white px-2 py-1 rounded-full text-warm-gray"
                                  >
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
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
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Other Reviews Section */}
              <div>
                {userProfile && similarProfileReviews.length > 0 && (
                  <h3 className="text-lg font-semibold text-deep mb-4">All Reviews</h3>
                )}
                <div className="space-y-6">
                  {allReviewsCombined.filter(r => !isSimilarSkinReview(r.id)).map((review) => (
                    <div key={review.id} className="border border-blush rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-deep">{review.author}</p>
                          <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                            <span>{review.skinType}</span>
                            {review.fitzpatrickType && (
                              <>
                                <span>•</span>
                                <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                              </>
                            )}
                          </div>
                          {review.concerns && review.concerns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {review.concerns.map((concern, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-cream px-2 py-1 rounded-full text-warm-gray"
                                >
                                  {concern}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="text-sm" showNumeric />
                      </div>
                      <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleHelpfulClick(review.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                              helpfulReviews.has(review.id)
                                ? 'bg-primary/10 text-primary'
                                : 'text-warm-gray hover:bg-cream'
                            } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                            style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                          >
                            <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                            <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                          </button>
                          {reportedReviews.has(review.id) ? (
                            <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                              <i className="ri-flag-fill text-xs"></i>
                              Reported
                            </span>
                          ) : showReportConfirm === review.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-warm-gray">Report?</span>
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
                              className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                              title="Report review"
                            >
                              <i className="ri-flag-line"></i>
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-warm-gray/70">{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-blush/30 bg-cream/30">
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-deep/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-blush/30 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-deep">Report Review</h3>
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Reason for reporting</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-blush bg-white text-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or fake review</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="misleading">Misleading information</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Additional details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more context..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-blush bg-white text-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-blush/30 flex justify-end gap-3">
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
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  reportReason
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blush text-warm-gray cursor-not-allowed'
                }`}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientDetail;
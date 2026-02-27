import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveComplexion, getEffectiveSensitivity, getEffectiveLifestyle } from '../../lib/utils/sessionState';
import { matchesConcern } from '../../lib/utils/matching';
import { calculateSimilarityWeight, getTierBadgeInfo, isComplexionMatch, type MatchTier } from '../../lib/utils/reviewSimilarity';
import Dropdown from '../../components/ui/Dropdown';

interface ProductReview {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  productName: string;
  productImage: string;
  skinType: string;
  skinConcerns: string[];
  age: number;
  routineLength: string;
  complexion?: string;
  sensitivity?: string;
  lifestyle?: string[];
  beforeAfterPhotos?: string[];
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  usageDuration: string;
  finalVerdict?: string;
  similarityScore?: number;
  matchTier?: MatchTier;
  matchDetails?: string[];
}

const ProductReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const userSkinTypeParam = searchParams.get('skinType');
  const userConcernsParam = searchParams.get('concerns')?.split(',') || [];
  
  const ratingParam = searchParams.get('rating');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filterRating, setFilterRating] = useState<string>(ratingParam || 'all');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterRecommended, setFilterRecommended] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [progressPhotoReview, setProgressPhotoReview] = useState<ProductReview | null>(null);
  const [matchPopupReview, setMatchPopupReview] = useState<ProductReview | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (matchPopupReview) setMatchPopupReview(null);
        else if (progressPhotoReview) setProgressPhotoReview(null);
        else if (showReportModal) { setShowReportModal(null); setReportReason(''); setReportDetails(''); }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [matchPopupReview, progressPhotoReview, showReportModal]);

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

  const handleShareReview = async (review: ProductReview) => {
    const shareUrl = `${window.location.origin}/reviews-products?id=${productId || ''}&review=${review.id}`;
    const shareData = {
      title: `${review.userName}'s review of ${review.productName}`,
      text: review.title,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareToast('Link copied to clipboard');
    } catch {
      setShareToast('Unable to copy link');
    }
    setTimeout(() => setShareToast(null), 2500);
  };

  // Get user skin profile from sessionState (unified source of truth)
  const rawSkinType = getEffectiveSkinType() || userSkinTypeParam || '';
  const rawConcerns = getEffectiveConcerns().length > 0
    ? getEffectiveConcerns()
    : (userConcernsParam.length > 0 ? userConcernsParam : []);

  // hasSurveyData reflects whether REAL profile data exists (no hardcoded fallbacks)
  const hasSurveyData = !!(rawSkinType || rawConcerns.length > 0);

  // Use fallbacks only when we have SOME real data but a specific field is missing
  const effectiveSkinType = rawSkinType || (hasSurveyData ? 'combination' : 'combination');
  const effectiveConcerns = rawConcerns.length > 0 ? rawConcerns : (hasSurveyData ? ['General Skincare'] : []);

  // Extended profile via unified getters (rehydrated from Supabase when localStorage is empty)
  const surveyComplexion = getEffectiveComplexion();
  const surveySensitivity = getEffectiveSensitivity();
  const surveyLifestyle = getEffectiveLifestyle();

  const userSkinProfile = {
    skinType: effectiveSkinType,
    primaryConcerns: effectiveConcerns,
    complexion: surveyComplexion,
    sensitivity: surveySensitivity,
    lifestyle: surveyLifestyle,
    age: 28,
    routineLength: '3-6 months'
  };

  // Demo reviews - these represent illustrative examples, not real user reviews
  const allReviews: ProductReview[] = [
    {
      id: 1,
      userName: 'Sarah M.',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'A significant improvement for my combination skin',
      content: "After 3 months of consistent use, this serum has completely transformed my skin. My T-zone used to be an oil slick by noon, but now it stays balanced all day. The acne on my chin has cleared up significantly, and my hyperpigmentation from old breakouts is fading. The texture is lightweight and layers perfectly under moisturizer. I apply 3-4 drops morning and night, and one bottle lasts about 6 weeks. Worth every penny!",
      date: '2024-01-20',
      verified: true,
      helpful: 45,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation', 'Large Pores'],
      complexion: 'Type III - Medium',
      sensitivity: 'moderate',
      lifestyle: ['Active lifestyle', 'Screen time heavy'],
      age: 29,
      routineLength: '3-6 months',
      beforeAfterPhotos: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop&q=80'],
      pros: ['Reduced oiliness', 'Cleared acne', 'Faded dark spots', 'Lightweight texture'],
      cons: ['Takes 6-8 weeks to see full results', 'Slight tingling first week'],
      wouldRecommend: true,
      usageDuration: '3 months',
      finalVerdict: 'If you have combination skin with breakout concerns, this serum is worth the patience — real results after consistent use.'
    },
    {
      id: 2,
      userName: 'Jessica R.',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Great for sensitive skin, gentle yet effective',
      content: "As someone with reactive sensitive skin, I was nervous to try this. Started with every other night and gradually increased to nightly use. No irritation whatsoever! My redness has decreased noticeably, and my skin feels more resilient. The formula is very gentle - no burning or stinging that I usually get with active ingredients. My skin looks calmer and more even-toned after 2 months of use.",
      date: '2024-01-18',
      verified: true,
      helpful: 32,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
      skinType: 'sensitive',
      skinConcerns: ['Sensitivity', 'Redness', 'Uneven Skin Tone'],
      complexion: 'Type II - Fair',
      sensitivity: 'high',
      lifestyle: ['Indoor work environment', 'High stress levels'],
      age: 25,
      routineLength: '6+ months',
      pros: ['Very gentle formula', 'Reduced redness', 'No irritation', 'Calming effect'],
      cons: ['Results take time', 'Wish it came in larger size'],
      wouldRecommend: true,
      usageDuration: '2 months',
      finalVerdict: 'A gentle option for anyone with reactive skin who needs effective ingredients without the irritation.'
    },
    {
      id: 3,
      userName: 'Michael K.',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Finally found my holy grail for oily skin',
      content: "This serum has been effective for controlling oil production without over-drying. I have very oily skin with enlarged pores, and this has been a lifesaver. Within 4 weeks, my pores looked visibly smaller, and the oil control lasts all day. I use it twice daily after cleansing. The niacinamide concentration is perfect - strong enough to be effective but not irritating. My skin texture has improved dramatically.",
      date: '2024-01-15',
      verified: false,
      helpful: 38,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
      skinType: 'oily',
      skinConcerns: ['Large Pores', 'Excess Oil', 'Uneven Texture'],
      complexion: 'Type IV - Olive',
      sensitivity: 'low',
      lifestyle: ['Active lifestyle', 'Outdoor work environment'],
      age: 32,
      routineLength: '1-3 months',
      pros: ['Excellent oil control', 'Minimized pores', 'Improved texture', 'Long-lasting effects'],
      cons: ['Bottle could be bigger', 'Dropper sometimes gets sticky'],
      wouldRecommend: true,
      usageDuration: '4 months',
      finalVerdict: 'For oily skin that needs pore control without dryness, this delivers — my texture has never been smoother.'
    },
    {
      id: 4,
      userName: 'Emma L.',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Effective for hyperpigmentation and aging concerns',
      content: "At 42, I was looking for something to address both pigmentation and fine lines. This serum has definitely helped with both! My melasma patches have lightened considerably over 3 months, and I've noticed my skin looks more plump and smooth. The formula plays well with my other anti-aging products. I use it in my morning routine under vitamin C serum and sunscreen.",
      date: '2024-01-12',
      verified: true,
      helpful: 28,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
      skinType: 'dry',
      skinConcerns: ['Hyperpigmentation', 'Fine Lines & Wrinkles', 'Dryness & Dehydration'],
      complexion: 'Type III - Medium',
      sensitivity: 'moderate',
      lifestyle: ['Frequently wears makeup', 'Sun exposure daily'],
      age: 42,
      routineLength: '6+ months',
      pros: ['Faded dark spots', 'Improved skin texture', 'Works with other products', 'Anti-aging benefits'],
      cons: ['Takes patience to see results', 'Price point is high'],
      wouldRecommend: true,
      usageDuration: '3 months',
      finalVerdict: 'At 42, finding something that addresses both pigmentation and fine lines is rare — this serum does both with consistent use.'
    },
    {
      id: 5,
      userName: 'David C.',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&q=80',
      rating: 3,
      title: 'Good product but not miraculous for me',
      content: "I had high expectations based on other reviews, but the results have been more subtle for me. I do see some improvement in my skin texture and my breakouts are less frequent, but it hasn't been the dramatic transformation I hoped for. My combination skin still gets oily in the T-zone, though maybe less than before. It's a decent product, just not the miracle cure I expected.",
      date: '2024-01-10',
      verified: true,
      helpful: 22,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Large Pores'],
      complexion: 'Type V - Brown',
      sensitivity: 'low',
      lifestyle: ['Active lifestyle', 'Screen time heavy', 'High stress levels'],
      age: 24,
      routineLength: '1-3 months',
      pros: ['Gentle on skin', 'Some texture improvement', 'Good ingredients'],
      cons: ['Results slower than expected', 'T-zone still oily', 'Expensive for subtle results'],
      wouldRecommend: false,
      usageDuration: '6 weeks',
      finalVerdict: 'Decent product, but if you expect dramatic results for combination skin, temper your expectations — improvements were subtle for me.'
    }
  ];

  // Score all reviews using shared Similarity Weight utility (12.15)
  const scoredReviews = allReviews.map(review => {
    const { score, matchTier, matchDetails } = calculateSimilarityWeight(review, userSkinProfile);
    return { ...review, similarityScore: score, matchTier, matchDetails };
  });

  // Filter: only show reviews with similarity ≥15 when profile data exists
  let filteredReviews = scoredReviews.filter(review => {
    // Apply user-selected filters first
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false;
    if (filterVerified && !review.verified) return false;
    if (filterRecommended !== 'all') {
      if (filterRecommended === 'yes' && !review.wouldRecommend) return false;
      if (filterRecommended === 'no' && review.wouldRecommend) return false;
    }
    // Keyword search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        review.title.toLowerCase().includes(q) ||
        review.content.toLowerCase().includes(q) ||
        review.productName.toLowerCase().includes(q) ||
        review.userName.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    // Strict personalization: only show reviews with score ≥15
    if (hasSurveyData) return (review.similarityScore || 0) >= 15;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.similarityScore || 0) - (a.similarityScore || 0);
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      case 'helpful': return b.helpful - a.helpful;
      default: return 0;
    }
  });

  const averageRating = allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length;
  const recommendPercentage = (allReviews.filter(r => r.wouldRecommend).length / allReviews.length) * 100;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < Math.floor(rating); i++) stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    if (rating % 1 >= 0.5) stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    for (let i = 0; i < 5 - Math.ceil(rating); i++) stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    return stars;
  };

  return (
    <div className="min-h-screen bg-cream">
      <main className="pt-24 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-warm-gray mb-4">
              <Link to="/discover" className="hover:text-primary focus:text-primary focus:outline-none cursor-pointer transition-colors duration-fast">Discover</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/product-detail" className="hover:text-primary focus:text-primary focus:outline-none cursor-pointer transition-colors duration-fast">Products</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span className="text-primary font-medium">Product Reviews</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-deep mb-4">Product Reviews &amp; Results</h1>
            <p className="text-xl text-warm-gray max-w-3xl">Real customer experiences with detailed before/after results, pros and cons, and recommendations for individuals with similar skin.</p>
          </div>

          {hasSurveyData && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border-l-4 border-primary">
              <div>
                <h3 className="text-xl font-semibold text-deep mb-2">Showing reviews from similar individuals</h3>
                <p className="text-warm-gray text-sm mb-3">Prioritized for <strong>{userSkinProfile.skinType} skin</strong> with concerns about <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong>{userSkinProfile.complexion ? <> and <strong>{userSkinProfile.complexion}</strong> complexion</> : ''} that are looking into buying this product.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-primary bg-light/20 px-2 py-1 rounded-full">{sortedReviews.length} matching reviews found</span>
                  {sortedReviews.filter(r => r.matchTier === 'full').length > 0 && (
                    <span className="text-xs text-primary-700 bg-light/30 px-2 py-1 rounded-full border border-primary-300">{sortedReviews.filter(r => r.matchTier === 'full').length} full match</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {!hasSurveyData && (
            <div className="bg-cream-100 rounded-2xl p-6 mb-8 border border-blush">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-light/30 flex items-center justify-center flex-shrink-0"><i className="ri-questionnaire-line text-primary text-xl"></i></div>
                <div>
                  <h3 className="text-lg font-semibold text-deep mb-1">Get personalized reviews</h3>
                  <p className="text-warm-gray text-sm mb-3">Take the skin survey to see reviews from individuals with skin similar to yours.</p>
                  <Link to="/skin-survey" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-dark transition-colors cursor-pointer">
                    <i className="ri-arrow-right-line"></i>
                    <span>Take Skin Survey</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{averageRating.toFixed(1)}</div>
                <p className="text-sm text-warm-gray mb-2">Average Rating</p>
                <div className="flex items-center justify-center space-x-1">{renderStars(Math.round(averageRating))}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{allReviews.length}</div>
                <p className="text-sm text-warm-gray">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{recommendPercentage.toFixed(0)}%</div>
                <p className="text-sm text-warm-gray">Would Recommend</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{((allReviews.filter(r => r.verified).length / allReviews.length) * 100).toFixed(0)}%</div>
                <p className="text-sm text-warm-gray">Verified Purchases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-warm-gray mb-2">Sort By</label>
                <Dropdown
                  id="sort-by"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    ...(hasSurveyData ? [{ value: 'relevance', label: 'Most Relevant to You' }] : []),
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'highest', label: 'Highest Rated' },
                    { value: 'lowest', label: 'Lowest Rated' },
                    { value: 'helpful', label: 'Most Helpful' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-gray mb-2">Rating</label>
                <Dropdown
                  id="filter-rating"
                  value={filterRating}
                  onChange={setFilterRating}
                  options={[
                    { value: 'all', label: 'All Ratings' },
                    { value: '5', label: '5 Stars' },
                    { value: '4', label: '4 Stars' },
                    { value: '3', label: '3 Stars' },
                    { value: '2', label: '2 Stars' },
                    { value: '1', label: '1 Star' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-gray mb-2">Recommendation</label>
                <Dropdown
                  id="filter-recommended"
                  value={filterRecommended}
                  onChange={setFilterRecommended}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'yes', label: 'Recommends' },
                    { value: 'no', label: "Doesn't Recommend" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-warm-gray mb-2">Purchase Status</label>
                <button
                  onClick={() => setFilterVerified(!filterVerified)}
                  className="flex items-center space-x-2 cursor-pointer group rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${filterVerified ? 'bg-primary border-primary' : 'border-blush group-hover:border-primary/50'}`}>
                    {filterVerified && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-warm-gray">Verified only</span>
                </button>
              </div>
              <div className="flex items-end"><div className="text-sm text-warm-gray">Showing {sortedReviews.length} of {allReviews.length} reviews{hasSurveyData && sortedReviews.length < allReviews.length ? ' (matched to your profile)' : ''}</div></div>
            </div>
            {/* Keyword Search */}
            <div className="mt-4 pt-4 border-t border-blush">
              <div className="relative max-w-md">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/60"></i>
                <input
                  type="text"
                  placeholder="Search reviews by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-blush focus:border-primary focus:outline-none text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {sortedReviews.map((review) => {
              const tierBadge = getTierBadgeInfo(review.matchTier || 'none', review.similarityScore || 0);
              return (
                <div key={review.id} className="bg-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-blush/30 flex-shrink-0 flex items-center justify-center">{review.userAvatar ? (<img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />) : (<i className="ri-user-line text-xl text-warm-gray/50"></i>)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-deep">{review.userName}</h3>
                        {review.verified && (<span className="flex items-center space-x-1 px-2 py-0.5 bg-taupe-100 text-taupe-800 text-xs font-medium rounded-full"><i className="ri-shield-check-fill"></i><span>Verified</span></span>)}
                        {hasSurveyData && tierBadge && (<button onClick={() => setMatchPopupReview(review)} className={`flex items-center space-x-1 px-3 py-1 ${tierBadge.color} text-xs font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer`}><i className={tierBadge.icon}></i><span>{tierBadge.label}</span></button>)}
                      </div>
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="flex items-center space-x-0.5">{renderStars(review.rating)}</div>
                        <span className="text-xs text-warm-gray/80">{new Date(review.date).toLocaleDateString()}</span>
                        <span className="text-xs text-warm-gray/80">• Used for {review.usageDuration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${hasSurveyData && review.skinType.toLowerCase() === userSkinProfile.skinType.toLowerCase() ? 'text-primary-700 font-medium' : 'text-warm-gray/80'}`}>
                          {review.skinType} skin
                        </span>
                        <span className="text-xs text-warm-gray/80">• Age {review.age}</span>
                        {hasSurveyData && review.complexion && isComplexionMatch(review.complexion, userSkinProfile.complexion) !== 'none' && (
                          <span className={`text-xs ${isComplexionMatch(review.complexion, userSkinProfile.complexion) === 'exact' ? 'text-primary-700 font-medium' : 'text-primary-700/70'}`}>{review.complexion}</span>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {review.skinConcerns.slice(0, 2).map((concern, idx) => (
                            <span key={idx} className={`px-2 py-1 text-xs rounded-full ${hasSurveyData && matchesConcern(concern, userSkinProfile.primaryConcerns) ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium' : 'bg-gray-100 text-gray-600'}`}>{concern}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-blush/30"><img src={review.productImage} alt={review.productName} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-sm font-medium text-deep">{review.productName}</p>
                        <div className={`text-xs font-medium ${review.wouldRecommend ? 'text-primary-700' : 'text-red-600'}`}>{review.wouldRecommend ? '✓ Recommends' : "✗ Doesn't Recommend"}</div>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-deep mb-2">{review.title}</h4>
                  <p className="text-warm-gray text-sm leading-relaxed mb-4">{review.content}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-semibold text-primary-700 mb-2 flex items-center space-x-2"><i className="ri-thumb-up-line"></i><span>What I Love</span></h5>
                      <ul className="space-y-1.5">{review.pros.map((pro, idx) => (<li key={idx} className="flex items-start space-x-2 text-sm text-warm-gray"><i className="ri-check-line text-primary-700 mt-0.5 flex-shrink-0"></i><span>{pro}</span></li>))}</ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-red-600 mb-2 flex items-center space-x-2"><i className="ri-thumb-down-line"></i><span>Areas for Improvement</span></h5>
                      <ul className="space-y-1.5">{review.cons.map((con, idx) => (<li key={idx} className="flex items-start space-x-2 text-sm text-warm-gray"><i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i><span>{con}</span></li>))}</ul>
                    </div>
                  </div>
                  <div className="mb-4">
                    {review.beforeAfterPhotos && review.beforeAfterPhotos.length > 0 ? (
                      <button
                        onClick={() => setProgressPhotoReview(review)}
                        className="flex items-center space-x-2 px-3 py-2 bg-light/20 text-primary-700 border border-primary-300 rounded-lg text-sm font-medium hover:bg-light/40 transition-colors cursor-pointer"
                      >
                        <i className="ri-image-line"></i>
                        <span>View Progress Photos ({review.beforeAfterPhotos.length})</span>
                      </button>
                    ) : (
                      <p className="text-xs text-warm-gray/60 italic">User didn't attach before and after photos</p>
                    )}
                  </div>
                  {review.finalVerdict && (
                    <div className="mb-4 p-4 bg-cream rounded-xl border border-blush">
                      <p className="text-sm text-deep leading-relaxed italic">"{review.finalVerdict}"</p>
                      <p className="text-xs text-warm-gray mt-2">— {review.userName}'s final take</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-blush">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleHelpfulClick(review.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          helpfulReviews.has(review.id)
                            ? 'bg-primary/10 text-primary'
                            : 'text-warm-gray hover:bg-gray-100'
                        } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                        style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                      >
                        <i className={helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                        <span className="text-sm">Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})</span>
                      </button>
                      <button onClick={() => handleShareReview(review)} aria-label="Share review" className="flex items-center space-x-2 text-warm-gray hover:text-primary cursor-pointer"><i className="ri-share-line"></i><span className="text-sm">Share</span></button>
                      {reportedReviews.has(review.id) ? (
                        <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                          <i className="ri-flag-fill text-xs"></i>
                          Reported
                        </span>
                      ) : showReportConfirm === review.id ? (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-flag-line text-xs text-warm-gray/60"></i>
                          <span className="text-xs text-warm-gray">Report this review?</span>
                          <button onClick={() => handleReportReview(review.id)} className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer">Yes</button>
                          <button onClick={() => setShowReportConfirm(null)} className="text-xs text-warm-gray hover:text-deep cursor-pointer">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowReportConfirm(review.id)} className="flex items-center space-x-2 text-warm-gray hover:text-primary cursor-pointer"><i className="ri-flag-line"></i><span className="text-sm">Report</span></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedReviews.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-light/20 rounded-full border border-primary-300">
                <i className="ri-user-heart-line text-3xl text-primary-700"></i>
              </div>
              {hasSurveyData ? (
                <>
                  <h3 className="text-xl font-semibold text-deep mb-2">No reviews match your skin profile yet</h3>
                  <p className="text-warm-gray mb-6 max-w-md mx-auto">We couldn't find reviews from individuals with a similar skin profile. Try adjusting your filters or explore other products.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-deep mb-2">No reviews found</h3>
                  <p className="text-warm-gray mb-6">Try adjusting your filters to see more results.</p>
                </>
              )}
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => { setSortBy('newest'); setFilterRating('all'); setFilterRecommended('all'); setFilterVerified(false); setSearchQuery(''); }} className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-all cursor-pointer">Clear All Filters</button>
                <Link to="/discover" className="px-6 py-3 border border-primary text-primary rounded-full font-semibold hover:bg-light/20 transition-all">Explore Products</Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Progress Photos Modal */}
      {progressPhotoReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setProgressPhotoReview(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-deep">Progress Photos</h3>
                <p className="text-sm text-warm-gray mt-1">{progressPhotoReview.userName} &middot; Used for {progressPhotoReview.usageDuration}</p>
              </div>
              <button
                onClick={() => setProgressPhotoReview(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-3">Before</p>
                  {progressPhotoReview.beforeAfterPhotos?.[0] ? (
                    <div className="rounded-lg overflow-hidden bg-gray-50">
                      <img src={progressPhotoReview.beforeAfterPhotos[0]} alt="Before progress photo" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 flex items-center justify-center aspect-[4/3]">
                      <div className="text-center">
                        <i className="ri-image-line text-2xl text-warm-gray/30"></i>
                        <p className="text-xs text-warm-gray/50 mt-1">No photo provided</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide mb-3">After</p>
                  {progressPhotoReview.beforeAfterPhotos?.[1] ? (
                    <div className="rounded-lg overflow-hidden bg-gray-50">
                      <img src={progressPhotoReview.beforeAfterPhotos[1]} alt="After progress photo" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 flex items-center justify-center aspect-[4/3]">
                      <div className="text-center">
                        <i className="ri-image-line text-2xl text-warm-gray/30"></i>
                        <p className="text-xs text-warm-gray/50 mt-1">No photo provided</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowReportModal(null); setReportReason(''); setReportDetails(''); } }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" role="dialog" aria-modal="true">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-deep">Report Review</h3>
              <button
                onClick={() => { setShowReportModal(null); setReportReason(''); setReportDetails(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary"
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
                onClick={() => { setShowReportModal(null); setReportReason(''); setReportDetails(''); }}
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
        const popupBadge = getTierBadgeInfo(r.matchTier || 'none', r.similarityScore || 0);
        const skinTypeMatch = r.skinType.toLowerCase() === userSkinProfile.skinType.toLowerCase();
        let concernCount = 0;
        r.skinConcerns.forEach(rc => { if (matchesConcern(rc, userSkinProfile.primaryConcerns)) concernCount++; });
        const complexionResult = isComplexionMatch(r.complexion || '', userSkinProfile.complexion);
        const complexionMatch = complexionResult !== 'none';
        const sensitivityMatch = !!(r.sensitivity && userSkinProfile.sensitivity && r.sensitivity === userSkinProfile.sensitivity);
        const lifestyleMatch = !!(r.lifestyle && userSkinProfile.lifestyle.length > 0 && r.lifestyle.some(l => userSkinProfile.lifestyle.includes(l)));
        const ageMatch = Math.abs(r.age - userSkinProfile.age) <= 5;

        const rows = [
          { name: 'Skin Type', points: '+40', matched: skinTypeMatch, earned: skinTypeMatch ? 40 : 0, theirs: r.skinType, yours: userSkinProfile.skinType },
          { name: 'Concerns', points: '+15/ea', matched: concernCount > 0, earned: concernCount * 15, theirs: r.skinConcerns.slice(0, 2).join(', '), yours: userSkinProfile.primaryConcerns.slice(0, 2).join(', '), note: `${concernCount} matched` },
          { name: 'Complexion', points: '+10', matched: complexionMatch, earned: complexionMatch ? 10 : 0, theirs: r.complexion || '—', yours: userSkinProfile.complexion || '—', note: complexionMatch ? (complexionResult === 'exact' ? 'exact' : '±1 tier') : undefined },
          { name: 'Sensitivity', points: '+10', matched: sensitivityMatch, earned: sensitivityMatch ? 10 : 0, theirs: r.sensitivity || '—', yours: userSkinProfile.sensitivity || '—' },
          { name: 'Lifestyle', points: '+5', matched: lifestyleMatch, earned: lifestyleMatch ? 5 : 0, theirs: r.lifestyle?.slice(0, 1).join('') || '—', yours: userSkinProfile.lifestyle.slice(0, 1).join('') || '—' },
          { name: 'Age Range', points: '+5', matched: ageMatch, earned: ageMatch ? 5 : 0, theirs: `Age ${r.age}`, yours: `Age ${userSkinProfile.age}`, note: '±5 years' },
        ];

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setMatchPopupReview(null); }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" role="dialog" aria-modal="true">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-deep">Match Breakdown</h3>
                  <p className="text-sm text-warm-gray mt-1">{r.userName}'s profile vs yours</p>
                </div>
                <button
                  onClick={() => setMatchPopupReview(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary"
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
                  <span className="text-lg font-bold text-primary">{Math.min(r.similarityScore || 0, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-deep text-white text-sm font-medium rounded-full shadow-lg flex items-center space-x-2">
          <i className="ri-check-line"></i>
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
};

export default ProductReviewsPage;
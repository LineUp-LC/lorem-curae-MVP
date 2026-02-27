import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Dropdown from '../../components/ui/Dropdown';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveComplexion, getEffectiveSensitivity, getEffectiveLifestyle } from '../../lib/utils/sessionState';
import { calculateSimilarityWeight, getTierBadgeInfo, type MatchTier } from '../../lib/utils/reviewSimilarity';
import { matchesConcern } from '../../lib/utils/matching';

interface RetailerReview {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  retailerName: string;
  aspectRatings: {
    customerService: number;
    shipping: number;
    website: number;
    packaging: number;
    valueForMoney: number;
  };
  purchaseDetails: {
    orderValue: string;
    shippingTime: string;
    paymentMethod: string;
  };
  skinType: string;
  skinConcerns: string[];
  age: number;
  routineLength: string;
  similarityScore?: number;
  matchTier?: MatchTier;
  matchDetails?: string[];
}

const ReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const retailerFilter = searchParams.get('retailer');
  const userSkinTypeParam = searchParams.get('skinType');
  const userConcernsParam = searchParams.get('concerns')?.split(',') || [];

  const ratingParam = searchParams.get('rating');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filterRating, setFilterRating] = useState<string>(ratingParam || 'all');
  const [filterRetailer, setFilterRetailer] = useState<string>(retailerFilter || 'all');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [matchPopupReview, setMatchPopupReview] = useState<RetailerReview | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (matchPopupReview) setMatchPopupReview(null);
        else if (showReportModal) { setShowReportModal(null); setReportReason(''); setReportDetails(''); }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [matchPopupReview, showReportModal]);

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

  const handleShareReview = async (review: RetailerReview) => {
    const shareUrl = `${window.location.origin}/retailer-reviews?id=${productId || ''}&review=${review.id}`;
    const shareData = {
      title: `${review.userName}'s review of ${review.retailerName}`,
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
  const allReviews: RetailerReview[] = [
    {
      id: 1, userName: 'Verified Reviewer',
      userAvatar: '',
      rating: 5, title: 'Outstanding customer service and fast delivery',
      content: 'Ordered from the Official Brand Store and was impressed by their responsiveness. Had a question about my order and received a helpful reply within 2 hours. Product arrived beautifully packaged in eco-friendly materials.',
      date: '2024-01-20', verified: true, helpful: 34, retailerName: 'Official Brand Store',
      aspectRatings: { customerService: 5, shipping: 5, website: 5, packaging: 5, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$48.94', shippingTime: '2 days', paymentMethod: 'Credit Card' },
      skinType: 'combination', skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation'], age: 29, routineLength: '3-6 months'
    },
    {
      id: 2, userName: 'Verified Reviewer',
      userAvatar: '',
      rating: 4, title: 'Great experience with Beauty Haven',
      content: 'First time ordering from Beauty Haven and the process was seamless. Their website is well-organized and easy to navigate.',
      date: '2024-01-18', verified: true, helpful: 28, retailerName: 'Beauty Haven',
      aspectRatings: { customerService: 4, shipping: 4, website: 5, packaging: 3, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$55.45', shippingTime: '4 days', paymentMethod: 'PayPal' },
      skinType: 'oily', skinConcerns: ['Large Pores', 'Excess Oil'], age: 31, routineLength: '1-3 months'
    },
    {
      id: 3, userName: 'Community Member',
      userAvatar: '',
      rating: 5, title: 'Exceptional service from Glow Market',
      content: "Glow Market exceeded my expectations! Their price match policy saved me $3, and they processed it quickly without hassle.",
      date: '2024-01-15', verified: false, helpful: 42, retailerName: 'Glow Market',
      aspectRatings: { customerService: 5, shipping: 5, website: 4, packaging: 5, valueForMoney: 5 },
      purchaseDetails: { orderValue: '$52.73', shippingTime: '3 days', paymentMethod: 'Apple Pay' },
      skinType: 'combination', skinConcerns: ['Acne & Breakouts', 'Dryness & Dehydration'], age: 27, routineLength: '3-6 months'
    },
    {
      id: 4, userName: 'Verified Reviewer',
      userAvatar: '',
      rating: 4, title: 'Solid experience with Skin Essentials',
      content: 'Skin Essentials provided expert advice through their chat feature, which helped me choose the right variant for my combination skin.',
      date: '2024-01-12', verified: true, helpful: 25, retailerName: 'Skin Essentials',
      aspectRatings: { customerService: 5, shipping: 3, website: 4, packaging: 4, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$54.36', shippingTime: '4 days', paymentMethod: 'Credit Card' },
      skinType: 'combination', skinConcerns: ['Hyperpigmentation', 'Uneven Skin Tone'], age: 30, routineLength: '6+ months'
    },
    {
      id: 5, userName: 'Verified Reviewer',
      userAvatar: '',
      rating: 3, title: 'Mixed experience with Pure Beauty Co',
      content: "Pure Beauty Co's commitment to eco-friendly packaging is commendable. However, the website was slow during checkout.",
      date: '2024-01-10', verified: true, helpful: 19, retailerName: 'Pure Beauty Co',
      aspectRatings: { customerService: 2, shipping: 2, website: 3, packaging: 5, valueForMoney: 3 },
      purchaseDetails: { orderValue: '$55.99', shippingTime: '7 days', paymentMethod: 'Credit Card' },
      skinType: 'sensitive', skinConcerns: ['Sensitivity', 'Redness'], age: 33, routineLength: '6+ months'
    },
    {
      id: 6, userName: 'Verified Reviewer',
      userAvatar: '',
      rating: 5, title: 'Flawless online shopping experience',
      content: "Official Brand Store's website is the gold standard - fast loading, intuitive navigation, and excellent mobile optimization.",
      date: '2024-01-08', verified: true, helpful: 38, retailerName: 'Official Brand Store',
      aspectRatings: { customerService: 5, shipping: 5, website: 5, packaging: 5, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$48.94', shippingTime: '2 days', paymentMethod: 'Store Credit' },
      skinType: 'combination', skinConcerns: ['Acne & Breakouts', 'Large Pores'], age: 26, routineLength: '1-3 months'
    }
  ];

  // Score all reviews using shared Similarity Weight utility (12.15)
  const scoredReviews = allReviews.map(review => {
    const { score, matchTier, matchDetails } = calculateSimilarityWeight(
      { skinType: review.skinType, skinConcerns: review.skinConcerns, age: review.age },
      { skinType: userSkinProfile.skinType, primaryConcerns: userSkinProfile.primaryConcerns, complexion: surveyComplexion, sensitivity: surveySensitivity, lifestyle: surveyLifestyle, age: userSkinProfile.age }
    );
    return { ...review, similarityScore: score, matchTier, matchDetails };
  });

  // Filter: only show reviews with similarity ≥15 when profile data exists
  let filteredReviews = scoredReviews.filter(review => {
    // Apply user-selected filters first
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false;
    if (filterRetailer !== 'all' && review.retailerName !== filterRetailer) return false;
    if (filterVerified && !review.verified) return false;
    // Keyword search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        review.title.toLowerCase().includes(q) ||
        review.content.toLowerCase().includes(q) ||
        review.retailerName.toLowerCase().includes(q) ||
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

  const retailers = Array.from(new Set(allReviews.map(r => r.retailerName)));
  const averageRating = allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < Math.floor(rating); i++) stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    if (rating % 1 >= 0.5) stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    for (let i = 0; i < 5 - Math.ceil(rating); i++) stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    return stars;
  };

  const renderAspectRating = (label: string, rating: number) => (
    <div className="flex items-center justify-between text-sm">
      <span className="text-warm-gray">{label}:</span>
      <div className="flex items-center space-x-1">
        {renderStars(rating)}
        <span className="text-deep font-medium ml-1">{rating}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <main className="pt-24 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-warm-gray mb-4">
              <Link to="/" className="hover:text-primary focus:text-primary focus:outline-none cursor-pointer transition-colors duration-fast">Home</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/discover" className="hover:text-primary focus:text-primary focus:outline-none cursor-pointer transition-colors duration-fast">Products</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span className="text-primary font-medium">Retailer Reviews</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-deep mb-4">Retailer Reviews &amp; Service Ratings</h1>
            <p className="text-xl text-warm-gray max-w-3xl">Real customer experiences with online beauty retailers. Read about service quality, shipping reliability, website experience, and overall satisfaction.</p>
          </div>

          {hasSurveyData && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border-l-4 border-primary">
              <div>
                <h3 className="text-xl font-semibold text-deep mb-2">Showing reviews from similar individuals</h3>
                <p className="text-warm-gray text-sm mb-3">Prioritized for <strong>{userSkinProfile.skinType} skin</strong> with concerns about <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong>{userSkinProfile.complexion ? <> and <strong>{userSkinProfile.complexion}</strong> complexion</> : ''} that have purchased from these retailers.</p>
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
                  <p className="text-warm-gray text-sm mb-3">Take the skin survey to see retailer reviews from individuals with skin similar to yours.</p>
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
                <p className="text-sm text-warm-gray mb-2">Overall Rating</p>
                <div className="flex items-center justify-center space-x-1">{renderStars(Math.round(averageRating))}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{allReviews.length}</div>
                <p className="text-sm text-warm-gray">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-deep mb-1">{retailers.length}</div>
                <p className="text-sm text-warm-gray">Retailers Reviewed</p>
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
                <label className="block text-sm font-semibold text-warm-gray mb-2">Retailer</label>
                <Dropdown
                  id="filter-retailer"
                  value={filterRetailer}
                  onChange={setFilterRetailer}
                  options={[
                    { value: 'all', label: 'All Retailers' },
                    ...retailers.map((retailer) => ({ value: retailer, label: retailer })),
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
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-blush/30 flex-shrink-0 flex items-center justify-center">
                          {review.userAvatar ? (
                            <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-user-line text-2xl text-warm-gray/50"></i>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-deep">{review.userName}</h3>
                            {review.verified && (<span className="flex items-center space-x-1 px-2 py-0.5 bg-taupe-100 text-taupe-800 text-xs font-medium rounded-full"><i className="ri-shield-check-fill"></i><span>Verified</span></span>)}
                            {hasSurveyData && tierBadge && (<button onClick={() => setMatchPopupReview(review)} className={`flex items-center space-x-1 px-3 py-1 ${tierBadge.color} text-xs font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer`}><i className={tierBadge.icon}></i><span>{tierBadge.label}</span></button>)}
                          </div>
                          <div className="flex items-center space-x-3 mb-1">
                            <div className="flex items-center space-x-0.5">{renderStars(review.rating)}</div>
                            <span className="text-xs text-warm-gray/80">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-primary">{review.retailerName}</span>
                            <span className="text-sm text-warm-gray/80">• Order: {review.purchaseDetails.orderValue}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${hasSurveyData && review.skinType.toLowerCase() === userSkinProfile.skinType.toLowerCase() ? 'text-primary-700 font-medium' : 'text-warm-gray/80'}`}>
                              {review.skinType} skin
                            </span>
                            <span className="text-xs text-warm-gray/80">• Age {review.age}</span>
                            <div className="flex flex-wrap gap-1">
                              {review.skinConcerns.slice(0, 2).map((concern, idx) => (
                                <span key={idx} className={`px-2 py-1 text-xs rounded-full ${hasSurveyData && matchesConcern(concern, userSkinProfile.primaryConcerns) ? 'bg-light/30 text-primary-700 border border-primary-300 font-medium' : 'bg-gray-100 text-gray-600'}`}>{concern}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-deep mb-3">{review.title}</h4>
                      <p className="text-warm-gray leading-relaxed mb-4">{review.content}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-warm-gray mb-4">
                        <span className="flex items-center space-x-1"><i className="ri-time-line"></i><span>Delivered in {review.purchaseDetails.shippingTime}</span></span>
                        <span className="flex items-center space-x-1"><i className="ri-bank-card-line"></i><span>{review.purchaseDetails.paymentMethod}</span></span>
                      </div>
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
                    <div className="bg-cream rounded-xl p-4">
                      <h5 className="text-lg font-semibold text-deep mb-4">Service Breakdown</h5>
                      <div className="space-y-3">
                        {renderAspectRating('Customer Service', review.aspectRatings.customerService)}
                        {renderAspectRating('Shipping Speed', review.aspectRatings.shipping)}
                        {renderAspectRating('Website Experience', review.aspectRatings.website)}
                        {renderAspectRating('Packaging Quality', review.aspectRatings.packaging)}
                        {renderAspectRating('Value for Money', review.aspectRatings.valueForMoney)}
                      </div>
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
                  <p className="text-warm-gray mb-6 max-w-md mx-auto">We couldn't find retailer reviews from individuals with a similar skin profile. Try adjusting your filters or explore other retailers.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-deep mb-2">No reviews found</h3>
                  <p className="text-warm-gray mb-6">Try adjusting your filters to see more results.</p>
                </>
              )}
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => { setSortBy('newest'); setFilterRating('all'); setFilterRetailer('all'); setFilterVerified(false); setSearchQuery(''); }} className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-all cursor-pointer">Clear All Filters</button>
                <Link to="/discover" className="px-6 py-3 border border-primary text-primary rounded-full font-semibold hover:bg-light/20 transition-all">Explore Products</Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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
        const ageMatch = Math.abs(r.age - userSkinProfile.age) <= 5;

        const rows = [
          { name: 'Skin Type', points: '+40', matched: skinTypeMatch, earned: skinTypeMatch ? 40 : 0, theirs: r.skinType, yours: userSkinProfile.skinType },
          { name: 'Concerns', points: '+15/ea', matched: concernCount > 0, earned: concernCount * 15, theirs: r.skinConcerns.slice(0, 2).join(', '), yours: userSkinProfile.primaryConcerns.slice(0, 2).join(', '), note: `${concernCount} matched` },
          { name: 'Complexion', points: '+10', matched: false, earned: 0, theirs: '—', yours: userSkinProfile.complexion || '—' },
          { name: 'Sensitivity', points: '+10', matched: false, earned: 0, theirs: '—', yours: userSkinProfile.sensitivity || '—' },
          { name: 'Lifestyle', points: '+5', matched: false, earned: 0, theirs: '—', yours: userSkinProfile.lifestyle.slice(0, 1).join('') || '—' },
          { name: 'Age Range', points: '+5', matched: ageMatch, earned: ageMatch ? 5 : 0, theirs: `Age ${r.age}`, yours: `Age ${userSkinProfile.age}`, note: '±5 years' },
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

export default ReviewsPage;
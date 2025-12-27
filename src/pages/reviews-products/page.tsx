import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../lib/utils/sessionState';

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
  beforeAfterPhotos?: string[];
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  usageDuration: string;
  similarityScore?: number;
}

const ProductReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const userSkinTypeParam = searchParams.get('skinType');
  const userConcernsParam = searchParams.get('concerns')?.split(',') || [];
  
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterSkinType, setFilterSkinType] = useState<string>(userSkinTypeParam || 'all');
  const [filterRecommended, setFilterRecommended] = useState<string>('all');
  const [showOnlySimilar, setShowOnlySimilar] = useState<boolean>(!!userSkinTypeParam);

  // Get user skin profile from sessionState (unified source of truth), with URL params as fallback
  const effectiveSkinType = getEffectiveSkinType() || userSkinTypeParam || 'combination';
  const effectiveConcerns = getEffectiveConcerns().length > 0 
    ? getEffectiveConcerns() 
    : (userConcernsParam.length > 0 ? userConcernsParam : ['Acne & Breakouts', 'Hyperpigmentation']);

  const [userSkinProfile] = useState({
    skinType: effectiveSkinType,
    primaryConcerns: effectiveConcerns,
    age: 28,
    routineLength: '3-6 months'
  });

  const allReviews: ProductReview[] = [
    {
      id: 1,
      userName: 'Sarah Mitchell',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20headshot%2C%20satisfied%20skincare%20user%2C%20natural%20smile%2C%20glowing%20skin%2C%20clean%20background&width=60&height=60&seq=product-reviewer-001&orientation=squarish',
      rating: 5,
      title: 'Complete game-changer for my combination skin!',
      content: "After 3 months of consistent use, this serum has completely transformed my skin. My T-zone used to be an oil slick by noon, but now it stays balanced all day. The acne on my chin has cleared up significantly, and my hyperpigmentation from old breakouts is fading. The texture is lightweight and layers perfectly under moisturizer. I apply 3-4 drops morning and night, and one bottle lasts about 6 weeks. Worth every penny!",
      date: '2024-01-20',
      verified: true,
      helpful: 45,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://readdy.ai/api/search-image?query=Elegant%20skincare%20serum%20bottle%2C%20niacinamide%20formula%2C%20premium%20glass%20packaging%2C%20clean%20aesthetic%2C%20white%20background&width=80&height=80&seq=product-image-001&orientation=squarish',
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation', 'Large Pores'],
      age: 29,
      routineLength: '3-6 months',
      beforeAfterPhotos: ['https://readdy.ai/api/search-image?query=Before%20and%20after%20skincare%20results%2C%20combination%20skin%20improvement%2C%20acne%20clearing%2C%20professional%20photography&width=200&height=150&seq=before-after-001&orientation=landscape'],
      pros: ['Reduced oiliness', 'Cleared acne', 'Faded dark spots', 'Lightweight texture'],
      cons: ['Takes 6-8 weeks to see full results', 'Slight tingling first week'],
      wouldRecommend: true,
      usageDuration: '3 months'
    },
    {
      id: 2,
      userName: 'Jessica Chen',
      userAvatar: 'https://readdy.ai/api/search-image?query=Young%20asian%20woman%20portrait%2C%20skincare%20enthusiast%2C%20happy%20expression%2C%20clear%20skin%2C%20natural%20lighting&width=60&height=60&seq=product-reviewer-002&orientation=squarish',
      rating: 4,
      title: 'Great for sensitive skin, gentle yet effective',
      content: "As someone with reactive sensitive skin, I was nervous to try this. Started with every other night and gradually increased to nightly use. No irritation whatsoever! My redness has decreased noticeably, and my skin feels more resilient. The formula is very gentle - no burning or stinging that I usually get with active ingredients. My skin looks calmer and more even-toned after 2 months of use.",
      date: '2024-01-18',
      verified: true,
      helpful: 32,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://readdy.ai/api/search-image?query=Elegant%20skincare%20serum%20bottle%2C%20niacinamide%20formula%2C%20premium%20glass%20packaging%2C%20clean%20aesthetic%2C%20white%20background&width=80&height=80&seq=product-image-002&orientation=squarish',
      skinType: 'sensitive',
      skinConcerns: ['Sensitivity', 'Redness', 'Uneven Skin Tone'],
      age: 25,
      routineLength: '6+ months',
      pros: ['Very gentle formula', 'Reduced redness', 'No irritation', 'Calming effect'],
      cons: ['Results take time', 'Wish it came in larger size'],
      wouldRecommend: true,
      usageDuration: '2 months'
    },
    {
      id: 3,
      userName: 'Michael Rodriguez',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20satisfied%20skincare%20customer%2C%20confident%20smile%2C%20clear%20skin%2C%20modern%20portrait&width=60&height=60&seq=product-reviewer-003&orientation=squarish',
      rating: 5,
      title: 'Finally found my holy grail for oily skin',
      content: "This serum is incredible for controlling oil production without over-drying. I have very oily skin with enlarged pores, and this has been a lifesaver. Within 4 weeks, my pores looked visibly smaller, and the oil control lasts all day. I use it twice daily after cleansing. The niacinamide concentration is perfect - strong enough to be effective but not irritating. My skin texture has improved dramatically.",
      date: '2024-01-15',
      verified: false,
      helpful: 38,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://readdy.ai/api/search-image?query=Elegant%20skincare%20serum%20bottle%2C%20niacinamide%20formula%2C%20premium%20glass%20packaging%2C%20clean%20aesthetic%2C%20white%20background&width=80&height=80&seq=product-image-003&orientation=squarish',
      skinType: 'oily',
      skinConcerns: ['Large Pores', 'Excess Oil', 'Uneven Texture'],
      age: 32,
      routineLength: '1-3 months',
      pros: ['Excellent oil control', 'Minimized pores', 'Improved texture', 'Long-lasting effects'],
      cons: ['Bottle could be bigger', 'Dropper sometimes gets sticky'],
      wouldRecommend: true,
      usageDuration: '4 months'
    },
    {
      id: 4,
      userName: 'Emma Thompson',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20portrait%2C%20mature%20skincare%20user%2C%20elegant%20appearance%2C%20satisfied%20expression%2C%20natural%20lighting&width=60&height=60&seq=product-reviewer-004&orientation=squarish',
      rating: 4,
      title: 'Effective for hyperpigmentation and aging concerns',
      content: "At 42, I was looking for something to address both pigmentation and fine lines. This serum has definitely helped with both! My melasma patches have lightened considerably over 3 months, and I've noticed my skin looks more plump and smooth. The formula plays well with my other anti-aging products. I use it in my morning routine under vitamin C serum and sunscreen.",
      date: '2024-01-12',
      verified: true,
      helpful: 28,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://readdy.ai/api/search-image?query=Elegant%20skincare%20serum%20bottle%2C%20niacinamide%20formula%2C%20premium%20glass%20packaging%2C%20clean%20aesthetic%2C%20white%20background&width=80&height=80&seq=product-image-004&orientation=squarish',
      skinType: 'dry',
      skinConcerns: ['Hyperpigmentation', 'Fine Lines & Wrinkles', 'Dryness & Dehydration'],
      age: 42,
      routineLength: '6+ months',
      pros: ['Faded dark spots', 'Improved skin texture', 'Works with other products', 'Anti-aging benefits'],
      cons: ['Takes patience to see results', 'Price point is high'],
      wouldRecommend: true,
      usageDuration: '3 months'
    },
    {
      id: 5,
      userName: 'David Park',
      userAvatar: 'https://readdy.ai/api/search-image?query=Young%20man%20portrait%2C%20skincare%20beginner%2C%20friendly%20expression%2C%20clear%20complexion%2C%20professional%20headshot&width=60&height=60&seq=product-reviewer-005&orientation=squarish',
      rating: 3,
      title: 'Good product but not miraculous for me',
      content: "I had high expectations based on other reviews, but the results have been more subtle for me. I do see some improvement in my skin texture and my breakouts are less frequent, but it hasn't been the dramatic transformation I hoped for. My combination skin still gets oily in the T-zone, though maybe less than before. It's a decent product, just not the miracle cure I expected.",
      date: '2024-01-10',
      verified: true,
      helpful: 22,
      productName: 'Advanced Niacinamide Serum',
      productImage: 'https://readdy.ai/api/search-image?query=Elegant%20skincare%20serum%20bottle%2C%20niacinamide%20formula%2C%20premium%20glass%20packaging%2C%20clean%20aesthetic%2C%20white%20background&width=80&height=80&seq=product-image-005&orientation=squarish',
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Large Pores'],
      age: 24,
      routineLength: '1-3 months',
      pros: ['Gentle on skin', 'Some texture improvement', 'Good ingredients'],
      cons: ['Results slower than expected', 'T-zone still oily', 'Expensive for subtle results'],
      wouldRecommend: false,
      usageDuration: '6 weeks'
    }
  ];

  const calculateSimilarityScore = (review: ProductReview): number => {
    let score = 0;
    if (review.skinType === userSkinProfile.skinType) score += 50;
    const concernMatches = review.skinConcerns.filter(concern => userSkinProfile.primaryConcerns.includes(concern)).length;
    score += concernMatches * 20;
    const ageDiff = Math.abs(review.age - userSkinProfile.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    if (review.routineLength === userSkinProfile.routineLength) score += 10;
    return score;
  };

  let filteredReviews = allReviews.filter(review => {
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false;
    if (filterVerified && !review.verified) return false;
    if (filterSkinType !== 'all' && review.skinType !== filterSkinType) return false;
    if (filterRecommended !== 'all') {
      if (filterRecommended === 'yes' && !review.wouldRecommend) return false;
      if (filterRecommended === 'no' && review.wouldRecommend) return false;
    }
    if (showOnlySimilar) return calculateSimilarityScore(review) > 20;
    return true;
  });

  filteredReviews = filteredReviews.map(review => ({ ...review, similarityScore: calculateSimilarityScore(review) }));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'relevance': return userSkinTypeParam ? (b.similarityScore || 0) - (a.similarityScore || 0) : b.helpful - a.helpful;
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      case 'helpful': return b.helpful - a.helpful;
      default: return 0;
    }
  });

  const skinTypes = Array.from(new Set(allReviews.map(r => r.skinType)));
  const averageRating = allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length;
  const recommendPercentage = (allReviews.filter(r => r.wouldRecommend).length / allReviews.length) * 100;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < Math.floor(rating); i++) stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    if (rating % 1 >= 0.5) stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    for (let i = 0; i < 5 - Math.ceil(rating); i++) stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    return stars;
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 70) return { label: 'Very Similar to You', color: 'bg-green-100 text-green-800', icon: 'ri-user-heart-line' };
    if (score >= 50) return { label: 'Similar Profile', color: 'bg-blue-100 text-blue-800', icon: 'ri-user-line' };
    if (score >= 30) return { label: 'Somewhat Similar', color: 'bg-amber-100 text-amber-800', icon: 'ri-user-2-line' };
    return null;
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <div className="pt-24 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-sage-600 cursor-pointer">Home</Link>
              <i className="ri-arrow-right-s-line"></i>
              <Link to="/discover" className="hover:text-sage-600 cursor-pointer">Products</Link>
              <i className="ri-arrow-right-s-line"></i>
              <span className="text-sage-600">Product Reviews</span>
            </div>
            <h1 className="text-4xl font-serif text-forest-900 mb-3">Product Reviews &amp; Results</h1>
            <p className="text-lg text-gray-600 max-w-3xl">Real customer experiences with detailed before/after results, pros and cons, and personalized recommendations based on skin profiles.</p>
          </div>

          {userSkinTypeParam && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border-l-4 border-sage-600">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0"><i className="ri-user-heart-line text-sage-600 text-xl"></i></div>
                  <div>
                    <h3 className="text-xl font-semibold text-forest-900 mb-2">Personalized for Your Skin Profile</h3>
                    <p className="text-gray-600 text-sm mb-3">Reviews prioritized for: <strong>{userSkinProfile.skinType} skin</strong> with concerns about <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong></p>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showOnlySimilar} onChange={(e) => setShowOnlySimilar(e.target.checked)} className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500" />
                        <span className="text-sm text-gray-700">Only show reviews from similar skin profiles</span>
                      </label>
                      <span className="text-xs text-sage-600 bg-sage-50 px-2 py-1 rounded-full">{sortedReviews.filter(r => (r.similarityScore || 0) > 20).length} matching reviews</span>
                    </div>
                  </div>
                </div>
                <Link to="/my-skin" className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer flex items-center space-x-1"><i className="ri-settings-3-line"></i><span>Update Profile</span></Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center space-x-1 mb-2">{renderStars(Math.round(averageRating))}</div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{allReviews.length}</div>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{recommendPercentage.toFixed(0)}%</div>
                <p className="text-sm text-gray-600">Would Recommend</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{((allReviews.filter(r => r.verified).length / allReviews.length) * 100).toFixed(0)}%</div>
                <p className="text-sm text-gray-600">Verified Purchases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer">
                  {userSkinTypeParam && <option value="relevance">Most Relevant to You</option>}
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer">
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skin Type</label>
                <select value={filterSkinType} onChange={(e) => setFilterSkinType(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer">
                  <option value="all">All Skin Types</option>
                  {skinTypes.map((skinType) => (<option key={skinType} value={skinType}>{skinType}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendation</label>
                <select value={filterRecommended} onChange={(e) => setFilterRecommended(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer">
                  <option value="all">All</option>
                  <option value="yes">Recommends</option>
                  <option value="no">Doesn't Recommend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Status</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={filterVerified} onChange={(e) => setFilterVerified(e.target.checked)} className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500" />
                  <span className="text-sm text-gray-700">Verified only</span>
                </label>
              </div>
              <div className="flex items-end"><div className="text-sm text-gray-600">Showing {sortedReviews.length} of {allReviews.length} reviews</div></div>
            </div>
          </div>

          <div className="space-y-6">
            {sortedReviews.map((review) => {
              const similarityBadge = getSimilarityBadge(review.similarityScore || 0);
              return (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0"><img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{review.userName}</h3>
                        {review.verified && (<span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><i className="ri-shield-check-fill"></i><span>Verified</span></span>)}
                        {similarityBadge && (<span className={`flex items-center space-x-1 px-3 py-1 ${similarityBadge.color} text-xs font-semibold rounded-full`}><i className={similarityBadge.icon}></i><span>{similarityBadge.label}</span></span>)}
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                        <span className="text-sm text-gray-500">• Used for {review.usageDuration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{review.skinType} skin • Age {review.age}</span>
                        <div className="flex flex-wrap gap-1">
                          {review.skinConcerns.slice(0, 2).map((concern, idx) => (
                            <span key={idx} className={`px-2 py-1 text-xs rounded-full ${userSkinProfile.primaryConcerns.includes(concern) ? 'bg-sage-100 text-sage-800 font-medium' : 'bg-gray-100 text-gray-600'}`}>{concern}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100"><img src={review.productImage} alt={review.productName} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.productName}</p>
                        <div className={`text-xs font-medium ${review.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>{review.wouldRecommend ? '✓ Recommends' : "✗ Doesn't Recommend"}</div>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{review.title}</h4>
                  <p className="text-gray-700 leading-relaxed mb-6">{review.content}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="text-lg font-semibold text-green-700 mb-3 flex items-center space-x-2"><i className="ri-thumb-up-line"></i><span>What I Love</span></h5>
                      <ul className="space-y-2">{review.pros.map((pro, idx) => (<li key={idx} className="flex items-start space-x-2 text-sm text-gray-700"><i className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"></i><span>{pro}</span></li>))}</ul>
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-red-700 mb-3 flex items-center space-x-2"><i className="ri-thumb-down-line"></i><span>Areas for Improvement</span></h5>
                      <ul className="space-y-2">{review.cons.map((con, idx) => (<li key={idx} className="flex items-start space-x-2 text-sm text-gray-700"><i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i><span>{con}</span></li>))}</ul>
                    </div>
                  </div>
                  {review.beforeAfterPhotos && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-3">Progress Photos</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{review.beforeAfterPhotos.map((photo, idx) => (<div key={idx} className="rounded-lg overflow-hidden"><img src={photo} alt={`Progress photo ${idx + 1}`} className="w-full h-48 object-cover" /></div>))}</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-sage-600 cursor-pointer"><i className="ri-thumb-up-line"></i><span className="text-sm">Helpful ({review.helpful})</span></button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-sage-600 cursor-pointer"><i className="ri-share-line"></i><span className="text-sm">Share</span></button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-sage-600 cursor-pointer"><i className="ri-flag-line"></i><span className="text-sm">Report</span></button>
                    </div>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${review.wouldRecommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <i className={review.wouldRecommend ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                      <span className="text-sm font-medium">{review.wouldRecommend ? 'Recommends this product' : "Doesn't recommend"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full"><i className="ri-search-line text-3xl text-gray-400"></i></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
              <button onClick={() => { setSortBy('newest'); setFilterRating('all'); setFilterSkinType('all'); setFilterRecommended('all'); setFilterVerified(false); setShowOnlySimilar(false); }} className="px-6 py-3 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all cursor-pointer">Clear All Filters</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductReviewsPage;

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../lib/utils/sessionState';

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
}

const ReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const retailerFilter = searchParams.get('retailer');
  const userSkinTypeParam = searchParams.get('skinType');
  const userConcernsParam = searchParams.get('concerns')?.split(',') || [];
  
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterRetailer, setFilterRetailer] = useState<string>(retailerFilter || 'all');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterSkinType, setFilterSkinType] = useState<string>(userSkinTypeParam || 'all');
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

  // Expanded reviews data with skin profile information
  const allReviews: Review[] = [
    {
      id: 1,
      userName: 'Sarah Mitchell',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20headshot%2C%20satisfied%20customer%2C%20friendly%20smile%2C%20natural%20lighting%2C%20e-commerce%20shopper%2C%20clean%20background&width=60&height=60&seq=service-reviewer-001&orientation=squarish',
      rating: 5,
      title: 'Outstanding customer service and fast delivery',
      content: 'Ordered from the Official Brand Store and was impressed by their responsiveness. Had a question about my order and received a helpful reply within 2 hours. Product arrived beautifully packaged in eco-friendly materials. The website checkout was smooth with multiple payment options. As someone with combination skin dealing with acne, I needed this product urgently and they delivered perfectly!',
      date: '2024-01-20',
      verified: true,
      helpful: 34,
      retailerName: 'Official Brand Store',
      aspectRatings: { customerService: 5, shipping: 5, website: 5, packaging: 5, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$48.94', shippingTime: '2 days', paymentMethod: 'Credit Card' },
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation'],
      age: 29,
      routineLength: '3-6 months'
    },
    {
      id: 2,
      userName: 'Michael Chen',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20satisfied%20customer%2C%20confident%20expression%2C%20online%20shopping%20experience%2C%20clean%20background&width=60&height=60&seq=service-reviewer-002&orientation=squarish',
      rating: 4,
      title: 'Great experience with Beauty Haven',
      content: 'First time ordering from Beauty Haven and the process was seamless. Their website is well-organized and easy to navigate. Shipping was as promised, though packaging could be more secure - item shifted during transit but arrived undamaged. Customer support was knowledgeable when I called about tracking. Perfect for my oily skin routine.',
      date: '2024-01-18',
      verified: true,
      helpful: 28,
      retailerName: 'Beauty Haven',
      aspectRatings: { customerService: 4, shipping: 4, website: 5, packaging: 3, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$55.45', shippingTime: '4 days', paymentMethod: 'PayPal' },
      skinType: 'oily',
      skinConcerns: ['Large Pores', 'Excess Oil'],
      age: 31,
      routineLength: '1-3 months'
    },
    {
      id: 3,
      userName: 'Jennifer Lopez',
      userAvatar: 'https://readdy.ai/api/search-image?query=Young%20woman%20portrait%2C%20happy%20customer%2C%20natural%20beauty%2C%20satisfied%20shopper%2C%20professional%20headshot%2C%20clean%20aesthetic&width=60&height=60&seq=service-reviewer-003&orientation=squarish',
      rating: 5,
      title: 'Exceptional service from Glow Market',
      content: "Glow Market exceeded my expectations! Their price match policy saved me $3, and they processed it quickly without hassle. The loyalty points program is generous, and I love their gift wrapping option - perfect for a friend's birthday. Delivery was faster than estimated. The unboxing experience felt premium despite the competitive pricing. Great for combination skin like mine!",
      date: '2024-01-15',
      verified: false,
      helpful: 42,
      retailerName: 'Glow Market',
      aspectRatings: { customerService: 5, shipping: 5, website: 4, packaging: 5, valueForMoney: 5 },
      purchaseDetails: { orderValue: '$52.73', shippingTime: '3 days', paymentMethod: 'Apple Pay' },
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Dryness & Dehydration'],
      age: 27,
      routineLength: '3-6 months'
    },
    {
      id: 4,
      userName: 'David Rodriguez',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20content%20customer%2C%20reliable%20expression%2C%20e-commerce%20experience%2C%20clean%20background%20portrait&width=60&height=60&seq=service-reviewer-004&orientation=squarish',
      rating: 4,
      title: 'Solid experience with Skin Essentials',
      content: 'Skin Essentials provided expert advice through their chat feature, which helped me choose the right variant for my combination skin with hyperpigmentation. Their secure checkout process was reassuring with multiple security badges. The free sample included was a nice touch. Shipping was reliable though not the fastest. Overall professional service that builds confidence in the brand.',
      date: '2024-01-12',
      verified: true,
      helpful: 25,
      retailerName: 'Skin Essentials',
      aspectRatings: { customerService: 5, shipping: 3, website: 4, packaging: 4, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$54.36', shippingTime: '4 days', paymentMethod: 'Credit Card' },
      skinType: 'combination',
      skinConcerns: ['Hyperpigmentation', 'Uneven Skin Tone'],
      age: 30,
      routineLength: '6+ months'
    },
    {
      id: 5,
      userName: 'Amanda Foster',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20portrait%2C%20eco-conscious%20customer%2C%20natural%20smile%2C%20sustainable%20shopping%2C%20clean%20background%20headshot&width=60&height=60&seq=service-reviewer-005&orientation=squarish',
      rating: 3,
      title: 'Mixed experience with Pure Beauty Co',
      content: "Pure Beauty Co's commitment to eco-friendly packaging is commendable, and their carbon-neutral shipping aligns with my values. However, the website was slow during checkout, and customer service took 3 days to respond to my inquiry about delivery delays. The product quality is good for sensitive skin, but the service needs improvement for the premium price point.",
      date: '2024-01-10',
      verified: true,
      helpful: 19,
      retailerName: 'Pure Beauty Co',
      aspectRatings: { customerService: 2, shipping: 2, website: 3, packaging: 5, valueForMoney: 3 },
      purchaseDetails: { orderValue: '$55.99', shippingTime: '7 days', paymentMethod: 'Credit Card' },
      skinType: 'sensitive',
      skinConcerns: ['Sensitivity', 'Redness'],
      age: 33,
      routineLength: '6+ months'
    },
    {
      id: 6,
      userName: 'Kevin Park',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20tech-savvy%20customer%2C%20modern%20portrait%2C%20online%20shopping%20enthusiast%2C%20clean%20background&width=60&height=60&seq=service-reviewer-006&orientation=squarish',
      rating: 5,
      title: 'Flawless online shopping experience',
      content: "Official Brand Store's website is the gold standard - fast loading, intuitive navigation, and excellent mobile optimization. Their rewards program integration made checkout even smoother. Email notifications kept me informed at every step. The authenticity guarantee gives peace of mind. This is how online beauty shopping should be done for acne-prone skin products.",
      date: '2024-01-08',
      verified: true,
      helpful: 38,
      retailerName: 'Official Brand Store',
      aspectRatings: { customerService: 5, shipping: 5, website: 5, packaging: 5, valueForMoney: 4 },
      purchaseDetails: { orderValue: '$48.94', shippingTime: '2 days', paymentMethod: 'Store Credit' },
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Large Pores'],
      age: 26,
      routineLength: '1-3 months'
    }
  ];

  const calculateSimilarityScore = (review: Review): number => {
    let score = 0;
    if (review.skinType === userSkinProfile.skinType) score += 50;
    const concernMatches = review.skinConcerns.filter(concern => 
      userSkinProfile.primaryConcerns.includes(concern)
    ).length;
    score += concernMatches * 20;
    const ageDiff = Math.abs(review.age - userSkinProfile.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    if (review.routineLength === userSkinProfile.routineLength) score += 10;
    return score;
  };

  let filteredReviews = allReviews.filter(review => {
    if (filterRating !== 'all' && review.rating !== parseInt(filterRating)) return false;
    if (filterRetailer !== 'all' && review.retailerName !== filterRetailer) return false;
    if (filterVerified && !review.verified) return false;
    if (filterSkinType !== 'all' && review.skinType !== filterSkinType) return false;
    if (showOnlySimilar) {
      const score = calculateSimilarityScore(review);
      return score > 20;
    }
    return true;
  });

  filteredReviews = filteredReviews.map(review => ({
    ...review,
    similarityScore: calculateSimilarityScore(review)
  }));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        if (userSkinTypeParam) return (b.similarityScore || 0) - (a.similarityScore || 0);
        return b.helpful - a.helpful;
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      case 'helpful': return b.helpful - a.helpful;
      default: return 0;
    }
  });

  const retailers = Array.from(new Set(allReviews.map(r => r.retailerName)));
  const skinTypes = Array.from(new Set(allReviews.map(r => r.skinType)));
  const averageRating = allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    }
    if (hasHalfStar) stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    }
    return stars;
  };

  const renderAspectRating = (label: string, rating: number) => (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <div className="flex items-center space-x-1">
        {renderStars(rating)}
        <span className="text-gray-700 font-medium ml-1">{rating}</span>
      </div>
    </div>
  );

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
              <span className="text-sage-600">Retailer Reviews</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-4">Retailer Reviews &amp; Service Ratings</h1>
            <p className="text-xl text-gray-600 max-w-3xl">Real customer experiences with online beauty retailers. Read about service quality, shipping reliability, website experience, and overall satisfaction.</p>
          </div>

          {userSkinTypeParam && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border-l-4 border-sage-600">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-heart-line text-sage-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-forest-900 mb-2">Personalized for Your Skin Profile</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Reviews prioritized for: <strong>{userSkinProfile.skinType} skin</strong> with concerns about{' '}
                      <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong>
                    </p>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={showOnlySimilar} onChange={(e) => setShowOnlySimilar(e.target.checked)} className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500" />
                        <span className="text-sm text-gray-700">Only show reviews from similar skin profiles</span>
                      </label>
                      <span className="text-xs text-sage-600 bg-sage-50 px-2 py-1 rounded-full">{sortedReviews.filter(r => (r.similarityScore || 0) > 20).length} matching reviews</span>
                    </div>
                  </div>
                </div>
                <Link to="/my-skin" className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer flex items-center space-x-1">
                  <i className="ri-settings-3-line"></i>
                  <span>Update Profile</span>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center space-x-1 mb-2">{renderStars(Math.round(averageRating))}</div>
                <p className="text-sm text-gray-600">Overall Rating</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{allReviews.length}</div>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-forest-900 mb-1">{retailers.length}</div>
                <p className="text-sm text-gray-600">Retailers Reviewed</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Retailer</label>
                <select value={filterRetailer} onChange={(e) => setFilterRetailer(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer">
                  <option value="all">All Retailers</option>
                  {retailers.map((retailer) => (<option key={retailer} value={retailer}>{retailer}</option>))}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Status</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={filterVerified} onChange={(e) => setFilterVerified(e.target.checked)} className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500" />
                  <span className="text-sm text-gray-700">Verified purchases only</span>
                </label>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">Showing {sortedReviews.length} of {allReviews.length} reviews</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {sortedReviews.map((review) => {
              const similarityBadge = getSimilarityBadge(review.similarityScore || 0);
              return (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{review.userName}</h3>
                            {review.verified && (<span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><i className="ri-shield-check-fill"></i><span>Verified Purchase</span></span>)}
                            {similarityBadge && (<span className={`flex items-center space-x-1 px-3 py-1 ${similarityBadge.color} text-xs font-semibold rounded-full`}><i className={similarityBadge.icon}></i><span>{similarityBadge.label}</span></span>)}
                          </div>
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-sage-600">{review.retailerName}</span>
                            <span className="text-sm text-gray-500">• Order: {review.purchaseDetails.orderValue}</span>
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
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{review.title}</h4>
                      <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center space-x-1"><i className="ri-time-line"></i><span>Delivered in {review.purchaseDetails.shippingTime}</span></span>
                        <span className="flex items-center space-x-1"><i className="ri-bank-card-line"></i><span>{review.purchaseDetails.paymentMethod}</span></span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-sage-600 cursor-pointer"><i className="ri-thumb-up-line"></i><span className="text-sm">Helpful ({review.helpful})</span></button>
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-sage-600 cursor-pointer"><i className="ri-flag-line"></i><span className="text-sm">Report</span></button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-cream-50 rounded-xl p-4">
                      <h5 className="text-lg font-semibold text-forest-900 mb-4">Service Breakdown</h5>
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
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <i className="ri-search-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
              <button onClick={() => { setSortBy('newest'); setFilterRating('all'); setFilterRetailer('all'); setFilterSkinType('all'); setFilterVerified(false); setShowOnlySimilar(false); }} className="px-6 py-3 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all cursor-pointer">Clear All Filters</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewsPage;
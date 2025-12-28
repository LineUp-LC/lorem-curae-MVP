import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';

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
  age: number;
  routineLength: string;
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
  const skinType = getEffectiveSkinType() || 'combination';
  const concerns = getEffectiveConcerns().length > 0 ? getEffectiveConcerns() : ['Acne & Breakouts', 'Hyperpigmentation'];
  
  const [userSkinProfile] = useState({
    skinType,
    primaryConcerns: concerns,
    age: 28,
    routineLength: '3-6 months'
  });

  const [showPersonalized, setShowPersonalized] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<Review | null>(null);

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
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20headshot%2C%20friendly%20smile%2C%20natural%20lighting%2C%20skincare%20enthusiast%2C%20clean%20background%2C%20modern%20portrait%20photography&width=60&height=60&seq=reviewer-001&orientation=squarish',
      rating: 5,
      title: 'Amazing results for combination skin!',
      content: 'I\'ve been using this serum for 3 months now and the difference is incredible. My T-zone is no longer oily by midday, and my cheeks feel hydrated. The texture is lightweight and absorbs quickly without any sticky residue. Perfect for my combination skin type!',
      date: '2024-01-15',
      verified: true,
      helpful: 24,
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Dryness & Dehydration'],
      age: 29,
      routineLength: '3-6 months'
    },
    {
      id: 2,
      userName: 'Jessica R.',
      userAvatar: 'https://readdy.ai/api/search-image?query=Young%20woman%20portrait%2C%20natural%20beauty%2C%20confident%20smile%2C%20skincare%20routine%2C%20professional%20headshot%2C%20clean%20aesthetic&width=60&height=60&seq=reviewer-002&orientation=squarish',
      rating: 4,
      title: 'Great for sensitive skin',
      content: 'As someone with very sensitive skin, I was hesitant to try this. But it\'s been gentle and effective. No irritation at all, and I\'ve noticed my redness has decreased significantly. Takes time to see results but worth the patience.',
      date: '2024-01-10',
      verified: true,
      helpful: 18,
      skinType: 'sensitive',
      skinConcerns: ['Sensitivity', 'Redness'],
      age: 25,
      routineLength: '6+ months'
    },
    {
      id: 3,
      userName: 'Michael K.',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20headshot%2C%20friendly%20expression%2C%20natural%20lighting%2C%20skincare%20enthusiast%2C%20clean%20background%2C%20modern%20portrait&width=60&height=60&seq=reviewer-003&orientation=squarish',
      rating: 5,
      title: 'Finally found my holy grail serum',
      content: 'After trying countless serums, this one actually delivers. The niacinamide really helps with my enlarged pores, and the hyaluronic acid keeps my skin plump all day. Great for oily skin that needs hydration without heaviness.',
      date: '2024-01-08',
      verified: false,
      helpful: 31,
      skinType: 'oily',
      skinConcerns: ['Large Pores', 'Excess Oil'],
      age: 32,
      routineLength: '1-3 months'
    },
    {
      id: 4,
      userName: 'Emma L.',
      userAvatar: 'https://readdy.ai/api/search-image?query=Young%20professional%20woman%2C%20natural%20skincare%20enthusiast%2C%20gentle%20smile%2C%20clean%20portrait%20photography%2C%20modern%20headshot&width=60&height=60&seq=reviewer-004&orientation=squarish',
      rating: 5,
      title: 'Perfect match for combination acne-prone skin',
      content: 'This serum has been a game-changer for my combination skin with persistent breakouts. It controls oil in my T-zone while keeping my cheeks moisturized. The acne-fighting ingredients work without over-drying. Highly recommend for similar skin types!',
      date: '2024-01-20',
      verified: true,
      helpful: 35,
      skinType: 'combination',
      skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation', 'Large Pores'],
      age: 26,
      routineLength: '3-6 months'
    },
    {
      id: 5,
      userName: 'David C.',
      userAvatar: 'https://readdy.ai/api/search-image?query=Professional%20man%20portrait%2C%20confident%20expression%2C%20skincare%20routine%20advocate%2C%20clean%20background%2C%20modern%20headshot&width=60&height=60&seq=reviewer-005&orientation=squarish',
      rating: 4,
      title: 'Effective for dark spots and uneven tone',
      content: 'Been dealing with hyperpigmentation from old acne scars. This serum has noticeably faded the dark spots over 4 months of consistent use. The vitamin C and niacinamide combo works well. Patience is key with pigmentation issues.',
      date: '2024-01-12',
      verified: true,
      helpful: 22,
      skinType: 'combination',
      skinConcerns: ['Hyperpigmentation', 'Acne Scars'],
      age: 30,
      routineLength: '3-6 months'
    },
    {
      id: 6,
      userName: 'Lisa K.',
      userAvatar: 'https://readdy.ai/api/search-image?query=Mature%20woman%20portrait%2C%20elegant%20appearance%2C%20skincare%20expert%2C%20professional%20headshot%2C%20natural%20lighting&width=60&height=60&seq=reviewer-006&orientation=squarish',
      rating: 4,
      title: 'Good anti-aging benefits',
      content: 'At 45, I\'m always looking for products that help with fine lines and firmness. This serum has improved my skin texture and reduced some fine lines around my eyes. Takes consistent use to see results.',
      date: '2024-01-05',
      verified: true,
      helpful: 19,
      skinType: 'dry',
      skinConcerns: ['Fine Lines & Wrinkles', 'Loss of Firmness'],
      age: 45,
      routineLength: '6+ months'
    }
  ];

  // Function to calculate similarity score based on user profile
  const calculateSimilarityScore = (review: Review): number => {
    let score = 0;
    
    // Skin type match (highest priority)
    if (review.skinType === userSkinProfile.skinType) {
      score += 50;
    }
    
    // Concern overlap
    const concernMatches = review.skinConcerns.filter(concern => 
      userSkinProfile.primaryConcerns.includes(concern)
    ).length;
    score += concernMatches * 20;
    
    // Age similarity (within 10 years)
    const ageDiff = Math.abs(review.age - userSkinProfile.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    
    // Routine length similarity
    if (review.routineLength === userSkinProfile.routineLength) {
      score += 10;
    }
    
    return score;
  };

  // Get personalized and general reviews
  const personalizedReviews = allReviews
    .map(review => ({
      ...review,
      similarityScore: calculateSimilarityScore(review)
    }))
    .filter(review => review.similarityScore > 20) // Only show relevant reviews
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  const featuredReviews = showPersonalized && personalizedReviews.length > 0 
    ? personalizedReviews 
    : allReviews.slice(0, 3);

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

  const getSimilarityBadge = (score: number) => {
    if (score >= 70) return { label: 'Very Similar Profile', color: 'bg-green-100 text-green-800', icon: 'ri-user-heart-line' };
    if (score >= 50) return { label: 'Similar Profile', color: 'bg-sage-100 text-sage-800', icon: 'ri-user-line' };
    return { label: 'Related', color: 'bg-gray-100 text-gray-700', icon: 'ri-user-shared-line' };
  };

  return (
    <div id="reviews" className="py-16 bg-gradient-to-b from-[#F8F6F3] to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center">
              <i className="ri-chat-3-line text-2xl text-sage-600"></i>
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-forest-900">
                Community Reviews
              </h2>
              <p className="text-gray-600 mt-1">Real experiences from verified buyers</p>
            </div>
          </div>
        </div>

        {/* Personalization Banner */}
        {personalizedReviews.length > 0 && (
          <div className="bg-sage-50 rounded-2xl p-6 mb-8 border border-sage-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-heart-line text-xl text-sage-600"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-forest-900 mb-1">
                    Personalized for Your Skin
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Based on your skin profile: <strong>{userSkinProfile.skinType} skin</strong> with concerns about{' '}
                    <strong>{userSkinProfile.primaryConcerns.join(' & ')}</strong>
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPersonalized}
                        onChange={(e) => setShowPersonalized(e.target.checked)}
                        className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                      />
                      <span className="text-sm text-gray-700">Show reviews from similar skin profiles</span>
                    </label>
                    <span className="text-xs text-sage-600 bg-sage-50 px-2 py-1 rounded-full">
                      {personalizedReviews.length} matching reviews found
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/my-skin"
                className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer flex items-center space-x-1"
              >
                <i className="ri-settings-3-line"></i>
                <span>Update Profile</span>
              </Link>
            </div>
          </div>
        )}

        {/* Rating Overview */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Overall Rating */}
            <div className="text-center lg:col-span-2">
              <div className="text-6xl font-bold text-forest-900 mb-2">
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
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = Math.floor(Math.random() * 100) + 20;
                  const percentage = (count / totalReviews) * 100;
                  return (
                    <div key={rating} className="flex items-center space-x-3">
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredReviews.map((review) => {
            const similarityBadge = showPersonalized && 'similarityScore' in review 
              ? getSimilarityBadge(review.similarityScore) 
              : null;
            
            return (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg">
                {/* Review Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <button
                    onClick={() => handleReviewerClick(review)}
                    className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-sage-500 transition-all"
                  >
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <button
                        onClick={() => handleReviewerClick(review)}
                        className="font-semibold text-gray-900 truncate hover:text-sage-600 cursor-pointer transition-colors"
                      >
                        {review.userName}
                      </button>
                      {review.verified && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex-shrink-0">
                          <i className="ri-shield-check-fill"></i>
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {review.skinType} skin • Age {review.age} • {new Date(review.date).toLocaleDateString()}
                    </p>
                    
                    {/* Similarity Badge */}
                    {similarityBadge && (
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 ${similarityBadge.color} text-xs font-medium rounded-full`}>
                        <i className={similarityBadge.icon}></i>
                        <span>{similarityBadge.label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skin Concerns */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {review.skinConcerns.map((concern, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 text-xs rounded-full ${
                          userSkinProfile.primaryConcerns.includes(concern)
                            ? 'bg-sage-100 text-sage-800 font-medium'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {concern}
                      </span>
                    ))}
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <i className="ri-thumb-up-line"></i>
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </div>
                  <Link
                    to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
                    className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer"
                  >
                    Read full review
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            to={`/reviews-products?id=${productId}&skinType=${userSkinProfile.skinType}&concerns=${userSkinProfile.primaryConcerns.join(',')}`}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-forest-900 text-white rounded-full font-semibold text-lg hover:bg-forest-800 transition-all shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
          >
            <i className="ri-chat-3-line text-xl"></i>
            <span>Read All {totalReviews} Reviews</span>
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
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* My-Skin Profile */}
              <div>
                <h4 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <i className="ri-user-heart-line text-sage-600"></i>
                  My-Skin Profile
                </h4>
                <div className="bg-sage-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Skin Type:</span> {getReviewerProfile(selectedReviewer).skinType}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getReviewerProfile(selectedReviewer).concerns.map((concern, idx) => (
                      <span key={idx} className="px-3 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Routine */}
              <div>
                <h4 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <i className="ri-calendar-check-line text-sage-600"></i>
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
                <h4 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <i className="ri-sticky-note-line text-sage-600"></i>
                  Routine Notes
                </h4>
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-sm text-gray-700 italic">"{getReviewerProfile(selectedReviewer).routineNotes}"</p>
                </div>
              </div>

              {/* Nutrition Meal Planner */}
              <div>
                <h4 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <i className="ri-restaurant-line text-sage-600"></i>
                  Nutrition Meal Plan
                </h4>
                <div className="bg-green-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {getReviewerProfile(selectedReviewer).nutritionMealPlan.map((meal, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <i className="ri-checkbox-circle-fill text-green-500"></i>
                        {meal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nutrition Tracker */}
              <div>
                <h4 className="font-semibold text-forest-800 mb-3 flex items-center gap-2">
                  <i className="ri-bar-chart-box-line text-sage-600"></i>
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
    </div>
  );
};

export default ProductReviews;
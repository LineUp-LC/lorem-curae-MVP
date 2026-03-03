import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';
import { getReviewsForProduct, type MockReview } from '../../../mocks/reviews';
import { matchesConcern } from '../../../lib/utils/matching';

type Review = MockReview;

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  // Get user skin profile from sessionState (unified source of truth)
  const skinType = getEffectiveSkinType() || 'combination';
  const concerns = getEffectiveConcerns().length > 0 ? getEffectiveConcerns() : ['Acne Prone', 'Uneven Skin Tone'];
  
  const [userSkinProfile] = useState({
    skinType,
    primaryConcerns: concerns,
    age: 28,
    routineLength: '3-6 months'
  });

  const [showPersonalized, setShowPersonalized] = useState(true);

  // Canonical review data from shared source
  const allReviews: Review[] = getReviewsForProduct(productId);

  // Function to calculate similarity score based on user profile
  const calculateSimilarityScore = (review: Review): number => {
    let score = 0;
    
    // Skin type match (highest priority)
    if (review.skinType === userSkinProfile.skinType) {
      score += 50;
    }
    
    // Concern overlap (fuzzy matching via shared utility)
    const concernMatches = review.skinConcerns.filter(concern =>
      matchesConcern(concern, userSkinProfile.primaryConcerns)
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
    if (score >= 70) return { label: 'Very Similar Profile', color: 'bg-taupe-100 text-taupe-800', icon: 'ri-user-heart-line' };
    if (score >= 50) return { label: 'Similar Profile', color: 'bg-taupe-100 text-taupe-800', icon: 'ri-user-line' };
    return { label: 'Related', color: 'bg-gray-100 text-gray-700', icon: 'ri-user-shared-line' };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/60?text=User';
  };

  return (
    <div id="reviews" className="py-16 bg-gradient-to-b from-[#F8F6F3] to-white">
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
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-taupe-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-heart-line text-xl text-taupe"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-deep-900 mb-1">
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
                        className="w-4 h-4 text-taupe border-gray-300 rounded focus:ring-taupe-500"
                      />
                      <span className="text-sm text-gray-700">Show reviews from similar skin profiles</span>
                    </label>
                    <span className="text-xs text-taupe bg-taupe-50 px-2 py-1 rounded-full">
                      {personalizedReviews.length} matching reviews found
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/my-skin"
                className="text-taupe hover:text-taupe-700 text-sm font-medium cursor-pointer flex items-center space-x-1"
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
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {review.userName}
                      </h3>
                      {review.verified && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-taupe-100 text-taupe-800 text-xs font-medium rounded-full flex-shrink-0">
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
                          matchesConcern(concern, userSkinProfile.primaryConcerns)
                            ? 'bg-taupe-100 text-taupe-800 font-medium'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <h4 className="font-semibold text-gray-900 mb-2" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {review.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4" style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
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
                    className="text-taupe hover:text-taupe-700 text-sm font-medium cursor-pointer"
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
            className="inline-flex items-center space-x-2 px-8 py-4 bg-deep-900 text-white rounded-full font-semibold text-lg hover:bg-deep transition-all shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
          >
            <i className="ri-chat-3-line text-xl"></i>
            <span>Read All {totalReviews} Reviews</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
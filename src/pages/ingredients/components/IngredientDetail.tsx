import { useState, useEffect } from 'react';
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

const IngredientDetail = ({ ingredientId, onBack }: IngredientDetailProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSimilarProfileReviews, setShowSimilarProfileReviews] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem('user_skin_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      const quizResults = localStorage.getItem('skin_quiz_results');
      if (quizResults) {
        setUserProfile(JSON.parse(quizResults));
      }
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
    <div className="min-h-screen py-12 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-warm-gray hover:text-primary mb-8 transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl"></i>
          <span className="font-medium">Back to Library</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className={`w-24 h-24 flex items-center justify-center ${ingredient.bgColor} rounded-2xl flex-shrink-0`}>
              <i className={`${ingredient.icon} text-5xl ${ingredient.color}`}></i>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-serif text-deep mb-2">
                    {ingredient.name}
                  </h1>
                  <p className="text-xl text-warm-gray">{ingredient.scientificName}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  ingredient.safetyRating === 'Excellent' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  Safety: {ingredient.safetyRating}
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`ri-star-fill text-lg ${
                          star <= Math.round(ingredient.rating) ? 'text-amber-400' : 'text-blush'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-deep">{ingredient.rating}</span>
                  <span className="text-warm-gray">({ingredient.reviews} reviews)</span>
                </div>
              </div>
              <p className="text-lg text-warm-gray leading-relaxed">
                {ingredient.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Benefits */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-serif text-deep mb-6">Key Benefits</h2>
              <ul className="space-y-3">
                {ingredient.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <i className="ri-checkbox-circle-fill text-xl text-primary flex-shrink-0 mt-0.5"></i>
                    <span className="text-warm-gray">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Use */}
            <div className="bg-gradient-to-br from-light/20 to-cream rounded-2xl p-8">
              <h2 className="text-2xl font-serif text-deep mb-4">How to Use</h2>
              <p className="text-warm-gray leading-relaxed mb-4">{ingredient.howToUse}</p>
              <div className="bg-white rounded-xl p-4 border-l-4 border-primary">
                <p className="text-sm font-semibold text-deep mb-1">Optimal Concentration</p>
                <p className="text-sm text-warm-gray">{ingredient.concentration}</p>
              </div>
            </div>

            {/* Myth Busting */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-serif text-deep mb-6">Myth Busting</h2>
              <div className="space-y-6">
                {ingredient.myths.map((item, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6">
                    <div className="flex items-start space-x-2 mb-2">
                      <i className="ri-close-circle-line text-xl text-primary flex-shrink-0 mt-0.5"></i>
                      <p className="font-semibold text-deep">{item.myth}</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-checkbox-circle-line text-xl text-primary flex-shrink-0 mt-0.5"></i>
                      <p className="text-warm-gray">{item.truth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Reviews */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-serif text-deep mb-6">Community Reviews</h2>
              
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
                          <div className="flex items-center flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill text-sm ${
                                  star <= review.rating ? 'text-amber-400' : 'text-blush'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush">
                          <button className="flex items-center space-x-2 text-sm text-warm-gray hover:text-primary transition-colors cursor-pointer">
                            <i className="ri-thumb-up-line"></i>
                            <span>Helpful ({review.helpful})</span>
                          </button>
                          <span className="text-xs text-warm-gray/80">{review.date}</span>
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
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill text-sm ${
                                  star <= review.rating ? 'text-amber-400' : 'text-blush'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                        <button className="flex items-center space-x-2 text-sm text-warm-gray hover:text-primary transition-colors cursor-pointer">
                          <i className="ri-thumb-up-line"></i>
                          <span>Helpful ({review.helpful})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowAllReviewsModal(true)}
                className="w-full mt-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Read All Reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Best For */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-deep mb-4">Best For</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-warm-gray mb-2">Skin Types</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredient.skinTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-light/30 text-primary-700 text-xs font-medium rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-warm-gray mb-2">Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredient.concerns.map((concern, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-light/30 text-primary-700 text-xs font-medium rounded-full"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-primary to-dark rounded-2xl p-6 text-white">
              <h3 className="text-xl font-serif mb-3">Find Products</h3>
              <p className="text-light text-sm mb-6">
                Discover products featuring this ingredient in our curated marketplace.
              </p>
              <a 
                href="/marketplace"
                className="block w-full py-3 bg-white text-deep rounded-full font-semibold hover:bg-cream transition-colors whitespace-nowrap cursor-pointer text-center"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* All Reviews Modal */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-blush">
              <div>
                <h2 className="text-2xl font-serif text-deep">All Reviews</h2>
                <p className="text-sm text-warm-gray mt-1">{allReviewsCombined.length} total reviews</p>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-warm-gray"></i>
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
                          <div className="flex items-center ml-4 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill text-sm ${
                                  star <= review.rating ? 'text-amber-400' : 'text-blush'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush">
                          <button className="flex items-center space-x-2 text-sm text-warm-gray hover:text-primary transition-colors cursor-pointer">
                            <i className="ri-thumb-up-line"></i>
                            <span>Helpful ({review.helpful})</span>
                          </button>
                          <span className="text-xs text-warm-gray/80">{review.date}</span>
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
                        <div className="flex items-center ml-4 flex-shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`ri-star-fill text-sm ${
                                star <= review.rating ? 'text-amber-400' : 'text-blush'
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-blush">
                        <button className="flex items-center space-x-2 text-sm text-warm-gray hover:text-primary transition-colors cursor-pointer">
                          <i className="ri-thumb-up-line"></i>
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        <span className="text-xs text-warm-gray/80">{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-blush bg-cream">
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientDetail;
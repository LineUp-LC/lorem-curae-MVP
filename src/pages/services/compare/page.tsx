import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';

interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string;
  specialties: string[];
  image: string;
  benefits: string[];
  bestFor: string[];
  similarProfileReviews: number;
}

interface Review {
  id: string;
  author: string;
  skinType: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export default function ServicesComparePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const businessIds = location.state?.businessIds || [];
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedBusinessReviews, setSelectedBusinessReviews] = useState<Review[]>([]);
  const [selectedBusinessName, setSelectedBusinessName] = useState('');
  
  // Get user profile from sessionState (unified source of truth)
  const skinType = getEffectiveSkinType() || 'combination';
  const concerns = getEffectiveConcerns().length > 0 ? getEffectiveConcerns() : ['acne', 'hyperpigmentation'];
  const [userProfile] = useState({
    skinType,
    concerns,
  });

  useEffect(() => {
    // Mock data - in real app, fetch based on businessIds
    const mockBusinesses: Business[] = [
      {
        id: '1',
        name: 'Radiance Skin Studio',
        rating: 4.9,
        reviewCount: 342,
        location: 'Downtown, Los Angeles',
        priceRange: '$$$',
        specialties: ['Acne Treatment', 'Chemical Peels', 'Microneedling'],
        image: 'https://readdy.ai/api/search-image?query=modern%20luxury%20skincare%20spa%20interior%20with%20treatment%20beds%20soft%20lighting%20elegant%20minimalist%20design%20professional%20aesthetic%20clean%20white%20surfaces&width=400&height=300&seq=compare-1&orientation=landscape',
        benefits: [
          'Advanced acne treatment protocols',
          'Medical-grade chemical peels',
          'Collagen induction therapy',
          'Personalized treatment plans',
        ],
        bestFor: ['Acne-prone skin', 'Hyperpigmentation', 'Texture improvement'],
        similarProfileReviews: 87,
      },
      {
        id: '2',
        name: 'Glow Aesthetics Clinic',
        rating: 4.8,
        reviewCount: 289,
        location: 'Beverly Hills, CA',
        priceRange: '$$$$',
        specialties: ['Laser Therapy', 'Anti-Aging', 'Hydrafacial'],
        image: 'https://readdy.ai/api/search-image?query=upscale%20medical%20spa%20treatment%20room%20with%20advanced%20skincare%20equipment%20modern%20professional%20interior%20soft%20ambient%20lighting%20luxury%20aesthetic&width=400&height=300&seq=compare-2&orientation=landscape',
        benefits: [
          'State-of-the-art laser technology',
          'Anti-aging specialists',
          'Luxury spa experience',
          'Comprehensive skin analysis',
        ],
        bestFor: ['Mature skin', 'Sun damage', 'Fine lines & wrinkles'],
        similarProfileReviews: 52,
      },
      {
        id: '3',
        name: 'Pure Essence Spa',
        rating: 4.7,
        reviewCount: 456,
        location: 'Santa Monica, CA',
        priceRange: '$$',
        specialties: ['Organic Facials', 'LED Therapy', 'Dermaplaning'],
        image: 'https://readdy.ai/api/search-image?query=serene%20natural%20spa%20room%20with%20plants%20organic%20skincare%20products%20calming%20atmosphere%20zen%20aesthetic%20soft%20natural%20lighting%20wellness%20center&width=400&height=300&seq=compare-3&orientation=squarish',
        benefits: [
          'Organic & natural products',
          'Gentle LED light therapy',
          'Relaxing spa atmosphere',
          'Affordable pricing',
        ],
        bestFor: ['Sensitive skin', 'Natural treatments', 'Relaxation'],
        similarProfileReviews: 124,
      },
    ];

    const filtered = mockBusinesses.filter(b => businessIds.includes(b.id));
    setBusinesses(filtered);
  }, [businessIds]);

  const getBestMatch = (business: Business) => {
    const concernMatch = business.specialties.some(s =>
      userProfile.concerns.some(c => s.toLowerCase().includes(c))
    );
    const reviewCount = business.similarProfileReviews;

    if (concernMatch && reviewCount > 80) return 'Excellent Match';
    if (concernMatch && reviewCount > 50) return 'Good Match';
    if (reviewCount > 80) return 'Popular Choice';
    return 'Consider';
  };

  const getMatchColor = (match: string) => {
    if (match === 'Excellent Match') return 'bg-green-100 text-green-700 border-green-300';
    if (match === 'Good Match') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (match === 'Popular Choice') return 'bg-purple-100 text-purple-700 border-purple-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const handleViewReviews = (businessId: string, businessName: string) => {
    // Mock reviews data - in real app, fetch from database
    const mockReviews: Review[] = [
      {
        id: '1',
        author: 'Jessica M.',
        skinType: 'Combination',
        rating: 5,
        comment: 'Amazing results! My acne has improved significantly after just 3 sessions. The staff really understands combination skin and tailored the treatment perfectly.',
        date: '2 weeks ago',
        verified: true,
        helpful: 24,
      },
      {
        id: '2',
        author: 'David K.',
        skinType: 'Combination',
        rating: 5,
        comment: 'Best facial I\'ve ever had. They addressed my hyperpigmentation concerns and my skin looks so much brighter now.',
        date: '1 month ago',
        verified: true,
        helpful: 18,
      },
      {
        id: '3',
        author: 'Maria L.',
        skinType: 'Combination',
        rating: 4,
        comment: 'Great experience overall. The treatment was effective for my acne-prone areas. Would definitely recommend!',
        date: '3 weeks ago',
        verified: true,
        helpful: 15,
      },
      {
        id: '4',
        author: 'Alex R.',
        skinType: 'Combination',
        rating: 5,
        comment: 'Professional service and excellent results. My skin texture has improved dramatically.',
        date: '1 week ago',
        verified: true,
        helpful: 12,
      },
    ];

    setSelectedBusinessReviews(mockReviews);
    setSelectedBusinessName(businessName);
    setShowReviewsModal(true);
  };

  if (businesses.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <i className="ri-scales-line text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Services to Compare</h2>
            <p className="text-gray-600 mb-8">Please select at least 2 services to compare</p>
            <button
              onClick={() => navigate('/services/search')}
              className="px-6 py-3 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors cursor-pointer"
            >
              Back to Search
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/services/search')}
              className="flex items-center gap-2 text-forest-800 hover:text-forest-900 mb-4 cursor-pointer"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Search</span>
            </button>
            <h1 className="font-serif text-5xl font-bold text-forest-800 mb-3">
              Compare Services
            </h1>
            <p className="text-gray-600">
              Side-by-side comparison to help you choose the best service for your needs
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Business Headers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-6">
                  <div className="h-48 rounded-xl overflow-hidden mb-4">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest-800 mb-2">
                    {business.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-star-fill text-coral-400"></i>
                    <span className="font-bold text-forest-800">{business.rating}</span>
                    <span className="text-sm text-gray-600">({business.reviewCount})</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{business.location}</p>
                  <button
                    onClick={() => navigate(`/services/${business.id}`)}
                    className="w-full px-4 py-2 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors text-sm font-medium cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Best Match for You */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Best Match for You
              </div>
              {businesses.map((business) => {
                const match = getBestMatch(business);
                return (
                  <div key={business.id} className="bg-white p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getMatchColor(match)}`}>
                      {match}
                    </span>
                    <p className="text-xs text-gray-600 mt-2">
                      Based on your skin profile
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Price Range
              </div>
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-4">
                  <span className="text-2xl font-bold text-forest-800">
                    {business.priceRange}
                  </span>
                </div>
              ))}
            </div>

            {/* Specialties */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Specialties
              </div>
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-4">
                  <div className="flex flex-wrap gap-2">
                    {business.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-cream-100 text-forest-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Key Benefits
              </div>
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-4">
                  <ul className="space-y-2">
                    {business.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <i className="ri-check-line text-green-600 mt-0.5"></i>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Best For */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Best For
              </div>
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-4">
                  <div className="space-y-2">
                    {business.bestFor.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <i className="ri-user-heart-line text-forest-800"></i>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews from Similar Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
              <div className="bg-gray-50 p-4 font-semibold text-forest-800">
                Reviews from Similar Skin Profiles
              </div>
              {businesses.map((business) => (
                <div key={business.id} className="bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-group-line text-2xl text-forest-800"></i>
                    <div>
                      <p className="text-2xl font-bold text-forest-800">
                        {business.similarProfileReviews}
                      </p>
                      <p className="text-xs text-gray-600">
                        reviews from users with {userProfile.skinType} skin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewReviews(business.id, business.name)}
                    className="w-full px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors text-sm font-medium cursor-pointer"
                  >
                    <i className="ri-eye-line mr-2"></i>
                    View Reviews
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <i className="ri-information-line text-blue-600 text-2xl"></i>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How We Calculate Best Match</h3>
                <p className="text-sm text-blue-800">
                  We analyze your skin profile ({userProfile.skinType} skin with concerns: {userProfile.concerns.join(', ')}) 
                  and compare it with reviews from users who have similar skin types and concerns. Services with more positive 
                  reviews from similar profiles rank higher as your best match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedBusinessName}</h3>
                  <p className="text-sm text-gray-600">
                    Reviews from users with {userProfile.skinType} skin
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {selectedBusinessReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                            <i className="ri-user-line text-sage-600"></i>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{review.author}</h4>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{review.skinType} Skin • {review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 ml-13">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`ri-star-fill text-sm ${
                                  star <= review.rating ? 'text-amber-400' : 'text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{review.rating}.0</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 ml-13">{review.comment}</p>
                    <div className="flex items-center gap-4 ml-13">
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-sage-600 cursor-pointer">
                        <i className="ri-thumb-up-line"></i>
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <i className="ri-information-line text-sage-600 text-xl"></i>
                <p className="text-sm text-gray-600">
                  These reviews are from verified users with similar skin profiles to yours ({userProfile.skinType} skin with {userProfile.concerns.join(', ')} concerns).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const ProductSearchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Mock user skin profile
  const userSkinProfile = {
    skinType: 'Combination',
    concerns: ['Acne', 'Dark Spots'],
    fitzpatrickType: 'IV'
  };

  // Mock product data
  const product = {
    id: id || '1',
    name: 'Hydrating Hyaluronic Acid Serum',
    brand: 'GlowLab Skincare',
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.8,
    reviewCount: 1243,
    description: 'A lightweight, fast-absorbing serum that delivers intense hydration with multiple molecular weights of hyaluronic acid. Plumps skin, reduces fine lines, and creates a dewy, healthy glow. Formulated with clean, science-backed ingredients for visible results.',
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20skincare%20serum%20bottle%20clear%20glass%20dropper%20hyaluronic%20acid%20product%20photography%20white%20background%20minimalist%20elegant%20design%20professional%20lighting%20high%20end%20beauty%20product&width=600&height=600&seq=product-main-detail-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=skincare%20serum%20texture%20water%20droplets%20hyaluronic%20acid%20gel%20close%20up%20macro%20photography%20clear%20transparent%20liquid%20beauty%20product%20smooth%20surface&width=600&height=600&seq=product-texture-detail-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=skincare%20product%20application%20on%20skin%20serum%20droplets%20hand%20applying%20beauty%20routine%20natural%20lighting%20lifestyle%20photography%20glowing%20skin&width=600&height=600&seq=product-use-detail-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=skincare%20serum%20ingredients%20botanical%20extracts%20natural%20components%20beauty%20product%20flat%20lay%20minimalist%20composition%20professional%20photography&width=600&height=600&seq=product-ingredients-1&orientation=squarish',
    ],
    size: '30ml / 1 fl oz',
    keyIngredients: [
      { name: 'Hyaluronic Acid (Multi-Weight)', benefit: 'Deep hydration & plumping', percentage: '2%' },
      { name: 'Vitamin B5 (Panthenol)', benefit: 'Skin barrier support & healing', percentage: '5%' },
      { name: 'Glycerin', benefit: 'Moisture retention & softening', percentage: '3%' },
      { name: 'Niacinamide', benefit: 'Brightening & pore refinement', percentage: '2%' },
    ],
    benefits: [
      'Provides up to 72 hours of continuous hydration',
      'Reduces appearance of fine lines and wrinkles',
      'Improves skin texture and elasticity',
      'Suitable for all skin types including sensitive',
      'Non-comedogenic and fragrance-free formula',
      'Dermatologist tested and clinically proven',
    ],
    howToUse: [
      'Cleanse your face thoroughly and pat dry',
      'Apply 3-4 drops to clean, damp skin',
      'Gently pat into face and neck using upward motions',
      'Use morning and evening before moisturizer',
      'Follow with SPF during daytime use',
    ],
    skinTypes: ['All Skin Types', 'Dry', 'Dehydrated', 'Combination', 'Sensitive'],
    concerns: ['Dehydration', 'Fine Lines', 'Dullness', 'Texture'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
  };

  const reviews = [
    {
      id: 1,
      author: 'Emma L.',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      skinType: 'Combination',
      concerns: ['Dehydration', 'Fine Lines'],
      fitzpatrickType: 'III',
      comment: 'This serum is amazing! My skin feels so plump and hydrated. I\'ve noticed a significant reduction in fine lines around my eyes. The texture is lightweight and absorbs quickly without any sticky residue.',
      helpful: 45,
      images: [],
    },
    {
      id: 2,
      author: 'Jasmine W.',
      rating: 5,
      date: '3 weeks ago',
      verified: true,
      skinType: 'Combination',
      concerns: ['Acne', 'Dark Spots'],
      fitzpatrickType: 'IV',
      comment: 'Perfect for my combination skin with acne concerns! This serum hydrates without making my T-zone oily. I\'ve seen improvement in my post-inflammatory hyperpigmentation too. Highly recommend for similar skin types!',
      helpful: 67,
      images: [],
    },
    {
      id: 3,
      author: 'Michael R.',
      rating: 4,
      date: '1 month ago',
      verified: true,
      skinType: 'Dry',
      concerns: ['Dryness', 'Sensitivity'],
      fitzpatrickType: 'II',
      comment: 'Great product for dry skin. Absorbs quickly and doesn\'t leave any sticky residue. My skin feels softer and more supple. Would definitely recommend!',
      helpful: 32,
      images: [],
    },
    {
      id: 4,
      author: 'Aaliyah M.',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      skinType: 'Combination',
      concerns: ['Acne', 'Large Pores'],
      fitzpatrickType: 'V',
      comment: 'Love how this serum balances my skin! My breakouts have reduced by 70% and my pores look smaller. The lightweight formula is perfect for combination skin prone to acne.',
      helpful: 54,
      images: [],
    },
    {
      id: 5,
      author: 'Sarah K.',
      rating: 5,
      date: '3 weeks ago',
      verified: true,
      skinType: 'Normal',
      concerns: ['Dullness', 'Texture'],
      fitzpatrickType: 'III',
      comment: 'Love the lightweight texture. My skin looks so much healthier and more radiant since I started using this. The glow is real!',
      helpful: 28,
      images: [],
    },
    {
      id: 6,
      author: 'David C.',
      rating: 4,
      date: '1 month ago',
      verified: true,
      skinType: 'Oily',
      concerns: ['Excess Oil', 'Large Pores'],
      fitzpatrickType: 'IV',
      comment: 'Surprisingly good for oily skin! Doesn\'t make me greasy at all. Helps control oil production throughout the day.',
      helpful: 19,
      images: [],
    },
  ];

  // Function to check if review is from similar skin profile
  const isSimilarSkin = (review: typeof reviews[0]) => {
    let matches = 0;
    
    if (review.skinType.toLowerCase() === userSkinProfile.skinType.toLowerCase()) {
      matches++;
    }
    
    const concernsMatch = review.concerns.some(concern => 
      userSkinProfile.concerns.some(userConcern => 
        concern.toLowerCase().includes(userConcern.toLowerCase())
      )
    );
    if (concernsMatch) matches++;
    
    if (review.fitzpatrickType === userSkinProfile.fitzpatrickType) {
      matches++;
    }
    
    return matches >= 2;
  };

  const similarProducts = [
    {
      id: '2',
      name: 'Niacinamide Brightening Serum',
      brand: 'GlowLab Skincare',
      price: 32.99,
      rating: 4.7,
      reviewCount: 892,
      image: 'https://readdy.ai/api/search-image?query=niacinamide%20serum%20bottle%20skincare%20product%20white%20background%20professional%20photography%20minimalist%20design%20beauty%20product%20elegant%20glass%20dropper&width=300&height=300&seq=similar-product-1&orientation=squarish',
    },
    {
      id: '3',
      name: 'Vitamin C Radiance Serum',
      brand: 'GlowLab Skincare',
      price: 38.99,
      rating: 4.9,
      reviewCount: 1456,
      image: 'https://readdy.ai/api/search-image?query=vitamin%20c%20serum%20amber%20bottle%20skincare%20product%20white%20background%20professional%20photography%20elegant%20design%20beauty%20product%20luxury%20packaging&width=300&height=300&seq=similar-product-2&orientation=squarish',
    },
    {
      id: '4',
      name: 'Retinol Night Treatment',
      brand: 'GlowLab Skincare',
      price: 42.99,
      rating: 4.6,
      reviewCount: 743,
      image: 'https://readdy.ai/api/search-image?query=retinol%20serum%20dark%20bottle%20skincare%20product%20white%20background%20professional%20photography%20luxury%20design%20beauty%20product%20premium%20packaging&width=300&height=300&seq=similar-product-3&orientation=squarish',
    },
    {
      id: '5',
      name: 'Peptide Firming Serum',
      brand: 'GlowLab Skincare',
      price: 45.99,
      rating: 4.8,
      reviewCount: 621,
      image: 'https://readdy.ai/api/search-image?query=peptide%20serum%20bottle%20skincare%20product%20white%20background%20professional%20photography%20modern%20design%20beauty%20product%20sophisticated%20packaging&width=300&height=300&seq=similar-product-4&orientation=squarish',
    },
  ];

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-taupe cursor-pointer transition-colors">Home</button>
            <i className="ri-arrow-right-s-line"></i>
            <button onClick={() => navigate('/discover')} className="hover:text-taupe cursor-pointer transition-colors">Products</button>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product Main Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="w-full h-[600px] bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-12"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-full h-28 bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                      selectedImage === idx ? 'border-taupe shadow-md' : 'border-gray-200 hover:border-taupe-300'
                    }`}
                  >
                    <img src={image} alt={`View ${idx + 1}`} className="w-full h-full object-contain p-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-taupe font-semibold text-sm uppercase tracking-wider mb-2">{product.brand}</p>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`text-lg ${
                            star <= Math.round(product.rating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{product.rating}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const reviewsSection = document.getElementById('reviews-section');
                      reviewsSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-taupe cursor-pointer transition-colors"
                  >
                    ({product.reviewCount.toLocaleString()} reviews)
                  </button>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-gray-900">${product.price}</span>
                  <span className="text-2xl text-gray-400 line-through">${product.originalPrice}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>

                {/* Stock & Features */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {product.inStock && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-taupe-50 text-taupe-700 rounded-full">
                      <div className="w-2 h-2 bg-taupe-500 rounded-full"></div>
                      <span className="text-sm font-semibold">In Stock</span>
                    </div>
                  )}
                  {product.fastShipping && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                      <i className="ri-truck-line"></i>
                      <span className="text-sm font-semibold">Fast Shipping</span>
                    </div>
                  )}
                  {product.freeReturns && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full">
                      <i className="ri-arrow-go-back-line"></i>
                      <span className="text-sm font-semibold">Free Returns</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>
              </div>

              {/* Size */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Size</p>
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-taupe-50 border-2 border-taupe rounded-xl">
                  <i className="ri-drop-line text-taupe"></i>
                  <span className="text-sm font-semibold text-gray-900">{product.size}</span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-xl"></i>
                  </button>
                  <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 px-8 py-4 bg-taupe text-white rounded-xl font-bold text-lg hover:bg-taupe-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Add to Cart
                </button>
                <button className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:border-taupe hover:text-taupe transition-all cursor-pointer">
                  <i className="ri-heart-line text-2xl"></i>
                </button>
                <button className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl hover:border-taupe hover:text-taupe transition-all cursor-pointer">
                  <i className="ri-share-line text-2xl"></i>
                </button>
              </div>

              {/* Skin Types & Concerns */}
              <div className="p-6 bg-gradient-to-br from-taupe-50 to-emerald-50 rounded-2xl border border-taupe-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-user-line text-taupe"></i>
                      Suitable for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypes.map((type, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white text-taupe-700 text-sm font-medium rounded-full border border-taupe-300 shadow-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-heart-pulse-line text-taupe"></i>
                      Addresses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.concerns.map((concern, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white text-taupe-700 text-sm font-medium rounded-full border border-taupe-300 shadow-sm">
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto">
              {['overview', 'ingredients', 'how-to-use', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-semibold text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'border-taupe text-taupe'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Benefits</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-taupe-300 transition-colors">
                      <div className="w-8 h-8 flex items-center justify-center bg-taupe-100 rounded-full flex-shrink-0">
                        <i className="ri-check-line text-taupe font-bold"></i>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Ingredients</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {product.keyIngredients.map((ingredient, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{ingredient.name}</h3>
                      <span className="px-3 py-1 bg-taupe-100 text-taupe-700 text-sm font-bold rounded-full">
                        {ingredient.percentage}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{ingredient.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Use Tab */}
          {activeTab === 'how-to-use' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use</h2>
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  {product.howToUse.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-taupe text-white rounded-full font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div id="reviews-section">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                  <p className="text-gray-600">Based on {product.reviewCount.toLocaleString()} verified reviews</p>
                </div>
                <button className="px-6 py-3 bg-taupe text-white rounded-xl font-semibold hover:bg-taupe-700 transition-colors whitespace-nowrap cursor-pointer">
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-6 mb-8">
                {displayedReviews.map((review) => {
                  const hasSimilarSkin = isSimilarSkin(review);
                  
                  return (
                    <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all relative">
                      {/* Similar Skin Badge */}
                      {hasSimilarSkin && (
                        <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-md flex-shrink-0">
                          <i className="ri-user-heart-line"></i>
                          <span>Similar Skin</span>
                        </div>
                      )}
                      
                      <div className="pr-32">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-taupe-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{review.author}</h3>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-taupe-100 text-taupe-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                  <i className="ri-shield-check-fill"></i>
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`text-sm ${
                                      star <= review.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'
                                    }`}
                                  ></i>
                                ))}
                              </div>
                              <span>{review.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {review.skinType} Skin
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Type {review.fitzpatrickType}
                          </span>
                          {review.concerns.map((concern, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {concern}
                            </span>
                          ))}
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                        
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-taupe transition-colors cursor-pointer">
                          <i className="ri-thumb-up-line"></i>
                          <span>Helpful ({review.helpful})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showAllReviews && reviews.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg whitespace-nowrap cursor-pointer"
                  >
                    View All {reviews.length} Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Similar Products */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/product-search-detail/${item.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-full h-72 bg-gray-50 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-taupe font-semibold uppercase tracking-wider mb-1">{item.brand}</p>
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-taupe transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">${item.price}</span>
                      <div className="flex items-center gap-1">
                        <i className="ri-star-fill text-amber-400 text-sm"></i>
                        <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                        <span className="text-xs text-gray-500">({item.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductSearchDetailPage;
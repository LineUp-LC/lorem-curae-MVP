import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProductOverview from './components/ProductOverview';
import ProductReviews from './components/ProductReviews';
import PurchaseOptions from './components/PurchaseOptions';
import SimilarProducts from './components/SimilarProducts';
import { supabase } from '../../lib/supabase-browser';

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedRetailerIds, setSelectedRetailerIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // State for product comparison feature
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);

  const product = {
    id: 1,
    name: 'Brightening Vitamin C Serum',
    brand: 'Glow Naturals',
    rating: 4.9,
    reviewCount: 2156,
    priceRange: '$43.50 - $46.00',
    images: [
      'https://readdy.ai/api/search-image?query=Brightening%20vitamin%20C%20serum%20in%20elegant%20glass%20dropper%20bottle%20with%20golden%20liquid%2C%20minimalist%20white%20background%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20clean%20aesthetic&width=600&height=600&seq=1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=Vitamin%20C%20serum%20texture%20close-up%2C%20golden%20orange%20liquid%20droplet%2C%20silky%20smooth%20consistency%2C%20white%20background%2C%20macro%20photography%2C%20professional%20beauty%20shot&width=600&height=600&seq=2&orientation=squarish',
      'https://readdy.ai/api/search-image?query=Vitamin%20C%20serum%20application%20on%20skin%2C%20golden%20serum%20being%20applied%20to%20face%2C%20glowing%20skin%2C%20natural%20lighting%2C%20beauty%20skincare%20routine%2C%20professional%20photography&width=600&height=600&seq=3&orientation=squarish',
      'https://readdy.ai/api/search-image?query=Vitamin%20C%20serum%20ingredients%20display%2C%20vitamin%20C%20crystals%2C%20ferulic%20acid%2C%20vitamin%20E%20capsules%2C%20botanical%20extracts%2C%20white%20background%2C%20clean%20product%20photography&width=600&height=600&seq=4&orientation=squarish'
    ],
    description: 'Powerful antioxidant serum that brightens, evens tone, and protects against environmental damage.',
    inStock: true,
    freeShipping: true
  };

  const keyIngredients = [
    'Vitamin C',
    'Ferulic Acid',
    'Vitamin E'
  ];

  const locationData = {
    location: 'New York, NY',
    climate: 'Humid Continental',
    uvIndex: 'Moderate (5-6)',
    pollutionLevel: 'Moderate',
    season: 'Spring'
  };

  const retailers = [
    {
      id: 1,
      name: 'DermStore',
      price: 43.50,
      totalPrice: 43.50,
      shipping: 'Free',
      shippingCost: 0,
      tax: 0,
      deliveryTime: '3-5 days',
      trustScore: 98,
      verified: true,
      logo: 'https://via.placeholder.com/100x40?text=DermStore',
      returnPolicy: '30 days',
      rewards: 'Earn 5% back in points',
      url: 'https://www.dermstore.com',
    },
    {
      id: 2,
      name: 'Sephora',
      price: 45.00,
      totalPrice: 45.00,
      shipping: 'Free over $50',
      shippingCost: 0,
      tax: 0,
      deliveryTime: '2-4 days',
      trustScore: 99,
      verified: true,
      logo: 'https://via.placeholder.com/100x40?text=Sephora',
      returnPolicy: '60 days',
      rewards: 'Beauty Insider points',
      url: 'https://www.sephora.com',
    },
    {
      id: 3,
      name: 'Ulta Beauty',
      price: 44.00,
      totalPrice: 47.99,
      shipping: '$3.99',
      shippingCost: 3.99,
      tax: 0,
      deliveryTime: '4-6 days',
      trustScore: 97,
      verified: true,
      logo: 'https://via.placeholder.com/100x40?text=Ulta',
      returnPolicy: '60 days',
      rewards: 'Ultamate Rewards',
      url: 'https://www.ulta.com',
    },
    {
      id: 4,
      name: 'Amazon',
      price: 42.00,
      totalPrice: 42.00,
      shipping: 'Free with Prime',
      shippingCost: 0,
      tax: 0,
      deliveryTime: '1-2 days',
      trustScore: 92,
      verified: false,
      logo: 'https://via.placeholder.com/100x40?text=Amazon',
      returnPolicy: '30 days',
      rewards: 'Prime benefits',
      url: 'https://www.amazon.com',
    },
    {
      id: 5,
      name: 'Target',
      price: 44.50,
      totalPrice: 44.50,
      shipping: 'Free over $35',
      shippingCost: 0,
      tax: 0,
      deliveryTime: '3-5 days',
      trustScore: 96,
      verified: true,
      logo: 'https://via.placeholder.com/100x40?text=Target',
      returnPolicy: '90 days',
      rewards: 'Circle rewards',
      url: 'https://www.target.com',
    },
  ];

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      const tabsSection = document.querySelector('.bg-gray-50.py-16');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSaveToRoutine = () => {
    const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    if (!savedProducts.find((p: any) => p.id === product.id)) {
      savedProducts.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        priceRange: product.priceRange,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } else {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const scrollToIngredients = () => {
    const ingredientsSection = document.getElementById('full-ingredients-section');
    if (ingredientsSection) {
      ingredientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler for adding/removing products from comparison
  const handleAddToComparison = (productId: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length < 3) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, []);

  // Comparison modal
  if (showComparison) {
    const selectedRetailers = retailers.filter(r => selectedRetailerIds.includes(r.id));
    
    const prices = selectedRetailers.map(r => r.totalPrice);
    const bestPrice = Math.min(...prices);
    const worstPrice = Math.max(...prices);
    
    const trustScores = selectedRetailers.map(r => r.trustScore);
    const bestTrust = Math.max(...trustScores);
    const worstTrust = Math.min(...trustScores);
    
    const deliveryDays = selectedRetailers.map(r => parseInt(r.deliveryTime.split('-')[0]));
    const fastestDelivery = Math.min(...deliveryDays);
    const slowestDelivery = Math.max(...deliveryDays);
    
    const getPriceColor = (price: number) => {
      if (price === bestPrice) return 'text-sage-500 font-semibold';
      if (price === worstPrice) return 'text-orange-600 font-semibold';
      return 'text-gray-900';
    };
    
    const getTrustColor = (score: number) => {
      if (score === bestTrust) return 'text-sage-500 font-semibold';
      if (score === worstTrust) return 'text-orange-600 font-semibold';
      return 'text-gray-900';
    };
    
    const getDeliveryColor = (time: string) => {
      const days = parseInt(time.split('-')[0]);
      if (days === fastestDelivery) return 'text-sage-500 font-semibold';
      if (days === slowestDelivery) return 'text-orange-600 font-semibold';
      return 'text-gray-900';
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Compare Retailers</h2>
              <p className="text-sm text-gray-600 mt-1">Select up to 3 retailers to compare prices and details</p>
            </div>
            <button
              onClick={() => setShowComparison(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {retailers.map((retailer) => (
                <label
                  key={retailer.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRetailerIds.includes(retailer.id)
                      ? 'border-sage-500 bg-sage-500/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRetailerIds.includes(retailer.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (selectedRetailerIds.length < 3) {
                          setSelectedRetailerIds([...selectedRetailerIds, retailer.id]);
                        }
                      } else {
                        setSelectedRetailerIds(selectedRetailerIds.filter(id => id !== retailer.id));
                      }
                    }}
                    className="absolute top-4 right-4"
                    disabled={!selectedRetailerIds.includes(retailer.id) && selectedRetailerIds.length >= 3}
                  />
                  <div className="pr-8">
                    <h3 className="font-semibold text-gray-900">{retailer.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">${retailer.totalPrice.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <i className="ri-star-fill text-yellow-400 text-sm"></i>
                        <span className="text-sm text-gray-600">{retailer.trustScore}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{retailer.deliveryTime}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedRetailers.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <i className="ri-bar-chart-box-line text-xl text-sage-500"></i>
                  <h3 className="text-lg font-semibold text-gray-900">Side-by-Side Comparison</h3>
                </div>

                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-900">Metric</th>
                        {selectedRetailers.map((retailer) => (
                          <th key={retailer.id} className="text-left p-4 font-semibold text-gray-900">
                            {retailer.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Total Price</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${getPriceColor(retailer.totalPrice)}`}>
                                ${retailer.totalPrice.toFixed(2)}
                              </span>
                              {retailer.totalPrice === bestPrice && (
                                <span className="px-2 py-0.5 bg-sage-500/10 text-sage-500 text-xs font-medium rounded-full whitespace-nowrap">
                                  Best Price
                                </span>
                              )}
                              {retailer.totalPrice === worstPrice && selectedRetailers.length > 1 && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">
                                  Highest
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Product Price</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <span className="text-gray-900">${retailer.price.toFixed(2)}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Shipping</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <span className="text-gray-900">
                              {retailer.shippingCost === 0 ? (
                                <span className="text-sage-500 font-medium">{retailer.shipping}</span>
                              ) : (
                                <span>{retailer.shipping}</span>
                              )}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Tax</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <span className="text-gray-900">${retailer.tax.toFixed(2)}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Trust Score</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <i className="ri-star-fill text-yellow-400 text-sm"></i>
                                <span className={getTrustColor(retailer.trustScore)}>
                                  {retailer.trustScore}
                                </span>
                              </div>
                              {retailer.trustScore === bestTrust && (
                                <span className="px-2 py-0.5 bg-sage-500/10 text-sage-500 text-xs font-medium rounded-full whitespace-nowrap">
                                  Highest Rated
                                </span>
                              )}
                              {retailer.trustScore === worstTrust && selectedRetailers.length > 1 && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">
                                  Lowest
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">Delivery Time</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={getDeliveryColor(retailer.deliveryTime)}>
                                {retailer.deliveryTime}
                              </span>
                              {parseInt(retailer.deliveryTime.split('-')[0]) === fastestDelivery && (
                                <span className="px-2 py-0.5 bg-sage-500/10 text-sage-500 text-xs font-medium rounded-full whitespace-nowrap">
                                  Fastest
                                </span>
                              )}
                              {parseInt(retailer.deliveryTime.split('-')[0]) === slowestDelivery && selectedRetailers.length > 1 && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">
                                  Slowest
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-gray-700">Store Link</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <a
                              href={retailer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              Visit Store
                              <i className="ri-external-link-line"></i>
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sage-500"></div>
                    <span className="text-gray-600">Best Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <span className="text-gray-600">Needs Attention</span>
                  </div>
                </div>
              </div>
            )}

            {selectedRetailers.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-checkbox-multiple-line text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">Select retailers above to start comparing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {showSaveSuccess && (
        <div className="fixed top-24 right-6 z-50 bg-sage-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <i className="ri-checkbox-circle-fill text-xl"></i>
          <span className="font-medium">Saved to your routine!</span>
        </div>
      )}

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="w-full h-[600px] bg-gray-50 rounded-2xl overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-full h-32 bg-gray-50 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index ? 'ring-2 ring-sage-500' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-sage-600 mb-2">{product.brand}</p>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={scrollToReviews}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-lg ${
                            i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-sm text-gray-600">({product.reviewCount.toLocaleString()} reviews)</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{product.priceRange}</span>
                  <span className="text-sm text-gray-600">+ shipping & taxes (estimated at checkout)</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.inStock && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 text-sage-700 text-sm font-medium rounded-full">
                      <i className="ri-checkbox-circle-fill"></i>
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              <p className="text-base text-gray-700 leading-relaxed">{product.description}</p>

              {/* Key Ingredients */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Ingredients</h3>
                  <button
                    onClick={scrollToIngredients}
                    className="text-sm text-sage-600 hover:text-sage-700 underline whitespace-nowrap"
                  >
                    View full Ingredients
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keyIngredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suitable For */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suitable For</h3>
                <div className="flex flex-wrap gap-2">
                  {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map((type) => {
                    const isUserSkinType = userProfile?.skin_type?.toLowerCase() === type.toLowerCase();
                    return (
                      <span
                        key={type}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isUserSkinType
                            ? 'bg-sage-100 text-sage-700 border-2 border-sage-500'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {type}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Personalized Location Info */}
              <div className="bg-gradient-to-br from-sage-50 to-teal-50 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ri-map-pin-line text-xl text-sage-600 mt-0.5"></i>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Personalized for Your Location</h3>
                    <p className="text-sm text-gray-600">Based on your profile: {locationData.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Climate</p>
                    <p className="text-sm font-semibold text-gray-900">{locationData.climate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">UV Index</p>
                    <p className="text-sm font-semibold text-gray-900">{locationData.uvIndex}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Pollution Level</p>
                    <p className="text-sm font-semibold text-gray-900">{locationData.pollutionLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Season</p>
                    <p className="text-sm font-semibold text-gray-900">{locationData.season}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveToRoutine}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-bookmark-line text-lg"></i>
                  Save to Routine
                </button>
                
                <button
                  onClick={scrollToReviews}
                  className="w-full bg-white hover:bg-gray-50 text-sage-600 font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 border-2 border-sage-600"
                >
                  <i className="ri-chat-3-line text-lg"></i>
                  Read {product.reviewCount.toLocaleString()} Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Where to Buy Section */}
        <PurchaseOptions productId={product.id} />

        {/* Tabs Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8">
                {['overview', 'ingredients', 'how-to-use', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap relative ${
                      activeTab === tab
                        ? 'text-sage-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'ingredients' && 'Ingredients'}
                    {tab === 'how-to-use' && 'How to Use'}
                    {tab === 'reviews' && `Reviews (${product.reviewCount.toLocaleString()})`}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-600"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <ProductOverview />

                <div id="full-ingredients-section">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Full Ingredient List</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Water (Aqua), Niacinamide, Glycerin, Hyaluronic Acid, Pentylene Glycol, Zinc PCA, 
                    Panthenol, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Acacia Senegal Gum, 
                    Hydrolyzed Wheat Protein, Hydrolyzed Wheat Starch, Carrageenan, Xanthan Gum, 
                    Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Full Ingredient List</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Aqua (Water), Ascorbic Acid (Vitamin C), Propanediol, Glycerin, Ferulic Acid, Tocopherol (Vitamin E), 
                  Hyaluronic Acid, Panthenol, Niacinamide, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, 
                  Chamomilla Recutita (Matricaria) Flower Extract, Camellia Sinensis Leaf Extract, Citrus Aurantium Dulcis 
                  (Orange) Peel Oil, Xanthan Gum, Sodium Benzoate, Potassium Sorbate, Citric Acid
                </p>
              </div>
            )}
            {activeTab === 'how-to-use' && (
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Cleanse</h3>
                      <p className="text-sm text-gray-700">Start with a clean, dry face. Pat skin gently with a towel.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Apply</h3>
                      <p className="text-sm text-gray-700">Dispense 3-4 drops onto fingertips and gently press into face and neck.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Wait</h3>
                      <p className="text-sm text-gray-700">Allow serum to absorb for 1-2 minutes before applying other products.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Protect</h3>
                      <p className="text-sm text-gray-700">Follow with moisturizer and SPF during the day. Use morning and evening for best results.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
          </div>
        </div>

        {/* Similar Products - with optional comparison props */}
        <SimilarProducts
          productId={product.id}
          onAddToComparison={handleAddToComparison}
          selectedForComparison={selectedForComparison}
        />
      </main>

      <Footer />
    </div>
  );
}
import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProductOverview from './components/ProductOverview';
import ProductReviews from './components/ProductReviews';
import PurchaseOptions from './components/PurchaseOptions';
import SimilarProducts from './components/SimilarProducts';
import ProductComparison from '../discover/components/ProductComparison';
import { productData } from '../../mocks/products';
import { supabase } from '../../lib/supabase-browser';
import { useFavorites } from '../../lib/utils/favoritesState';
import { recentlyViewedState } from '../../lib/utils/recentlyViewedState';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useLocalStorageState<string>(
    'product_detail_active_tab',
    'overview'
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSavedToRoutine, setIsSavedToRoutine] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedRetailerIds, setSelectedRetailerIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showProductComparison, setShowProductComparison] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [userConcerns, setUserConcerns] = useState<string[]>([]);

  // Favorites state
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const skinData = localStorage.getItem('skinSurveyData');
    if (skinData) {
      const parsed = JSON.parse(skinData);
      if (parsed.concerns) {
        setUserConcerns(parsed.concerns.map((c: string) => c.toLowerCase()));
      }
    }
  }, []);

  // Check if product is already saved to routine
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    const isAlreadySaved = savedProducts.some((p: any) => p.id === 1);
    setIsSavedToRoutine(isAlreadySaved);
  }, []);

  const product = {
    id: 1,
    name: 'Brightening Vitamin C Serum',
    brand: 'Glow Naturals',
    rating: 4.9,
    reviewCount: 2156,
    priceRange: '$43.50 - $46.00',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&q=80'
    ],
    description: 'Powerful antioxidant serum that brightens, evens tone, and protects against environmental damage.',
    inStock: true,
    freeShipping: true
  };

  // Track product view on mount
  useEffect(() => {
    recentlyViewedState.addRecentlyViewed({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      priceRange: product.priceRange,
    });
  }, [product.id]);

  const keyIngredients = ['Vitamin C', 'Ferulic Acid', 'Vitamin E'];

  const locationData = {
    location: 'New York, NY',
    climate: 'Humid Continental',
    uvIndex: 'Moderate (5-6)',
    pollutionLevel: 'Moderate',
    season: 'Spring'
  };

  const retailers = [
    { id: 1, name: 'DermStore', price: 43.50, totalPrice: 43.50, shipping: 'Free', shippingCost: 0, tax: 0, deliveryTime: '3-5 days', trustScore: 98, verified: true, logo: 'https://via.placeholder.com/100x40?text=DermStore', returnPolicy: '30 days', rewards: 'Earn 5% back in points', url: 'https://www.dermstore.com' },
    { id: 2, name: 'Sephora', price: 45.00, totalPrice: 45.00, shipping: 'Free over $50', shippingCost: 0, tax: 0, deliveryTime: '2-4 days', trustScore: 99, verified: true, logo: 'https://via.placeholder.com/100x40?text=Sephora', returnPolicy: '60 days', rewards: 'Beauty Insider points', url: 'https://www.sephora.com' },
    { id: 3, name: 'Ulta Beauty', price: 44.00, totalPrice: 47.99, shipping: '$3.99', shippingCost: 3.99, tax: 0, deliveryTime: '4-6 days', trustScore: 97, verified: true, logo: 'https://via.placeholder.com/100x40?text=Ulta', returnPolicy: '60 days', rewards: 'Ultamate Rewards', url: 'https://www.ulta.com' },
    { id: 4, name: 'Amazon', price: 42.00, totalPrice: 42.00, shipping: 'Free with Prime', shippingCost: 0, tax: 0, deliveryTime: '1-2 days', trustScore: 92, verified: false, logo: 'https://via.placeholder.com/100x40?text=Amazon', returnPolicy: '30 days', rewards: 'Prime benefits', url: 'https://www.amazon.com' },
    { id: 5, name: 'Target', price: 44.50, totalPrice: 44.50, shipping: 'Free over $35', shippingCost: 0, tax: 0, deliveryTime: '3-5 days', trustScore: 96, verified: true, logo: 'https://via.placeholder.com/100x40?text=Target', returnPolicy: '90 days', rewards: 'Circle rewards', url: 'https://www.target.com' },
  ];

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      const tabsSection = document.querySelector('.bg-cream.py-16');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSaveToRoutine = () => {
    const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    const existingIndex = savedProducts.findIndex((p: any) => p.id === product.id);

    if (existingIndex === -1) {
      // Add to routine
      savedProducts.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        priceRange: product.priceRange,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      setIsSavedToRoutine(true);
    } else {
      // Remove from routine
      savedProducts.splice(existingIndex, 1);
      localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      setIsSavedToRoutine(false);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      priceRange: product.priceRange,
    });
  };

  const scrollToIngredients = () => {
    const ingredientsSection = document.getElementById('full-ingredients-section');
    if (ingredientsSection) {
      ingredientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToComparison = (productId: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(productId)) return prev.filter(id => id !== productId);
      if (prev.length < 3) return [...prev, productId];
      return prev;
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users_profiles').select('*').eq('id', user.id).single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, []);

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
      if (price === bestPrice) return 'text-primary font-semibold';
      if (price === worstPrice) return 'text-orange-600 font-semibold';
      return 'text-deep';
    };
    
    const getTrustColor = (score: number) => {
      if (score === bestTrust) return 'text-primary font-semibold';
      if (score === worstTrust) return 'text-orange-600 font-semibold';
      return 'text-deep';
    };
    
    const getDeliveryColor = (time: string) => {
      const days = parseInt(time.split('-')[0]);
      if (days === fastestDelivery) return 'text-primary font-semibold';
      if (days === slowestDelivery) return 'text-orange-600 font-semibold';
      return 'text-deep';
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-blush p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-deep">Compare Retailers</h2>
              <p className="text-sm text-warm-gray mt-1">Select up to 3 retailers to compare prices and details</p>
            </div>
            <button onClick={() => setShowComparison(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blush/30 transition-colors">
              <i className="ri-close-line text-xl text-warm-gray"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {retailers.map((retailer) => (
                <label key={retailer.id} className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedRetailerIds.includes(retailer.id) ? 'border-primary bg-primary/5' : 'border-blush hover:border-blush'}`}>
                  <input type="checkbox" checked={selectedRetailerIds.includes(retailer.id)}
                    onChange={(e) => {
                      if (e.target.checked) { if (selectedRetailerIds.length < 3) setSelectedRetailerIds([...selectedRetailerIds, retailer.id]); }
                      else { setSelectedRetailerIds(selectedRetailerIds.filter(id => id !== retailer.id)); }
                    }}
                    className="absolute top-4 right-4" disabled={!selectedRetailerIds.includes(retailer.id) && selectedRetailerIds.length >= 3}
                  />
                  <div className="pr-8">
                    <h3 className="font-semibold text-deep">{retailer.name}</h3>
                    <p className="text-2xl font-bold text-deep mt-2">${retailer.totalPrice.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1"><i className="ri-star-fill text-yellow-400 text-sm"></i><span className="text-sm text-warm-gray">{retailer.trustScore}</span></div>
                      <span className="text-blush">•</span>
                      <span className="text-sm text-warm-gray">{retailer.deliveryTime}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedRetailers.length > 0 && (
              <div className="bg-cream rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <i className="ri-bar-chart-box-line text-xl text-primary"></i>
                  <h3 className="text-lg font-semibold text-deep">Side-by-Side Comparison</h3>
                </div>
                <div className="bg-white rounded-lg overflow-hidden border border-blush">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cream border-b border-blush">
                        <th className="text-left p-4 font-semibold text-deep">Metric</th>
                        {selectedRetailers.map((retailer) => (<th key={retailer.id} className="text-left p-4 font-semibold text-deep">{retailer.name}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Total Price</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${getPriceColor(retailer.totalPrice)}`}>${retailer.totalPrice.toFixed(2)}</span>
                              {retailer.totalPrice === bestPrice && (<span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">Best Price</span>)}
                              {retailer.totalPrice === worstPrice && selectedRetailers.length > 1 && (<span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">Highest</span>)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Product Price</td>
                        {selectedRetailers.map((retailer) => (<td key={retailer.id} className="p-4"><span className="text-deep">${retailer.price.toFixed(2)}</span></td>))}
                      </tr>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Shipping</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <span className="text-deep">{retailer.shippingCost === 0 ? (<span className="text-primary font-medium">{retailer.shipping}</span>) : (<span>{retailer.shipping}</span>)}</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Tax</td>
                        {selectedRetailers.map((retailer) => (<td key={retailer.id} className="p-4"><span className="text-deep">${retailer.tax.toFixed(2)}</span></td>))}
                      </tr>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Trust Score</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1"><i className="ri-star-fill text-yellow-400 text-sm"></i><span className={getTrustColor(retailer.trustScore)}>{retailer.trustScore}</span></div>
                              {retailer.trustScore === bestTrust && (<span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">Highest Rated</span>)}
                              {retailer.trustScore === worstTrust && selectedRetailers.length > 1 && (<span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">Lowest</span>)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-blush/50">
                        <td className="p-4 font-medium text-warm-gray">Delivery Time</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={getDeliveryColor(retailer.deliveryTime)}>{retailer.deliveryTime}</span>
                              {parseInt(retailer.deliveryTime.split('-')[0]) === fastestDelivery && (<span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">Fastest</span>)}
                              {parseInt(retailer.deliveryTime.split('-')[0]) === slowestDelivery && selectedRetailers.length > 1 && (<span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full whitespace-nowrap">Slowest</span>)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-warm-gray">Store Link</td>
                        {selectedRetailers.map((retailer) => (
                          <td key={retailer.id} className="p-4">
                            <a href={retailer.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap">
                              Visit Store<i className="ri-external-link-line"></i>
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-warm-gray">Best Value</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-600"></div><span className="text-warm-gray">Needs Attention</span></div>
                </div>
              </div>
            )}

            {selectedRetailers.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-checkbox-multiple-line text-5xl text-blush mb-4"></i>
                <p className="text-warm-gray">Select retailers above to start comparing</p>
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
        <div className="fixed top-24 right-6 z-50 bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 motion-safe:animate-fade-in">
          <i className="ri-checkbox-circle-fill text-xl"></i>
          <span className="font-medium">Saved to your routine!</span>
        </div>
      )}

      <main className="flex-1 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="w-full h-[600px] bg-cream rounded-2xl overflow-hidden">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`w-full h-32 bg-cream rounded-lg overflow-hidden transition-all ${selectedImage === index ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-blush'}`}>
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-primary mb-2">{product.brand}</p>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={scrollToReviews} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (<i key={i} className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-blush'}`}></i>))}
                    </div>
                    <span className="text-sm font-semibold text-deep">{product.rating}</span>
                    <span className="text-sm text-warm-gray">({product.reviewCount.toLocaleString()} reviews)</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-b border-blush py-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-deep">{product.priceRange}</span>
                  <span className="text-sm text-warm-gray">+ shipping & taxes (estimated at checkout)</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.inStock && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-coral/10 text-coral text-sm font-medium rounded-full">
                      <i className="ri-checkbox-circle-fill"></i>In Stock
                    </span>
                  )}
                  <button
                    onClick={() => document.getElementById('where-to-buy-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-primary hover:text-dark underline cursor-pointer"
                  >
                    Check where to buy
                  </button>
                </div>
              </div>

              <p className="text-base text-warm-gray leading-relaxed">{product.description}</p>

              {/* Key Ingredients */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-deep">Key Ingredients</h3>
                  <button onClick={scrollToIngredients} className="text-sm text-primary hover:text-dark underline whitespace-nowrap">View full Ingredients</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keyIngredients.map((ingredient, index) => {
                    const userConcernsData = JSON.parse(localStorage.getItem('skinSurveyData') || '{}').concerns || [];
                    const concernIngredientMap: Record<string, string[]> = {
                      'Acne Prone': ['Salicylic Acid', 'Niacinamide', 'Tea Tree'],
                      'Uneven Skin Tone': ['Vitamin C', 'Alpha Arbutin', 'Niacinamide'],
                      'Signs of Aging': ['Retinol', 'Vitamin C', 'Vitamin E', 'Peptides'],
                      'Lack of Hydration': ['Hyaluronic Acid', 'Glycerin', 'Vitamin E'],
                    };
                    const matchingIngredients = userConcernsData.flatMap((c: string) => concernIngredientMap[c] || []);
                    const isMatchingIngredient = matchingIngredients.some((mi: string) => ingredient.toLowerCase().includes(mi.toLowerCase()) || mi.toLowerCase().includes(ingredient.toLowerCase()));
                    
                    return (
                      <span key={index} className={`px-4 py-2 text-sm font-medium rounded-lg ${isMatchingIngredient ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-cream text-warm-gray'}`}>
                        {ingredient}
                        {isMatchingIngredient && <i className="ri-sparkling-fill ml-1 text-primary"></i>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Suitable For */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-deep mb-4">Suitable For</h3>
                <div className="flex flex-wrap gap-2">
                  {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map((type) => {
                    const savedSkinType = JSON.parse(localStorage.getItem('skinSurveyData') || '{}').skinType?.[0];
                    const isUserSkinType = userProfile?.skin_type?.toLowerCase() === type.toLowerCase() || savedSkinType?.toLowerCase() === type.toLowerCase();
                    return (
                      <span key={type} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isUserSkinType ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-blush/30 text-warm-gray'}`}>
                        {type}
                        {isUserSkinType && <i className="ri-check-line ml-1"></i>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-deep mb-4">Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const userPrefs = JSON.parse(localStorage.getItem('skinSurveyData') || '{}').preferences || {};
                    const productPreferences = [
                      { key: 'chemicalFree', label: 'Chemical-Free', value: true },
                      { key: 'vegan', label: 'Vegan', value: true },
                      { key: 'plantBased', label: 'Plant-Based', value: true },
                      { key: 'fragranceFree', label: 'Fragrance-Free', value: false },
                      { key: 'glutenFree', label: 'Gluten-Free', value: true },
                      { key: 'alcoholFree', label: 'Alcohol-Free', value: true },
                      { key: 'siliconeFree', label: 'Silicone-Free', value: false },
                      { key: 'crueltyFree', label: 'Cruelty-Free', value: true },
                    ];
                    return productPreferences.map((pref) => {
                      const isMatching = userPrefs[pref.key] === true && pref.value === true;
                      return (
                        <span key={pref.key} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${pref.value ? isMatching ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-sage/10 text-sage' : 'bg-blush/30 text-warm-gray/60 line-through'}`}>
                          {pref.value && isMatching && <i className="ri-check-line mr-1"></i>}
                          {pref.value && !isMatching && <i className="ri-leaf-line mr-1"></i>}
                          {!pref.value && <i className="ri-close-line mr-1"></i>}
                          {pref.label}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-gradient-to-br from-sage/10 to-light/20 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ri-map-pin-line text-xl text-sage mt-0.5"></i>
                  <div>
                    <h3 className="text-sm font-semibold text-deep mb-1">Personalized for Your Location</h3>
                    <p className="text-sm text-warm-gray">Based on your profile: {locationData.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs font-medium text-warm-gray mb-1">Climate</p><p className="text-sm font-semibold text-deep">{locationData.climate}</p></div>
                  <div><p className="text-xs font-medium text-warm-gray mb-1">UV Index</p><p className="text-sm font-semibold text-deep">{locationData.uvIndex}</p></div>
                  <div><p className="text-xs font-medium text-warm-gray mb-1">Pollution Level</p><p className="text-sm font-semibold text-deep">{locationData.pollutionLevel}</p></div>
                  <div><p className="text-xs font-medium text-warm-gray mb-1">Season</p><p className="text-sm font-semibold text-deep">{locationData.season}</p></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                    isFavorite(product.id)
                      ? 'bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20'
                      : 'bg-primary hover:bg-dark text-white'
                  }`}
                >
                  <i className={`${isFavorite(product.id) ? 'ri-heart-fill' : 'ri-heart-line'} text-lg`}></i>
                  {isFavorite(product.id) ? 'Saved to Favorites' : 'Add to Favorites'}
                </button>
                <button
                  onClick={handleSaveToRoutine}
                  className={`w-full font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 border-2 border-primary ${
                    isSavedToRoutine
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-white hover:bg-cream text-primary'
                  }`}
                >
                  <i className={`${isSavedToRoutine ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-lg`}></i>
                  {isSavedToRoutine ? 'Saved to Routine' : 'Save to Routine'}
                </button>
                <button onClick={scrollToReviews} className="w-full bg-white hover:bg-cream text-primary font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 border-2 border-primary">
                  <i className="ri-chat-3-line text-lg"></i>Read {product.reviewCount.toLocaleString()} Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        <PurchaseOptions productId={product.id} />

        {/* Tabs Section */}
        <div className="bg-cream py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-blush mb-8">
              <div className="flex gap-8">
                {['overview', 'ingredients', 'how-to-use', 'reviews'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-semibold transition-colors whitespace-nowrap relative ${activeTab === tab ? 'text-primary' : 'text-warm-gray hover:text-primary-500'}`}>
                    {tab === 'overview' && 'Overview'}
                    {tab === 'ingredients' && 'Ingredients'}
                    {tab === 'how-to-use' && 'How to Use'}
                    {tab === 'reviews' && `Reviews (${product.reviewCount.toLocaleString()})`}
                    {activeTab === tab && (<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <ProductOverview />
                <div id="full-ingredients-section">
                  <h3 className="text-xl font-semibold text-deep mb-4">Full Ingredient List</h3>
                  <p className="text-warm-gray leading-relaxed">Water (Aqua), Niacinamide, Glycerin, Hyaluronic Acid, Pentylene Glycol, Zinc PCA, Panthenol, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Acacia Senegal Gum, Hydrolyzed Wheat Protein, Hydrolyzed Wheat Starch, Carrageenan, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.</p>
                </div>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-deep mb-6">Full Ingredient List</h2>
                <p className="text-sm text-warm-gray leading-relaxed">Aqua (Water), Ascorbic Acid (Vitamin C), Propanediol, Glycerin, Ferulic Acid, Tocopherol (Vitamin E), Hyaluronic Acid, Panthenol, Niacinamide, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, Chamomilla Recutita (Matricaria) Flower Extract, Camellia Sinensis Leaf Extract, Citrus Aurantium Dulcis (Orange) Peel Oil, Xanthan Gum, Sodium Benzoate, Potassium Sorbate, Citric Acid</p>
              </div>
            )}
            {activeTab === 'how-to-use' && (
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-deep mb-6">How to Use</h2>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Cleanse', desc: 'Start with a clean, dry face. Pat skin gently with a towel.' },
                    { step: 2, title: 'Apply', desc: 'Dispense 3-4 drops onto fingertips and gently press into face and neck.' },
                    { step: 3, title: 'Wait', desc: 'Allow serum to absorb for 1-2 minutes before applying other products.' },
                    { step: 4, title: 'Protect', desc: 'Follow with moisturizer and SPF during the day. Use morning and evening for best results.' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">{item.step}</div>
                      <div><h3 className="font-semibold text-deep mb-1">{item.title}</h3><p className="text-sm text-warm-gray">{item.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
          </div>
        </div>

        <SimilarProducts productId={product.id} onAddToComparison={handleAddToComparison} selectedForComparison={selectedForComparison} onOpenComparison={() => setShowProductComparison(true)} />
      </main>

      {showProductComparison && selectedForComparison.length >= 2 && (
        <ProductComparison products={productData.filter(p => selectedForComparison.includes(p.id))} userConcerns={userConcerns} onClose={() => setShowProductComparison(false)}
          onRemoveProduct={(id) => { setSelectedForComparison(prev => prev.filter(pId => pId !== id)); if (selectedForComparison.length <= 2) setShowProductComparison(false); }}
        />
      )}

      <Footer />
    </div>
  );
}
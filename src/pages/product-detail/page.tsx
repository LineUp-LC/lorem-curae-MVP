import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import ProductOverview from './components/ProductOverview';
import ProductReviews from './components/ProductReviews';
import PurchaseOptions from './components/PurchaseOptions';
import SimilarProducts from './components/SimilarProducts';
import ComparisonPickerModal from '../../components/feature/ComparisonPickerModal';
import ProductGuideChat from '../../components/feature/ProductGuideChat';
import EnvironmentFitModal from './components/EnvironmentFitModal';
import { generateSeasonalModalContent } from '../../lib/utils/seasonalModalContent';
import { useSavedProducts } from '../../lib/utils/favoritesState';
import { recentlyViewedState } from '../../lib/utils/recentlyViewedState';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectivePreferences, getEffectiveComplexion, getEffectiveSensitivity, getEffectiveLifestyle } from '../../lib/utils/sessionState';
import { matchesConcern, matchesIngredient } from '../../lib/utils/matching';
import { normalizeSkinTypes, isSkinTypeMatch, isAllMetadata, getMetadataDisplayLabel } from '../../lib/utils/productMetadata';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';
import CompatibleWith from '../../components/feature/CompatibleWith';
import SafetyBadge from '../../components/feature/SafetyBadge';
import IngredientLink from '../../components/feature/IngredientLink';
import { assessProductSafety, getUserProfile } from '../../lib/utils/productSafety';
import { useUserLocation } from '../../lib/utils/locationState';
import { useEnvironmentContext } from '../../lib/environment/useEnvironmentContext';
import { useDocumentTitle } from '../../lib/utils/useDocumentTitle';
import { generateEnvironmentFitExplanation } from '../../lib/utils/environmentFit';
import { aggregateReviewerEvidence } from '../../lib/utils/reviewerEvidence';
import { useAuth } from '../../lib/auth/AuthContext';
import { getProductById, productCatalog } from '../../lib/data/products';
import { getReviewsForProduct } from '../../mocks/reviews';
import AIExplainPanel from '../../components/feature/AIExplainPanel';
import AIReviewSummary from '../../components/feature/AIReviewSummary';
import GuidedAssistantPanel from '../../components/feature/GuidedAssistantPanel';
import type { GuidedAssistantMode } from '../../lib/ai/conversationState';

export default function ProductDetailPage() {
  // URL params
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = parseInt(paramId || searchParams.get('id') || '2');
  const productFromMock = getProductById(productId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useLocalStorageState<string>(
    'product_detail_active_tab',
    'overview'
  );
  const [saveNotification, setSaveNotification] = useState<{ show: boolean; isAdding: boolean }>({ show: false, isAdding: true });
  const [selectedRetailerIds, setSelectedRetailerIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showComparisonPicker, setShowComparisonPicker] = useState(false);
  const [guidedMode, setGuidedMode] = useState<GuidedAssistantMode | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showInciList, setShowInciList] = useState(false);
  const [expandedIngredientCats, setExpandedIngredientCats] = useState<Set<string>>(new Set(['Active Ingredients']));

  // Saved products state
  const { isSaved, toggleSaved } = useSavedProducts();
  const { user } = useAuth();
  const { displayString: userLocationDisplay } = useUserLocation();
  const { env } = useEnvironmentContext();

  // Skin profile from global state (Supabase profile → session → localStorage fallback)
  const userConcerns = getEffectiveConcerns().map(c => c.toLowerCase());
  const userSkinType = (getEffectiveSkinType() || '').toLowerCase();

  // User product preferences from global state
  const userPreferences = getEffectivePreferences();

  const product = productFromMock ? {
    id: productFromMock.id,
    name: productFromMock.name,
    brand: productFromMock.brand,
    rating: productFromMock.rating,
    reviewCount: getReviewsForProduct(productFromMock.id).length,
    priceRange: `$${(productFromMock.price * 0.9).toFixed(2)} - $${(productFromMock.price * 1.1).toFixed(2)}`,
    images: [
      productFromMock.image,
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&q=80'
    ],
    description: productFromMock.description,
    inStock: productFromMock.inStock,
    freeShipping: true,
  } : null;

  // Track product view on mount
  useEffect(() => {
    if (product) {
      recentlyViewedState.addRecentlyViewed({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        priceRange: product.priceRange,
      });
    }
  }, [product?.id]);

  // Set document title
  useDocumentTitle(product ? `${product.name} by ${product.brand}` : null);

  const keyIngredients = productFromMock?.keyIngredients || [];

  // Environment data from the centralized pipeline — never hard-coded
  const envLocationDisplay = env?.location?.city
    ? [env.location.city, env.location.region].filter(Boolean).join(', ')
    : userLocationDisplay || '';
  const envClimate = env?.climate
    ? env.climate.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';
  const envUvLabel = env?.uvBand
    ? `${env.uvBand.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}${env.uvIndex != null ? ` (${env.uvIndex})` : ''}`
    : '';
  const envSeason = env?.season
    ? env.season.charAt(0).toUpperCase() + env.season.slice(1)
    : '';

  // Aggregate reviewer evidence for environment-fit explanation
  const reviewerEvidence = productFromMock
    ? aggregateReviewerEvidence(productFromMock.id, {
        skinType: userSkinType,
        primaryConcerns: userConcerns,
        complexion: getEffectiveComplexion(),
        sensitivity: getEffectiveSensitivity(),
        lifestyle: getEffectiveLifestyle(),
        age: 0,
      })
    : undefined;

  // Dynamic environment fit explanation for the Learn More modal
  const envFit = productFromMock && env
    ? generateEnvironmentFitExplanation(productFromMock, env, reviewerEvidence, userConcerns)
    : null;

  // Build seasonal modal content for the Learn More modal
  const seasonalModalContent = useMemo(() => {
    if (!productFromMock || !env || env.source === 'mock') return null;
    const disc = envFit?.disclaimer || 'Personalized for your local conditions. Update your location in Settings anytime.';
    // Read seasonal skin notes from localStorage for the current season
    let seasonalNotes: { current?: string; other?: string; updatedAt?: string } | undefined;
    if (env.season) {
      try {
        const stored = localStorage.getItem('seasonal_skin_notes');
        if (stored) {
          const parsed = JSON.parse(stored);
          seasonalNotes = parsed[env.season] || undefined;
        }
      } catch { /* ignore corrupt data */ }
    }
    return generateSeasonalModalContent(
      productFromMock,
      env,
      reviewerEvidence?.scoredReviews || [],
      disc,
      {
        skinType: userSkinType || undefined,
        concerns: userConcerns.length > 0 ? userConcerns : undefined,
        sensitivity: getEffectiveSensitivity() || undefined,
        complexion: getEffectiveComplexion() || undefined,
        lifestyle: getEffectiveLifestyle(),
        preferences: getEffectivePreferences(),
        seasonalNotes,
      },
    );
  }, [productFromMock?.id, env?.climate, env?.uvBand, env?.season, reviewerEvidence?.scoredReviews, userSkinType, userConcerns.join(','), showLocationModal]);

  const retailers = [
    { id: 1, name: 'DermStore', price: 43.50, totalPrice: 43.50, shipping: 'Free', shippingCost: 0, deliveryTime: '3-5 days', trustScore: 98, verified: true, logo: 'https://via.placeholder.com/100x40?text=DermStore', returnPolicy: '30 days', rewards: 'Earn 5% back in points', url: 'https://www.dermstore.com' },
    { id: 2, name: 'Sephora', price: 45.00, totalPrice: 45.00, shipping: 'Free over $50', shippingCost: 0, deliveryTime: '2-4 days', trustScore: 99, verified: true, logo: 'https://via.placeholder.com/100x40?text=Sephora', returnPolicy: '60 days', rewards: 'Beauty Insider points', url: 'https://www.sephora.com' },
    { id: 3, name: 'Ulta Beauty', price: 44.00, totalPrice: 47.99, shipping: '$3.99', shippingCost: 3.99, deliveryTime: '4-6 days', trustScore: 97, verified: true, logo: 'https://via.placeholder.com/100x40?text=Ulta', returnPolicy: '60 days', rewards: 'Ultamate Rewards', url: 'https://www.ulta.com' },
    { id: 4, name: 'Amazon', price: 42.00, totalPrice: 42.00, shipping: 'Free with Prime', shippingCost: 0, deliveryTime: '1-2 days', trustScore: 92, verified: false, logo: 'https://via.placeholder.com/100x40?text=Amazon', returnPolicy: '30 days', rewards: 'Prime benefits', url: 'https://www.amazon.com' },
    { id: 5, name: 'Target', price: 44.50, totalPrice: 44.50, shipping: 'Free over $35', shippingCost: 0, deliveryTime: '3-5 days', trustScore: 96, verified: true, logo: 'https://via.placeholder.com/100x40?text=Target', returnPolicy: '90 days', rewards: 'Circle rewards', url: 'https://www.target.com' },
  ];

  // Escape key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLocationModal) setShowLocationModal(false);
        else if (showComparison) setShowComparison(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLocationModal, showComparison]);

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      const tabsSection = document.querySelector('.bg-cream.py-16');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSaveProduct = () => {
    const wasAdding = !isSaved(product.id);
    toggleSaved({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      priceRange: product.priceRange,
    });
    setSaveNotification({ show: true, isAdding: wasAdding });
    setTimeout(() => setSaveNotification({ show: false, isAdding: wasAdding }), 3000);
  };

  const scrollToIngredients = () => {
    // First switch to ingredients tab
    setActiveTab('ingredients');
    // Then scroll to the tabs section after a brief delay for tab change
    setTimeout(() => {
      const tabsSection = document.querySelector('.bg-cream.py-16');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Product not found guard
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-search-line text-5xl text-blush mb-4 block"></i>
          <h1 className="text-2xl font-serif text-deep mb-2">Product Not Found</h1>
          <p className="text-warm-gray mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/discover" className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

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
            <button onClick={() => setShowComparison(false)} aria-label="Close" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blush/30 transition-colors focus-visible:ring-2 focus-visible:ring-primary">
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
                        {selectedRetailers.map((retailer) => (<td key={retailer.id} className="p-4"><span className="text-deep">At checkout</span></td>))}
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
      
      {/* Save Notification Popup */}
      {saveNotification.show && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 motion-safe:animate-fade-in">
          <i className={`${saveNotification.isAdding ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          <div>
            <p className="font-medium">{saveNotification.isAdding ? 'Saved to Products' : 'Removed from Saved'}</p>
            <p className="text-sm text-white/80">{product.name}</p>
          </div>
        </div>
      )}

      <main className="flex-1 pt-24">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center space-x-2 text-sm text-warm-gray">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <i className="ri-arrow-right-s-line text-blush"></i>
            <Link to="/discover" className="hover:text-primary transition-colors">Discover</Link>
            <i className="ri-arrow-right-s-line text-blush"></i>
            <span className="text-deep font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

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

              <div className="border-t border-b border-blush py-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-deep">{product.priceRange}</span>
                  <span className="text-xs text-warm-gray">+ shipping & taxes (estimated at checkout)</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.inStock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-coral/10 text-coral text-xs font-medium rounded-full">
                      <i className="ri-checkbox-circle-fill"></i>In Stock
                    </span>
                  )}
                  <button
                    onClick={() => document.getElementById('where-to-buy-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-xs text-primary hover:text-dark underline cursor-pointer"
                  >
                    Check where to buy
                  </button>
                </div>
              </div>

              <p className="text-base text-warm-gray leading-relaxed">{product.description}</p>

              {/* Key Ingredients */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-deep">Key Ingredients</h3>
                  <button onClick={scrollToIngredients} className="text-xs text-primary hover:text-dark underline whitespace-nowrap">View full Ingredients</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keyIngredients.map((ingredient, index) => {
                    const isMatchingIngredient = matchesIngredient(ingredient, userConcerns);

                    return (
                      <span key={index} className={`px-3 py-1 text-xs font-medium rounded-full border ${isMatchingIngredient ? 'bg-light/30 text-primary-700 border-primary-300' : 'bg-cream text-warm-gray border-transparent'}`}>
                        {isMatchingIngredient && <i className="ri-check-line mr-0.5"></i>}
                        {ingredient}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Suitable For */}
              {(() => {
                const normalized = normalizeSkinTypes(productFromMock?.skinTypes || ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']);
                const displayTypes = normalized.some(isAllMetadata)
                  ? normalized.filter(isAllMetadata)
                  : normalized;
                return displayTypes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-deep mb-2">Suitable For</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {displayTypes.map((type, idx) => {
                        const isMatch = isSkinTypeMatch(type, userSkinType);
                        return (
                          <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${isMatch ? 'bg-light/30 text-primary-700 border-primary-300' : 'bg-blush/30 text-warm-gray border-transparent'}`}>
                            {isMatch && <i className="ri-check-line mr-0.5"></i>}
                            {getMetadataDisplayLabel(type, 'skinType')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Addresses */}
              {productFromMock?.concerns && productFromMock.concerns.length > 0 && (() => {
                const displayConcerns = productFromMock.concerns.some(isAllMetadata)
                  ? productFromMock.concerns.filter(isAllMetadata)
                  : productFromMock.concerns;
                return (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-deep mb-2">Addresses</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {displayConcerns.map((concern, idx) => {
                        const isMatchingConcern = matchesConcern(concern, userConcerns);
                        return (
                          <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border capitalize ${isMatchingConcern ? 'bg-light/30 text-primary-700 border-primary-300' : 'bg-blush/30 text-warm-gray border-transparent'}`}>
                            {isMatchingConcern && <i className="ri-check-line mr-0.5"></i>}
                            {getMetadataDisplayLabel(concern, 'concern')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Preferences */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-deep mb-2">Preferences</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const prefLabels: Record<string, string> = {
                      chemicalFree: 'Chemical-Free', vegan: 'Vegan', plantBased: 'Plant-Based',
                      fragranceFree: 'Fragrance-Free', glutenFree: 'Gluten-Free', alcoholFree: 'Alcohol-Free',
                      siliconeFree: 'Silicone-Free', crueltyFree: 'Cruelty-Free',
                    };
                    const mockPrefs = productFromMock?.preferences || {};
                    const productPreferences = Object.entries(prefLabels)
                      .map(([key, label]) => ({
                        key, label, value: mockPrefs[key as keyof typeof mockPrefs] ?? false,
                      }))
                      .filter((pref) => pref.value === true);
                    return productPreferences.map((pref) => {
                      const isMatching = userPreferences[pref.key] === true;
                      return (
                        <span key={pref.key} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isMatching ? 'bg-light/30 text-primary-700 border-primary-300 font-medium' : 'bg-cream text-warm-gray'}`}>
                          {isMatching && <i className="ri-check-line mr-0.5"></i>}
                          {pref.label}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Environment Fit */}
              <div id="section-environment" className="mb-4">
                <h3 className="text-sm font-semibold text-deep mb-2">Environment Fit</h3>
                {env && env.source !== 'mock' ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {envLocationDisplay && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-light/30 text-primary-700 border border-primary-300">
                          <i className="ri-map-pin-line"></i>
                          {envLocationDisplay}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-warm-gray italic">
                        {env.source === 'live'
                          ? 'Personalized for your local conditions'
                          : 'Partially personalized based on your saved location'}
                      </span>
                      <button
                        onClick={() => setShowLocationModal(true)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-dark transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                        aria-label="Learn more about how your location affects product recommendations"
                      >
                        <i className="ri-question-line"></i>
                        <span className="underline">Learn more</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-cream text-warm-gray border border-transparent">
                      <i className="ri-map-pin-line"></i>
                      No location set
                    </span>
                    <span className="text-xs text-warm-gray italic">Add your location for personalized environmental insights</span>
                    {user ? (
                      <Link
                        to="/settings?tab=location"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-dark font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                      >
                        <i className="ri-settings-3-line"></i>
                        Update in Settings
                      </Link>
                    ) : (
                      <Link
                        to="/auth/signup"
                        onClick={() => localStorage.setItem('postAuthRedirect', '/settings?tab=location')}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-dark font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                      >
                        <i className="ri-user-add-line"></i>
                        Sign Up
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Safety Assessment */}
              {(() => {
                const safety = assessProductSafety(keyIngredients || [], getUserProfile());
                return safety.level !== 'safe' ? (
                  <div className="mb-4">
                    <SafetyBadge result={safety} />
                  </div>
                ) : null;
              })()}

              {/* AI Explain Panel */}
              {productFromMock && (
                <div className="mb-4">
                  <AIExplainPanel
                    product={productFromMock}
                    environment={env}
                    evidence={{
                      environmentFit: envFit ? { explanation: envFit.explanation, disclaimer: envFit.disclaimer } : undefined,
                      reviewerEvidence: reviewerEvidence ? { count: reviewerEvidence.matchCount, detail: reviewerEvidence.detail } : undefined,
                    }}
                  />
                </div>
              )}

              {/* Location Explanation Modal */}
              {showLocationModal && env && seasonalModalContent && (
                <EnvironmentFitModal
                  content={seasonalModalContent}
                  season={env.season}
                  env={env}
                  userSkinType={userSkinType || undefined}
                  product={productFromMock || undefined}
                  reviewerEvidence={reviewerEvidence}
                  userProfile={{
                    skinType: userSkinType || undefined,
                    concerns: userConcerns.length > 0 ? userConcerns : undefined,
                    sensitivity: getEffectiveSensitivity() || undefined,
                    complexion: getEffectiveComplexion() || undefined,
                    lifestyle: getEffectiveLifestyle(),
                    preferences: getEffectivePreferences(),
                  }}
                  onSaveSeasonalNotes={(current, other) => {
                    if (!env.season) return;
                    try {
                      const stored = localStorage.getItem('seasonal_skin_notes');
                      const notes = stored ? JSON.parse(stored) : {};
                      notes[env.season] = { current, other, updatedAt: new Date().toISOString() };
                      localStorage.setItem('seasonal_skin_notes', JSON.stringify(notes));
                    } catch { /* ignore */ }
                  }}
                  onClose={() => setShowLocationModal(false)}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSaveProduct}
                  className={`font-medium py-2 px-4 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1.5 text-sm ${
                    isSaved(product.id)
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-primary hover:bg-dark text-white'
                  }`}
                >
                  <i className={`${isSaved(product.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
                  {isSaved(product.id) ? 'Saved' : 'Save Product'}
                </button>
                <button
                  onClick={scrollToReviews}
                  className="bg-white hover:bg-cream text-primary font-medium py-2 px-4 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1.5 text-sm border border-primary"
                >
                  <i className="ri-chat-3-line"></i>
                  {product.reviewCount.toLocaleString()} Reviews
                </button>
                <button
                  onClick={() => setShowComparisonPicker(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-colors bg-cream text-warm-gray hover:bg-blush border border-blush"
                  title="Compare"
                >
                  <i className="ri-scales-line"></i>
                </button>
                <button
                  onClick={() => setGuidedMode('help_me_choose')}
                  className="bg-white hover:bg-cream text-primary font-medium py-2 px-4 rounded-full transition-colors whitespace-nowrap inline-flex items-center gap-1.5 text-sm border border-primary"
                  title="Help me choose"
                >
                  <i className="ri-question-line"></i>
                  Help me choose
                </button>
              </div>
            </div>
          </div>
        </div>

        <PurchaseOptions productId={product.id} />

        {/* Tabs Section */}
        <div id="section-tabs" className="bg-cream py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-blush mb-8">
              <div className="flex gap-8 overflow-x-auto" role="tablist">
                {['overview', 'ingredients', 'how-to-use', 'reviews'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
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
              <div className="bg-white rounded-2xl p-8">
                <ProductOverview productId={product.id} />
              </div>
            )}
            {activeTab === 'ingredients' && (() => {
              const ingredientCategories = [
                {
                  category: 'Active Ingredients',
                  icon: 'ri-flask-line',
                  description: 'Targeted ingredients that address specific skin concerns',
                  ingredients: [
                    { inci: 'Ascorbic Acid (Vitamin C)', benefit: 'Brightening, antioxidant protection, collagen synthesis', concerns: ['dullness', 'dark spots', 'hyperpigmentation', 'aging'] },
                    { inci: 'Ferulic Acid', benefit: 'Boosts Vitamin C and E effectiveness, antioxidant', concerns: ['aging', 'sun damage', 'dullness'] },
                    { inci: 'Niacinamide', benefit: 'Reduces pores, evens skin tone, strengthens barrier', concerns: ['pores', 'oily', 'acne', 'uneven skin tone', 'texture'] },
                    { inci: 'Panthenol', benefit: 'Soothes irritation, supports skin barrier repair', concerns: ['sensitivity', 'dryness', 'redness', 'irritation'] },
                  ],
                },
                {
                  category: 'Hydration & Moisture',
                  icon: 'ri-drop-line',
                  description: 'Ingredients that attract and retain moisture in the skin',
                  ingredients: [
                    { inci: 'Hyaluronic Acid', benefit: 'Holds up to 1000x its weight in water, deep hydration', concerns: ['dryness', 'dehydration', 'fine lines', 'lack of hydration'] },
                    { inci: 'Sodium Hyaluronate', benefit: 'Smaller molecule form of HA, penetrates deeper layers', concerns: ['dryness', 'dehydration', 'fine lines', 'lack of hydration'] },
                    { inci: 'Glycerin', benefit: 'Humectant that draws water to skin, prevents moisture loss', concerns: ['dryness', 'dehydration', 'lack of hydration'] },
                    { inci: 'Tocopherol (Vitamin E)', benefit: 'Antioxidant, locks in moisture, supports skin repair', concerns: ['dryness', 'aging', 'sun damage'] },
                  ],
                },
                {
                  category: 'Botanical Extracts',
                  icon: 'ri-leaf-line',
                  description: 'Plant-derived ingredients with soothing and protective properties',
                  ingredients: [
                    { inci: 'Aloe Barbadensis Leaf Juice', benefit: 'Calms and soothes skin, lightweight hydration', concerns: ['sensitivity', 'redness', 'irritation'] },
                    { inci: 'Chamomilla Recutita (Matricaria) Flower Extract', benefit: 'Anti-inflammatory, calms redness and irritation', concerns: ['sensitivity', 'redness', 'irritation'] },
                    { inci: 'Camellia Sinensis Leaf Extract', benefit: 'Green tea antioxidant, protects against free radicals', concerns: ['aging', 'dullness', 'sun damage'] },
                    { inci: 'Citrus Aurantium Dulcis (Orange) Peel Oil', benefit: 'Natural fragrance, mild antioxidant properties', concerns: [] },
                  ],
                },
                {
                  category: 'Base & Stabilizers',
                  icon: 'ri-test-tube-line',
                  description: 'Functional ingredients that ensure product stability and texture',
                  ingredients: [
                    { inci: 'Aqua (Water)', benefit: 'Solvent base for the formulation', concerns: [] },
                    { inci: 'Propanediol', benefit: 'Plant-derived solvent, enhances ingredient absorption', concerns: [] },
                    { inci: 'Xanthan Gum', benefit: 'Natural thickener, creates smooth texture', concerns: [] },
                    { inci: 'Sodium Benzoate', benefit: 'Preservative, maintains product safety', concerns: [] },
                    { inci: 'Potassium Sorbate', benefit: 'Preservative, prevents microbial growth', concerns: [] },
                    { inci: 'Citric Acid', benefit: 'pH adjuster, maintains formula stability', concerns: [] },
                  ],
                },
              ];

              const isMatchingConcern = (ingredientConcerns: string[]) => {
                return ingredientConcerns.some(c => matchesConcern(c, userConcerns));
              };

              const matchingInciNames = new Set(
                ingredientCategories.flatMap(cat =>
                  cat.ingredients.filter(ing => isMatchingConcern(ing.concerns)).map(ing => ing.inci)
                )
              );

              const inciListItems = [
                'Aqua (Water)', 'Ascorbic Acid (Vitamin C)', 'Propanediol', 'Glycerin',
                'Ferulic Acid', 'Tocopherol (Vitamin E)', 'Hyaluronic Acid', 'Panthenol',
                'Niacinamide', 'Sodium Hyaluronate', 'Aloe Barbadensis Leaf Juice',
                'Chamomilla Recutita (Matricaria) Flower Extract', 'Camellia Sinensis Leaf Extract',
                'Citrus Aurantium Dulcis (Orange) Peel Oil', 'Xanthan Gum', 'Sodium Benzoate',
                'Potassium Sorbate', 'Citric Acid',
              ];

              const toggleCategory = (name: string) => {
                setExpandedIngredientCats(prev => {
                  const next = new Set(prev);
                  if (next.has(name)) next.delete(name);
                  else next.add(name);
                  return next;
                });
              };

              return (
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-deep mb-1">Full Ingredient List</h2>
                  <p className="text-sm text-warm-gray mb-5">
                    {ingredientCategories.reduce((acc, cat) => acc + cat.ingredients.length, 0)} ingredients categorized by function.{userConcerns.length > 0 ? ' Highlighted ingredients match your skin profile.' : ''}
                  </p>

                  {/* Collapsible INCI List */}
                  <div className="mb-5">
                    <button
                      onClick={() => setShowInciList(prev => !prev)}
                      className="flex items-center gap-2 text-xs font-medium text-warm-gray hover:text-primary transition-colors cursor-pointer"
                    >
                      <i className={`ri-arrow-right-s-line transition-transform duration-200 ${showInciList ? 'rotate-90' : ''}`}></i>
                      View raw INCI list
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${showInciList ? 'max-h-40 mt-2' : 'max-h-0'}`}>
                      <p className="text-xs leading-relaxed p-3 bg-cream/50 rounded-lg border border-blush/30">
                        {inciListItems.map((name, i) => (
                          <span key={i}>
                            <IngredientLink
                              name={name}
                              className={matchingInciNames.has(name) ? 'text-primary-700 font-medium' : 'text-warm-gray'}
                            />
                            {i < inciListItems.length - 1 && <span className="text-warm-gray">, </span>}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  {/* Accordion Categories */}
                  <div className="divide-y divide-blush/30">
                    {ingredientCategories.map((cat) => {
                      const isExpanded = expandedIngredientCats.has(cat.category);
                      const matchCount = cat.ingredients.filter(ing => isMatchingConcern(ing.concerns)).length;
                      return (
                        <div key={cat.category}>
                          <button
                            onClick={() => toggleCategory(cat.category)}
                            className="w-full flex items-center gap-3 py-3.5 cursor-pointer group"
                          >
                            <span className="font-semibold text-deep text-sm flex-1 text-left">{cat.category}</span>
                            <span className="text-[11px] text-warm-gray mr-1">{cat.ingredients.length}</span>
                            {matchCount > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full mr-1">
                                {matchCount} match{matchCount > 1 ? 'es' : ''}
                              </span>
                            )}
                            <i className={`ri-arrow-down-s-line text-warm-gray group-hover:text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                          </button>

                          <div className={`overflow-hidden transition-all duration-200 origin-top ${isExpanded ? 'max-h-[600px] pb-3' : 'max-h-0'}`}>
                            <div className="space-y-1 w-fit">
                              {cat.ingredients.map((ing) => {
                                const isMatch = isMatchingConcern(ing.concerns);
                                return (
                                  <div
                                    key={ing.inci}
                                    className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
                                      isMatch ? 'bg-light/30' : ''
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium leading-tight ${isMatch ? 'text-primary-700' : 'text-deep'}`}>
                                        {isMatch && <i className="ri-check-line mr-1 text-xs"></i>}
                                        <IngredientLink name={ing.inci} className={isMatch ? 'text-primary-700' : 'text-deep'} />
                                      </p>
                                      <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">{ing.benefit}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {productFromMock && (
                  <AIReviewSummary
                    product={productFromMock}
                    reviews={getReviewsForProduct(productFromMock.id)}
                    environment={env}
                  />
                )}
                <div className="bg-white rounded-2xl p-8">
                  <ProductReviews productId={product.id} product={productFromMock || undefined} env={env} season={env?.season} />
                </div>
              </div>
            )}
          </div>
        </div>

        <SimilarProducts productId={product.id} />
        <CompatibleWith productId={product.id} />
      </main>


      {/* Comparison Picker Modal */}
      <ComparisonPickerModal
        isOpen={showComparisonPicker}
        onClose={() => setShowComparisonPicker(false)}
        initialProductId={product.id}
        userConcerns={userConcerns}
      />

      {/* Guided Assistant Panel */}
      {guidedMode && (
        <GuidedAssistantPanel
          mode={guidedMode}
          initialProductIds={[product.id]}
          onClose={() => setGuidedMode(null)}
        />
      )}

      {/* Floating AI Product Guide */}
      {productFromMock && env && (
        <ProductGuideChat
          chatContext={{
            product: productFromMock,
            env,
            userSkinType: userSkinType || undefined,
            userConcerns: userConcerns.length > 0 ? userConcerns : undefined,
            userSensitivity: getEffectiveSensitivity() || undefined,
            reviews: reviewerEvidence?.scoredReviews || [],
          }}
          onNavigate={(target) => {
            // Handle tab-based navigation targets
            if (target.sectionId === 'section-reviews-tab') {
              scrollToReviews();
            } else if (target.sectionId === 'section-ingredients-tab') {
              scrollToIngredients();
            } else {
              // Generic section scroll
              const el = document.getElementById(target.sectionId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }}
        />
      )}

    </div>
  );
}
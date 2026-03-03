import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productData } from '../../../mocks/products';
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import { getEffectiveSkinType, getEffectivePreferences } from '../../../lib/utils/sessionState';
import { normalizeSkinTypes, isSkinTypeMatch } from '../../../lib/utils/productMetadata';
import type { Product } from '../../../types/product';
import { useSavedProducts } from '../../../lib/utils/favoritesState';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';
import Dropdown from '../../../components/ui/Dropdown';
import SafetyBadge from '../../../components/feature/SafetyBadge';
import { assessProductSafety, getUserProfile } from '../../../lib/utils/productSafety';
import { classifyTimeOfDay } from '../../../lib/utils/classifyTimeOfDay';
import { PRODUCT_CATEGORIES } from '../../../lib/utils/categoryRegistry';
import AIInsightBlock from '../../../components/feature/AIInsightBlock';
import { buildAIContext } from '../../../lib/ai/surfaceContext';

/**
 * ProductCatalog Component
 * 
 * MOBILE FIXES APPLIED:
 * - Responsive grid gaps (smaller on xs screens)
 * - Better spacing on very small devices (375px)
 * - Safe area support for comparison bar
 */

const skinTypes = [
  { value: 'all', label: 'All Skin Types' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Sensitive' },
];

const preferenceLabels: Record<string, string> = {
  vegan: 'Vegan',
  crueltyFree: 'Cruelty-Free',
  fragranceFree: 'Fragrance-Free',
  glutenFree: 'Gluten-Free',
  alcoholFree: 'Alcohol-Free',
  siliconeFree: 'Silicone-Free',
  plantBased: 'Plant-Based',
  chemicalFree: 'Chemical-Free',
};

interface ProductCatalogProps {
  userConcerns: string[];
  compareList?: Product[];
  setCompareList?: React.Dispatch<React.SetStateAction<Product[]>>;
  onOpenComparison: () => void;
  onStartQuiz: () => void;
  onProductClick: (productId: number) => void;
  onSaveProduct: (productId: number) => void;
  onFilterChange: (filterType: string, value: any) => void;
}

export default function ProductCatalog({
  userConcerns,
  compareList,
  setCompareList,
  onOpenComparison,
  onStartQuiz,
  onProductClick,
  onSaveProduct,
  onFilterChange,
}: ProductCatalogProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Saved products for reactive updates
  const { isSaved, toggleSaved } = useSavedProducts();

  // Persisted filter and sort preferences
  const [selectedCategory, setSelectedCategory] = useLocalStorageState<string>(
    'discover_filter_category',
    'all'
  );
  const [sortBy, setSortBy] = useLocalStorageState<string>(
    'discover_sort_by',
    'rating'
  );
  const [selectedSkinType, setSelectedSkinType] = useLocalStorageState<string>(
    'discover_filter_skin_type',
    'all'
  );

  // Migrate old 'popular' sort value to 'rating'
  useEffect(() => {
    if (sortBy === 'popular') {
      setSortBy('rating');
    }
  }, []);
  const [timeOfDay, setTimeOfDay] = useLocalStorageState<string>(
    'discover_filter_time_of_day',
    'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Save notification state
  const [saveNotification, setSaveNotification] = useState<{ show: boolean; productName: string; isAdding: boolean }>({ show: false, productName: '', isAdding: true });

  // Safe fallback for compareList to prevent undefined errors
  const safeCompareList = compareList ?? [];

  // Derive showCompareBar from safeCompareList length
  const showCompareBar = safeCompareList.length > 0;

  // Comparison bar state: minimize toggle and scroll-based translucency
  const [isCompareBarMinimized, setIsCompareBarMinimized] = useLocalStorageState<boolean>(
    'discover_compare_bar_minimized',
    false
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const compareBarRef = useRef<HTMLDivElement>(null);

  // Compare highlight state (triggered from homepage "Product Comparison" card)
  const [showCompareHighlight, setShowCompareHighlight] = useState(false);
  const firstProductRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('highlight') === 'compare') {
      setShowCompareHighlight(true);
      // Clean up URL param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('highlight');
      window.history.replaceState({}, '', `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`);
      // Scroll to first product after a brief delay
      setTimeout(() => {
        firstProductRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowCompareHighlight(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Safe fallback for userConcerns
  const safeUserConcerns = userConcerns ?? [];

  // Detect scroll for translucent background effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle category from URL params (from homepage CTAs)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const products = productData;

  // Determine the active skin type filter:
  // If user completed survey, auto-filter by their profile skin type;
  // otherwise use the dropdown selection.
  const effectiveSkinType = getEffectiveSkinType();
  const activeSkinTypeFilter = effectiveSkinType || selectedSkinType;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.keyIngredients.some((ing) =>
          ing.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesSkinType =
        activeSkinTypeFilter === 'all' ||
        normalizeSkinTypes(product.skinTypes).some(
          (st) => isSkinTypeMatch(st, activeSkinTypeFilter)
        );
      const productTimeOfDay = product.timeOfDay ?? classifyTimeOfDay(product);
      const matchesTimeOfDay =
        timeOfDay === 'all' ||
        productTimeOfDay.includes(timeOfDay as 'am' | 'pm');

      return matchesCategory && matchesSearch && matchesSkinType && matchesTimeOfDay;
    });
  }, [products, selectedCategory, searchQuery, activeSkinTypeFilter, timeOfDay]);

  // Concern matching using the matching utility with synonym support
  const matchedProducts = useMemo(() => {
    if (!safeUserConcerns || safeUserConcerns.length === 0) return [];

    return filteredProducts.filter((product) =>
      productMatchesUserConcerns(product.concerns, safeUserConcerns)
    );
  }, [filteredProducts, safeUserConcerns]);

  const otherProducts = useMemo(() => {
    return filteredProducts.filter(
      (product) => !matchedProducts.some((m) => m.id === product.id)
    );
  }, [filteredProducts, matchedProducts]);

  // Final sorting (price, rating, saved)
  const sortProducts = (productList: Product[]) => {
    return [...productList].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'favorites':
          // Saved first, then by rating
          const aSaved = isSaved(a.id) ? 1 : 0;
          const bSaved = isSaved(b.id) ? 1 : 0;
          if (bSaved !== aSaved) return bSaved - aSaved;
          return b.rating - a.rating;
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });
  };

  const sortedMatchedProducts = useMemo(
    () => sortProducts(matchedProducts),
    [matchedProducts, sortBy]
  );

  const sortedOtherProducts = useMemo(
    () => sortProducts(otherProducts),
    [otherProducts, sortBy]
  );

  // AI search insight — only active when the user has typed a search query
  const searchAIContext = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const allResults = [...sortedMatchedProducts, ...sortedOtherProducts];
    if (allResults.length === 0) return null;
    return buildAIContext('search', {
      page: {
        mode: 'search',
        query: searchQuery,
        results: allResults.slice(0, 10),
      },
    });
  }, [searchQuery, sortedMatchedProducts, sortedOtherProducts]);

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

  // Check if product is in compare list (using safe list)
  const isInCompareList = (productId: number) => {
    return safeCompareList.some((p) => p.id === productId);
  };

  // Check if product is recommended using synonym-aware matching
  const isProductRecommended = (product: Product) => {
    return productMatchesUserConcerns(product.concerns, safeUserConcerns);
  };

  const handleAddToCompare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Guard: only proceed if setCompareList is provided
    if (!setCompareList) return;
    
    if (isInCompareList(product.id)) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
    } else if (safeCompareList.length < 3) {
      setCompareList((prev) => [...prev, product]);
    }
  };

  const handleClearCompare = () => {
    // Guard: only proceed if setCompareList is provided
    if (!setCompareList) return;
    setCompareList([]);
  };

  const handleCompareAll = () => {
    onOpenComparison();
  };

  // Render a single product card
  const renderProductCard = (product: Product, highlightCompare = false) => {
    const isRecommended = isProductRecommended(product);
    const isSelected = isInCompareList(product.id);

    return (
      <div
        key={product.id}
        onClick={() => navigate(`/product-detail?id=${product.id}`)}
        className={`
          bg-white rounded-2xl overflow-hidden transition-[transform,box-shadow] duration-300 group cursor-pointer relative hover:-translate-y-1 transform-gpu
          ${
            isRecommended
              ? 'ring-2 ring-primary ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)]'
              : 'shadow-md hover:shadow-xl border border-blush'
          }
        `}
      >
        {isRecommended && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full shadow z-10">
            Best Match
          </span>
        )}

        {/* Action Buttons - Horizontal Layout */}
        <div className="absolute top-3 right-3 flex flex-row items-center gap-2 z-10">
          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const wasAlreadySaved = isSaved(product.id);
              toggleSaved({
                id: product.id,
                name: product.name,
                brand: product.brand,
                image: product.image,
                priceRange: `$${(product.price * 0.9).toFixed(2)} - $${(product.price * 1.1).toFixed(2)}`,
                category: product.category,
                skinTypes: product.skinTypes,
              });
              setSaveNotification({ show: true, productName: product.name, isAdding: !wasAlreadySaved });
              setTimeout(() => setSaveNotification({ show: false, productName: '', isAdding: true }), 3000);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isSaved(product.id)
                ? 'bg-primary text-white'
                : 'bg-white text-warm-gray hover:bg-light/30 hover:text-primary'
            }`}
            title={isSaved(product.id) ? 'Remove from saved' : 'Save product'}
            aria-label={isSaved(product.id) ? `Remove ${product.name} from saved` : `Save ${product.name}`}
            aria-pressed={isSaved(product.id)}
          >
            <i className={`${isSaved(product.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          </button>

          {/* Comparison Button */}
          {(() => {
            const isMaxReached = safeCompareList.length >= 3 && !isSelected;
            return (
              <div className="relative">
                <button
                  onClick={(e) => !isMaxReached && handleAddToCompare(product, e)}
                  disabled={isMaxReached}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    highlightCompare
                      ? 'ring-4 ring-primary/50 animate-pulse '
                      : ''
                  }${
                    isSelected
                      ? 'bg-primary text-white cursor-pointer'
                      : isMaxReached
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-warm-gray hover:bg-light/30 cursor-pointer'
                  }`}
                  title={isSelected ? 'Remove from comparison' : isMaxReached ? 'Maximum 3 products' : 'Add to comparison'}
                  aria-label={isSelected ? `Remove ${product.name} from comparison` : isMaxReached ? 'Maximum 3 products reached' : `Add ${product.name} to comparison`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? (
                    <i className="ri-check-line text-xl"></i>
                  ) : (
                    <i className="ri-scales-line text-xl"></i>
                  )}
                </button>
                {highlightCompare && (
                  <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-deep text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-20">
                    Tap to compare products
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-deep rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Product Image */}
        <div className="relative w-full h-80 overflow-hidden bg-cream">
          <img
            src={product.image || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 transform-gpu"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-deep font-semibold rounded-full text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Category Label */}
          <div className="absolute bottom-4 left-4">
            <span className="px-2.5 py-1 text-xs font-medium bg-white/90 text-deep-900 rounded-full capitalize shadow-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 xs:p-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
            {product.brand}
          </p>

          <h3 className="text-base xs:text-lg font-semibold text-deep mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
            <span className="text-sm font-medium text-warm-gray">{product.rating}</span>
            <span className="text-sm text-warm-gray/80">({product.reviewCount})</span>
          </div>

          <p className="text-sm text-warm-gray mb-3 line-clamp-1">{product.description}</p>

          {/* Concerns - with highlighting for matching concerns */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-warm-gray mb-1.5">Addresses:</p>
            <div className="flex flex-wrap gap-1">
              {product.concerns.slice(0, 3).map((concern, idx) => {
                const isMatchingConcern = productMatchesUserConcerns([concern], safeUserConcerns);

                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded-full border capitalize ${
                      isMatchingConcern
                        ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                        : 'bg-cream text-warm-gray border-blush'
                    }`}
                  >
                    {isMatchingConcern && <i className="ri-check-line mr-0.5"></i>}
                    {concern}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Key Ingredients */}
          {product.keyIngredients && product.keyIngredients.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-warm-gray mb-1.5">Key Ingredients:</p>
              <div className="flex flex-wrap gap-1">
                {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                  const isMatch = matchesIngredient(ingredient, safeUserConcerns);
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        isMatch
                          ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                          : 'bg-cream text-warm-gray border-blush'
                      }`}
                    >
                      {isMatch && <i className="ri-check-line mr-0.5"></i>}
                      {ingredient}
                    </span>
                  );
                })}
              </div>

              {/* Safety Warning */}
              {(() => {
                const safety = assessProductSafety(product.keyIngredients || [], getUserProfile());
                return safety.level !== 'safe' ? <SafetyBadge result={safety} compact /> : null;
              })()}
            </div>
          )}

          {/* Preferences */}
          {product.preferences && Object.values(product.preferences).some(v => v === true) && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-warm-gray mb-1.5">Preferences:</p>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const userPrefs = getEffectivePreferences();
                  return Object.entries(product.preferences)
                    .filter(([_, value]) => value === true)
                    .slice(0, 3)
                    .map(([key]) => {
                      const isPrefMatch = userPrefs[key] === true;
                      return (
                        <span
                          key={key}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            isPrefMatch
                              ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                              : 'bg-cream text-warm-gray border-blush'
                          }`}
                        >
                          {isPrefMatch && <i className="ri-check-line mr-0.5"></i>}
                          {preferenceLabels[key] || key}
                        </span>
                      );
                    });
                })()}
              </div>
            </div>
          )}

          {/* Skin Types */}
          {(() => {
            const normalized = normalizeSkinTypes(product.skinTypes);
            const userSkinType = getEffectiveSkinType();
            return normalized.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-warm-gray mb-1.5">Skin Types:</p>
                <div className="flex flex-wrap gap-1">
                  {normalized.slice(0, 3).map((type, idx) => {
                    const isMatch = isSkinTypeMatch(type, userSkinType);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 text-xs rounded-full capitalize border ${
                          isMatch
                            ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                            : 'bg-cream text-warm-gray border-blush'
                        }`}
                      >
                        {isMatch && <i className="ri-check-line mr-0.5"></i>}
                        {type}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-4 border-t border-blush">
            <div>
              <p className="text-xs text-warm-gray/80 mb-1">Estimated price range</p>
              <span className="text-lg xs:text-xl font-bold text-deep">
                ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    /* FIXED: Added responsive padding for mobile - px-4 on small screens */
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-serif text-deep mb-4 sm:mb-6">
          Discover What's For You
        </h1>
        <p className="text-base sm:text-xl text-warm-gray max-w-3xl mx-auto mb-6 sm:mb-8">
          Discover products that truly fit your skin profile, compare them side‑by‑side, and shop confidently through reputable retailers vetted by our community
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-2xl mx-auto">
          <label htmlFor="discover-search" className="sr-only">
            Search products
          </label>

          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-warm-gray/60"></i>

          <input
            id="discover-search"
            name="search"
            type="text"
            placeholder="Search products, brands, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-full border-2 border-blush focus:border-primary focus:outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Category Toggle + Dropdown */}
      <div className="relative mb-4 sm:mb-6">
        <button
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-blush hover:border-primary/30 transition-colors cursor-pointer shadow-sm"
        >
          <i className="ri-grid-line text-base text-primary"></i>
          <span className="text-sm font-semibold text-deep">Categories</span>
          <i className={`ri-arrow-${isCategoriesOpen ? 'up' : 'down'}-s-line text-lg text-warm-gray`}></i>
        </button>

        {/* Dropdown panel — overlays content */}
        {isCategoriesOpen && (
          <>
            {/* Backdrop to close on outside click */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsCategoriesOpen(false)}
            />

            {/* Mobile: wrapped pills */}
            <div className="absolute left-0 top-full mt-2 z-40 bg-white rounded-2xl border border-blush/30 shadow-lg p-4 w-full sm:w-auto lg:hidden">
              <div className="flex flex-wrap gap-2 xs:gap-3">
                {PRODUCT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      onFilterChange('category', category.value);
                      setIsCategoriesOpen(false);
                    }}
                    aria-pressed={selectedCategory === category.value}
                    className={`flex items-center space-x-2 px-3 xs:px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                    }`}
                  >
                    <i className={`${category.icon} text-base`}></i>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: vertical list */}
            <div className="hidden lg:block absolute left-0 top-full mt-2 z-40 bg-white rounded-2xl border border-blush/30 shadow-lg p-3 w-56">
              <div className="space-y-1">
                {PRODUCT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      onFilterChange('category', category.value);
                      setIsCategoriesOpen(false);
                    }}
                    aria-pressed={selectedCategory === category.value}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white'
                        : 'text-warm-gray hover:bg-cream hover:text-deep'
                    }`}
                  >
                    <i className={`${category.icon} text-base`}></i>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 sm:mb-8">
        {/* Time of Day & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">

          {/* Skin Type + Time of Day + Compare */}
          <div className="flex flex-col xs:flex-row items-start xs:items-end gap-3 xs:gap-4 w-full sm:w-auto">

            {/* Skin Type — dropdown if no survey, label if survey completed */}
            <div className="w-full xs:w-auto">
              <label
                className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1.5"
              >
                Skin Type
              </label>
              {effectiveSkinType ? (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 bg-light/30 border border-primary-300 rounded-full text-sm font-medium text-primary-700 min-w-[150px]"
                  title="Based on your skin survey"
                >
                  <i className="ri-check-line text-base"></i>
                  Filtered for {effectiveSkinType}
                </div>
              ) : (
                <Dropdown
                  id="filter-skin-type"
                  name="skinType"
                  value={selectedSkinType}
                  onChange={(value) => {
                    setSelectedSkinType(value);
                    onFilterChange('skinType', value);
                  }}
                  options={skinTypes}
                  className="min-w-[150px]"
                />
              )}
            </div>

            {/* Time of Day */}
            <div className="w-full xs:w-auto">
              <label
                htmlFor="filter-time-of-day"
                className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1.5"
              >
                Time of Day
              </label>
              <Dropdown
                id="filter-time-of-day"
                name="timeOfDay"
                value={timeOfDay}
                onChange={(value) => {
                  setTimeOfDay(value)
                  onFilterChange('timeOfDay', value)
                }}
                options={[
                  { value: 'all', label: 'All Times' },
                  { value: 'am', label: 'AM (Morning)' },
                  { value: 'pm', label: 'PM (Evening)' },
                ]}
                className="min-w-[150px]"
              />
            </div>

            {/* Compare CTA */}
            <div className="w-full xs:w-auto flex flex-col items-center -mt-8">
              <label className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1.5">
                Compare
              </label>
              <button
                onClick={handleCompareAll}
                title="Compare Products"
                aria-label="Compare Products"
                className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-white border border-blush text-warm-gray hover:border-primary/50 hover:bg-cream/30 hover:text-primary transition-all cursor-pointer"
              >
                <i className="ri-scales-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Sort + Reset */}
          <div className="flex items-end gap-4">
            {/* Sort */}
            <div className="w-full xs:w-auto">
              <label
                htmlFor="filter-sort-by"
                className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1.5"
              >
                Sort By
              </label>
              <Dropdown
                id="filter-sort-by"
                name="sortBy"
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value)
                  onFilterChange('sortBy', value)
                }}
                options={[
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'favorites', label: 'Saved First' },
                ]}
                className="min-w-[170px]"
              />
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' || timeOfDay !== 'all' || sortBy !== 'rating' || searchQuery !== '' || (!effectiveSkinType && selectedSkinType !== 'all')) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setTimeOfDay('all');
                  setSortBy('rating');
                  setSearchQuery('');
                  if (!effectiveSkinType) setSelectedSkinType('all');
                  onFilterChange('category', 'all');
                  onFilterChange('timeOfDay', 'all');
                  onFilterChange('sortBy', 'rating');
                  onFilterChange('skinType', 'all');
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-warm-gray hover:text-deep transition-colors cursor-pointer whitespace-nowrap"
                title="Reset all filters to defaults"
              >
                <i className="ri-refresh-line text-base"></i>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm text-warm-gray">
          Showing{' '}
          <span className="font-semibold text-deep">
            {sortedMatchedProducts.length + sortedOtherProducts.length}
          </span>{' '}
          products
          {safeUserConcerns.length > 0 && sortedMatchedProducts.length > 0 && (
            <span className="text-primary ml-2">
              ({sortedMatchedProducts.length} recommended for your concerns)
            </span>
          )}
        </p>
      </div>

      {/* AI Search Insight */}
      {searchAIContext && (
        <div className="mb-6">
          <AIInsightBlock context={searchAIContext} compact />
        </div>
      )}

      {/* Recommended for You Section */}
      {sortedMatchedProducts.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 xs:gap-3 mb-4 flex-wrap">
            <h2 className="text-lg xs:text-xl font-semibold text-primary-700">Recommended for You</h2>
            <span className="px-2 xs:px-3 py-1 bg-light/30 text-primary-700 text-xs xs:text-sm rounded-full">
              Based on your skin concerns
            </span>
          </div>
          {/* FIXED: Responsive grid gaps - smaller on xs screens */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {sortedMatchedProducts.map((product, idx) => (
              <div key={product.id} ref={idx === 0 ? firstProductRef : undefined}>
                {renderProductCard(product, idx === 0 && showCompareHighlight)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Divider between recommended and other products */}
      {sortedMatchedProducts.length > 0 && sortedOtherProducts.length > 0 && (
        <div className="border-t border-blush my-8 sm:my-10 pt-6">
          <h2 className="text-lg xs:text-xl font-semibold text-warm-gray mb-4">More Products</h2>
        </div>
      )}

      {/* Main Product Grid */}
      {/* FIXED: Responsive grid with smaller gaps on mobile */}
      <div
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-4 sm:gap-6"
        data-product-shop
      >
        {sortedOtherProducts.map((product, idx) => (
          <div key={product.id} ref={sortedMatchedProducts.length === 0 && idx === 0 ? firstProductRef : undefined}>
            {renderProductCard(product, sortedMatchedProducts.length === 0 && idx === 0 && showCompareHighlight)}
          </div>
        ))}
      </div>

      {/* No Results */}
      {sortedMatchedProducts.length + sortedOtherProducts.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-cream rounded-full mx-auto mb-4">
            <i className="ri-search-line text-3xl sm:text-4xl text-warm-gray/60"></i>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-deep mb-2">No products found</h3>
          <p className="text-warm-gray mb-6">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setTimeOfDay('all');
              setSortBy('rating');
              if (!effectiveSkinType) setSelectedSkinType('all');
            }}
            className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-all whitespace-nowrap cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Comparison Bar */}
      {/* FIXED: Added iOS safe area bottom padding */}
      {showCompareBar && (
        <div
          ref={compareBarRef}
          role="region"
          aria-label="Product comparison bar"
          aria-live="polite"
          className={`
            fixed bottom-0 left-0 right-0 z-50
            border-t-2 border-primary shadow-2xl
            transition-all duration-300 ease-out
            motion-safe:animate-slide-up
            ${isScrolled ? 'bg-white/90 backdrop-blur-md' : 'bg-white'}
            ${isCompareBarMinimized ? 'py-2' : ''}
          `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Minimize Toggle Button */}
          <button
            onClick={() => setIsCompareBarMinimized(!isCompareBarMinimized)}
            aria-expanded={!isCompareBarMinimized}
            aria-controls="compare-bar-content"
            aria-label={isCompareBarMinimized ? 'Expand comparison bar' : 'Minimize comparison bar'}
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary hover:bg-dark text-white rounded-t-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <i className={`ri-arrow-${isCompareBarMinimized ? 'up' : 'down'}-s-line text-lg transition-transform`} aria-hidden="true"></i>
          </button>

          <div
            id="compare-bar-content"
            className={`
              max-w-7xl mx-auto px-4 sm:px-6
              transition-all duration-300 ease-out
              ${isCompareBarMinimized ? 'py-1 opacity-90' : 'py-3 sm:py-4'}
            `}
          >
            {/* Minimized State */}
            {isCompareBarMinimized ? (
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <i className="ri-scales-3-line text-primary" aria-hidden="true"></i>
                  <span className="text-sm font-medium text-deep">
                    {safeCompareList.length} products to compare
                  </span>
                </div>
                <button
                  onClick={onOpenComparison}
                  disabled={safeCompareList.length < 2}
                  aria-label={safeCompareList.length < 2 ? 'Select at least 2 products to compare' : `Compare ${safeCompareList.length} products`}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    safeCompareList.length >= 2
                      ? 'bg-primary text-white hover:bg-dark cursor-pointer'
                      : 'bg-gray-300 text-warm-gray/80 cursor-not-allowed'
                  }`}
                >
                  Compare
                </button>
              </div>
            ) : (
              /* Expanded State */
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-light/30 rounded-full"
                      aria-hidden="true"
                    >
                      <i className="ri-scales-3-line text-lg sm:text-xl text-primary"></i>
                    </div>
                    <div>
                      <h3 id="compare-bar-title" className="font-semibold text-deep text-sm sm:text-base">
                        Compare Products
                      </h3>
                      <p className="text-xs sm:text-sm text-warm-gray" aria-live="polite">
                        <span className="sr-only">Currently </span>
                        {safeCompareList.length} of 3 products selected
                      </p>
                    </div>
                  </div>
                  
                  {/* Product Pills - Horizontal scrollable on mobile */}
                  <div 
                    className="flex items-center space-x-2 overflow-x-auto scrollbar-hide md:overflow-visible max-w-[140px] xs:max-w-[200px] sm:max-w-[300px] md:max-w-none pb-1 md:pb-0"
                    role="list"
                    aria-label="Selected products for comparison"
                  >
                    {safeCompareList.map((product) => (
                      <div
                        key={product.id}
                        role="listitem"
                        className="flex items-center space-x-1 xs:space-x-2 px-2 xs:px-3 py-1.5 xs:py-2 bg-light/20 rounded-full flex-shrink-0"
                      >
                        <span className="text-xs xs:text-sm font-medium text-deep truncate max-w-[60px] xs:max-w-[100px] sm:max-w-[150px]">
                          {product.brand}
                        </span>
                        <button
                          onClick={(e) => handleAddToCompare(product, e)}
                          aria-label={`Remove ${product.brand} from comparison`}
                          className="w-5 h-5 flex items-center justify-center text-warm-gray/80 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          <i className="ri-close-line text-base" aria-hidden="true"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <button
                    onClick={handleClearCompare}
                    aria-label="Clear all products from comparison"
                    className="px-3 sm:px-4 py-2 text-warm-gray hover:text-deep hover:bg-cream rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onOpenComparison}
                    disabled={safeCompareList.length < 2}
                    aria-label={safeCompareList.length < 2 ? 'Select at least 2 products to compare' : `Compare ${safeCompareList.length} products`}
                    aria-disabled={safeCompareList.length < 2}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm sm:text-base ${
                      safeCompareList.length >= 2
                        ? 'bg-primary text-white hover:bg-dark shadow-md cursor-pointer'
                        : 'bg-gray-300 text-warm-gray/80 cursor-not-allowed'
                    }`}
                  >
                    Compare Now ({safeCompareList.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Notification Popup */}
      {saveNotification.show && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 motion-safe:animate-fade-in">
          <i className={`${saveNotification.isAdding ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          <div>
            <p className="font-medium">{saveNotification.isAdding ? 'Product Saved' : 'Product Removed'}</p>
            <p className="text-sm text-white/80">{saveNotification.productName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
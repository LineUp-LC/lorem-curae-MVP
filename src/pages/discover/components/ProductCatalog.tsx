import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { productCatalog } from '../../../lib/data/products';
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import { getEffectiveSkinType, getEffectivePreferences } from '../../../lib/utils/sessionState';
import { normalizeSkinTypes, isSkinTypeMatch } from '../../../lib/utils/productMetadata';
import type { Product } from '../../../types/product';
import type { DiscoveryScore } from '../../../lib/discovery/types';
import { scoreProduct, hasProfileData } from '../../../lib/discovery/scoringEngine';
import { deriveIngredientLinks, buildIngredientOptions } from '../../../lib/discovery/ingredientLinks';
import { useSavedProducts } from '../../../lib/utils/favoritesState';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';
import Dropdown from '../../../components/ui/Dropdown';
import { classifyTimeOfDay } from '../../../lib/utils/classifyTimeOfDay';
import { PRODUCT_CATEGORIES } from '../../../lib/utils/categoryRegistry';
import RoutinePickerModal from '../../../components/feature/RoutinePickerModal';
import AIDiscoveryBar from '../../../components/feature/AIDiscoveryBar';
import ProductCard_CompactB from './ProductCard_CompactB';

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

interface ProductCatalogProps {
  userConcerns: string[];
  compareList?: Product[];
  setCompareList?: React.Dispatch<React.SetStateAction<Product[]>>;
  onOpenComparison: () => void;
  onFilterChange: (filterType: string, value: any) => void;
}

export default function ProductCatalog({
  userConcerns,
  compareList,
  setCompareList,
  onOpenComparison,
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
  const [selectedIngredients, setSelectedIngredients] = useLocalStorageState<string[]>(
    'discover_filter_ingredients',
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);

  // Save notification state
  const [saveNotification, setSaveNotification] = useState<{ show: boolean; productName: string; isAdding: boolean; productData?: any }>({ show: false, productName: '', isAdding: true });
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [routinePickerProduct, setRoutinePickerProduct] = useState<any>(null);

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

  const products = productCatalog;

  // Ingredient links derived from product keyIngredients (deterministic, no Supabase needed)
  const ingredientLinks = useMemo(() => deriveIngredientLinks(products), [products]);
  const ingredientOptions = useMemo(
    () => buildIngredientOptions(products, ingredientLinks),
    [products, ingredientLinks],
  );

  // Sort ingredient options: profile-relevant first (with flag), then rest by product count
  const sortedIngredientOptions = useMemo(() => {
    if (safeUserConcerns.length === 0) return ingredientOptions.map(o => ({ ...o, isRelevant: false }));
    return ingredientOptions
      .map(o => ({ ...o, isRelevant: matchesIngredient(o.label, safeUserConcerns) }))
      .sort((a, b) => {
        if (a.isRelevant !== b.isRelevant) return a.isRelevant ? -1 : 1;
        return b.productCount - a.productCount;
      });
  }, [ingredientOptions, safeUserConcerns]);

  // Determine the active skin type filter:
  // If user completed survey, auto-filter by their profile skin type;
  // otherwise use the dropdown selection.
  const effectiveSkinType = getEffectiveSkinType();
  const activeSkinTypeFilter = effectiveSkinType || selectedSkinType;

  // Profile flag — used to gate "Best Match" sort option for guests
  const hasProfile = !!(effectiveSkinType || safeUserConcerns.length > 0);

  // Sort guard: guests cannot use "relevance"; profiled users default to it
  useEffect(() => {
    if (sortBy === 'relevance' && !hasProfile) setSortBy('rating');
    if (sortBy === 'rating' && hasProfile) setSortBy('relevance');
  }, [hasProfile]);

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

      // Ingredient filter: product must contain at least one selected slug (OR logic)
      const matchesIngredientFilter =
        selectedIngredients.length === 0 ||
        (ingredientLinks.get(product.id) ?? []).some(slug =>
          selectedIngredients.includes(slug),
        );

      return matchesCategory && matchesSearch && matchesSkinType && matchesTimeOfDay && matchesIngredientFilter;
    });
  }, [products, selectedCategory, searchQuery, activeSkinTypeFilter, timeOfDay, selectedIngredients, ingredientLinks]);

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

  // Discovery scoring map — computed when sorting by "Best Match" with profile data
  const scoredMap = useMemo(() => {
    if (sortBy !== 'relevance') return null;
    const profile = {
      skinType: effectiveSkinType,
      concerns: safeUserConcerns,
      preferences: getEffectivePreferences(),
    };
    if (!hasProfileData(profile)) return null;

    const map = new Map<number, DiscoveryScore>();
    for (const product of filteredProducts) {
      map.set(product.id, scoreProduct(product, profile));
    }
    return map;
  }, [filteredProducts, sortBy, effectiveSkinType, safeUserConcerns]);

  // Final sorting (price, rating, saved, relevance)
  const sortProducts = (productList: Product[]) => {
    return [...productList].sort((a, b) => {
      switch (sortBy) {
        case 'relevance': {
          if (scoredMap) {
            const scoreA = scoredMap.get(a.id)?.total ?? 0;
            const scoreB = scoredMap.get(b.id)?.total ?? 0;
            if (scoreA !== scoreB) return scoreB - scoreA;
          }
          // Fallback / tiebreaker: rating
          return b.rating - a.rating;
        }
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'favorites': {
          // Saved first, then by rating
          const aSaved = isSaved(a.id) ? 1 : 0;
          const bSaved = isSaved(b.id) ? 1 : 0;
          if (bSaved !== aSaved) return bSaved - aSaved;
          return b.rating - a.rating;
        }
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });
  };

  const sortedMatchedProducts = useMemo(
    () => sortProducts(matchedProducts),
    [matchedProducts, sortBy, scoredMap]
  );

  const sortedOtherProducts = useMemo(
    () => sortProducts(otherProducts),
    [otherProducts, sortBy, scoredMap]
  );

  // AI discovery context is now self-managed by AIDiscoveryBar

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
  const renderProductCard = (product: Product, highlightCompare = false, showMatchScore = false) => {
    const isRecommended = hasProfile && isProductRecommended(product);
    const isSelected = isInCompareList(product.id);
    const score = hasProfile && showMatchScore ? scoredMap?.get(product.id) : undefined;

    return (
      <ProductCard_CompactB
        key={product.id}
        product={product}
        highlightCompare={highlightCompare}
        isRecommended={isRecommended}
        isSelected={isSelected}
        isProductSaved={isSaved(product.id)}
        compareCount={safeCompareList.length}
        safeUserConcerns={safeUserConcerns}
        matchTier={score?.tier}
        matchReasons={score?.topReasons}
        onProductClick={(id: number) => navigate(`/product-detail?id=${id}`)}
        onToggleSave={(e: React.MouseEvent) => {
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
          setSaveNotification({
            show: true,
            productName: product.name,
            isAdding: !wasAlreadySaved,
            productData: !wasAlreadySaved ? { id: product.id, name: product.name, brand: product.brand, image: product.image, category: product.category } : undefined,
          });
          setTimeout(() => setSaveNotification({ show: false, productName: '', isAdding: true }), 4000);
        }}
        onAddToCompare={(e: React.MouseEvent) => handleAddToCompare(product, e)}
      />
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

      {/* Search Bar with AI Discovery */}
      <AIDiscoveryBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        userConcerns={safeUserConcerns}
        className="mb-6 sm:mb-8"
      />

      {/* Category Toggle + Dropdown */}
      <div className="relative mb-4 sm:mb-6">
        <button
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-blush hover:border-primary/30 transition-colors cursor-pointer shadow-sm"
        >
          <i className="ri-grid-line text-xs text-primary"></i>
          <span className="text-xs font-medium text-deep">Categories</span>
          <i className={`ri-arrow-${isCategoriesOpen ? 'up' : 'down'}-s-line text-sm text-warm-gray`}></i>
        </button>

        {/* Backdrop to close on outside click */}
        {isCategoriesOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsCategoriesOpen(false)}
          />
        )}

        {/* Dropdown panel */}
        <div className={`
          absolute left-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-blush/30 shadow-lg shadow-warm-gray/10 p-2.5 w-full sm:w-auto sm:max-w-md
          transition-all duration-200 origin-top
          ${isCategoriesOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }
        `}>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  onFilterChange('category', category.value);
                  setIsCategoriesOpen(false);
                }}
                aria-pressed={selectedCategory === category.value}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-xs transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                }`}
              >
                <i className={`${category.icon} text-xs`}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredient Filter Toggle */}
      {ingredientOptions.length > 0 && (
        <div className="relative mb-4 sm:mb-6">
          <button
            onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-blush hover:border-primary/30 transition-colors cursor-pointer shadow-sm"
          >
            <i className="ri-flask-line text-xs text-primary"></i>
            <span className="text-xs font-medium text-deep">
              Ingredients{selectedIngredients.length > 0 ? ` (${selectedIngredients.length})` : ''}
            </span>
            <i className={`ri-arrow-${isIngredientsOpen ? 'up' : 'down'}-s-line text-sm text-warm-gray`}></i>
          </button>

          {/* Backdrop */}
          {isIngredientsOpen && (
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsIngredientsOpen(false)}
            />
          )}

          {/* Dropdown panel (multi-select) */}
          <div className={`
            absolute left-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-blush/30 shadow-lg shadow-warm-gray/10 p-2.5 w-full sm:w-auto sm:max-w-md
            transition-all duration-200 origin-top
            ${isIngredientsOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            }
          `}>
            <div className="flex flex-wrap gap-1.5">
              {sortedIngredientOptions.map((option) => {
                const isActive = selectedIngredients.includes(option.slug);
                return (
                  <button
                    key={option.slug}
                    onClick={() => {
                      setSelectedIngredients(
                        isActive
                          ? selectedIngredients.filter((s: string) => s !== option.slug)
                          : [...selectedIngredients, option.slug]
                      );
                    }}
                    aria-pressed={isActive}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-xs transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : option.isRelevant
                          ? 'bg-light/30 text-primary-700 border border-primary-300 hover:border-primary'
                          : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                    }`}
                  >
                    {isActive && <i className="ri-check-line text-xs"></i>}
                    {!isActive && option.isRelevant && <i className="ri-check-line text-xs text-primary/60"></i>}
                    <span>{option.label}</span>
                    <span className={`text-xs ${isActive ? 'text-white/70' : 'text-warm-gray/50'}`}>({option.productCount})</span>
                  </button>
                );
              })}
            </div>
            {selectedIngredients.length > 0 && (
              <button
                onClick={() => setSelectedIngredients([])}
                className="mt-2 text-xs text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                Clear ingredient filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 sm:mb-8">
        {/* Time of Day & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">

          {/* Skin Type + Time of Day + Compare */}
          <div className="w-full sm:w-auto">
            {/* Labels row */}
            <div className="flex gap-3 xs:gap-3 mb-1">
              <span className="text-xs font-medium text-warm-gray uppercase tracking-wide min-w-[120px]">Skin Type</span>
              <span className="text-xs font-medium text-warm-gray uppercase tracking-wide min-w-[120px] text-center">Time of Day</span>
              <span className="text-xs font-medium text-warm-gray uppercase tracking-wide text-center pl-1.5">Compare</span>
            </div>
            {/* Controls row */}
            <div className="flex items-center gap-3">
              {/* Skin Type */}
              {effectiveSkinType ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-light/30 border border-primary-300 rounded-xl text-xs font-medium text-primary-700 min-w-[120px]"
                  title="Based on your skin survey"
                >
                  <i className="ri-check-line text-xs"></i>
                  {effectiveSkinType} skin
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
                  compact
                  className="min-w-[120px]"
                />
              )}

              {/* Time of Day */}
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
                compact
                className="min-w-[120px]"
              />

              {/* Compare */}
              <button
                onClick={handleCompareAll}
                title="Compare Products"
                aria-label="Compare Products"
                className="flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-white border border-blush text-xs text-warm-gray hover:border-primary/50 hover:bg-cream/30 hover:text-primary transition-all cursor-pointer"
              >
                <i className="ri-scales-line"></i>
              </button>
            </div>
          </div>

          {/* Sort + Reset */}
          <div className="flex items-end gap-4">
            {/* Sort */}
            <div className="w-full xs:w-auto">
              <label
                htmlFor="filter-sort-by"
                className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1"
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
                  ...(hasProfile ? [{ value: 'relevance', label: 'Best Match' }] : []),
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'favorites', label: 'Saved First' },
                ]}
                compact
                className="min-w-[120px]"
              />
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' || timeOfDay !== 'all' || sortBy !== (hasProfile ? 'relevance' : 'rating') || searchQuery !== '' || selectedIngredients.length > 0 || (!effectiveSkinType && selectedSkinType !== 'all')) && (
              <button
                onClick={() => {
                  const defaultSort = hasProfile ? 'relevance' : 'rating';
                  setSelectedCategory('all');
                  setTimeOfDay('all');
                  setSortBy(defaultSort);
                  setSearchQuery('');
                  setSelectedIngredients([]);
                  if (!effectiveSkinType) setSelectedSkinType('all');
                  onFilterChange('category', 'all');
                  onFilterChange('timeOfDay', 'all');
                  onFilterChange('sortBy', defaultSort);
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
        {safeUserConcerns.length === 0 && !effectiveSkinType && (
          <p className="text-sm text-warm-gray/90 mb-3">
            Your product matches are based on your skin profile. <Link to="/auth/signup" className="text-primary hover:text-dark underline">Sign in</Link> to see personalized suggestions tailored to your skin type, concerns, and preferences.
          </p>
        )}
        <p className="text-sm text-warm-gray">
          Showing{' '}
          <span className="font-semibold text-deep">
            {sortedMatchedProducts.length + sortedOtherProducts.length}
          </span>{' '}
          products
          {hasProfile && safeUserConcerns.length > 0 && sortedMatchedProducts.length > 0 && (
            <span className="text-primary ml-2">
              ({sortedMatchedProducts.length} suggestions based on your skin profile)
            </span>
          )}
        </p>
      </div>

      {/* Recommended for You Section — only for authenticated users with profile */}
      {hasProfile && sortedMatchedProducts.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 xs:gap-3 mb-4 flex-wrap">
            <h2 className="text-lg xs:text-xl font-semibold text-primary-700">Recommended for You</h2>
          </div>
          {/* FIXED: Responsive grid gaps - smaller on xs screens */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
            {sortedMatchedProducts.map((product, idx) => (
              <div key={product.id} ref={idx === 0 ? firstProductRef : undefined}>
                {renderProductCard(product, idx === 0 && showCompareHighlight, true)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Divider between recommended and other products */}
      {hasProfile && sortedMatchedProducts.length > 0 && sortedOtherProducts.length > 0 && (
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
            {renderProductCard(product, sortedMatchedProducts.length === 0 && idx === 0 && showCompareHighlight, false)}
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
              const defaultSort = hasProfile ? 'relevance' : 'rating';
              setSelectedCategory('all');
              setSearchQuery('');
              setTimeOfDay('all');
              setSortBy(defaultSort);
              setSelectedIngredients([]);
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
      <div
        ref={compareBarRef}
        role="region"
        aria-label="Product comparison bar"
        aria-live="polite"
        className={`
          fixed left-0 right-0 z-50
          border-t-2 border-primary shadow-2xl
          transition-all duration-300 ease-out
          ${showCompareBar
            ? 'bottom-0 opacity-100 translate-y-0'
            : 'bottom-0 opacity-0 translate-y-full pointer-events-none'
          }
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

      {/* Save Notification Popup */}
      {saveNotification.show && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 motion-safe:animate-fade-in">
          <i className={`${saveNotification.isAdding ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          <div>
            <p className="font-medium">{saveNotification.isAdding ? 'Product Saved' : 'Product Removed'}</p>
            <p className="text-sm text-white/80">{saveNotification.productName}</p>
            {saveNotification.isAdding && saveNotification.productData && (
              <button
                onClick={() => {
                  setRoutinePickerProduct(saveNotification.productData);
                  setSaveNotification({ show: false, productName: '', isAdding: true });
                  setShowRoutinePicker(true);
                }}
                className="text-xs underline text-white/70 hover:text-white mt-1 cursor-pointer"
              >
                Add to Routine?
              </button>
            )}
          </div>
        </div>
      )}

      {/* Routine Picker Modal */}
      {showRoutinePicker && routinePickerProduct && (
        <RoutinePickerModal
          isOpen={showRoutinePicker}
          onClose={() => {
            setShowRoutinePicker(false);
            setRoutinePickerProduct(null);
          }}
          product={routinePickerProduct}
        />
      )}
    </div>
  );
}
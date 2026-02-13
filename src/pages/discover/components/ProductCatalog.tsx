import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productData } from '../../../mocks/products';
import { productMatchesUserConcerns } from '../../../lib/utils/matching';
import type { Product } from '../../../types/product';
import { useFavorites } from '../../../lib/utils/favoritesState';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';
import Dropdown from '../../../components/ui/Dropdown';

/**
 * ProductCatalog Component
 * 
 * MOBILE FIXES APPLIED:
 * - Responsive grid gaps (smaller on xs screens)
 * - Better spacing on very small devices (375px)
 * - Safe area support for comparison bar
 */

// Static data moved outside component to prevent recreation on each render
const categories = [
  { value: 'all', label: 'All Products', icon: 'ri-grid-line' },
  { value: 'cleanser', label: 'Cleansers', icon: 'ri-drop-line' },
  { value: 'toner', label: 'Toners', icon: 'ri-contrast-drop-line' },
  { value: 'serum', label: 'Serums', icon: 'ri-flask-line' },
  { value: 'essence', label: 'Essences', icon: 'ri-water-flash-line' },
  { value: 'moisturizer', label: 'Moisturizers', icon: 'ri-contrast-drop-2-line' },
  { value: 'sunscreen', label: 'Sunscreen', icon: 'ri-sun-line' },
  { value: 'treatment', label: 'Treatments', icon: 'ri-heart-pulse-line' },
  { value: 'eye-care', label: 'Eye Care', icon: 'ri-eye-line' },
  { value: 'lip-care', label: 'Lip Care', icon: 'ri-chat-smile-3-line' },
  { value: 'mask', label: 'Masks', icon: 'ri-user-smile-line' },
  { value: 'exfoliator', label: 'Exfoliators', icon: 'ri-refresh-line' },
  { value: 'oil', label: 'Face Oils', icon: 'ri-drop-fill' },
  { value: 'mist', label: 'Mists & Sprays', icon: 'ri-cloud-line' },
  { value: 'tool', label: 'Tools & Devices', icon: 'ri-tools-line' },
];

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

  // Favorites for reactive updates
  const { isFavorite, toggleFavorite } = useFavorites();

  // Persisted filter and sort preferences
  const [selectedCategory, setSelectedCategory] = useLocalStorageState<string>(
    'discover_filter_category',
    'all'
  );
  const [selectedSkinType, setSelectedSkinType] = useLocalStorageState<string>(
    'discover_filter_skin_type',
    'all'
  );
  const [sortBy, setSortBy] = useLocalStorageState<string>(
    'discover_sort_by',
    'rating'
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

  // Favorite notification state
  const [favoriteNotification, setFavoriteNotification] = useState<{ show: boolean; productName: string; isAdding: boolean }>({ show: false, productName: '', isAdding: true });

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSkinType =
        selectedSkinType === 'all' || product.skinTypes.includes(selectedSkinType);
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.keyIngredients.some((ing) =>
          ing.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSkinType && matchesSearch;
    });
  }, [products, selectedCategory, selectedSkinType, searchQuery]);

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

  // Final sorting (price, rating, favorites)
  const sortProducts = (productList: Product[]) => {
    return [...productList].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'favorites':
          // Favorites first, then by rating
          const aFav = isFavorite(a.id) ? 1 : 0;
          const bFav = isFavorite(b.id) ? 1 : 0;
          if (bFav !== aFav) return bFav - aFav;
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

  // Render a single product card
  const renderProductCard = (product: Product) => {
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
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const wasAlreadyFavorite = isFavorite(product.id);
              toggleFavorite({
                id: product.id,
                name: product.name,
                brand: product.brand,
                image: product.image,
                priceRange: `$${(product.price * 0.9).toFixed(2)} - $${(product.price * 1.1).toFixed(2)}`,
                category: product.category,
                skinTypes: product.skinTypes,
              });
              setFavoriteNotification({ show: true, productName: product.name, isAdding: !wasAlreadyFavorite });
              setTimeout(() => setFavoriteNotification({ show: false, productName: '', isAdding: true }), 3000);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isFavorite(product.id)
                ? 'bg-primary text-white'
                : 'bg-white text-warm-gray hover:bg-light/30 hover:text-primary'
            }`}
            title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
            aria-pressed={isFavorite(product.id)}
          >
            <i className={`${isFavorite(product.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          </button>

          {/* Comparison Button */}
          {(() => {
            const isMaxReached = safeCompareList.length >= 3 && !isSelected;
            return (
              <button
                onClick={(e) => !isMaxReached && handleAddToCompare(product, e)}
                disabled={isMaxReached}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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

          <p className="text-sm text-warm-gray mb-4 line-clamp-2">{product.description}</p>

          {/* Concerns - with highlighting for matching concerns */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-warm-gray mb-2">Addresses:</p>
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

      {/* Filters */}
      <div className="mb-6 sm:mb-8">
        {/* Category Filter */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-semibold text-warm-gray mb-3">Categories</h3>
          {/* FIXED: Horizontal scroll on mobile with proper spacing */}
          <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 xs:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  onFilterChange('category', category.value);
                }}
                className={`flex items-center space-x-2 px-3 xs:px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
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

        {/* Skin Type, Time of Day & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">

          {/* Skin Type + Time of Day */}
          <div className="flex flex-col xs:flex-row items-start xs:items-end gap-3 xs:gap-4 w-full sm:w-auto">

            {/* Skin Type */}
            <div className="w-full xs:w-auto">
              <label
                htmlFor="filter-skin-type"
                className="block text-xs font-medium text-warm-gray uppercase tracking-wide mb-1.5"
              >
                Skin Type
              </label>
              <Dropdown
                id="filter-skin-type"
                name="skinType"
                value={selectedSkinType}
                onChange={(value) => {
                  setSelectedSkinType(value)
                  onFilterChange('skinType', value)
                }}
                options={skinTypes}
                className="min-w-[150px]"
              />
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
                  { value: 'favorites', label: 'Favorites First' },
                ]}
                className="min-w-[170px]"
              />
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' || selectedSkinType !== 'all' || timeOfDay !== 'all' || sortBy !== 'popular') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSkinType('all');
                  setTimeOfDay('all');
                  setSortBy('popular');
                  onFilterChange('category', 'all');
                  onFilterChange('skinType', 'all');
                  onFilterChange('timeOfDay', 'all');
                  onFilterChange('sortBy', 'popular');
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
            {sortedMatchedProducts.map((product) => renderProductCard(product))}
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
        {sortedOtherProducts.map((product) => renderProductCard(product))}
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
              setSelectedSkinType('all');
              setSearchQuery('');
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

      {/* Favorite Notification Popup */}
      {favoriteNotification.show && (
        <div className="fixed top-24 right-6 z-50 bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 motion-safe:animate-fade-in">
          <i className={`${favoriteNotification.isAdding ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
          <div>
            <p className="font-medium">{favoriteNotification.isAdding ? 'Added to Favorites' : 'Removed from Favorites'}</p>
            <p className="text-sm text-white/80">{favoriteNotification.productName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
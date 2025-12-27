import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productData } from '../../../mocks/products';
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import type { Product } from '../../../types/product';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [timeOfDay, setTimeOfDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Safe fallback for compareList to prevent undefined errors
  const safeCompareList = compareList ?? [];

  // Derive showCompareBar from safeCompareList length
  const showCompareBar = safeCompareList.length > 0;

  // Safe fallback for userConcerns
  const safeUserConcerns = userConcerns ?? [];

  // Check if user has completed the skin survey
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    const skinSurveyData = localStorage.getItem('skinSurveyData');
    setSurveyCompleted(!!(userProfile || skinSurveyData));
  }, []);

  // Handle category from URL params (from homepage CTAs)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const categories = [
    { value: 'all', label: 'All Products', icon: 'ri-grid-line' },
    { value: 'cleanser', label: 'Cleansers', icon: 'ri-drop-line' },
    { value: 'toner', label: 'Toners', icon: 'ri-contrast-drop-line' },
    { value: 'serum', label: 'Serums', icon: 'ri-flask-line' },
    { value: 'moisturizer', label: 'Moisturizers', icon: 'ri-contrast-drop-2-line' },
    { value: 'sunscreen', label: 'Sunscreen', icon: 'ri-sun-line' },
    { value: 'treatment', label: 'Treatments', icon: 'ri-heart-pulse-line' },
    { value: 'mask', label: 'Masks', icon: 'ri-user-smile-line' },
  ];

  const skinTypes = [
    { value: 'all', label: 'All Skin Types' },
    { value: 'dry', label: 'Dry' },
    { value: 'oily', label: 'Oily' },
    { value: 'combination', label: 'Combination' },
    { value: 'normal', label: 'Normal' },
    { value: 'sensitive', label: 'Sensitive' },
  ];

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

  // Final sorting (price, rating, popularity)
  const sortProducts = (productList: Product[]) => {
    return [...productList].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.reviewCount - a.reviewCount;
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
    } else if (safeCompareList.length < 4) {
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
          bg-white rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer relative hover:-translate-y-1
          ${
            isRecommended
              ? 'ring-2 ring-sage-500 ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)]'
              : 'shadow-md hover:shadow-xl border border-gray-100'
          }
        `}
      >
        {isRecommended && (
          <span className="absolute top-3 left-3 bg-sage-600 text-white text-xs px-2 py-1 rounded-full shadow z-10">
            Best Match
          </span>
        )}

        {/* Comparison Button */}
        <button
          onClick={(e) => handleAddToCompare(product, e)}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-md z-10 ${
            isSelected
              ? 'bg-sage-600 text-white'
              : 'bg-white text-gray-700 hover:bg-sage-100'
          }`}
          title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
        >
          {isSelected ? (
            <i className="ri-check-line text-xl"></i>
          ) : (
            <i className="ri-scales-line text-xl"></i>
          )}
        </button>

        {/* Product Image */}
        <div className="relative w-full h-80 overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-full text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-2">
            {product.brand}
          </p>

          <h3 className="text-lg font-semibold text-forest-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

          {/* Key Ingredients - with highlighting for matching ingredients */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Key Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                const isMatchingIngredient = matchesIngredient(ingredient, safeUserConcerns);
                
                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded-full border ${
                      isMatchingIngredient
                        ? 'bg-sage-100 text-sage-700 border-sage-300 font-medium'
                        : 'bg-cream-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {ingredient}
                  </span>
                );
              })}
              {product.keyIngredients.length > 3 && (
                <span className="px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  +{product.keyIngredients.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Estimated price range</p>
              <span className="text-xl font-bold text-forest-900">
                ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif text-forest-900 mb-6">
          Discover Your Perfect Match
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore our curated collection of clean, science-backed skincare products tailored
          to your unique needs
        </p>

        {/* Quiz CTA Banner - Only show if survey not completed */}
        {!surveyCompleted && (
          <div className="bg-gradient-to-r from-sage-600 to-sage-700 rounded-3xl p-8 mb-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left text-white">
                <h3 className="text-2xl font-serif mb-2">Not sure where to start?</h3>
                <p className="text-sage-100">
                  Take our personalized skin quiz to find products perfect for you
                </p>
              </div>
              <button
                onClick={() => navigate('/skin-survey-account')}
                className="px-8 py-4 bg-white text-sage-700 rounded-full font-semibold hover:bg-cream-50 transition-all shadow-lg whitespace-nowrap cursor-pointer flex items-center space-x-2"
              >
                <i className="ri-questionnaire-line text-xl"></i>
                <span>Start Skin Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <label htmlFor="discover-search" className="sr-only">
            Search products
          </label>

          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>

          <input
            id="discover-search"
            name="search"
            type="text"
            placeholder="Search products, brands, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-sage-600 focus:outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  onFilterChange('category', category.value);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category.value
                    ? 'bg-sage-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-300'
                }`}
              >
                <i className={`${category.icon} text-base`}></i>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skin Type, Time of Day & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Skin Type + Time of Day */}
          <div className="flex items-center space-x-3 flex-wrap gap-3">

            {/* Skin Type */}
            <label
              htmlFor="filter-skin-type"
              className="text-sm font-semibold text-gray-700"
            >
              Skin Type:
            </label>

            <select
              id="filter-skin-type"
              name="skinType"
              value={selectedSkinType}
              onChange={(e) => {
                setSelectedSkinType(e.target.value)
                onFilterChange('skinType', e.target.value)
              }}
              className="px-4 py-2 rounded-full border border-gray-200 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              {skinTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Time of Day */}
            <label
              htmlFor="filter-time-of-day"
              className="text-sm font-semibold text-gray-700 ml-4"
            >
              Time of Day:
            </label>

            <select
              id="filter-time-of-day"
              name="timeOfDay"
              value={timeOfDay}
              onChange={(e) => {
                setTimeOfDay(e.target.value)
                onFilterChange('timeOfDay', e.target.value)
              }}
              className="px-4 py-2 rounded-full border border-gray-200 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              <option value="all">All</option>
              <option value="am">AM (Morning)</option>
              <option value="pm">PM (Evening)</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-3">
            <label
              htmlFor="filter-sort-by"
              className="text-sm font-semibold text-gray-700"
            >
              Sort by:
            </label>

            <select
              id="filter-sort-by"
              name="sortBy"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                onFilterChange('sortBy', e.target.value)
              }}
              className="px-4 py-2 rounded-full border border-gray-200 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-semibold text-forest-900">
            {sortedMatchedProducts.length + sortedOtherProducts.length}
          </span>{' '}
          products
          {safeUserConcerns.length > 0 && sortedMatchedProducts.length > 0 && (
            <span className="text-sage-600 ml-2">
              ({sortedMatchedProducts.length} recommended for your concerns)
            </span>
          )}
        </p>
      </div>

      {/* Recommended for You Section */}
      {sortedMatchedProducts.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-sage-700">Recommended for You</h2>
            <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm rounded-full">
              Based on your skin concerns
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedMatchedProducts.map((product) => renderProductCard(product))}
          </div>
        </section>
      )}

      {/* Divider between recommended and other products */}
      {sortedMatchedProducts.length > 0 && sortedOtherProducts.length > 0 && (
        <div className="border-t border-gray-200 my-10 pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">More Products</h2>
        </div>
      )}

      {/* Main Product Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-product-shop
      >
        {sortedOtherProducts.map((product) => renderProductCard(product))}
      </div>

      {/* No Results */}
      {sortedMatchedProducts.length + sortedOtherProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
            <i className="ri-search-line text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-serif text-forest-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSkinType('all');
              setSearchQuery('');
            }}
            className="px-6 py-3 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all whitespace-nowrap cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Comparison Bar */}
      {showCompareBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sage-600 shadow-2xl z-50 transition-all animate-slide-up">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-sage-100 rounded-full">
                    <i className="ri-scales-3-line text-xl text-sage-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-forest-900">Compare Products</h3>
                    <p className="text-sm text-gray-600">
                      {safeCompareList.length} of 4 products selected
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  {safeCompareList.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2 px-3 py-2 bg-sage-50 rounded-full"
                    >
                      <span className="text-sm font-medium text-forest-900">
                        {product.brand}
                      </span>
                      <button
                        onClick={(e) => handleAddToCompare(product, e)}
                        className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-base"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearCompare}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={onOpenComparison}
                  disabled={safeCompareList.length < 2}
                  className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                    safeCompareList.length >= 2
                      ? 'bg-sage-600 text-white hover:bg-sage-700 shadow-md cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Compare Now ({safeCompareList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
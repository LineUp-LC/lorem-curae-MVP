import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productData } from '../../../mocks/products';
  
interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  skinTypes: string[];
  concerns: string[];
  keyIngredients: string[];
  inStock: boolean;
}

interface ProductCatalogProps {
  onStartQuiz?: () => void;
  userConcerns: string[];
  onProductClick: (id: string) => void;
  onSaveProduct: (id: string) => void;
  onFilterChange: (type: string, value: any) => void;
}

// Synonym map for concern matching
const concernMap: Record<string, string[]> = {
  'acne': ['breakouts', 'blemishes', 'pimples'],
  'aging': ['anti-aging', 'wrinkles', 'fine lines', 'mature skin'],
  'dryness': ['dry skin', 'dehydration', 'flaky'],
  'oiliness': ['oily skin', 'excess oil', 'shine'],
  'dark spots': ['hyperpigmentation', 'discoloration', 'sun spots'],
  'redness': ['rosacea', 'irritation', 'sensitivity'],
  'dullness': ['lack of radiance', 'tired skin', 'uneven tone'],
  'pores': ['large pores', 'clogged pores', 'minimizing pores'],
};

export default function ProductCatalog({
  userConcerns,
  onStartQuiz,
  onProductClick,
  onSaveProduct,
  onFilterChange
}: ProductCatalogProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [timeOfDay, setTimeOfDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

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
    
  // Collect all recommended ingredients for the user's selected concerns
  const recommendedIngredients = useMemo(() => {
    const stored = localStorage.getItem("userConcerns");
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return parsed.flatMap((c: any) => c.recommendedIngredients || []);
    } catch (e) {
      console.error("Failed to parse userConcerns from localStorage", e);
      return [];
    }
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSkinType = selectedSkinType === 'all' || product.skinTypes.includes(selectedSkinType);
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.keyIngredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSkinType && matchesSearch;
  });

  // Concern matching happens AFTER base filtering
  const matchedProducts = useMemo(() => {
    if (!userConcerns || userConcerns.length === 0) return [];

    const matches = filteredProducts.filter((product) =>
      product.concerns?.some((c) => userConcerns.includes(c))
    );

    console.log("User concerns:", userConcerns);
    console.log("Filtered products:", filteredProducts);
    console.log("Matched products:", matches);

    return matches;
  }, [filteredProducts, userConcerns]);

const otherProducts = useMemo(() => {
  return filteredProducts.filter(
    (product) =>
      !matchedProducts.some((m) => m.id === product.id)
  );
}, [filteredProducts, matchedProducts]);

  // Final sorting (price, rating, popularity)
  const sortedMatchedProducts = useMemo(() => {
    return [...matchedProducts].sort((a, b) => {
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
  }, [matchedProducts, sortBy]);

  const sortedOtherProducts = useMemo(() => {
    return [...otherProducts].sort((a, b) => {
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
  }, [otherProducts, sortBy]);

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

  // Helper function to check if a product is recommended based on synonym-aware matching
  const isProductRecommended = (product: Product) => {
    return product.concerns?.some((productConcern) =>
      userConcerns.some((userConcern) => {
        const synonyms = concernMap[userConcern] || [];
        return (
          productConcern.toLowerCase() === userConcern.toLowerCase() ||
          synonyms.includes(productConcern.toLowerCase())
        );
      })
    );
  };

  // Render a single product card (shared between recommended and main grid)
  const renderProductCard = (product: Product) => {
    const isRecommended = isProductRecommended(product);

    return (
      <div
        key={product.id}
        onClick={() => navigate(`/product-detail?id=${product.id}`)}
        className={`
          bg-white rounded-2xl overflow-hidden transition-all group cursor-pointer relative
          ${isRecommended
            ? "ring-2 ring-sage-500 ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)]"
            : "shadow-md hover:shadow-xl border border-gray-100"
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
          onClick={(e) => {
            e.preventDefault();
            handleAddToCompare(product.id, e);
          }}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-md z-10 ${
            compareList.includes(product.id)
              ? 'bg-sage-600 text-white'
              : 'bg-white text-gray-700 hover:bg-sage-100'
          }`}
          title={compareList.includes(product.id) ? 'Remove from comparison' : 'Add to comparison'}
        >
          {compareList.includes(product.id) ? (
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
            <div className="flex items-center space-x-1">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Key Ingredients with sage highlighting */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Key Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {product.keyIngredients.slice(0, 2).map((ingredient, idx) => {
                const isIngredientRecommended = recommendedIngredients.includes(ingredient);
                return (
                  <span
                    key={idx}
                    className={`
                      px-2 py-1 text-xs rounded-full border
                      ${isIngredientRecommended
                        ? "bg-sage-100 text-sage-700 border-sage-300"
                        : "bg-cream-100 text-gray-700 border-gray-200"
                      }
                    `}
                  >
                    {ingredient}
                  </span>
                );
              })}
              {product.keyIngredients.length > 2 && (
                <span className="px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  +{product.keyIngredients.length - 2}
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

  const handleAddToCompare = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.includes(productId)) {
      setCompareList(compareList.filter(id => id !== productId));
      if (compareList.length === 1) {
        setShowCompareBar(false);
      }
    } else if (compareList.length < 4) {
      const newList = [...compareList, productId];
      setCompareList(newList);
      setShowCompareBar(true);
    }
  };

  const handleCompare = () => {
    setShowCompareModal(true);
  };

  const handleViewProductDetail = (productId: number) => {
    setShowCompareModal(false);
    navigate(`/product-detail?id=${productId}`);
  };

  const handleClearCompare = () => {
    setCompareList([]);
    setShowCompareBar(false);
  };

  // Calculate comparison highlights
  const getComparisonHighlights = () => {
    const compareProducts = compareList.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
    
    if (compareProducts.length === 0) return {};

    const prices = compareProducts.map(p => p.price);
    const ratings = compareProducts.map(p => p.rating);
    const reviewCounts = compareProducts.map(p => p.reviewCount);

    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const highestRating = Math.max(...ratings);
    const lowestRating = Math.min(...ratings);
    const mostReviews = Math.max(...reviewCounts);
    const leastReviews = Math.min(...reviewCounts);

    return {
      lowestPrice,
      highestPrice,
      highestRating,
      lowestRating,
      mostReviews,
      leastReviews,
    };
  };

  const highlights = getComparisonHighlights();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-serif text-forest-900 mb-6">
          Discover Your Perfect Match
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore our curated collection of clean, science-backed skincare products tailored to your unique needs
        </p>
        
        {/* Quiz CTA Banner - Only show if survey not completed */}
        {!surveyCompleted && (
          <div className="bg-gradient-to-r from-sage-600 to-sage-700 rounded-3xl p-8 mb-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left text-white">
                <h3 className="text-2xl font-serif mb-2">Not sure where to start?</h3>
                <p className="text-sage-100">Take our personalized skin quiz to find products perfect for you</p>
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
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
          <input
            type="text"
            placeholder="Search products, brands, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => setSelectedCategory(category.value)}
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
          <div className="flex items-center space-x-3 flex-wrap gap-3">
            <label className="text-sm font-semibold text-gray-700">Skin Type:</label>
            <select
              value={selectedSkinType}
              onChange={(e) => setSelectedSkinType(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-200 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              {skinTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <label className="text-sm font-semibold text-gray-700 ml-4">Time of Day:</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-200 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              <option value="all">All</option>
              <option value="am">AM (Morning)</option>
              <option value="pm">PM (Evening)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
          Showing{" "}
          <span className="font-semibold text-forest-900">
            {sortedMatchedProducts.length + sortedOtherProducts.length}
          </span>{" "}
          products
        </p>
      </div>

      {/* Recommended for You Section */}
      {sortedMatchedProducts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-sage-700 mb-4">
            Recommended for You
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedMatchedProducts.map((product) => renderProductCard(product))}
          </div>
        </section>
      )}

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-product-shop>
        {sortedOtherProducts.map((product) => renderProductCard(product))}
      </div>

      {/* No Results */}
      {sortedMatchedProducts.length + sortedOtherProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
            <i className="ri-search-line text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-2xl font-serif text-forest-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search query
          </p>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sage-600 shadow-2xl z-50 transition-all">
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
                      {compareList.length} of 4 products selected
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  {compareList.map((productId) => {
                    const product = products.find(p => p.id === productId);
                    return product ? (
                      <div key={productId} className="flex items-center space-x-2 px-3 py-2 bg-sage-50 rounded-full">
                        <span className="text-sm font-medium text-forest-900">{product.brand}</span>
                        <button
                          onClick={(e) => handleAddToCompare(productId, e)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-600 cursor-pointer"
                        >
                          <i className="ri-close-line text-base"></i>
                        </button>
                      </div>
                    ) : null;
                  })}
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
                  onClick={handleCompare}
                  disabled={compareList.length < 2}
                  className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                    compareList.length >= 2
                      ? 'bg-sage-600 text-white hover:bg-sage-700 shadow-md cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Compare Now ({compareList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-sage-100 rounded-full">
                  <i className="ri-scales-3-line text-2xl text-sage-600"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-forest-900">Product Comparison</h2>
                  <p className="text-sm text-gray-600">Compare {compareList.length} products side by side</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {compareList.map((productId) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;

                  const isLowestPrice = product.price === highlights.lowestPrice && compareList.length > 1;
                  const isHighestPrice = product.price === highlights.highestPrice && compareList.length > 1;
                  const isHighestRating = product.rating === highlights.highestRating && compareList.length > 1;
                  const isLowestRating = product.rating === highlights.lowestRating && compareList.length > 1;
                  const hasMostReviews = product.reviewCount === highlights.mostReviews && compareList.length > 1;
                  const hasLeastReviews = product.reviewCount === highlights.leastReviews && compareList.length > 1;

                  return (
                    <div key={productId} className="bg-cream-50 rounded-2xl overflow-hidden border-2 border-sage-200">
                      {/* Product Image */}
                      <div className="relative w-full h-64 bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-top"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCompare(productId, e);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-full hover:bg-red-50 cursor-pointer shadow-md"
                        >
                          <i className="ri-close-line text-lg"></i>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-1">
                            {product.brand}
                          </p>
                          <h3 className="text-lg font-semibold text-forest-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        {/* Rating */}
                        <div className={`p-3 rounded-xl transition-all ${
                          isHighestRating ? 'bg-sage-100 ring-2 ring-sage-600' : 
                          isLowestRating ? 'bg-orange-50 ring-2 ring-orange-400' : 
                          'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">Rating</p>
                            {isHighestRating && (
                              <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold">
                                Highest
                              </span>
                            )}
                            {isLowestRating && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                                Lowest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                          </div>
                        </div>

                        {/* Review Count */}
                        <div className={`p-3 rounded-xl transition-all ${
                          hasMostReviews ? 'bg-sage-100 ring-2 ring-sage-600' : 
                          hasLeastReviews ? 'bg-orange-50 ring-2 ring-orange-400' : 
                          'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">Reviews</p>
                            {hasMostReviews && (
                              <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold">
                                Most Reviewed
                              </span>
                            )}
                            {hasLeastReviews && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                                Least Reviewed
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-forest-900">
                            {product.reviewCount.toLocaleString()} reviews
                          </p>
                        </div>

                        {/* Price */}
                        <div className={`p-3 rounded-xl transition-all ${
                          isLowestPrice ? 'bg-sage-100 ring-2 ring-sage-600' : 
                          isHighestPrice ? 'bg-orange-50 ring-2 ring-orange-400' : 
                          'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">Price Range</p>
                            {isLowestPrice && (
                              <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold">
                                Best Price
                              </span>
                            )}
                            {isHighestPrice && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                                Highest
                              </span>
                            )}
                          </div>
                          <span className="text-xl font-bold text-forest-900">
                            ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
                          </span>
                        </div>

                        {/* Skin Types */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Skin Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.skinTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full capitalize"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Ingredients */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Key Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.keyIngredients.slice(0, 3).map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Concerns */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Addresses:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.concerns.slice(0, 2).map((concern, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-coral-100 text-coral-700 text-xs rounded-full capitalize"
                              >
                                {concern}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => handleViewProductDetail(product.id)}
                          className="w-full px-4 py-3 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Comparison Legend:</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-sage-600 rounded"></div>
                    <span className="text-sm text-gray-700">Best Value / Highest Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-700">Needs Attention / Lower Value</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
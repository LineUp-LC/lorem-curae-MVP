import { useState, useMemo, useEffect } from 'react';
import { productData } from '../../mocks/products';
import type { Product, ActiveIngredient } from '../../types/product';
import { matchesConcern, matchesIngredient } from '../../lib/utils/matching';
import {
  calculatePPML,
  formatPPML,
  formatSize,
  formatConcentration,
  calculateComparisonMetrics,
  isBestValue,
  isWorstValue,
  hasHighestConcentration,
  hasPPMLData,
  hasActiveIngredients,
  hasValidPrice,
  hasValidSize,
  getMissingDataText,
} from '../../lib/utils/productMetrics';

interface ComparisonPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: number;
  userConcerns?: string[];
  currentlyViewingProduct?: Product; // Product being viewed on PDP - shown at top
  preSelectedProducts?: Product[]; // Products already selected (for discover page)
  showSelectionView?: boolean; // Whether to show selection view (default: true)
}

export default function ComparisonPickerModal({
  isOpen,
  onClose,
  initialProductId,
  userConcerns = [],
  currentlyViewingProduct,
  preSelectedProducts,
  showSelectionView = true,
}: ComparisonPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(() => {
    // If pre-selected products are provided (from discover page), use those
    if (preSelectedProducts && preSelectedProducts.length > 0) {
      return preSelectedProducts;
    }
    // If currently viewing product is provided, start with that
    if (currentlyViewingProduct) {
      return [currentlyViewingProduct];
    }
    // Otherwise use initial product ID
    if (initialProductId) {
      const product = productData.find(p => p.id === initialProductId);
      return product ? [product] : [];
    }
    return [];
  });
  // If pre-selected products are provided, start in comparison view
  const [showComparison, setShowComparison] = useState(() => {
    if (preSelectedProducts && preSelectedProducts.length >= 2 && !showSelectionView) {
      return true;
    }
    return false;
  });

  // Update selected products when preSelectedProducts changes
  useEffect(() => {
    if (preSelectedProducts && preSelectedProducts.length > 0) {
      setSelectedProducts(preSelectedProducts);
      if (preSelectedProducts.length >= 2 && !showSelectionView) {
        setShowComparison(true);
      }
    }
  }, [preSelectedProducts, showSelectionView]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productData;
    const query = searchQuery.toLowerCase();
    return productData.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const isSelected = (productId: number) =>
    selectedProducts.some(p => p.id === productId);

  const handleToggleProduct = (product: Product) => {
    if (isSelected(product.id)) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedProducts.length <= 2) {
      setShowComparison(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
    setShowComparison(false);
  };

  const handleCompare = () => {
    if (selectedProducts.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleBackToSelection = () => {
    setShowComparison(false);
  };

  // Comparison highlights calculation
  const highlights = useMemo(() => {
    if (selectedProducts.length === 0) return {};
    const prices = selectedProducts.filter(p => hasValidPrice(p)).map(p => p.price);
    const ratings = selectedProducts.map(p => p.rating);
    const reviewCounts = selectedProducts.map(p => p.reviewCount);
    return {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      highestPrice: prices.length > 0 ? Math.max(...prices) : undefined,
      highestRating: Math.max(...ratings),
      lowestRating: Math.min(...ratings),
      mostReviews: Math.max(...reviewCounts),
      leastReviews: Math.min(...reviewCounts),
    };
  }, [selectedProducts]);

  // Calculate PPML and concentration metrics
  const comparisonMetrics = useMemo(() => {
    return calculateComparisonMetrics(selectedProducts);
  }, [selectedProducts]);

  // Get user preferences from localStorage
  const userPrefs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('skinSurveyData') || '{}').preferences || {};
    } catch {
      return {};
    }
  }, []);

  const prefLabels: Record<string, string> = {
    chemicalFree: 'Chemical-Free',
    vegan: 'Vegan',
    plantBased: 'Plant-Based',
    fragranceFree: 'Fragrance-Free',
    glutenFree: 'Gluten-Free',
    alcoholFree: 'Alcohol-Free',
    siliconeFree: 'Silicone-Free',
    crueltyFree: 'Cruelty-Free',
  };

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

  // Render concentration row for an ingredient
  const renderConcentrationRow = (ingredient: ActiveIngredient, productId: number) => {
    const isHighest = hasHighestConcentration(productId, ingredient.name, comparisonMetrics);
    const concentrationText = formatConcentration(ingredient);
    const hasKnownConcentration = typeof ingredient.concentration === 'number';

    return (
      <div
        key={ingredient.name}
        className={`flex items-center justify-between py-1 ${
          isHighest && hasKnownConcentration ? 'text-sage font-medium' : 'text-warm-gray'
        }`}
      >
        <span className="text-xs">{ingredient.name}</span>
        <span className={`text-xs flex items-center gap-1 ${
          !hasKnownConcentration ? 'text-warm-gray/60 italic' : ''
        }`}>
          {concentrationText}
          {isHighest && hasKnownConcentration && (
            <i className="ri-trophy-line text-amber-500" title="Highest concentration"></i>
          )}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-blush px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
              <i className="ri-scales-3-line text-xl text-primary"></i>
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-deep">
                {showComparison ? 'Product Comparison' : 'Compare Products'}
              </h2>
              <p className="text-sm text-warm-gray">
                {showComparison
                  ? `Comparing ${selectedProducts.length} products side by side`
                  : `Select up to 3 products to compare`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showComparison ? (
            /* Comparison View - Full Details */
            <div className="p-6">
              <button
                onClick={handleBackToSelection}
                className="mb-6 flex items-center gap-2 text-primary hover:text-dark transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="font-medium">Back to selection</span>
              </button>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProducts.map((product) => {
                  const isLowestPrice = hasValidPrice(product) && product.price === highlights.lowestPrice && selectedProducts.length > 1;
                  const isHighestPrice = hasValidPrice(product) && product.price === highlights.highestPrice && selectedProducts.length > 1;
                  const isHighestRating = product.rating === highlights.highestRating && selectedProducts.length > 1;
                  const isLowestRating = product.rating === highlights.lowestRating && selectedProducts.length > 1;
                  const hasMostReviews = product.reviewCount === highlights.mostReviews && selectedProducts.length > 1;
                  const hasLeastReviews = product.reviewCount === highlights.leastReviews && selectedProducts.length > 1;

                  // PPML calculations
                  const ppml = calculatePPML(product);
                  const ppmlFormatted = formatPPML(ppml);
                  const sizeFormatted = formatSize(product.size);
                  const productIsBestValue = isBestValue(product.id, comparisonMetrics);
                  const productIsWorstValue = isWorstValue(product.id, comparisonMetrics);

                  return (
                    <div
                      key={product.id}
                      className="bg-cream/50 rounded-2xl overflow-hidden border-2 border-blush"
                    >
                      {/* Product Image */}
                      <div className="relative w-full h-48 bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-top"
                        />
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-full hover:bg-red-50 cursor-pointer shadow-md"
                        >
                          <i className="ri-close-line text-lg"></i>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        {/* Brand & Name */}
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                            {product.brand}
                          </p>
                          <h3 className="font-semibold text-deep text-base line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        {/* Rating */}
                        <div className={`p-3 rounded-xl transition-all ${
                          isHighestRating ? 'bg-sage/20 ring-2 ring-sage' : isLowestRating ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-warm-gray">Rating</p>
                            {isHighestRating && (
                              <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Highest</span>
                            )}
                            {isLowestRating && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Lowest</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex text-sm">{renderStars(product.rating)}</div>
                            <span className="text-sm font-medium text-deep">{product.rating}</span>
                          </div>
                        </div>

                        {/* Reviews */}
                        <div className={`p-3 rounded-xl transition-all ${
                          hasMostReviews ? 'bg-sage/20 ring-2 ring-sage' : hasLeastReviews ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-warm-gray">Reviews</p>
                            {hasMostReviews && (
                              <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Most</span>
                            )}
                            {hasLeastReviews && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Least</span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-deep">
                            {product.reviewCount > 0 ? product.reviewCount.toLocaleString() : getMissingDataText('rating')}
                          </p>
                        </div>

                        {/* Price */}
                        <div className={`p-3 rounded-xl transition-all ${
                          isLowestPrice ? 'bg-sage/20 ring-2 ring-sage' : isHighestPrice ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-warm-gray">Price</p>
                            {isLowestPrice && (
                              <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Best</span>
                            )}
                            {isHighestPrice && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">High</span>
                            )}
                          </div>
                          {hasValidPrice(product) ? (
                            <div>
                              <span className="text-xl font-bold text-deep">${product.price.toFixed(2)}</span>
                              {sizeFormatted && (
                                <span className="text-xs text-warm-gray ml-2">({sizeFormatted})</span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-warm-gray/60 italic">{getMissingDataText('price')}</p>
                          )}
                        </div>

                        {/* Value Score (PPML) */}
                        {hasPPMLData(product) && (
                          <div className={`p-3 rounded-xl transition-all ${
                            productIsBestValue ? 'bg-sage/20 ring-2 ring-sage' : productIsWorstValue ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-warm-gray">Value Score</p>
                              {productIsBestValue && (
                                <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold flex items-center gap-1">
                                  <i className="ri-award-line"></i>Best Value
                                </span>
                              )}
                              {productIsWorstValue && (
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Priciest</span>
                              )}
                            </div>
                            <p className="text-base font-semibold text-deep">{ppmlFormatted}</p>
                          </div>
                        )}

                        {/* Active Concentrations */}
                        {hasActiveIngredients(product) && (
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs font-semibold text-warm-gray mb-2">Active Concentrations</p>
                            <div className="divide-y divide-blush">
                              {product.activeIngredients!.slice(0, 4).map((ingredient) =>
                                renderConcentrationRow(ingredient, product.id)
                              )}
                            </div>
                          </div>
                        )}

                        {/* Addresses (Concerns) */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-warm-gray mb-2">Addresses:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.concerns.length > 0 ? (
                              product.concerns.slice(0, 3).map((concern, idx) => {
                                const isMatch = matchesConcern(concern, userConcerns);
                                return (
                                  <span
                                    key={idx}
                                    className={isMatch
                                      ? 'px-2 py-1 bg-sage/20 text-sage text-xs rounded-full capitalize font-medium'
                                      : 'px-2 py-1 bg-cream text-warm-gray text-xs rounded-full capitalize'
                                    }
                                  >
                                    {concern}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-warm-gray/60 italic">Not specified</span>
                            )}
                          </div>
                        </div>

                        {/* Key Ingredients */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-warm-gray mb-2">Key Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.keyIngredients.length > 0 ? (
                              product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                                const isRecommended = matchesIngredient(ingredient, userConcerns);
                                return (
                                  <span
                                    key={idx}
                                    className={isRecommended
                                      ? 'px-2 py-1 bg-sage/20 text-sage text-xs rounded-full font-medium'
                                      : 'px-2 py-1 bg-cream text-warm-gray text-xs rounded-full'
                                    }
                                  >
                                    {ingredient}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-warm-gray/60 italic">{getMissingDataText('ingredients')}</span>
                            )}
                          </div>
                        </div>

                        {/* Skin Types */}
                        <div className="bg-white p-3 rounded-xl">
                          <p className="text-xs font-semibold text-warm-gray mb-2">Skin Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.skinTypes.map((type, idx) => (
                              <span key={idx} className="px-2 py-1 bg-cream text-warm-gray text-xs rounded-full capitalize">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Preferences */}
                        {product.preferences && Object.values(product.preferences).some(v => v === true) && (
                          <div className="bg-white p-3 rounded-xl">
                            <p className="text-xs font-semibold text-warm-gray mb-2">Preferences:</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(product.preferences)
                                .filter(([_, value]) => value === true)
                                .map(([key]) => {
                                  const isMatching = userPrefs[key] === true;
                                  return (
                                    <span
                                      key={key}
                                      className={isMatching
                                        ? 'px-2 py-1 bg-sage/20 text-sage text-xs rounded-full font-medium border border-sage/30'
                                        : 'px-2 py-1 bg-cream text-warm-gray text-xs rounded-full'
                                      }
                                    >
                                      {isMatching && <i className="ri-check-line mr-0.5"></i>}
                                      {prefLabels[key] || key}
                                    </span>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-cream rounded-xl">
                <div className="flex flex-wrap gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sage rounded"></div>
                    <span className="text-sm text-warm-gray">Best Value / Matches Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-sm text-warm-gray">Lower Value / Priciest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-trophy-line text-amber-500"></i>
                    <span className="text-sm text-warm-gray">Highest Concentration</span>
                  </div>
                </div>
                <div className="text-xs text-warm-gray/60 pt-2 border-t border-blush">
                  <span className="mr-4">
                    {comparisonMetrics.productsWithPPML}/{selectedProducts.length} products have size info
                  </span>
                  <span>
                    {comparisonMetrics.productsWithConcentration}/{selectedProducts.length} have concentration data
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Selection View */
            <div className="p-6">
              {/* Currently Viewing Section */}
              {currentlyViewingProduct && (
                <div className="mb-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Currently Viewing</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                      <img
                        src={currentlyViewingProduct.image}
                        alt={currentlyViewingProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">{currentlyViewingProduct.brand}</p>
                      <h4 className="font-medium text-deep text-sm truncate">{currentlyViewingProduct.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-deep">${currentlyViewingProduct.price.toFixed(2)}</span>
                        <span className="text-warm-gray">•</span>
                        <div className="flex items-center gap-1">
                          <i className="ri-star-fill text-amber-500 text-sm"></i>
                          <span className="text-sm text-warm-gray">{currentlyViewingProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full">
                        <i className="ri-check-line text-sm"></i>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative mb-6">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, brand, or category..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-blush rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Selected Products Bar */}
              {selectedProducts.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-deep">
                      {selectedProducts.length} of 3 selected
                    </span>
                    <button
                      onClick={handleClearSelection}
                      className="text-sm text-warm-gray hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-primary/30"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-deep truncate max-w-[120px]">
                          {product.name}
                        </span>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="w-5 h-5 flex items-center justify-center text-warm-gray hover:text-red-500 rounded-full cursor-pointer"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const selected = isSelected(product.id);
                  const disabled = !selected && selectedProducts.length >= 3;

                  return (
                    <div
                      key={product.id}
                      onClick={() => !disabled && handleToggleProduct(product)}
                      className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
                        selected
                          ? 'border-primary bg-primary/5'
                          : disabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-blush hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Indicator */}
                      <div
                        className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          selected
                            ? 'bg-primary text-white'
                            : 'bg-white border-2 border-blush'
                        }`}
                      >
                        {selected && <i className="ri-check-line text-sm"></i>}
                      </div>

                      {/* Product Image */}
                      <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-cream">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                        {product.brand}
                      </p>
                      <h3 className="font-medium text-deep text-sm mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-deep">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <i className="ri-star-fill text-amber-500 text-sm"></i>
                          <span className="text-sm text-warm-gray">
                            {product.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-search-line text-4xl text-warm-gray/50 mb-3"></i>
                  <p className="text-warm-gray">No products found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showComparison && (
          <div className="sticky bottom-0 bg-white border-t border-blush px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-warm-gray">
              {selectedProducts.length === 0
                ? 'Select products to compare'
                : selectedProducts.length === 1
                ? 'Select at least 1 more product'
                : `${selectedProducts.length} products ready to compare`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-warm-gray hover:text-deep hover:bg-cream rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompare}
                disabled={selectedProducts.length < 2}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedProducts.length >= 2
                    ? 'bg-primary text-white hover:bg-dark shadow-md cursor-pointer'
                    : 'bg-gray-300 text-warm-gray cursor-not-allowed'
                }`}
              >
                Compare ({selectedProducts.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesConcern, matchesIngredient } from '../../../lib/utils/matching';
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
  hasConcentrationData,
  hasActiveIngredients,
  hasValidPrice,
  hasValidSize,
  getMissingDataText,
} from '../../../lib/utils/productMetrics';
import type { Product, ActiveIngredient } from '../../../types/product';
import { createPortal } from 'react-dom';

interface ComparisonHighlights {
  lowestPrice?: number;
  highestPrice?: number;
  highestRating?: number;
  lowestRating?: number;
  mostReviews?: number;
  leastReviews?: number;
}

interface ProductComparisonProps {
  products?: Product[];
  userConcerns?: string[];
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
}

// Tooltip component that renders via portal to escape overflow constraints
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (show && buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // Position above the button
        left: rect.left + rect.width / 2, // Center horizontally
      });
    }
  }, [show, buttonRef]);

  const tooltipContent = show && createPortal(
    <div 
      className="fixed px-3 py-2 bg-deep-800 text-white text-xs rounded-lg shadow-lg w-48 text-center whitespace-normal pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
    >
      {text}
      <div 
        className="absolute border-4 border-transparent border-t-deep-800"
        style={{
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>,
    document.body
  );

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={setButtonRef}
        type="button"
        className="ml-1 text-gray-400 hover:text-gray-600 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
      >
        <i className="ri-information-line text-sm"></i>
      </button>
      {tooltipContent}
      {children}
    </div>
  );
}

export default function ProductComparison({
  products,
  userConcerns,
  onClose,
  onRemoveProduct,
}: ProductComparisonProps) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Safe fallbacks to prevent undefined errors
  const safeProducts = products ?? [];
  const safeUserConcerns = userConcerns ?? [];

  const handleViewProductDetail = (productId: number) => {
    onClose();
    navigate(`/product-detail?id=${productId}`);
  };

  // Calculate comparison highlights (existing)
  const getComparisonHighlights = (): ComparisonHighlights => {
    if (safeProducts.length === 0) return {};

    const prices = safeProducts.filter(p => hasValidPrice(p)).map((p) => p.price);
    const ratings = safeProducts.map((p) => p.rating);
    const reviewCounts = safeProducts.map((p) => p.reviewCount);

    return {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      highestPrice: prices.length > 0 ? Math.max(...prices) : undefined,
      highestRating: Math.max(...ratings),
      lowestRating: Math.min(...ratings),
      mostReviews: Math.max(...reviewCounts),
      leastReviews: Math.min(...reviewCounts),
    };
  };

  const highlights = getComparisonHighlights();

  // Calculate PPML and concentration metrics
  const comparisonMetrics = useMemo(() => {
    return calculateComparisonMetrics(safeProducts);
  }, [safeProducts]);

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
          isHighest && hasKnownConcentration ? 'text-sage-700 font-medium' : 'text-gray-600'
        }`}
      >
        <span className="text-xs">{ingredient.name}</span>
        <span className={`text-xs flex items-center gap-1 ${
          !hasKnownConcentration ? 'text-gray-400 italic' : ''
        }`}>
          {concentrationText}
          {isHighest && hasKnownConcentration && (
            <i className="ri-trophy-line text-amber-500" title="Highest concentration"></i>
          )}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 motion-safe:animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col motion-safe:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl z-10 shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-sage-100 rounded-full">
              <i className="ri-scales-3-line text-xl sm:text-2xl text-sage-600"></i>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-deep-900">Product Comparison</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Compare {safeProducts.length} products side by side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
          >
            <i className="ri-close-line text-xl sm:text-2xl"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Comparison Grid */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {safeProducts.map((product) => {
              const isLowestPrice =
                hasValidPrice(product) && product.price === highlights.lowestPrice && safeProducts.length > 1;
              const isHighestPrice =
                hasValidPrice(product) && product.price === highlights.highestPrice && safeProducts.length > 1;
              const isHighestRating =
                product.rating === highlights.highestRating && safeProducts.length > 1;
              const isLowestRating =
                product.rating === highlights.lowestRating && safeProducts.length > 1;
              const hasMostReviews =
                product.reviewCount === highlights.mostReviews && safeProducts.length > 1;
              const hasLeastReviews =
                product.reviewCount === highlights.leastReviews && safeProducts.length > 1;
              
              // PPML calculations
              const ppml = calculatePPML(product);
              const ppmlFormatted = formatPPML(ppml);
              const sizeFormatted = formatSize(product.size);
              const productIsBestValue = isBestValue(product.id, comparisonMetrics);
              const productIsWorstValue = isWorstValue(product.id, comparisonMetrics);

              return (
                <div
                  key={product.id}
                  className="bg-cream-50 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-blush-300"
                >
                  {/* SECTION 1: Product Identity */}
                  {/* Product Image */}
                  <div className="relative w-full h-48 sm:h-56 md:h-64 bg-white">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Placeholder for missing image */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-cream-100 ${product.image ? 'hidden' : ''}`}>
                      <div className="text-center text-gray-400">
                        <i className="ri-image-line text-4xl"></i>
                        <p className="text-xs mt-1">No image</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveProduct((product.id));
                      }}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-full hover:bg-red-50 cursor-pointer shadow-md"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                    {/* Brand & Name */}
                    <div>
                      {product.brand && (
                        <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-1">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="text-base sm:text-lg font-semibold text-deep-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    {/* Rating */}
                    <div
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        isHighestRating
                          ? 'bg-sage-100 ring-2 ring-sage-500'
                          : isLowestRating
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : 'bg-white'
                      }`}
                    >
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
                      {product.rating > 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-0.5 sm:space-x-1 text-sm">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {product.rating}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">{getMissingDataText('rating')}</p>
                      )}
                    </div>

                    {/* Review Count */}
                    <div
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        hasMostReviews
                          ? 'bg-sage-100 ring-2 ring-sage-500'
                          : hasLeastReviews
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-700">Reviews</p>
                        {hasMostReviews && (
                          <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold">
                            Most
                          </span>
                        )}
                        {hasLeastReviews && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                            Least
                          </span>
                        )}
                      </div>
                      <p className="text-base sm:text-lg font-bold text-deep-900">
                        {product.reviewCount > 0 ? product.reviewCount.toLocaleString() : getMissingDataText('rating')}
                      </p>
                    </div>

                    {/* SECTION 2: Price & Value */}
                    {/* Price */}
                    <div
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        isLowestPrice
                          ? 'bg-sage-100 ring-2 ring-sage-500'
                          : isHighestPrice
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-700">Price</p>
                        {isLowestPrice && (
                          <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold">
                            Best
                          </span>
                        )}
                        {isHighestPrice && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                            High
                          </span>
                        )}
                      </div>
                      {hasValidPrice(product) ? (
                        <div>
                          <span className="text-lg sm:text-xl font-bold text-deep-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {sizeFormatted && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({sizeFormatted})
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">{getMissingDataText('price')}</p>
                      )}
                    </div>

                    {/* Value Score (PPML) - Only show if we have valid data */}
                    {hasPPMLData(product) && (
                      <div
                        className={`p-2 sm:p-3 rounded-xl transition-all ${
                          productIsBestValue
                            ? 'bg-sage-100 ring-2 ring-sage-500'
                            : productIsWorstValue
                              ? 'bg-orange-50 ring-2 ring-orange-400'
                              : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <p className="text-xs font-semibold text-gray-700">Value Score</p>
                            <Tooltip text="Price per milliliter — lower means better value for money">
                              <span></span>
                            </Tooltip>
                          </div>
                          {productIsBestValue && (
                            <span className="px-2 py-0.5 bg-sage-600 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                              <i className="ri-award-line"></i>
                              Best Value
                            </span>
                          )}
                          {productIsWorstValue && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                              Priciest
                            </span>
                          )}
                        </div>
                        <p className="text-base font-semibold text-deep-900">
                          {ppmlFormatted}
                        </p>
                      </div>
                    )}

                    {/* Size not available fallback */}
                    {!hasValidSize(product) && hasValidPrice(product) && (
                      <div className="p-2 sm:p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-xs text-gray-400 italic text-center">
                          {getMissingDataText('size')}
                        </p>
                      </div>
                    )}

                    {/* SECTION 3: Active Ingredient Concentrations */}
                    {hasActiveIngredients(product) && (
                      <div className="bg-white p-2 sm:p-3 rounded-xl">
                        <div className="flex items-center mb-2">
                          <p className="text-xs font-semibold text-gray-700">
                            Active Concentrations
                          </p>
                          <Tooltip text="Higher concentration is not always better — depends on formulation and your skin's tolerance">
                            <span></span>
                          </Tooltip>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {product.activeIngredients!.slice(0, 4).map((ingredient) => 
                            renderConcentrationRow(ingredient, product.id)
                          )}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: Concerns (Addresses) */}
                    <div className="bg-white p-2 sm:p-3 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Addresses:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.concerns.length > 0 ? (
                          product.concerns.slice(0, 3).map((concern, idx) => {
                            const isMatch = matchesConcern(concern, safeUserConcerns);

                            return (
                              <span
                                key={idx}
                                className={
                                  isMatch
                                    ? 'px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full capitalize font-medium'
                                    : 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize'
                                }
                              >
                                {concern}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not specified</span>
                        )}
                      </div>
                    </div>

                    {/* SECTION 5: Key Ingredients */}
                    <div className="bg-white p-2 sm:p-3 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Key Ingredients:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.keyIngredients.length > 0 ? (
                          product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                            const isRecommended = matchesIngredient(ingredient, safeUserConcerns);

                            return (
                              <span
                                key={idx}
                                className={
                                  isRecommended
                                    ? 'px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-medium'
                                    : 'px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full'
                                }
                              >
                                {ingredient}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">{getMissingDataText('ingredients')}</span>
                        )}
                      </div>
                    </div>

                    {/* Skin Types */}
                    <div className="bg-white p-2 sm:p-3 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Skin Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.skinTypes.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 6: Preferences */}
                    {product.preferences && Object.values(product.preferences).some(v => v === true) && (
                      <div className="bg-white p-2 sm:p-3 rounded-xl">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Preferences:</p>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const userPrefs = JSON.parse(localStorage.getItem('skinSurveyData') || '{}').preferences || {};
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
                            
                            const productPrefs = product.preferences || {};
                            
                            // Only show preferences that the product has
                            return Object.entries(productPrefs)
                              .filter(([_, value]) => value === true)
                              .map(([key]) => {
                                const isMatching = userPrefs[key] === true;
                                return (
                                  <span
                                    key={key}
                                    className={
                                      isMatching
                                        ? 'px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full font-medium border border-sage-300'
                                        : 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
                                    }
                                  >
                                    {isMatching && <i className="ri-check-line mr-0.5"></i>}
                                    {prefLabels[key] || key}
                                  </span>
                                );
                              });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handleViewProductDetail(product.id)}
                      className="w-full px-4 py-2.5 sm:py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-700 transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-cream-100 rounded-xl sm:rounded-2xl">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Legend:</h4>
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-sage-600 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">Best Value / Matches Profile</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">Lower Value / Priciest</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-trophy-line text-amber-500"></i>
                <span className="text-xs sm:text-sm text-gray-700">Highest Concentration</span>
              </div>
            </div>
            {/* Data completeness indicator */}
            <div className="text-xs text-gray-500 pt-2 border-t border-cream-300">
              <span className="mr-4">
                {comparisonMetrics.productsWithPPML}/{safeProducts.length} products have size info
              </span>
              <span>
                {comparisonMetrics.productsWithConcentration}/{safeProducts.length} have concentration data
              </span>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 sm:mt-8 text-center pb-4">
            <button
              onClick={onClose}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base"
            >
              Close Comparison
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
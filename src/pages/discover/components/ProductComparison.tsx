import { useNavigate } from 'react-router-dom';
import { matchesConcern, matchesIngredient } from '../../../utils/matching';
import type { Product } from '../../../types/product';

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

export default function ProductComparison({
  products,
  userConcerns,
  onClose,
  onRemoveProduct,
}: ProductComparisonProps) {
  const navigate = useNavigate();

  // Safe fallbacks to prevent undefined errors
  const safeProducts = products ?? [];
  const safeUserConcerns = userConcerns ?? [];

  const handleViewProductDetail = (productId: number) => {
    onClose();
    navigate(`/product-detail?id=${productId}`);
  };

  // Calculate comparison highlights
  const getComparisonHighlights = (): ComparisonHighlights => {
    if (safeProducts.length === 0) return {};

    const prices = safeProducts.map((p) => p.price);
    const ratings = safeProducts.map((p) => p.rating);
    const reviewCounts = safeProducts.map((p) => p.reviewCount);

    return {
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      highestRating: Math.max(...ratings),
      lowestRating: Math.min(...ratings),
      mostReviews: Math.max(...reviewCounts),
      leastReviews: Math.min(...reviewCounts),
    };
  };

  const highlights = getComparisonHighlights();

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

  return (
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
              <p className="text-sm text-gray-600">
                Compare {safeProducts.length} products side by side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {safeProducts.map((product) => {
              const isLowestPrice =
                product.price === highlights.lowestPrice && safeProducts.length > 1;
              const isHighestPrice =
                product.price === highlights.highestPrice && safeProducts.length > 1;
              const isHighestRating =
                product.rating === highlights.highestRating && safeProducts.length > 1;
              const isLowestRating =
                product.rating === highlights.lowestRating && safeProducts.length > 1;
              const hasMostReviews =
                product.reviewCount === highlights.mostReviews && safeProducts.length > 1;
              const hasLeastReviews =
                product.reviewCount === highlights.leastReviews && safeProducts.length > 1;

              return (
                <div
                  key={product.id}
                  className="bg-cream-50 rounded-2xl overflow-hidden border-2 border-sage-200"
                >
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
                        onRemoveProduct((product.id));
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
                    <div
                      className={`p-3 rounded-xl transition-all ${
                        isHighestRating
                          ? 'bg-sage-100 ring-2 ring-sage-600'
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
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    {/* Review Count */}
                    <div
                      className={`p-3 rounded-xl transition-all ${
                        hasMostReviews
                          ? 'bg-sage-100 ring-2 ring-sage-600'
                          : hasLeastReviews
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : 'bg-white'
                      }`}
                    >
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
                    <div
                      className={`p-3 rounded-xl transition-all ${
                        isLowestPrice
                          ? 'bg-sage-100 ring-2 ring-sage-600'
                          : isHighestPrice
                            ? 'bg-orange-50 ring-2 ring-orange-400'
                            : 'bg-white'
                      }`}
                    >
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
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Ingredients - highlights recommended ingredients */}
                    <div className="bg-white p-3 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Key Ingredients:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
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
                        })}
                      </div>
                    </div>

                    {/* Concerns (Addresses) - highlights matching user concerns */}
                    <div className="bg-white p-3 rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Addresses:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.concerns.slice(0, 2).map((concern, idx) => {
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
                        })}
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
                <span className="text-sm text-gray-700">
                  Best Value / Highest Rating / Matches Your Profile
                </span>
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
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
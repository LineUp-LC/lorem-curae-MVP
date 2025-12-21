
import { productData } from '../../../mocks/products';
import { useNavigate } from 'react-router-dom';

interface SimilarProductsProps {
  productId: number;
  onAddToComparison: (id: number) => void;
  selectedForComparison: number[];
}

const SimilarProducts = ({ productId, onAddToComparison, selectedForComparison }: SimilarProductsProps) => {
  const navigate = useNavigate();
  const currentProduct = productData.find(p => p.id === productId);
  
  if (!currentProduct) return null;

  // Find similar products based on category and concerns
  const similarProducts = productData
    .filter(p => 
      p.id !== productId && 
      (p.category === currentProduct.category || 
       p.concerns.some(concern => currentProduct.concerns.includes(concern)))
    )
    .slice(0, 4);

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
    <div className="py-12 px-6 lg:px-12 bg-cream-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-forest-900 mb-3">Similar Products</h2>
          <p className="text-gray-600">
            Compare alternatives based on your skin type, concerns, and budget
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((product) => {
            const isSelected = selectedForComparison.includes(product.id);
            const canSelect = selectedForComparison.length < 3 || isSelected;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 group ${
                  isSelected ? 'border-forest-900' : 'border-gray-100'
                }`}
              >
                {/* Product Image */}
                <div 
                  onClick={() => navigate(`/product-search-detail/${product.id}`)}
                  className="relative w-full h-80 overflow-hidden bg-gray-50 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Compare Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canSelect) {
                        onAddToComparison(product.id);
                      }
                    }}
                    disabled={!canSelect}
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      isSelected
                        ? 'bg-forest-900 text-white'
                        : canSelect
                        ? 'bg-white/90 text-gray-700 hover:bg-forest-900 hover:text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <i className="ri-check-line text-xl"></i>
                    ) : (
                      <i className="ri-scales-line text-xl"></i>
                    )}
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  {/* Brand */}
                  <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-2">
                    {product.brand}
                  </p>

                  {/* Product Name */}
                  <h3 
                    onClick={() => navigate(`/product-search-detail/${product.id}`)}
                    className="text-lg font-semibold text-forest-900 mb-2 line-clamp-2 cursor-pointer hover:text-sage-600 transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                  </div>

                  {/* Key Ingredients */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.keyIngredients.slice(0, 2).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-forest-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.price !== currentProduct.price && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.price < currentProduct.price ? (
                            <span className="text-green-600">
                              <i className="ri-arrow-down-line"></i> 
                              ${(currentProduct.price - product.price).toFixed(2)} less
                            </span>
                          ) : (
                            <span className="text-red-600">
                              <i className="ri-arrow-up-line"></i> 
                              ${(product.price - currentProduct.price).toFixed(2)} more
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/product-search-detail/${product.id}`)}
                      className="px-4 py-2 bg-sage-600 text-white rounded-full font-semibold text-sm hover:bg-sage-700 transition-all shadow-md cursor-pointer whitespace-nowrap"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Hint */}
        {selectedForComparison.length > 0 && (
          <div className="mt-8 p-6 bg-sage-50 border border-sage-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-sage-100 rounded-full">
                  <i className="ri-scales-line text-2xl text-sage-600"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-forest-900">
                    {selectedForComparison.length} product{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedForComparison.length < 3 
                      ? `Select up to ${3 - selectedForComparison.length} more to compare side-by-side`
                      : 'Click the compare button to view detailed comparison'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarProducts;

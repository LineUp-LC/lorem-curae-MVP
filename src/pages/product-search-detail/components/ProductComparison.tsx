
import { productData } from '../../../mocks/products';
import { useNavigate } from 'react-router-dom';

interface ProductComparisonProps {
  productIds: number[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

const ProductComparison = ({ productIds, onClose, onRemove }: ProductComparisonProps) => {
  const navigate = useNavigate();
  const products = productData.filter(p => productIds.includes(p.id));

  // Return early if no products to compare
  if (products.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-serif text-forest-900 mb-4">No Products Selected</h2>
          <p className="text-gray-600 mb-6">Please select at least one product to compare.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Mock user profile
  const userProfile = {
    skinType: 'combination',
    concerns: ['hydration', 'texture'],
    budget: 50
  };

  // Mock retailer data for availability
  const getRetailerAvailability = (productId: number) => {
    const retailers = [
      { name: 'Sephora', inStock: Math.random() > 0.3, price: '+$2.99 shipping' },
      { name: 'Ulta', inStock: Math.random() > 0.2, price: 'Free shipping' },
      { name: 'Target', inStock: Math.random() > 0.4, price: '$35+ free ship' },
      { name: 'Amazon', inStock: Math.random() > 0.1, price: 'Prime eligible' }
    ];
    return retailers.filter(r => r.inStock).slice(0, 2 + Math.floor(Math.random() * 2));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    // Ensure rating is within valid range
    const validRating = Math.min(Math.max(rating, 0), 5);
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
    }
    const emptyStars = 5 - Math.ceil(validRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-serif text-forest-900 mb-2">Product Comparison</h2>
            <p className="text-gray-600">Compare features, ingredients, and pricing side-by-side</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all cursor-pointer"
          >
            <i className="ri-close-line text-2xl text-gray-700"></i>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-cream-50 rounded-tl-xl font-semibold text-gray-700 w-48">
                    Feature
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 bg-cream-50 last:rounded-tr-xl">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="w-32 h-40 rounded-lg overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <button
                            onClick={() => onRemove(product.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all cursor-pointer"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-sage-600 uppercase mb-1">
                            {product.brand}
                          </p>
                          <h3 className="text-sm font-semibold text-forest-900 line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold text-gray-700">Price</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="text-2xl font-bold text-forest-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.price <= userProfile.budget && (
                        <p className="text-xs text-green-600 mt-1">
                          <i className="ri-check-line"></i> Within budget
                        </p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b border-gray-100 bg-cream-50/50">
                  <td className="p-4 font-semibold text-gray-700">Rating</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {product.rating} ({product.reviewCount.toLocaleString()})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Skin Type Match */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold text-gray-700">
                    Skin Type Match
                    <p className="text-xs text-gray-500 font-normal mt-1">
                      Your type: {userProfile.skinType}
                    </p>
                  </td>
                  {products.map((product) => {
                    const isMatch = product.skinTypes.includes(userProfile.skinType) || 
                                   product.skinTypes.includes('all');
                    return (
                      <td key={product.id} className="p-4 text-center">
                        {isMatch ? (
                          <div className="inline-flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-full">
                            <i className="ri-check-line"></i>
                            <span className="text-sm font-semibold">Perfect Match</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-full">
                            <i className="ri-information-line"></i>
                            <span className="text-sm">Not Ideal</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Concerns Match */}
                <tr className="border-b border-gray-100 bg-cream-50/50">
                  <td className="p-4 font-semibold text-gray-700">
                    Addresses Your Concerns
                    <p className="text-xs text-gray-500 font-normal mt-1">
                      Your concerns: {userProfile.concerns.join(', ')}
                    </p>
                  </td>
                  {products.map((product) => {
                    const matchedConcerns = product.concerns.filter(c => 
                      userProfile.concerns.includes(c)
                    );
                    return (
                      <td key={product.id} className="p-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-2xl font-bold text-sage-600">
                            {matchedConcerns.length}/{userProfile.concerns.length}
                          </span>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {matchedConcerns.map((concern, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                              >
                                {concern}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Key Ingredients */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-semibold text-gray-700">Key Ingredients</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {product.keyIngredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cream-100 text-gray-700 text-xs rounded-full"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Retailer Availability */}
                <tr className="border-b border-gray-100 bg-cream-50/50">
                  <td className="p-4 font-semibold text-gray-700">
                    Available At
                    <p className="text-xs text-gray-500 font-normal mt-1">
                      Where you can buy this product
                    </p>
                  </td>
                  {products.map((product) => {
                    const availableRetailers = getRetailerAvailability(product.id);
                    return (
                      <td key={product.id} className="p-4">
                        <div className="flex flex-col items-center space-y-2">
                          {availableRetailers.length > 0 ? (
                            <div className="flex flex-wrap gap-2 justify-center max-w-48">
                              {availableRetailers.map((retailer, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 bg-white border border-green-200 rounded-lg text-center shadow-sm"
                                >
                                  <div className="text-xs font-semibold text-forest-900">
                                    {retailer.name}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    <i className="ri-check-line mr-1"></i>
                                    In Stock
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {retailer.price}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-2 bg-red-50 text-red-600 rounded-full text-sm">
                              <i className="ri-close-line mr-1"></i>
                              Limited Stock
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 font-semibold text-gray-700">Actions</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          onClick={() => {
                            navigate(`/product-search-detail/${product.id}`);
                            onClose();
                          }}
                          className="w-full px-4 py-2 bg-sage-600 text-white rounded-full font-semibold text-sm hover:bg-sage-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            // Save to routine logic
                            try {
                              const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
                              if (!savedProducts.find((p: any) => p.id === product.id)) {
                                savedProducts.push({
                                  id: product.id,
                                  name: product.name,
                                  brand: product.brand,
                                  image: product.image,
                                  price: product.price,
                                  category: product.category,
                                  savedAt: new Date().toISOString()
                                });
                                localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
                                alert('Product saved to your routine!');
                              } else {
                                alert('Product already in your routine!');
                              }
                            } catch (error) {
                              console.error('Error saving product:', error);
                              alert('Unable to save product. Please try again.');
                            }
                          }}
                          className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full font-semibold text-sm hover:border-sage-600 hover:text-sage-600 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Save to Routine
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-6 bg-sage-50 border-t border-sage-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 flex items-center justify-center bg-sage-100 rounded-full flex-shrink-0">
              <i className="ri-lightbulb-line text-2xl text-sage-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-forest-900 mb-2">
                Our Recommendation
              </h3>
              <p className="text-gray-700">
                Based on your {userProfile.skinType} skin type and concerns ({userProfile.concerns.join(', ')}), 
                we recommend choosing products that match your skin type and address at least one of your primary concerns. 
                Consider your budget of ${userProfile.budget} when making your final decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;

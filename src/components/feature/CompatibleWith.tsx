import { useNavigate, Link } from 'react-router-dom';
import { productData } from '../../mocks/products';
import { getEffectiveConcerns, getEffectiveSkinType, getEffectivePreferences } from '../../lib/utils/sessionState';
import { matchesConcern, matchesIngredient } from '../../lib/utils/matching';
import { findCompatibleProducts } from '../../lib/utils/productSimilarity';

interface CompatibleWithProps {
  productId: number;
}

const CompatibleWith = ({ productId }: CompatibleWithProps) => {
  const navigate = useNavigate();
  const currentProduct = productData.find(p => p.id === productId);
  const userConcerns = getEffectiveConcerns();
  const userSkinType = getEffectiveSkinType();
  const userPreferences = getEffectivePreferences();

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

  if (!currentProduct) return null;

  const compatibleProducts = findCompatibleProducts(
    currentProduct,
    userConcerns,
    userSkinType,
  );

  if (compatibleProducts.length === 0) return null;

  const getProductUrl = (id: number) => `/product-detail?id=${id}`;

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
    <div className="py-12 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-deep-900 mb-3">Compatible With</h2>
          <p className="text-gray-600">
            See which products pair safely with this one
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {compatibleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-gray-100 group"
            >
              {/* Product Image */}
              <div
                onClick={() => navigate(getProductUrl(product.id))}
                className="relative w-full h-72 overflow-hidden bg-gray-50 cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />

                {/* Compatibility Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm ${
                      product.compatibilityLevel === 'fully-compatible'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <i
                      className={
                        product.compatibilityLevel === 'fully-compatible'
                          ? 'ri-shield-check-line'
                          : 'ri-alert-line'
                      }
                    ></i>
                    {product.compatibilityLevel === 'fully-compatible'
                      ? 'Fully Compatible'
                      : 'Use With Care'}
                  </span>
                </div>

                {/* Category Label */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-white/90 text-deep-900 rounded-full capitalize shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                {/* Brand */}
                <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-2">
                  {product.brand}
                </p>

                {/* Product Name */}
                <h3
                  onClick={() => navigate(getProductUrl(product.id))}
                  className="text-lg font-semibold text-deep-900 mb-2 line-clamp-2 cursor-pointer hover:text-taupe transition-colors"
                >
                  {product.name}
                </h3>

                {/* Rating */}
                <Link
                  to={`/reviews-products?id=${product.id}`}
                  className="flex items-center space-x-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                  <span className="text-sm text-gray-500 hover:text-primary transition-colors">
                    ({product.reviewCount})
                  </span>
                </Link>

                {/* Compatibility Reasons */}
                {product.compatibilityReasons.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Why it pairs well:</p>
                    <div className="space-y-1">
                      {product.compatibilityReasons.map((reason, idx) => (
                        <p key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <i className="ri-check-double-line text-green-600 mt-0.5 flex-shrink-0"></i>
                          <span className="line-clamp-2">{reason}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caution Notes */}
                {product.cautionNotes.length > 0 && (
                  <div className="mb-3">
                    <div className="space-y-1">
                      {product.cautionNotes.slice(0, 1).map((note, idx) => (
                        <p key={idx} className="text-xs text-amber-600 flex items-start gap-1.5">
                          <i className="ri-information-line mt-0.5 flex-shrink-0"></i>
                          <span className="line-clamp-2">{note}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {product.concerns && product.concerns.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Addresses:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.concerns.slice(0, 3).map((concern, idx) => {
                        const isConcernMatch = matchesConcern(concern, userConcerns);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs rounded-full capitalize border ${
                              isConcernMatch
                                ? 'bg-light/30 text-primary-700 font-medium border border-primary-300'
                                : 'bg-cream-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {isConcernMatch && <i className="ri-check-line mr-0.5"></i>}
                            {concern}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Key Ingredients */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Key Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                      const isMatch = matchesIngredient(ingredient, userConcerns);
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            isMatch
                              ? 'bg-light/30 text-primary-700 font-medium border border-primary-300'
                              : 'bg-cream-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {isMatch && <i className="ri-check-line mr-0.5"></i>}
                          {ingredient}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Preferences */}
                {product.preferences && Object.values(product.preferences).some(v => v === true) && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Preferences:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(product.preferences)
                        .filter(([_, value]) => value === true)
                        .map(([key]) => {
                          const isPrefMatch = userPreferences[key] === true;
                          return (
                            <span
                              key={key}
                              className={`px-2 py-1 text-xs rounded-full border ${
                                isPrefMatch
                                  ? 'bg-light/30 text-primary-700 font-medium border border-primary-300'
                                  : 'bg-cream-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {isPrefMatch && <i className="ri-check-line mr-0.5"></i>}
                              {preferenceLabels[key] || key}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Estimated price range</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-deep-900">
                      ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
                    </span>
                    <button
                      onClick={() => navigate(getProductUrl(product.id))}
                      className="px-4 py-2 bg-taupe text-white rounded-full font-semibold text-sm hover:bg-taupe-700 transition-all cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompatibleWith;

import { useState, useEffect } from 'react';
import { productData } from '../../../mocks/products';
import { useNavigate } from 'react-router-dom';
import ComparisonPickerModal from '../../../components/feature/ComparisonPickerModal';
import type { Product } from '../../../types/product';

interface SimilarProductsProps {
  productId: number;
}

const SimilarProducts = ({ productId }: SimilarProductsProps) => {
  const navigate = useNavigate();
  const currentProduct = productData.find(p => p.id === productId);
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({});
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Load user preferences and concerns
  useEffect(() => {
    const skinData = localStorage.getItem('skinSurveyData');
    if (skinData) {
      const parsed = JSON.parse(skinData);
      if (parsed.preferences) {
        setUserPreferences(parsed.preferences);
      }
      if (parsed.concerns) {
        setUserConcerns(parsed.concerns.map((c: string) => c.toLowerCase()));
      }
    }
  }, []);

  // Check if preference matches user's preferences
  const isPreferenceMatching = (prefKey: string): boolean => {
    return userPreferences[prefKey] === true;
  };

  // Check if concern matches user's concerns
  const isConcernMatching = (concern: string): boolean => {
    return userConcerns.some(uc => 
      concern.toLowerCase().includes(uc) || uc.includes(concern.toLowerCase())
    );
  };

  // Check if ingredient is beneficial for user's concerns
  const isIngredientMatching = (ingredient: string): boolean => {
    const ingredientConcernMap: Record<string, string[]> = {
      'hyaluronic acid': ['hydration', 'dryness', 'fine lines', 'aging'],
      'vitamin c': ['brightening', 'dark spots', 'dullness', 'hyperpigmentation'],
      'niacinamide': ['pores', 'oily', 'texture', 'acne', 'brightening'],
      'retinol': ['aging', 'fine lines', 'wrinkles', 'texture', 'acne'],
      'salicylic acid': ['acne', 'pores', 'oily', 'blackheads'],
      'ceramides': ['hydration', 'barrier', 'sensitivity', 'dryness'],
      'centella asiatica': ['sensitivity', 'redness', 'irritation', 'acne'],
      'glycerin': ['hydration', 'dryness'],
      'squalane': ['hydration', 'dryness', 'barrier'],
      'peptides': ['aging', 'fine lines', 'firmness'],
      'vitamin e': ['hydration', 'protection', 'aging'],
      'zinc': ['acne', 'oily', 'inflammation'],
      'azelaic acid': ['acne', 'redness', 'hyperpigmentation'],
      'aha': ['texture', 'dullness', 'aging'],
      'bha': ['acne', 'pores', 'oily'],
    };
    
    const ingredientLower = ingredient.toLowerCase();
    const relatedConcerns = ingredientConcernMap[ingredientLower] || [];
    
    return userConcerns.some(uc => 
      relatedConcerns.some(rc => rc.includes(uc) || uc.includes(rc))
    );
  };

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

  const handleToggleComparison = (id: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      // Max 3 products (including current product which will be added)
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleOpenComparisonModal = () => {
    setShowComparisonModal(true);
  };

  // Get selected products for the modal
  const getSelectedProducts = (): Product[] => {
    return productData.filter(p => selectedForComparison.includes(p.id));
  };

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
          <h2 className="text-3xl font-serif text-deep-900 mb-3">Similar Products</h2>
          <p className="text-gray-600">
            Compare alternatives based on your skin type, concerns, and budget
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((product) => {
            const isSelected = selectedForComparison.includes(product.id);
            // Max 2 similar products can be selected (+ current product = 3 total)
            const canSelect = selectedForComparison.length < 2 || isSelected;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 group ${
                  isSelected ? 'border-cream-900' : 'border-gray-100'
                }`}
              >
                {/* Product Image */}
                <div 
                  onClick={() => navigate(`/product-detail?id=${product.id}`)}
                  className="relative w-full h-80 overflow-hidden bg-gray-50 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canSelect) {
                        handleToggleComparison(product.id);
                      }
                    }}
                    disabled={!canSelect}
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white'
                        : canSelect
                        ? 'bg-white/90 text-gray-700 hover:bg-primary hover:text-white'
                        : 'bg-cream-300 text-gray-500 cursor-not-allowed'
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
                  <p className="text-xs font-semibold text-taupe uppercase tracking-wide mb-2">
                    {product.brand}
                  </p>

                  {/* Product Name */}
                  <h3 
                    onClick={() => navigate(`/product-detail?id=${product.id}`)}
                    className="text-lg font-semibold text-deep-900 mb-2 line-clamp-2 cursor-pointer hover:text-taupe transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>

                  {/* Concerns */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Addresses:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.concerns.slice(0, 3).map((concern, idx) => {
                        const isMatch = isConcernMatching(concern);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs rounded-full capitalize border ${
                              isMatch
                                ? 'bg-taupe-100 text-taupe-700 font-medium border-taupe-300'
                                : 'bg-cream-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {isMatch && <i className="ri-check-line mr-0.5"></i>}
                            {concern}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Ingredients */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Key Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                        const isMatchingIngredient = isIngredientMatching(ingredient);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs rounded-full border ${
                              isMatchingIngredient
                                ? 'bg-taupe-100 text-taupe-700 font-medium border-taupe-300'
                                : 'bg-cream-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {ingredient}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferences */}
                  {product.preferences && Object.values(product.preferences).some(v => v === true) && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Product Preferences:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product.preferences)
                          .filter(([_, value]) => value === true)
                          .map(([key]) => {
                            const isMatch = isPreferenceMatching(key);
                            return (
                              <span
                                key={key}
                                className={`px-2 py-1 text-xs rounded-full border ${
                                  isMatch
                                    ? 'bg-taupe-100 text-taupe-700 font-medium border-taupe-300'
                                    : 'bg-cream-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                {isMatch && <i className="ri-check-line mr-0.5"></i>}
                                {preferenceLabels[key] || key}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Price Comparison */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Estimated price range</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-deep-900">
                          ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
                        </span>
                        {product.price !== currentProduct.price && (
                          <p className="text-xs mt-1">
                            {product.price < currentProduct.price ? (
                              <span className="text-green-600 font-medium">
                                <i className="ri-arrow-down-line"></i>
                                ${(currentProduct.price - product.price).toFixed(2)} less
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                <i className="ri-arrow-up-line"></i>
                                ${(product.price - currentProduct.price).toFixed(2)} more
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Button - shows when products are selected */}
        {selectedForComparison.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleOpenComparisonModal}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-all cursor-pointer flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <i className="ri-scales-line text-xl"></i>
              Compare {selectedForComparison.length + 1} Products
            </button>
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      <ComparisonPickerModal
        isOpen={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setSelectedForComparison([]);
        }}
        currentlyViewingProduct={currentProduct}
        preSelectedProducts={[currentProduct, ...getSelectedProducts()]}
        userConcerns={userConcerns}
        showSelectionView={true}
      />
    </div>
  );
};

export default SimilarProducts;
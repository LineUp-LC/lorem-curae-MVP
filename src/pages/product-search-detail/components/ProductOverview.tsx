
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productData } from '../../../mocks/products';

interface ProductOverviewProps {
  productId: number;
  onAddToComparison: (id: number) => void;
  isInComparison: boolean;
}

const ProductOverview = ({ productId, onAddToComparison, isInComparison }: ProductOverviewProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const product = productData.find(p => p.id === productId);
  
  if (!product) return null;

  // Mock user profile data
  const userProfile = {
    skinType: 'combination',
    concerns: ['hydration', 'texture'],
    location: 'New York, NY',
    climate: 'Humid Continental',
    uvIndex: 'Moderate (5-6)',
    pollution: 'Moderate',
    season: 'Spring'
  };

  const isRecommendedForUser = product.skinTypes.includes(userProfile.skinType) &&
    product.concerns.some(concern => userProfile.concerns.includes(concern));

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

  const handleSaveToRoutine = () => {
    // Save to localStorage for routine page
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
  };

  return (
    <div className="py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/discover" className="hover:text-sage-600 transition-colors cursor-pointer">Products</a>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-forest-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <div className="w-full h-[600px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-full h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-sage-600' : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Personalized Badge */}
            {isRecommendedForUser && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-sage-100 text-sage-800 rounded-full mb-4">
                <i className="ri-sparkling-line"></i>
                <span className="text-sm font-semibold">Recommended for Your Skin</span>
              </div>
            )}

            {/* Brand */}
            <p className="text-sm font-semibold text-sage-600 uppercase tracking-wide mb-2">
              {product.brand}
            </p>

            {/* Product Name */}
            <h1 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-lg font-semibold text-gray-900">{product.rating}</span>
              <span className="text-gray-500">({product.reviewCount.toLocaleString()} reviews)</span>
              <button
                onClick={() => {
                  const reviewsSection = document.getElementById('reviews-section');
                  if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-sage-600 hover:text-sage-700 font-medium text-sm cursor-pointer hover:underline ml-2"
              >
                View Reviews
              </button>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-forest-900">${product.price.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">+ shipping &amp; taxes (estimated at checkout)</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2 mb-6">
              {product.inStock ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Core Ingredients - Clickable for Patch Test */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-forest-900 mb-3">Core Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.keyIngredients.map((ingredient, idx) => (
                  <Link
                    key={idx}
                    to={`/ingredient-patch-test?name=${encodeURIComponent(ingredient)}&type=Active Ingredient`}
                    className="px-4 py-2 bg-sage-100 text-sage-700 rounded-full font-medium hover:bg-sage-200 transition-colors cursor-pointer border-2 border-sage-300 hover:border-sage-500"
                  >
                    {ingredient}
                    <i className="ri-flask-line ml-2 text-sm"></i>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <i className="ri-information-line mr-1"></i>
                Click any ingredient to learn more and perform a patch test
              </p>
            </div>

            {/* Skin Types */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-forest-900 mb-3">Suitable For</h3>
              <div className="flex flex-wrap gap-2">
                {product.skinTypes.map((type, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-full font-medium capitalize ${
                      type === userProfile.skinType
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type === 'all' ? 'All Skin Types' : type}
                  </span>
                ))}
              </div>
            </div>

            {/* Environmental Context */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                  <i className="ri-map-pin-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-forest-900 mb-1">
                    Personalized for Your Location
                  </h3>
                  <p className="text-sm text-gray-600">
                    Based on your profile: {userProfile.location}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Climate</p>
                  <p className="text-sm font-medium text-gray-900">{userProfile.climate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">UV Index</p>
                  <p className="text-sm font-medium text-gray-900">{userProfile.uvIndex}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pollution Level</p>
                  <p className="text-sm font-medium text-gray-900">{userProfile.pollution}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Season</p>
                  <p className="text-sm font-medium text-gray-900">{userProfile.season}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSaveToRoutine}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-sage-600 text-white rounded-full font-semibold text-lg hover:bg-sage-700 transition-all shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
              >
                <i className="ri-bookmark-line text-xl"></i>
                <span>Save to Routine</span>
              </button>
              
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`px-6 py-4 rounded-full font-semibold transition-all border-2 cursor-pointer whitespace-nowrap ${
                  isFavorited
                    ? 'bg-coral-500 text-white border-coral-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-coral-500'
                }`}
              >
                <i className={`${isFavorited ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
              </button>

              <button
                onClick={() => onAddToComparison(productId)}
                className={`px-6 py-4 rounded-full font-semibold transition-all border-2 cursor-pointer whitespace-nowrap ${
                  isInComparison
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-forest-900'
                }`}
              >
                <i className="ri-scales-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOverview;

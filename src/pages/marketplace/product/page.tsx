import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { cartState } from '../../../lib/utils/cartState';

interface MarketplaceProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  category: string;
  concerns: string[];
  keyIngredients: string[];
  preferences: {
    vegan: boolean;
    crueltyFree: boolean;
    fragranceFree: boolean;
    glutenFree: boolean;
    alcoholFree: boolean;
    siliconeFree: boolean;
    plantBased: boolean;
    chemicalFree: boolean;
  };
  storefrontName: string;
  storefrontId: number;
}

// Mock marketplace product data
const mockProduct: MarketplaceProduct = {
  id: 1,
  name: 'Hydrating Rose Water Toner',
  brand: 'Glow Naturals',
  price: 28.00,
  originalPrice: 35.00,
  description: 'A gentle, alcohol-free toner infused with pure rose water extract to balance and hydrate your skin. Perfect for all skin types, especially sensitive and dry skin. Helps minimize pores and prepare skin for better absorption of serums and moisturizers.',
  images: [
    'https://readdy.ai/api/search-image?query=rose%20water%20toner%20in%20elegant%20pink%20glass%20bottle%20with%20rose%20petals%20on%20white%20marble%20background%20professional%20product%20photography&width=600&height=600&seq=marketplace-product-1&orientation=squarish',
    'https://readdy.ai/api/search-image?query=rose%20water%20skincare%20toner%20texture%20close%20up%20on%20skin%20dewy%20glow%20professional%20beauty%20photography&width=600&height=600&seq=marketplace-product-2&orientation=squarish',
    'https://readdy.ai/api/search-image?query=rose%20petals%20and%20skincare%20bottle%20flat%20lay%20minimal%20aesthetic%20clean%20white%20background&width=600&height=600&seq=marketplace-product-3&orientation=squarish',
  ],
  rating: 4.8,
  reviewCount: 342,
  inStock: true,
  category: 'Toner',
  concerns: ['Dryness & Dehydration', 'Sensitivity', 'Large Pores'],
  keyIngredients: ['Rose Water', 'Hyaluronic Acid', 'Aloe Vera', 'Glycerin'],
  preferences: {
    vegan: true,
    crueltyFree: true,
    fragranceFree: false,
    glutenFree: true,
    alcoholFree: true,
    siliconeFree: true,
    plantBased: true,
    chemicalFree: false,
  },
  storefrontName: 'Glow Naturals',
  storefrontId: 1,
};

export default function MarketplaceProductDetailPage() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<MarketplaceProduct>(mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [userSkinProfile, setUserSkinProfile] = useState<any>(null);

  useEffect(() => {
    // Load user skin profile for preference highlighting
    const savedProfile = localStorage.getItem('skinSurveyData');
    if (savedProfile) {
      setUserSkinProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleAddToCart = () => {
    setAddingToCart(true);
    
    cartState.addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      inStock: product.inStock,
      quantity: quantity,
    });

    setTimeout(() => {
      setAddingToCart(false);
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    }, 500);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i
          key={i}
          className={`ri-star-${i < fullStars ? 'fill' : 'line'} text-lg ${
            i < fullStars ? 'text-amber-400' : 'text-gray-300'
          }`}
        ></i>
      );
    }
    return stars;
  };

  // Check if a preference matches user's profile
  const isPreferenceMatching = (prefKey: string): boolean => {
    if (!userSkinProfile?.preferences) return false;
    return userSkinProfile.preferences[prefKey] === true;
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

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center gap-2 text-gray-500">
              <li><Link to="/marketplace" className="hover:text-sage-600">Marketplace</Link></li>
              <li>/</li>
              <li><Link to={`/storefront/${product.storefrontId}`} className="hover:text-sage-600">{product.storefrontName}</Link></li>
              <li>/</li>
              <li className="text-gray-900">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden bg-white transition-all ${
                      selectedImage === index ? 'ring-2 ring-sage-500' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <Link 
                  to={`/storefront/${product.storefrontId}`}
                  className="text-sm font-medium text-sage-600 hover:text-sage-700 mb-2 inline-block"
                >
                  {product.brand}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">{renderStars(product.rating)}</div>
                  <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                  {product.originalPrice && (
                    <span className="px-2 py-1 bg-coral-100 text-coral-700 text-sm font-medium rounded-full">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              {/* Preference Tags (Task 9) */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.preferences).map(([key, value]) => {
                    if (!value) return null;
                    const isMatching = isPreferenceMatching(key);
                    return (
                      <span
                        key={key}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                          isMatching
                            ? 'bg-sage-100 text-sage-700 border border-sage-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isMatching && <i className="ri-check-line mr-1"></i>}
                        {preferenceLabels[key]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Key Ingredients */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {product.keyIngredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-cream-100 text-gray-700 text-sm rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-subtract-line"></i>
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    product.inStock
                      ? 'bg-sage-600 hover:bg-sage-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-cart-line text-xl"></i>
                      Add to Cart
                    </>
                  )}
                </button>

                {showAddedToCart && (
                  <div className="mt-4 p-4 bg-sage-50 border border-sage-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sage-700">
                      <i className="ri-check-line text-xl"></i>
                      <span className="font-medium">Added to cart!</span>
                    </div>
                    <Link
                      to="/cart"
                      className="text-sage-600 hover:text-sage-700 font-medium text-sm"
                    >
                      View Cart →
                    </Link>
                  </div>
                )}

                {!product.inStock && (
                  <p className="mt-4 text-center text-red-500 font-medium">
                    <i className="ri-error-warning-line mr-1"></i>
                    This product is currently out of stock
                  </p>
                )}
              </div>

              {/* Store Info */}
              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center">
                    <i className="ri-store-2-line text-sage-600 text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.storefrontName}</p>
                    <p className="text-sm text-gray-500">Verified Marketplace Seller</p>
                  </div>
                  <Link
                    to={`/storefront/${product.storefrontId}`}
                    className="px-4 py-2 border border-sage-600 text-sage-600 rounded-lg hover:bg-sage-50 transition-colors text-sm font-medium"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const StorefrontDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({});
  const [userConcerns, setUserConcerns] = useState<string[]>([]);

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

  const isPreferenceMatching = (prefKey: string): boolean => {
    return userPreferences[prefKey] === true;
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

  const storefront = {
    id: 1,
    name: 'Glow Naturals',
    tagline: 'Clean Beauty for Radiant Skin',
    description: 'At Glow Naturals, we believe that beauty should be clean, effective, and accessible. Our mission is to provide high-quality, natural skincare products that deliver real results without compromising on safety or sustainability. Every product is carefully formulated with ethically sourced ingredients and backed by science.',
    logo: 'https://readdy.ai/api/search-image?query=minimalist%20modern%20skincare%20brand%20logo%20clean%20aesthetic%20natural%20beauty%20leaf%20icon%20professional%20design&width=200&height=200&seq=storefront-detail-logo&orientation=squarish',
    banner: 'https://readdy.ai/api/search-image?query=natural%20organic%20skincare%20products%20arranged%20beautifully%20minimal%20aesthetic%20clean%20white%20background%20botanical%20elements%20professional%20product%20photography&width=1200&height=400&seq=storefront-detail-banner&orientation=landscape',
    followers: 12458,
    products: 45,
    rating: 4.8,
    reviews: 2341,
    verified: true,
    socials: {
      instagram: 'https://instagram.com/glownaturals',
      tiktok: 'https://tiktok.com/@glownaturals',
      website: 'https://glownaturals.com'
    },
    photos: [
      'https://readdy.ai/api/search-image?query=natural%20skincare%20product%20flatlay%20botanical%20ingredients%20minimal%20aesthetic%20professional%20photography&width=600&height=600&seq=storefront-photo-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=organic%20skincare%20serum%20bottles%20clean%20white%20background%20professional%20product%20photography&width=600&height=600&seq=storefront-photo-2&orientation=squarish',
      'https://readdy.ai/api/search-image?query=natural%20beauty%20products%20with%20plants%20minimal%20aesthetic%20clean%20photography&width=600&height=600&seq=storefront-photo-3&orientation=squarish',
      'https://readdy.ai/api/search-image?query=skincare%20routine%20products%20arranged%20beautifully%20clean%20aesthetic%20professional%20photography&width=600&height=600&seq=storefront-photo-4&orientation=squarish'
    ],
    videoThumbnail: 'https://readdy.ai/api/search-image?query=skincare%20brand%20video%20thumbnail%20natural%20products%20professional%20aesthetic%20clean%20background&width=800&height=450&seq=storefront-video&orientation=landscape',
    bestSellers: [
      {
        id: 1,
        name: 'Vitamin C Brightening Serum',
        price: '$42.00',
        image: 'https://readdy.ai/api/search-image?query=vitamin%20c%20serum%20bottle%20amber%20glass%20minimalist%20packaging%20white%20background%20professional%20product%20photography&width=300&height=300&seq=bestseller-1&orientation=squarish',
        rating: 4.9,
        reviews: 523,
        preferences: { vegan: true, crueltyFree: true, fragranceFree: false }
      },
      {
        id: 2,
        name: 'Hydrating Face Cream',
        price: '$38.00',
        image: 'https://readdy.ai/api/search-image?query=natural%20face%20cream%20jar%20minimalist%20packaging%20white%20background%20professional%20product%20photography&width=300&height=300&seq=bestseller-2&orientation=squarish',
        rating: 4.8,
        reviews: 412,
        preferences: { vegan: true, plantBased: true, alcoholFree: true }
      },
      {
        id: 3,
        name: 'Gentle Cleansing Balm',
        price: '$32.00',
        image: 'https://readdy.ai/api/search-image?query=cleansing%20balm%20jar%20natural%20skincare%20minimalist%20packaging%20white%20background%20professional%20photography&width=300&height=300&seq=bestseller-3&orientation=squarish',
        rating: 4.7,
        reviews: 389,
        preferences: { crueltyFree: true, fragranceFree: true, siliconeFree: true }
      }
    ],
    allProducts: [
      {
        id: 4,
        name: 'Niacinamide Pore Refining Serum',
        price: '$36.00',
        image: 'https://readdy.ai/api/search-image?query=niacinamide%20serum%20bottle%20minimalist%20packaging%20white%20background%20professional%20product%20photography&width=300&height=300&seq=product-4&orientation=squarish',
        rating: 4.8,
        reviews: 298,
        preferences: { vegan: true, alcoholFree: true }
      },
      {
        id: 5,
        name: 'Retinol Night Treatment',
        price: '$48.00',
        image: 'https://readdy.ai/api/search-image?query=retinol%20night%20cream%20jar%20luxury%20packaging%20white%20background%20professional%20product%20photography&width=300&height=300&seq=product-5&orientation=squarish',
        rating: 4.9,
        reviews: 445,
        preferences: { crueltyFree: true, fragranceFree: true }
      },
      {
        id: 6,
        name: 'Hyaluronic Acid Moisturizer',
        price: '$40.00',
        image: 'https://readdy.ai/api/search-image?query=hyaluronic%20acid%20moisturizer%20bottle%20minimalist%20packaging%20white%20background%20professional%20photography&width=300&height=300&seq=product-6&orientation=squarish',
        rating: 4.7,
        reviews: 356,
        preferences: { vegan: true, plantBased: true, glutenFree: true }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20">
        {/* Banner */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={storefront.banner}
            alt={storefront.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
        </div>

        {/* Storefront Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-20 relative z-10">
          <div className="bg-white rounded-xl p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white flex-shrink-0">
                  <img 
                    src={storefront.logo}
                    alt={storefront.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{storefront.name}</h1>
                    {storefront.verified && (
                      <i className="ri-verified-badge-fill text-sage-600 text-2xl" title="Verified"></i>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-4">{storefront.tagline}</p>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <i className="ri-star-fill text-amber-500"></i>
                      <span className="font-semibold text-gray-900">{storefront.rating}</span>
                      <span>({storefront.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-user-follow-line"></i>
                      <span>{storefront.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-shopping-bag-line"></i>
                      <span>{storefront.products} products</span>
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="flex items-center space-x-3 mt-4">
                    <a
                      href={storefront.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-sage-100 hover:text-sage-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-instagram-line text-lg"></i>
                    </a>
                    <a
                      href={storefront.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-sage-100 hover:text-sage-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-tiktok-line text-lg"></i>
                    </a>
                    <a
                      href={storefront.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-sage-100 hover:text-sage-600 transition-colors cursor-pointer"
                    >
                      <i className="ri-global-line text-lg"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-sage-600 text-white hover:bg-sage-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Following
                  </>
                ) : (
                  <>
                    <i className="ri-user-add-line mr-2"></i>
                    Follow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          {/* Tabs */}
          <div className="bg-white rounded-xl p-2 mb-8 flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'products' ? 'bg-sage-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'about' ? 'bg-sage-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews' ? 'bg-sage-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-12">
              {/* Best Sellers */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Sellers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {storefront.bestSellers.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-sage-300 hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-sage-600 transition-colors">
                          {product.name}
                        </h3>
                        {/* Preference Tags */}
                        {product.preferences && Object.values(product.preferences).some(v => v) && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Object.entries(product.preferences)
                              .filter(([_, value]) => value === true)
                              .map(([key]) => {
                                const isMatch = isPreferenceMatching(key);
                                return (
                                  <span
                                    key={key}
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      isMatch
                                        ? 'bg-sage-100 text-sage-700 font-medium border border-sage-300'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {isMatch && <i className="ri-check-line mr-0.5"></i>}
                                    {preferenceLabels[key] || key}
                                  </span>
                                );
                              })}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-sage-600">{product.price}</span>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <i className="ri-star-fill text-amber-500"></i>
                            <span>{product.rating}</span>
                            <span>({product.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* All Products */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {storefront.allProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-sage-300 hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-sage-600 transition-colors">
                          {product.name}
                        </h3>
                        {/* Preference Tags */}
                        {product.preferences && Object.values(product.preferences).some(v => v) && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Object.entries(product.preferences)
                              .filter(([_, value]) => value === true)
                              .map(([key]) => {
                                const isMatch = isPreferenceMatching(key);
                                return (
                                  <span
                                    key={key}
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      isMatch
                                        ? 'bg-sage-100 text-sage-700 font-medium border border-sage-300'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {isMatch && <i className="ri-check-line mr-0.5"></i>}
                                    {preferenceLabels[key] || key}
                                  </span>
                                );
                              })}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-sage-600">{product.price}</span>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <i className="ri-star-fill text-amber-500"></i>
                            <span>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              {/* Description */}
              <div className="bg-white rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
                <p className="text-gray-700 leading-relaxed">{storefront.description}</p>
              </div>

              {/* Photos */}
              <div className="bg-white rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {storefront.photos.map((photo, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                      <img 
                        src={photo}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Video */}
              <div className="bg-white rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Story</h2>
                <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                  <div className="aspect-video">
                    <img 
                      src={storefront.videoThumbnail}
                      alt="Brand video"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-xl group-hover:scale-110 transition-transform">
                      <i className="ri-play-fill text-4xl text-sage-600 ml-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <button className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer">
                  Write a Review
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <i className="ri-chat-3-line text-5xl mb-4"></i>
                <p>Reviews will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontDetailPage;
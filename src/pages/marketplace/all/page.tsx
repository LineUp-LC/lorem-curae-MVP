import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const MarketplaceAllPage = () => {
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'forYou' | 'services' | 'products'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userConcerns, setUserConcerns] = useState<string[]>([]);

  // Load user concerns for highlighting
  useEffect(() => {
    const skinData = localStorage.getItem('skinSurveyData');
    if (skinData) {
      const parsed = JSON.parse(skinData);
      if (parsed.concerns) {
        setUserConcerns(parsed.concerns.map((c: string) => c.toLowerCase()));
      }
    }
  }, []);

  // Check if storefront concerns match user's concerns
  const matchesUserConcerns = (storefrontConcerns: string[] | undefined): boolean => {
    if (!storefrontConcerns || !userConcerns.length) return false;
    return storefrontConcerns.some(concern => 
      userConcerns.some(userConcern => 
        concern.toLowerCase().includes(userConcern) || 
        userConcern.includes(concern.toLowerCase())
      )
    );
  };

  const storefronts = [
    {
      id: 1,
      name: 'Glow Naturals',
      tagline: 'Clean Beauty for Radiant Skin',
      logo: 'https://readdy.ai/api/search-image?query=minimalist%20modern%20skincare%20brand%20logo%20clean%20aesthetic%20natural%20beauty%20leaf%20icon%20professional%20design&width=200&height=200&seq=storefront-logo-1&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=natural%20organic%20skincare%20products%20arranged%20beautifully%20minimal%20aesthetic%20clean%20white%20background%20botanical%20elements%20professional%20product%20photography&width=1200&height=400&seq=storefront-banner-1&orientation=landscape',
      followers: 12458,
      products: 45,
      services: 0,
      type: 'products',
      rating: 4.8,
      reviews: 2341,
      featured: true,
      verified: true,
      premiumVisibility: true,
      concerns: ['brightening', 'hydration', 'anti-aging']
    },
    {
      id: 2,
      name: 'Pure Essence Lab',
      tagline: 'Science-Backed Skincare Solutions',
      logo: 'https://readdy.ai/api/search-image?query=modern%20scientific%20skincare%20brand%20logo%20minimalist%20laboratory%20aesthetic%20professional%20clean%20design&width=200&height=200&seq=storefront-logo-2&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=luxury%20skincare%20laboratory%20products%20scientific%20aesthetic%20clean%20white%20background%20professional%20product%20photography%20serums%20bottles&width=1200&height=400&seq=storefront-banner-2&orientation=landscape',
      followers: 8932,
      products: 32,
      services: 0,
      type: 'products',
      rating: 4.9,
      reviews: 1876,
      featured: true,
      verified: true,
      premiumVisibility: false,
      concerns: ['acne', 'oily skin', 'pores']
    },
    {
      id: 3,
      name: 'Botanical Beauty Co',
      tagline: 'Plant-Powered Skincare',
      logo: 'https://readdy.ai/api/search-image?query=botanical%20plant%20based%20skincare%20brand%20logo%20natural%20organic%20aesthetic%20leaf%20flower%20design&width=200&height=200&seq=storefront-logo-3&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=botanical%20plant%20based%20skincare%20products%20natural%20ingredients%20herbs%20flowers%20clean%20aesthetic%20professional%20photography&width=1200&height=400&seq=storefront-banner-3&orientation=landscape',
      followers: 15234,
      products: 58,
      services: 0,
      type: 'products',
      rating: 4.7,
      reviews: 3102,
      featured: true,
      verified: true,
      premiumVisibility: true,
      concerns: ['sensitivity', 'redness', 'natural']
    },
    {
      id: 4,
      name: 'Derma Solutions',
      tagline: 'Clinical Grade Skincare',
      logo: 'https://readdy.ai/api/search-image?query=medical%20dermatology%20skincare%20brand%20logo%20clinical%20professional%20minimalist%20design&width=200&height=200&seq=storefront-logo-4&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=clinical%20medical%20grade%20skincare%20products%20professional%20aesthetic%20white%20background%20dermatology%20approved&width=1200&height=400&seq=storefront-banner-4&orientation=landscape',
      followers: 6721,
      products: 28,
      services: 0,
      type: 'products',
      rating: 4.9,
      reviews: 1543,
      featured: false,
      verified: true,
      premiumVisibility: false,
      concerns: ['acne', 'scarring', 'hyperpigmentation']
    },
    {
      id: 5,
      name: 'Elite Skin Clinic',
      tagline: 'Professional Skincare Services',
      logo: 'https://readdy.ai/api/search-image?query=luxury%20medical%20spa%20clinic%20logo%20elegant%20sophisticated%20minimalist%20design%20professional%20aesthetic&width=200&height=200&seq=storefront-logo-5&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=luxury%20medical%20spa%20treatment%20room%20professional%20clean%20aesthetic%20modern%20equipment%20skincare%20clinic&width=1200&height=400&seq=storefront-banner-5&orientation=landscape',
      followers: 10567,
      products: 0,
      services: 15,
      type: 'services',
      rating: 4.8,
      reviews: 2198,
      featured: false,
      verified: true,
      premiumVisibility: false,
      concerns: ['anti-aging', 'wrinkles', 'fine lines']
    },
    {
      id: 6,
      name: 'Radiance Spa & Wellness',
      tagline: 'Holistic Beauty Experience',
      logo: 'https://readdy.ai/api/search-image?query=spa%20wellness%20center%20logo%20zen%20peaceful%20aesthetic%20natural%20healing%20design&width=200&height=200&seq=storefront-logo-6&orientation=squarish',
      banner: 'https://readdy.ai/api/search-image?query=luxury%20spa%20treatment%20room%20peaceful%20zen%20aesthetic%20natural%20lighting%20wellness%20center%20professional%20photography&width=1200&height=400&seq=storefront-banner-6&orientation=landscape',
      followers: 9834,
      products: 0,
      services: 22,
      type: 'services',
      rating: 4.7,
      reviews: 1987,
      featured: false,
      verified: true,
      premiumVisibility: false,
      concerns: ['relaxation', 'stress', 'dullness']
    }
  ];

  const filteredStorefronts = storefronts.filter((storefront) => {
    const matchesSearch = searchQuery === '' || 
      storefront.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storefront.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'featured') return matchesSearch && storefront.featured;
    if (filterType === 'forYou') return matchesSearch && matchesUserConcerns(storefront.concerns);
    if (filterType === 'services') return matchesSearch && storefront.type === 'services';
    if (filterType === 'products') return matchesSearch && storefront.type === 'products';
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-white border-b border-blush">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h1 className="text-4xl lg:text-5xl font-serif text-deep mb-4">
              All Storefronts
            </h1>
            <p className="text-lg text-warm-gray max-w-3xl">
              Browse all verified storefronts offering products and services
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white border-b border-blush">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-warm-gray/60"></i>
                <input
                  type="text"
                  placeholder="Search storefronts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-blush focus:border-primary focus:outline-none text-sm transition-all"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  All Storefronts
                </button>
                <button
                  onClick={() => setFilterType('featured')}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filterType === 'featured'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setFilterType('forYou')}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filterType === 'forYou'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  <i className="ri-sparkling-line mr-1"></i>For You
                </button>
                <button
                  onClick={() => setFilterType('products')}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filterType === 'products'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setFilterType('services')}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    filterType === 'services'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  Services
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6">
              <p className="text-sm text-warm-gray">
                Showing <strong>{filteredStorefronts.length}</strong> storefronts
              </p>
            </div>
          </div>
        </section>

        {/* Storefronts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStorefronts.map((storefront) => {
                const isConcernMatch = matchesUserConcerns(storefront.concerns);
                
                return (
                <Link
                  key={storefront.id}
                  to={storefront.type === 'services' ? `/services/${storefront.id}` : `/storefront/${storefront.id}`}
                  className="group cursor-pointer"
                >
                  <div className={`bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all ${
                    isConcernMatch
                      ? 'ring-2 ring-primary ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)] border-primary-300'
                      : 'border-blush hover:border-primary-300'
                  }`}>
                    {/* Concern Match Badge */}
                    {isConcernMatch && (
                      <div className="bg-primary-50 px-4 py-2 flex items-center gap-2 border-b border-blush">
                        <i className="ri-sparkling-2-fill text-primary text-sm"></i>
                        <span className="text-xs font-medium text-primary-700">Matches your skin concerns</span>
                      </div>
                    )}
                    {/* Banner */}
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={storefront.banner}
                        alt={storefront.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {storefront.featured && storefront.premiumVisibility && (
                          <>
                            <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                              Featured
                            </div>
                            <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1">
                              <i className="ri-vip-crown-line"></i>
                              Premium
                            </div>
                          </>
                        )}
                        {storefront.featured && !storefront.premiumVisibility && (
                          <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                            Featured
                          </div>
                        )}
                        {!storefront.featured && storefront.premiumVisibility && (
                          <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <i className="ri-vip-crown-line"></i>
                            Premium
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <div className={`px-3 py-1 text-white text-xs font-semibold rounded-full flex items-center gap-1 ${
                          storefront.type === 'products' ? 'bg-primary' : 'bg-primary'
                        }`}>
                          <i className={storefront.type === 'products' ? 'ri-shopping-bag-line' : 'ri-service-line'}></i>
                          {storefront.type === 'products' ? 'Products' : 'Services'}
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="relative px-6 -mt-12">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white">
                        <img 
                          src={storefront.logo}
                          alt={storefront.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-deep group-hover:text-primary transition-colors">
                          {storefront.name}
                        </h3>
                        {storefront.verified && (
                          <i className="ri-verified-badge-fill text-primary text-xl" title="Verified"></i>
                        )}
                      </div>
                      <p className="text-warm-gray text-sm mb-4">{storefront.tagline}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-warm-gray mb-4">
                        <div className="flex items-center space-x-1">
                          <i className="ri-star-fill text-amber-500"></i>
                          <span className="font-semibold text-deep">{storefront.rating}</span>
                          <span>({storefront.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className="ri-user-follow-line"></i>
                          <span>{storefront.followers.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-blush">
                        <span className="text-sm text-warm-gray">
                          {storefront.type === 'products' 
                            ? `${storefront.products} Products` 
                            : `${storefront.services} Services`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>

            {/* No Results */}
            {filteredStorefronts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 flex items-center justify-center bg-cream rounded-full mx-auto mb-4">
                  <i className="ri-search-line text-4xl text-warm-gray/60"></i>
                </div>
                <h3 className="text-2xl font-serif text-deep mb-2">No storefronts found</h3>
                <p className="text-warm-gray mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-all whitespace-nowrap cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceAllPage;
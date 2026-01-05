import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase-browser';

const MarketplacePage = () => {
  const [currentTier, setCurrentTier] = useState('free');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    fetchUserTier();
    fetchProducts();
    loadUserConcerns();
  }, []);

  const loadUserConcerns = () => {
    const skinData = localStorage.getItem('skinSurveyData');
    if (skinData) {
      const parsed = JSON.parse(skinData);
      if (parsed.concerns) {
        setUserConcerns(parsed.concerns.map((c: string) => c.toLowerCase()));
      }
      if (parsed.preferences) {
        setUserPreferences(parsed.preferences);
      }
    }
  };

  // Check if product concerns match user's concerns
  const matchesUserConcerns = (productConcerns: string[] | undefined): boolean => {
    if (!productConcerns || !userConcerns.length) return false;
    return productConcerns.some(concern => 
      userConcerns.some(userConcern => 
        concern.toLowerCase().includes(userConcern) || 
        userConcern.includes(concern.toLowerCase())
      )
    );
  };

  // Check if preference matches user's preferences
  const isPreferenceMatching = (prefKey: string): boolean => {
    return userPreferences[prefKey] === true;
  };

  const fetchUserTier = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (profile?.subscription_tier) {
        setCurrentTier(profile.subscription_tier);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          marketplace_storefronts!inner(
            id,
            business_name,
            is_verified,
            rating,
            stripe_connected_accounts(charges_enabled)
          )
        `)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: number) => {
    try {
      const productIdStr = productId.toString();
      setPurchasingProduct(productIdStr);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login?redirect=/marketplace';
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', {
        body: {
          productId: productIdStr,
          quantity: 1,
          successUrl: `${window.location.origin}/marketplace/success`,
          cancelUrl: `${window.location.origin}/marketplace`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setPurchasingProduct(null);
    }
  };

  const calculateDiscountedPrice = (price: number) => {
    let discount = 0;
    if (currentTier === 'premium') discount = 0.20;
    else if (currentTier === 'plus') discount = 0.10;
    
    return {
      original: price,
      discounted: price * (1 - discount),
      discount: discount * 100,
    };
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
      premiumVisibility: true
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
      premiumVisibility: false
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
      premiumVisibility: true
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
      premiumVisibility: false
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
      premiumVisibility: false
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
      premiumVisibility: false
    }
  ];

  const getDiscountBadge = () => {
    if (currentTier === 'premium') return { text: '20% OFF', color: 'bg-amber-500' };
    if (currentTier === 'plus') return { text: '10% OFF', color: 'bg-primary' };
    return null;
  };

  const discountBadge = getDiscountBadge();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section - Clean style matching Ingredients page */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-serif text-deep mb-4">
                Discover Authentic Brands
              </h1>
              <p className="text-lg text-warm-gray max-w-2xl mx-auto mb-8">
                Shop from verified storefronts offering curated, high-quality skincare products and services.
              </p>
              {discountBadge && (
                <div className="mb-6">
                  <span className={`inline-block px-6 py-2 ${discountBadge.color} text-white rounded-full font-semibold text-lg`}>
                    🎉 Your {currentTier === 'premium' ? 'Premium' : 'Plus'} Discount: {discountBadge.text} on all purchases
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Search storefronts..."
                    className="w-full px-6 py-4 pr-12 bg-white border-2 border-blush rounded-2xl text-base focus:outline-none focus:border-primary transition-colors"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-warm-gray/60 hover:text-primary cursor-pointer transition-colors">
                    <i className="ri-search-line text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {products.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-deep mb-2">Featured Products</h2>
                  <p className="text-warm-gray">Curated skincare from verified creators</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => {
                  const pricing = calculateDiscountedPrice(product.price);
                  const hasDiscount = pricing.discount > 0;
                  const storefront = product.marketplace_storefronts;
                  const isConnected = storefront?.stripe_connected_accounts?.[0]?.charges_enabled;
                  const isConcernMatch = matchesUserConcerns(product.concerns || product.target_concerns);

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-xl overflow-hidden border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${
                        isConcernMatch 
                          ? 'ring-2 ring-primary ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)] border-primary-300' 
                          : 'border-blush hover:border-primary-300'
                      }`}
                    >
                      {/* Concern Match Badge */}
                      {isConcernMatch && (
                        <div className="bg-light/20 px-3 py-1.5 flex items-center gap-2 border-b border-blush">
                          <i className="ri-sparkling-2-fill text-primary text-sm"></i>
                          <span className="text-xs font-medium text-primary-700">Matches your skin concerns</span>
                        </div>
                      )}
                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden bg-cream">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        {hasDiscount && (
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 ${discountBadge?.color} text-white text-xs font-semibold rounded-full`}>
                              {discountBadge?.text}
                            </span>
                          </div>
                        )}
                        {product.verified && (
                          <div className="absolute top-3 right-3">
                            <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1">
                              <i className="ri-verified-badge-fill"></i>
                              Verified
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Brand */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-primary font-medium">
                            {storefront?.business_name}
                          </span>
                          {storefront?.is_verified && (
                            <i className="ri-verified-badge-fill text-primary text-sm"></i>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3 className="text-base font-bold text-deep mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-amber-500 text-sm"></i>
                            <span className="text-sm font-semibold text-deep">
                              {product.rating?.toFixed(1) || '5.0'}
                            </span>
                          </div>
                          <span className="text-xs text-warm-gray/80">
                            ({product.review_count || 0} reviews)
                          </span>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {isConnected && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <i className="ri-shield-check-line"></i>
                              Secure Checkout
                            </span>
                          )}
                          {product.in_stock && (
                            <span className="px-2 py-1 bg-light/20 text-primary-700 text-xs rounded-full">
                              In Stock
                            </span>
                          )}
                        </div>

                        {/* Preferences */}
                        {product.preferences && Object.values(product.preferences).some((v: unknown) => v === true) && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {Object.entries(product.preferences)
                              .filter(([_, value]) => value === true)
                              .slice(0, 3)
                              .map(([key]) => {
                                const isMatch = isPreferenceMatching(key);
                                return (
                                  <span
                                    key={key}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      isMatch
                                        ? 'bg-light/30 text-primary-700 font-medium border border-primary-300'
                                        : 'bg-cream text-warm-gray'
                                    }`}
                                  >
                                    {isMatch && <i className="ri-check-line mr-0.5"></i>}
                                    {preferenceLabels[key] || key}
                                  </span>
                                );
                              })}
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="mb-3">
                          {hasDiscount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary">
                                ${pricing.discounted.toFixed(2)}
                              </span>
                              <span className="text-sm text-warm-gray/60 line-through">
                                ${pricing.original.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-deep">
                              ${pricing.original.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Purchase Button */}
                        <button
                          onClick={() => handlePurchase(product.id)}
                          disabled={!product.in_stock || purchasingProduct === product.id}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            product.in_stock
                              ? 'bg-primary text-white hover:bg-dark'
                              : 'bg-gray-200 text-warm-gray/80 cursor-not-allowed'
                          }`}
                        >
                          {purchasingProduct === product.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <i className="ri-loader-4-line animate-spin"></i>
                              Processing...
                            </span>
                          ) : product.in_stock ? (
                            'Buy Now'
                          ) : (
                            'Out of Stock'
                          )}
                        </button>

                        {/* Creator Payout Info */}
                        {isConnected && (
                          <p className="text-xs text-warm-gray/80 text-center mt-2">
                            90% goes directly to creator
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Featured Storefronts */}
        <section className="py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-deep mb-2">Featured Storefronts</h2>
                <p className="text-warm-gray">Handpicked brands we're proud to showcase</p>
              </div>
              <Link
                to="/marketplace/all"
                className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-light/20 transition-colors whitespace-nowrap cursor-pointer"
              >
                View All Storefronts
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {storefronts.filter(s => s.featured).map((storefront) => (
                <Link
                  key={storefront.id}
                  to={storefront.type === 'services' ? `/services/${storefront.id}` : `/storefront/${storefront.id}`}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl overflow-hidden border border-blush hover:border-primary-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Banner */}
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={storefront.banner}
                        alt={storefront.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {storefront.featured && (
                          <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow">
                            Featured
                          </div>
                        )}
                        {storefront.premiumVisibility && (
                          <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow">
                            <i className="ri-vip-crown-line"></i>
                            Premium
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discountBadge && (
                          <span className={`px-3 py-1 ${discountBadge.color} text-white text-xs font-semibold rounded-full`}>
                            {discountBadge.text}
                          </span>
                        )}
                        <div className={`px-3 py-1 text-white text-xs font-semibold rounded-full flex items-center gap-1 ${
                          storefront.type === 'products' ? 'bg-primary' : 'bg-coral-600'
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
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-deep text-center mb-12">
              Shop with Confidence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-bold text-deep mb-2">Secure Payments</h3>
                <p className="text-sm text-warm-gray">
                  All transactions protected by Stripe
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-verified-badge-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-bold text-deep mb-2">Verified Creators</h3>
                <p className="text-sm text-warm-gray">
                  All sellers thoroughly vetted
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-hand-coin-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-bold text-deep mb-2">Direct Payouts</h3>
                <p className="text-sm text-warm-gray">
                  90% goes directly to creators
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-discount-percent-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-bold text-deep mb-2">Member Discounts</h3>
                <p className="text-sm text-warm-gray">
                  Up to 20% off with Premium
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif text-deep mb-6">
              Ready to Grow Your Brand?
            </h2>
            <p className="text-lg text-warm-gray mb-8 max-w-2xl mx-auto">
              Join our marketplace and reach thousands of skincare enthusiasts
            </p>
            <Link
              to="/storefront/join"
              className="inline-block px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors duration-fast shadow-lg whitespace-nowrap cursor-pointer"
            >
              Become an LC Storefront
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
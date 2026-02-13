import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase-browser';
import { useFavorites, favoritesState } from '../../lib/utils/favoritesState';
import Toast from '../../components/feature/Toast';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';
import Dropdown from '../../components/ui/Dropdown';

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Saved products (favorites)
  const { favorites, removeFavorite } = useFavorites();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting preference (persisted)
  const [savedProductsSort, setSavedProductsSort] = useLocalStorageState<string>('account_saved_products_sort', 'recent');

  // Filter preferences (persisted)
  const [filterCategory, setFilterCategory] = useLocalStorageState<string>('saved_filter_category', 'all');
  const [filterSkinType, setFilterSkinType] = useLocalStorageState<string>('saved_filter_skin_type', 'all');

  const userTier = 'basic';

  const user = {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=400&height=400&seq=account-profile-banner&orientation=squarish',
    memberSince: 'January 2025',
    totalRoutines: 5,
    productsTracked: 23
  };

  useEffect(() => {
    loadAccountData();

    // Set up toast callback for when products are saved from other pages
    favoritesState.setOnAddCallback((productName) => {
      setToastMessage(`${productName} saved`);
    });

    return () => {
      favoritesState.setOnAddCallback(null);
    };
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Filter options
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'cleanser', label: 'Cleansers' },
    { value: 'toner', label: 'Toners' },
    { value: 'serum', label: 'Serums' },
    { value: 'moisturizer', label: 'Moisturizers' },
    { value: 'sunscreen', label: 'Sunscreen' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'mask', label: 'Masks' },
  ];

  const skinTypeOptions = [
    { value: 'all', label: 'All Skin Types' },
    { value: 'dry', label: 'Dry' },
    { value: 'oily', label: 'Oily' },
    { value: 'combination', label: 'Combination' },
    { value: 'normal', label: 'Normal' },
    { value: 'sensitive', label: 'Sensitive' },
  ];

  // Sort options for saved products
  const sortOptions = [
    { value: 'recent', label: 'Recently Saved' },
    { value: 'a-z', label: 'A → Z' },
    { value: 'z-a', label: 'Z → A' },
    { value: 'price-low', label: 'Lowest Price' },
    { value: 'price-high', label: 'Highest Price' },
  ];

  // Helper to extract numeric price from priceRange string (e.g., "$29.70 - $36.30")
  const extractPrice = (priceRange?: string): number => {
    if (!priceRange) return 0;
    const match = priceRange.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Filtered favorites based on user preferences
  const filteredFavorites = useMemo(() => {
    return favorites.filter((product) => {
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesSkinType =
        filterSkinType === 'all' ||
        !product.skinTypes ||
        product.skinTypes.includes(filterSkinType);
      return matchesCategory && matchesSkinType;
    });
  }, [favorites, filterCategory, filterSkinType]);

  // Sorted favorites based on user preference (applied after filtering)
  const sortedFavorites = useMemo(() => {
    const sorted = [...filteredFavorites];
    switch (savedProductsSort) {
      case 'a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-low':
        return sorted.sort((a, b) => extractPrice(a.priceRange) - extractPrice(b.priceRange));
      case 'price-high':
        return sorted.sort((a, b) => extractPrice(b.priceRange) - extractPrice(a.priceRange));
      case 'recent':
      default:
        // Most recently saved first
        return sorted.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
  }, [filteredFavorites, savedProductsSort]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: purchases } = await supabase
          .from('marketplace_transactions')
          .select(`
            *,
            marketplace_products(name, image_url, price),
            marketplace_storefronts(business_name)
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        setRecentPurchases(purchases || []);
      }
      
      const searches = localStorage.getItem('recent_searches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
      
      setRecentServices([
        {
          id: 1,
          serviceName: 'Hydrafacial Treatment',
          businessName: 'Radiance Skin Studio',
          date: '2025-01-15',
          image: 'https://readdy.ai/api/search-image?query=professional%20hydrafacial%20treatment%20spa%20skincare%20service%20clean%20aesthetic&width=200&height=200&seq=service-1&orientation=squarish'
        },
        {
          id: 2,
          serviceName: 'Chemical Peel',
          businessName: 'Elite Skin Clinic',
          date: '2025-01-10',
          image: 'https://readdy.ai/api/search-image?query=chemical%20peel%20skincare%20treatment%20professional%20spa%20service&width=200&height=200&seq=service-2&orientation=squarish'
        }
      ]);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={handleCloseToast} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-5 sm:p-6 mb-6 border border-blush/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-light/50">
                  <img
                    src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=user-avatar&orientation=squarish"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link
                  to="/profile/edit"
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full transition-colors cursor-pointer hover:bg-dark"
                >
                  <i className="ri-pencil-line text-xs"></i>
                </Link>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-lg font-semibold text-deep">Sarah Chen</h1>
                  {userTier === 'premium' && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-dark text-white text-xs rounded-full font-medium">
                      Premium
                    </span>
                  )}
                  {userTier === 'basic' && (
                    <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium">
                      Plus
                    </span>
                  )}
                </div>
                <p className="text-sm text-warm-gray">@skincare_enthusiast</p>
                <p className="text-xs text-warm-gray/70">Member since January 2024</p>
              </div>
            </div>
            <Link
              to="/profile/customize"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer hover:bg-dark"
            >
              <i className="ri-palette-line mr-1.5"></i>
              Customize
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link
            to="/my-skin"
            className="bg-white rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border border-blush/30"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-3 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
              <i className="ri-heart-pulse-line text-xl"></i>
            </div>
            <h3 className="font-medium text-sm text-deep mb-0.5">My Skin</h3>
            <p className="text-xs text-warm-gray">View profile</p>
          </Link>

          <Link
            to="/routines-list"
            className="bg-white rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border border-blush/30"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-3 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
              <i className="ri-calendar-check-line text-xl"></i>
            </div>
            <h3 className="font-medium text-sm text-deep mb-0.5">My Routines</h3>
            <p className="text-xs text-warm-gray">Manage regimens</p>
          </Link>

          <Link
            to="/marketplace"
            className="bg-white rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border border-blush/30"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-3 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
              <i className="ri-store-2-line text-xl"></i>
            </div>
            <h3 className="font-medium text-sm text-deep mb-0.5">Marketplace</h3>
            <p className="text-xs text-warm-gray">Browse products</p>
          </Link>

          <Link
            to="/badges"
            className="bg-white rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border border-blush/30"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-3 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
              <i className="ri-medal-line text-xl"></i>
            </div>
            <h3 className="font-medium text-sm text-deep mb-0.5">Badges</h3>
            <p className="text-xs text-warm-gray">Achievements</p>
          </Link>
        </div>

        {/* Saved Products Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-lg font-semibold text-deep">
              Favorited Products
            </h2>

            {favorites.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2 text-warm-gray">
                  Filter Favorited Products
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Category Filter */}
                  <Dropdown
                    id="saved-filter-category"
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={categoryOptions}
                    className="w-full sm:w-44"
                  />

                  {/* Skin Type Filter */}
                  <Dropdown
                    id="saved-filter-skin-type"
                    value={filterSkinType}
                    onChange={setFilterSkinType}
                    options={skinTypeOptions}
                    className="w-full sm:w-44"
                  />

                  {/* Sort Dropdown */}
                  {filteredFavorites.length > 1 && (
                    <Dropdown
                      id="saved-sort-by"
                      value={savedProductsSort}
                      onChange={setSavedProductsSort}
                      options={sortOptions}
                      className="w-full sm:w-44"
                    />
                  )}

                  {/* Reset Filters */}
                  {(filterCategory !== 'all' || filterSkinType !== 'all') && (
                    <button
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterSkinType('all');
                      }}
                      className="text-sm underline cursor-pointer transition-colors whitespace-nowrap self-center"
                      style={{ color: 'rgba(45, 42, 38, 0.7)' }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {sortedFavorites.length > 0 ? (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blush/30">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedFavorites.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer relative"
                  >
                    <Link to={`/product-detail?id=${product.id}`}>
                      <div className="aspect-square rounded-lg overflow-hidden mb-3" style={{ backgroundColor: '#F8F4F0' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium mb-1 line-clamp-2 transition-colors" style={{ color: '#2D2A26' }}>
                        {product.name}
                      </h4>
                      <p className="text-xs mb-1" style={{ color: '#6B635A' }}>{product.brand}</p>
                      {product.priceRange && (
                        <p className="text-xs font-medium" style={{ color: '#C4704D' }}>{product.priceRange}</p>
                      )}
                    </Link>

                    {/* Remove Link */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(product.id);
                      }}
                      className="mt-2 text-xs underline cursor-pointer transition-colors hover:opacity-100"
                      style={{ color: 'rgba(45, 42, 38, 0.7)' }}
                      aria-label={`Remove ${product.name} from saved products`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-blush/30">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-cream">
                <i className={`${favorites.length > 0 ? 'ri-filter-line' : 'ri-heart-line'} text-2xl text-warm-gray/60`}></i>
              </div>
              {favorites.length > 0 ? (
                <>
                  <h3 className="text-base font-medium mb-1 text-deep">No products match your filters</h3>
                  <p className="text-sm mb-4 text-warm-gray">Try adjusting your category or skin type filters</p>
                  <button
                    onClick={() => {
                      setFilterCategory('all');
                      setFilterSkinType('all');
                    }}
                    className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-dark"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base font-medium mb-1 text-deep">No saved products yet</h3>
                  <p className="text-sm mb-4 text-warm-gray">Explore products and save ones you'd like to revisit</p>
                  <Link
                    to="/discover"
                    className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-dark"
                  >
                    Discover Products
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Recent Marketplace Purchases */}
        {recentPurchases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-deep mb-4">
              Recent Marketplace Purchases
            </h2>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blush/30">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentPurchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    to={`/storefront/${purchase.marketplace_products?.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3" style={{ backgroundColor: '#F8F4F0' }}>
                      <img
                        src={purchase.marketplace_products?.image_url}
                        alt={purchase.marketplace_products?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-medium mb-1 line-clamp-2 transition-colors" style={{ color: '#2D2A26' }}>
                      {purchase.marketplace_products?.name}
                    </h4>
                    <p className="text-xs" style={{ color: '#6B635A' }}>{purchase.marketplace_storefronts?.business_name}</p>
                    <p className="text-xs mt-1" style={{ color: '#9A938A' }}>
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Services Searched */}
        {recentServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-deep mb-4">
              Services Recently Searched
            </h2>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blush/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentServices.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                    style={{ border: '1px solid rgba(232, 212, 204, 0.5)' }}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8F4F0' }}>
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold mb-1 transition-colors" style={{ color: '#2D2A26' }}>
                        {service.serviceName}
                      </h4>
                      <p className="text-xs mb-1" style={{ color: '#6B635A' }}>{service.businessName}</p>
                      <p className="text-xs" style={{ color: '#9A938A' }}>
                        Searched: {new Date(service.date).toLocaleDateString()}
                      </p>
                    </div>
                    <i className="ri-arrow-right-line transition-colors" style={{ color: '#C4704D' }}></i>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Recently Searched For */}
        <div>
          <h2 className="text-lg font-semibold text-deep mb-4">
            Products Recently Searched For
          </h2>

          <div className="space-y-4">
            {recentSearches.length > 0 ? recentSearches.map((search, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 sm:p-5 border border-blush/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-deep">
                    {search.concern}
                  </h3>
                  <Link
                    to={`/discover?concern=${search.concern}`}
                    className="text-sm font-medium cursor-pointer text-primary hover:text-dark"
                  >
                    View All <i className="ri-arrow-right-line ml-1"></i>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {search.products?.map((product: any, pidx: number) => (
                    <Link
                      key={pidx}
                      to={`/product-search-detail?id=${pidx + 1}`}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3" style={{ backgroundColor: '#F8F4F0' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium mb-1 line-clamp-2 transition-colors" style={{ color: '#2D2A26' }}>
                        {product.name}
                      </h4>
                      <p className="text-xs" style={{ color: '#6B635A' }}>{product.brand}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-xl p-8 text-center border border-blush/30">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-cream">
                  <i className="ri-search-line text-2xl text-warm-gray/60"></i>
                </div>
                <h3 className="text-base font-medium mb-1 text-deep">No recent searches</h3>
                <p className="text-sm mb-4 text-warm-gray">Start exploring to see your search history</p>
                <Link
                  to="/discover"
                  className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-dark"
                >
                  Discover Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountPage;
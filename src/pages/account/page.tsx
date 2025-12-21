import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user data - add tier information
  const userTier = 'basic'; // 'free', 'basic', 'premium'

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
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load recent marketplace purchases
        const { data: purchases } = await supabase
          .from('marketplace_transactions')
          .select(`
            *,
            marketplace_products(name, image_url, price),
            marketplace_storefronts(business_name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        setRecentPurchases(purchases || []);
      }
      
      // Load recent searches from localStorage
      const searches = localStorage.getItem('recent_searches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
      
      // Mock recent services (would come from database in production)
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
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-sage-200">
                  <img 
                    src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=user-avatar&orientation=squarish"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link
                  to="/profile/edit"
                  className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-colors cursor-pointer"
                >
                  <i className="ri-pencil-line text-sm"></i>
                </Link>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Sarah Chen</h1>
                  {userTier === 'premium' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-full font-medium">
                      Premium
                    </span>
                  )}
                  {userTier === 'basic' && (
                    <span className="px-3 py-1 bg-sage-600 text-white text-sm rounded-full font-medium">
                      Plus
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-1">@skincare_enthusiast</p>
                <p className="text-sm text-gray-500">Member since January 2024</p>
              </div>
            </div>
            <Link
              to="/profile/customize"
              className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-palette-line mr-2"></i>
              Customize Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link
            to="/my-skin"
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mb-4 group-hover:bg-gray-200 transition-colors">
              <i className="ri-heart-pulse-line text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Skin</h3>
            <p className="text-sm text-gray-600">View your profile</p>
          </Link>

          <Link
            to="/routines-list"
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mb-4 group-hover:bg-gray-200 transition-colors">
              <i className="ri-calendar-check-line text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Routines</h3>
            <p className="text-sm text-gray-600">Manage regimens</p>
          </Link>

          <Link
            to="/marketplace"
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mb-4 group-hover:bg-gray-200 transition-colors">
              <i className="ri-store-2-line text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Marketplace</h3>
            <p className="text-sm text-gray-600">Browse products</p>
          </Link>

          <Link
            to="/badges"
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mb-4 group-hover:bg-gray-200 transition-colors">
              <i className="ri-medal-line text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Badges</h3>
            <p className="text-sm text-gray-600">View achievements</p>
          </Link>
        </div>

        {/* Recent Marketplace Purchases */}
        {recentPurchases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Marketplace Purchases
            </h2>
            <div className="bg-white rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentPurchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    to={`/storefront/${purchase.marketplace_products?.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-50">
                      <img
                        src={purchase.marketplace_products?.image_url}
                        alt={purchase.marketplace_products?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-sage-600 transition-colors">
                      {purchase.marketplace_products?.name}
                    </h4>
                    <p className="text-xs text-gray-600">{purchase.marketplace_storefronts?.business_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Services Recently Searched
            </h2>
            <div className="bg-white rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentServices.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-sage-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-sage-600 transition-colors">
                        {service.serviceName}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{service.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Searched: {new Date(service.date).toLocaleDateString()}
                      </p>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400 group-hover:text-sage-600 transition-colors"></i>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Recently Searched For */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Products Recently Searched For
          </h2>

          <div className="space-y-8">
            {recentSearches.length > 0 ? recentSearches.map((search, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {search.concern}
                  </h3>
                  <Link
                    to={`/discover?concern=${search.concern}`}
                    className="text-sm text-sage-600 hover:text-sage-700 font-medium cursor-pointer"
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
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-sage-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-600">{product.brand}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-search-line text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent searches</h3>
                <p className="text-gray-600 mb-6">Start exploring products to see your search history here</p>
                <Link
                  to="/discover"
                  className="inline-block px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer"
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

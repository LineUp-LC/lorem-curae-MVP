import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase-browser';
import { updateUserProfile } from '../../lib/supabase';
import { useSavedProducts, savedProductsState } from '../../lib/utils/favoritesState';
import Toast from '../../components/feature/Toast';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';
import Dropdown from '../../components/ui/Dropdown';
import { useAuth } from '../../lib/auth/AuthContext';
import RoutinePickerModal from '../../components/feature/RoutinePickerModal';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user: authUser, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Saved products
  const { savedProducts, removeSavedProduct } = useSavedProducts();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [routinePickerProduct, setRoutinePickerProduct] = useState<any>(null);

  // Sorting preference (persisted)
  const [savedProductsSort, setSavedProductsSort] = useLocalStorageState<string>('account_saved_products_sort', 'recent');

  // Filter preferences (persisted)
  const [filterCategory, setFilterCategory] = useLocalStorageState<string>('saved_filter_category', 'all');
  const [filterSkinType, setFilterSkinType] = useLocalStorageState<string>('saved_filter_skin_type', 'all');

  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [bioSaving, setBioSaving] = useState(false);

  const handleSaveBio = async () => {
    if (!authUser) return;
    setBioSaving(true);
    try {
      const currentPrefs = (profile?.preferences as any) || {};
      const updated = await updateUserProfile(authUser.id, {
        preferences: { ...currentPrefs, bio: bioText.trim() },
      });
      if (updated) {
        await refreshProfile();
        setIsEditingBio(false);
      } else {
        console.error('Failed to save bio: update returned null');
      }
    } catch (err) {
      console.error('Failed to save bio:', err);
    } finally {
      setBioSaving(false);
    }
  };

  const userTier = 'basic';

  // Derive skin profile from profile fields OR surveyAnswers fallback
  const surveyAnswers = (profile?.preferences as any)?.surveyAnswers;
  const effectiveSkinType = profile?.skin_type || surveyAnswers?.skinTypes?.[0] || null;
  const effectiveConcerns: string[] = (profile?.concerns && profile.concerns.length > 0)
    ? profile.concerns
    : surveyAnswers?.concerns || [];
  const effectiveAllergens: string[] = (profile?.preferences as any)?.allergens || surveyAnswers?.allergens || [];
  const hasSkinProfile = !!(effectiveSkinType || effectiveConcerns.length > 0);

  // Derive display values from real authenticated user data
  const displayName = profile?.full_name || authUser?.email?.split('@')[0] || 'User';
  const displayEmail = authUser?.email || '';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  useEffect(() => {
    loadAccountData();

    // Set up toast callback for when products are saved from other pages
    savedProductsState.setOnAddCallback((productName) => {
      setToastMessage(`${productName} saved`);
    });

    return () => {
      savedProductsState.setOnAddCallback(null);
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

  // Filtered saved products based on user preferences
  const filteredSavedProducts = useMemo(() => {
    return savedProducts.filter((product) => {
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesSkinType =
        filterSkinType === 'all' ||
        !product.skinTypes ||
        product.skinTypes.includes(filterSkinType);
      return matchesCategory && matchesSkinType;
    });
  }, [savedProducts, filterCategory, filterSkinType]);

  // Sorted saved products based on user preference (applied after filtering)
  const sortedSavedProducts = useMemo(() => {
    const sorted = [...filteredSavedProducts];
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
  }, [filteredSavedProducts, savedProductsSort]);

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
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={handleCloseToast} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Profile Header + Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Profile Header */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 sm:p-6 border border-blush/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-light/50">
                    {(profile?.preferences as any)?.avatar_url ? (
                      <img
                        src={(profile?.preferences as any).avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blush/30">
                        <i className="ri-user-line text-2xl text-warm-gray/60"></i>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/profile/customize"
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full transition-colors cursor-pointer hover:bg-dark"
                  >
                    <i className="ri-pencil-line text-xs"></i>
                  </Link>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-lg font-semibold text-deep">{displayName}</h1>
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
                  <p className="text-sm text-warm-gray">{displayEmail}</p>
                  {memberSince && <p className="text-xs text-warm-gray/70">Member since {memberSince}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/profile/view/${authUser?.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-gray hover:text-deep transition-colors cursor-pointer"
                >
                  <i className="ri-eye-line"></i>
                  View as others
                </Link>
                <Link
                  to="/profile/customize"
                  className="text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer"
                >
                  Customize
                </Link>
              </div>
            </div>
          </div>

          {/* Badges Preview */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-blush/30 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-deep">Badges</h2>
              <Link to="/badges" className="text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { icon: 'ri-rocket-line', name: 'Early Adopter' },
                { icon: 'ri-calendar-check-line', name: 'Routine Master' },
                { icon: 'ri-heart-line', name: 'Community Helper' },
                { icon: 'ri-flask-fill', name: 'Ingredient Expert' },
              ].map((badge) => (
                <div key={badge.name} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cream">
                    <i className={`${badge.icon} text-lg text-warm-gray/50`}></i>
                  </div>
                  <span className="text-[10px] text-warm-gray/60 text-center leading-tight line-clamp-1">{badge.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-warm-gray/70 mt-auto">0 of 9 badges earned</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl p-5 sm:p-6 mb-8 border border-blush/30">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-deep">Bio</h2>
            {!isEditingBio && (
              <button
                onClick={() => { setBioText((profile?.preferences as any)?.bio || ''); setIsEditingBio(true); }}
                className="text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingBio ? (
            <div>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Tell the community a little about yourself and your skincare journey."
                className="w-full text-sm text-deep bg-cream/50 border border-blush/30 rounded-lg p-3 resize-none focus:outline-none focus:border-primary/40 transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-warm-gray/60">{bioText.length}/300</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="text-xs font-medium text-warm-gray hover:text-deep transition-colors px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={bioSaving}
                    className="text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors px-4 py-1.5 rounded-full disabled:opacity-50"
                  >
                    {bioSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-warm-gray leading-relaxed">
              {(profile?.preferences as any)?.bio || 'Tell the community a little about yourself and your skincare journey.'}
            </p>
          )}
        </div>

        {/* Skin Profile */}
        <div className="bg-white rounded-xl p-5 sm:p-6 mb-8 border border-blush/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-deep">Skin Profile</h2>
            {hasSkinProfile && (
              <Link
                to="/my-skin"
                className="text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer"
              >
                View Full Profile
              </Link>
            )}
          </div>

          {hasSkinProfile ? (
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {/* Skin Type */}
              {effectiveSkinType && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-1">Skin Type</p>
                  <p className="text-sm font-semibold text-deep capitalize">{effectiveSkinType}</p>
                </div>
              )}

              {/* Concerns */}
              {effectiveConcerns.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-1">Concerns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveConcerns.slice(0, 4).map((concern) => (
                      <span
                        key={concern}
                        className="px-2 py-0.5 bg-cream/60 text-xs text-warm-gray rounded-full border border-blush/30 capitalize"
                      >
                        {concern}
                      </span>
                    ))}
                    {effectiveConcerns.length > 4 && (
                      <span className="px-2 py-0.5 text-xs text-warm-gray/60">
                        +{effectiveConcerns.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {effectiveAllergens.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-1">Allergens</p>
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveAllergens.slice(0, 3).map((allergen) => (
                      <span
                        key={allergen}
                        className="px-2 py-0.5 bg-cream/60 text-xs text-warm-gray rounded-full border border-blush/30 capitalize"
                      >
                        {allergen}
                      </span>
                    ))}
                    {effectiveAllergens.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-warm-gray/60">
                        +{effectiveAllergens.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-warm-gray mb-3">You haven't completed your skin profile yet.</p>
              <Link
                to="/onboarding"
                className="inline-block px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-dark"
              >
                Start Survey
              </Link>
            </div>
          )}
        </div>

        {/* Saved Products Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-lg font-semibold text-deep">
              Saved Products
            </h2>

            {savedProducts.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2 text-warm-gray">
                  Filter Saved Products
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
                  {filteredSavedProducts.length > 1 && (
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

          {sortedSavedProducts.length > 0 ? (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blush/30">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedSavedProducts.map((product) => (
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

                    {/* Product Actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setRoutinePickerProduct(product);
                        }}
                        className="text-xs underline cursor-pointer transition-colors hover:opacity-100"
                        style={{ color: '#C4704D' }}
                        aria-label={`Add ${product.name} to a routine`}
                      >
                        Add to Routine
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeSavedProduct(product.id);
                        }}
                        className="text-xs underline cursor-pointer transition-colors hover:opacity-100"
                        style={{ color: 'rgba(45, 42, 38, 0.7)' }}
                        aria-label={`Remove ${product.name} from saved products`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-blush/30">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-cream">
                <i className={`${savedProducts.length > 0 ? 'ri-filter-line' : 'ri-bookmark-line'} text-2xl text-warm-gray/60`}></i>
              </div>
              {savedProducts.length > 0 ? (
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

      </main>

      {/* Routine Picker Modal */}
      {routinePickerProduct && (
        <RoutinePickerModal
          isOpen={!!routinePickerProduct}
          onClose={() => setRoutinePickerProduct(null)}
          product={{
            id: routinePickerProduct.id,
            name: routinePickerProduct.name,
            brand: routinePickerProduct.brand,
            image: routinePickerProduct.image,
            category: routinePickerProduct.category,
          }}
        />
      )}

    </div>
  );
};

export default AccountPage;
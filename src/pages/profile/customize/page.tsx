import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { supabase, UserProfile } from '../../../lib/supabase';

export default function ProfileCustomizePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('sage');
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [showBadges, setShowBadges] = useState(true);
  const [showRoutines, setShowRoutines] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserProfile(data);
        setSelectedTheme(data.profile_theme || 'sage');
        setSelectedLayout(data.profile_layout || 'grid');
        setShowBadges(data.show_badges ?? true);
        setShowRoutines(data.show_routines ?? true);
        setShowCommunities(data.show_communities ?? true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomization = async () => {
    if (!userProfile) return;

    // Check if user has access to customization
    if (userProfile.subscription_tier === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('users_profiles')
        .update({
          profile_theme: selectedTheme,
          profile_layout: selectedLayout,
          show_badges: showBadges,
          show_routines: showRoutines,
          show_communities: showCommunities,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      // Show success message
      alert('Profile customization saved successfully!');
      loadUserProfile();
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Failed to save customization. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'sage', name: 'Sage', primary: '#14B8A6', secondary: '#F0FDF4', accent: '#10B981' },
    { id: 'coral', name: 'Coral', primary: '#F97316', secondary: '#FFF7ED', accent: '#FB923C' },
    { id: 'lavender', name: 'Lavender', primary: '#A855F7', secondary: '#FAF5FF', accent: '#C084FC' },
    { id: 'ocean', name: 'Ocean', primary: '#0EA5E9', secondary: '#F0F9FF', accent: '#38BDF8' },
    { id: 'sunset', name: 'Sunset', primary: '#EC4899', secondary: '#FDF2F8', accent: '#F472B6' },
    { id: 'forest', name: 'Forest', primary: '#059669', secondary: '#ECFDF5', accent: '#34D399' }
  ];

  const layouts = [
    { id: 'grid', name: 'Grid', icon: 'ri-layout-grid-line', description: 'Classic grid layout' },
    { id: 'list', name: 'List', icon: 'ri-list-check', description: 'Detailed list view' },
    { id: 'masonry', name: 'Masonry', icon: 'ri-layout-masonry-line', description: 'Pinterest-style layout' }
  ];

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { text: 'Free', color: 'bg-gray-100 text-gray-700' },
      plus: { text: 'Plus', color: 'bg-teal-100 text-teal-700' },
      premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' }
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  const isLocked = userProfile?.subscription_tier === 'free';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Customize Profile</h1>
                <p className="text-gray-600">Personalize your profile appearance and layout</p>
              </div>
              {userProfile && (
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getTierBadge(userProfile.subscription_tier).color}`}>
                  {getTierBadge(userProfile.subscription_tier).text}
                </span>
              )}
            </div>
            {isLocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <i className="ri-lock-line text-amber-600 text-xl flex-shrink-0 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-amber-900 font-medium mb-1">Premium Feature</p>
                  <p className="text-amber-700 text-sm">Profile customization is available for Plus and Premium members.</p>
                </div>
                <Link
                  to="/subscription"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customization Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Theme Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Color Theme</h2>
                    <p className="text-gray-600 text-sm">Choose your profile color scheme</p>
                  </div>
                  {isLocked && <i className="ri-lock-line text-gray-400 text-2xl"></i>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => !isLocked && setSelectedTheme(theme.id)}
                      disabled={isLocked}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedTheme === theme.id
                          ? 'border-teal-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: theme.secondary }}
                        ></div>
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: theme.accent }}
                        ></div>
                      </div>
                      <p className="font-semibold text-gray-900">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Layout</h2>
                    <p className="text-gray-600 text-sm">Select how your content is displayed</p>
                  </div>
                  {isLocked && <i className="ri-lock-line text-gray-400 text-2xl"></i>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => !isLocked && setSelectedLayout(layout.id)}
                      disabled={isLocked}
                      className={`p-6 rounded-xl border-2 transition-all text-center ${
                        selectedLayout === layout.id
                          ? 'border-teal-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <i className={`${layout.icon} text-4xl text-gray-700 mb-3`}></i>
                      <p className="font-semibold text-gray-900 mb-1">{layout.name}</p>
                      <p className="text-sm text-gray-600">{layout.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Visibility Settings</h2>
                    <p className="text-gray-600 text-sm">Control what appears on your profile</p>
                  </div>
                  {isLocked && <i className="ri-lock-line text-gray-400 text-2xl"></i>}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="ri-medal-line text-2xl text-gray-700"></i>
                      <div>
                        <p className="font-medium text-gray-900">Show Badges</p>
                        <p className="text-sm text-gray-600">Display your earned badges</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowBadges(!showBadges)}
                      disabled={isLocked}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        showBadges ? 'bg-teal-600' : 'bg-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          showBadges ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="ri-calendar-check-line text-2xl text-gray-700"></i>
                      <div>
                        <p className="font-medium text-gray-900">Show Routines</p>
                        <p className="text-sm text-gray-600">Display your skincare routines</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowRoutines(!showRoutines)}
                      disabled={isLocked}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        showRoutines ? 'bg-teal-600' : 'bg-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          showRoutines ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="ri-community-line text-2xl text-gray-700"></i>
                      <div>
                        <p className="font-medium text-gray-900">Show Communities</p>
                        <p className="text-sm text-gray-600">Display joined communities</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowCommunities(!showCommunities)}
                      disabled={isLocked}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        showCommunities ? 'bg-teal-600' : 'bg-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          showCommunities ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Feature - Custom App Icon */}
              {userProfile?.subscription_tier === 'premium' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-vip-crown-line text-2xl text-amber-600"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Exclusive: Custom App Icon</h3>
                      <p className="text-gray-700 mb-4">Upload your own custom app icon to personalize your experience</p>
                      <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium whitespace-nowrap">
                        Upload Custom Icon
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex gap-4">
                <Link
                  to="/account"
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center whitespace-nowrap"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSaveCustomization}
                  disabled={isLocked || saving}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Live Preview</h3>
                <div
                  className="rounded-xl p-6 mb-4"
                  style={{
                    backgroundColor: themes.find(t => t.id === selectedTheme)?.secondary
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: themes.find(t => t.id === selectedTheme)?.primary
                      }}
                    >
                      <i className="ri-user-line text-2xl text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{userProfile?.full_name || 'Your Name'}</h4>
                      <p className="text-sm text-gray-600">Skincare Enthusiast</p>
                    </div>
                  </div>

                  {showBadges && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Badges</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <i className="ri-medal-line text-sm" style={{ color: themes.find(t => t.id === selectedTheme)?.primary }}></i>
                        </div>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <i className="ri-star-line text-sm" style={{ color: themes.find(t => t.id === selectedTheme)?.primary }}></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {showCommunities && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Communities</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                        <div className="w-8 h-8 bg-white rounded-lg"></div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">Preview of your customized profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-3xl text-amber-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Customize</h3>
              <p className="text-gray-600">
                Profile customization is available for Plus and Premium members
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-check-line text-teal-600"></i>
                <span>Custom color themes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-check-line text-teal-600"></i>
                <span>Multiple layout options</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <i className="ri-check-line text-teal-600"></i>
                <span>Visibility controls</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
              >
                Cancel
              </button>
              <Link
                to="/subscription"
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-center whitespace-nowrap"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
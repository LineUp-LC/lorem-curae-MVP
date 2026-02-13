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
      free: { text: 'Free', color: 'bg-warm-gray/10 text-warm-gray' },
      plus: { text: 'Plus', color: 'bg-sage/20 text-sage' },
      premium: { text: 'Premium', color: 'bg-primary/10 text-primary' }
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  const isLocked = userProfile?.subscription_tier === 'free';

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3"></div>
          <p className="text-warm-gray text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-deep mb-1">Customize Profile</h1>
            <p className="text-sm text-warm-gray">Control what appears on your public profile</p>
            {isLocked && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                <i className="ri-lock-line text-primary text-sm"></i>
                <span className="text-sm text-deep">Available for Plus and Premium</span>
                <Link
                  to="/subscription"
                  className="text-sm font-medium text-primary hover:text-dark"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Customization Options */}
            <div className="space-y-6">
              {/* Visibility Settings */}
              <div className="bg-white rounded-xl border border-blush/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-medium text-deep text-base">Visibility Settings</h2>
                    <p className="text-warm-gray text-sm">Control what appears on your profile</p>
                  </div>
                  {isLocked && <i className="ri-lock-line text-warm-gray/40 text-lg"></i>}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-blush/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-medal-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Badges</p>
                        <p className="text-xs text-warm-gray">Display earned badges</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowBadges(!showBadges)}
                      disabled={isLocked}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        showBadges ? 'bg-primary' : 'bg-warm-gray/25'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showBadges ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-blush/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-calendar-check-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Routines</p>
                        <p className="text-xs text-warm-gray">Display skincare routines</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowRoutines(!showRoutines)}
                      disabled={isLocked}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        showRoutines ? 'bg-primary' : 'bg-warm-gray/25'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showRoutines ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-community-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Communities</p>
                        <p className="text-xs text-warm-gray">Display joined communities</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !isLocked && setShowCommunities(!showCommunities)}
                      disabled={isLocked}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        showCommunities ? 'bg-primary' : 'bg-warm-gray/25'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showCommunities ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>


              {/* Save Button */}
              <div className="flex gap-3">
                <Link
                  to="/account"
                  className="flex-1 px-5 py-2.5 border border-blush text-warm-gray rounded-lg hover:bg-cream transition-colors font-medium text-center text-sm"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSaveCustomization}
                  disabled={isLocked || saving}
                  className="flex-1 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-deep/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-vip-crown-line text-2xl text-primary"></i>
              </div>
              <h3 className="font-serif text-xl font-semibold text-deep mb-1">Upgrade to Customize</h3>
              <p className="text-warm-gray text-sm">
                Profile customization is available for Plus and Premium members
              </p>
            </div>

            <div className="bg-cream rounded-xl p-4 mb-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-deep">
                <i className="ri-check-line text-primary"></i>
                <span>Custom color themes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-deep">
                <i className="ri-check-line text-primary"></i>
                <span>Multiple layout options</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-deep">
                <i className="ri-check-line text-primary"></i>
                <span>Visibility controls</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-5 py-2.5 border border-blush text-warm-gray rounded-lg hover:bg-cream transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <Link
                to="/subscription"
                className="flex-1 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-center text-sm"
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
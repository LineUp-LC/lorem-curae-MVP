import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase, UserProfile, DataImpactContribution } from '../../lib/supabase';

export default function DataImpactPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contribution, setContribution] = useState<DataImpactContribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [optingIn, setOptingIn] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Load contribution data
        const { data: contributionData, error: contributionError } = await supabase
          .from('data_impact_contributions')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (contributionError && contributionError.code !== 'PGRST116') {
          throw contributionError;
        }
        
        setContribution(contributionData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptInToggle = async () => {
    if (!userProfile) return;

    try {
      setOptingIn(true);
      const newOptInStatus = !contribution?.opted_in;

      if (contribution) {
        // Update existing record
        const { error } = await supabase
          .from('data_impact_contributions')
          .update({ 
            opted_in: newOptInStatus,
            last_contribution_at: newOptInStatus ? new Date().toISOString() : contribution.last_contribution_at
          })
          .eq('id', userProfile.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('data_impact_contributions')
          .insert({
            user_id: userProfile.id,
            opted_in: newOptInStatus,
            contribution_count: 0,
            last_contribution_at: newOptInStatus ? new Date().toISOString() : null
          });

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error updating opt-in status:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setOptingIn(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { text: 'Free', color: 'bg-gray-100 text-gray-700' },
      plus: { text: 'Plus', color: 'bg-taupe-100 text-taupe-700' },
      premium: { text: 'Premium', color: 'bg-amber-100 text-amber-700' }
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  const isPremium = userProfile?.subscription_tier === 'premium';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-taupe mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-2">Data Impact Dashboard</h1>
                <p className="text-sm text-warm-gray">See how your anonymized data contributes to systemic change</p>
              </div>
              {userProfile && (
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getTierBadge(userProfile.subscription_tier).color}`}>
                  {getTierBadge(userProfile.subscription_tier).text}
                </span>
              )}
            </div>
          </div>

          {/* Opt-In Section */}
          <div className="bg-gradient-to-br from-taupe-50 to-white border border-taupe-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-taupe-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-line text-3xl text-taupe"></i>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contribute to Change</h2>
                <p className="text-gray-700 mb-4">
                  Your anonymized search and purchase data helps NGOs, advocacy groups, and regulators push for safer, 
                  more sustainable skincare products. You maintain full ownership of your personal journey while 
                  contributing to systemic change.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleOptInToggle}
                    disabled={optingIn}
                    className={`relative w-16 h-9 rounded-full transition-colors ${
                      contribution?.opted_in ? 'bg-taupe' : 'bg-gray-300'
                    } ${optingIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-transform ${
                        contribution?.opted_in ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {contribution?.opted_in ? 'Contributing Data' : 'Not Contributing'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {contribution?.opted_in 
                        ? 'Thank you for helping shape the future of skincare!' 
                        : 'Enable to start contributing anonymized data'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {contribution?.opted_in && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center">
                    <i className="ri-database-2-line text-taupe text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">47,892</p>
                <p className="text-sm text-gray-600">Contributing to change</p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center">
                    <i className="ri-bar-chart-line text-taupe text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Data Points</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">2.4M</p>
                <p className="text-sm text-gray-600">Anonymized insights</p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center">
                    <i className="ri-trophy-line text-taupe text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Campaigns</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">23</p>
                <p className="text-sm text-gray-600">Successful advocacy</p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center">
                    <i className="ri-gift-line text-taupe text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900">Your Impact</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{contribution?.contribution_count || 0}</p>
                <p className="text-sm text-gray-600">Data contributions</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Impact Stories */}
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Impact Stories</h2>
                <div className="space-y-6">
                  <div className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-taupe-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-flask-line text-taupe text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">Microplastic Ban Success</h3>
                        <span className="px-2 py-1 bg-taupe-100 text-taupe-700 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Data showing 78% of users avoiding microplastic ingredients helped advocacy groups 
                        secure a ban in 3 EU countries. Over 450 products reformulated.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-user-line"></i>
                          12,847 contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          March 2024
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-taupe-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-leaf-line text-taupe text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">Sustainable Packaging Initiative</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Consumer preference data revealed 89% prioritize sustainable packaging. 
                        Leading brands now committing to 100% recyclable packaging by 2025.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-user-line"></i>
                          28,394 contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          Ongoing
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-taupe-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-test-tube-line text-taupe text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">Ingredient Transparency Standards</h3>
                        <span className="px-2 py-1 bg-taupe-100 text-taupe-700 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Search data showing confusion around ingredient names led to new FDA guidelines 
                        requiring clearer labeling and allergen warnings.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-user-line"></i>
                          19,562 contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          January 2024
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-taupe-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-heart-pulse-line text-taupe text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">Sensitive Skin Research</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Aggregated data on ingredient reactions helping dermatology researchers 
                        identify common irritants and develop better formulations for sensitive skin.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-user-line"></i>
                          34,721 contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          Ongoing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Detailed Reports */}
              {!isPremium && (
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-vip-crown-line text-2xl text-amber-600"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium: Detailed Impact Reports</h3>
                      <p className="text-gray-700 mb-4">
                        Get personalized monthly reports showing exactly how your data contributed to specific 
                        campaigns, research studies, and policy changes.
                      </p>
                      <Link
                        to="/subscription"
                        className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium whitespace-nowrap"
                      >
                        Upgrade to Premium
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Privacy & Security */}
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-lock-line text-taupe"></i>
                  Privacy & Security
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-taupe flex-shrink-0 mt-0.5"></i>
                    <p>All data is fully anonymized before sharing</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-taupe flex-shrink-0 mt-0.5"></i>
                    <p>No personal information ever shared</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-taupe flex-shrink-0 mt-0.5"></i>
                    <p>You can opt out anytime</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-taupe flex-shrink-0 mt-0.5"></i>
                    <p>Full transparency on data usage</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="ri-check-line text-taupe flex-shrink-0 mt-0.5"></i>
                    <p>GDPR & CCPA compliant</p>
                  </div>
                </div>
              </div>

              {/* Partner Organizations */}
              <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Partner Organizations</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-building-line text-taupe"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Clean Beauty Coalition</p>
                      <p className="text-xs text-gray-600">Advocacy Group</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-microscope-line text-taupe"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Dermatology Research Institute</p>
                      <p className="text-xs text-gray-600">Research</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-leaf-line text-taupe"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Sustainability Alliance</p>
                      <p className="text-xs text-gray-600">NGO</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-taupe-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-government-line text-taupe"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Consumer Safety Board</p>
                      <p className="text-xs text-gray-600">Regulatory</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-taupe-50 to-white rounded-xl p-6 border border-taupe-200">
                <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-taupe text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">You Use Nutrire</p>
                      <p className="text-xs text-gray-600">Search products, track routines, make purchases</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-taupe text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">Data Anonymized</p>
                      <p className="text-xs text-gray-600">All personal info removed, aggregated with others</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-taupe text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">Insights Generated</p>
                      <p className="text-xs text-gray-600">Trends and patterns identified from collective data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-taupe text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-1">Real Change</p>
                      <p className="text-xs text-gray-600">Partners use insights for advocacy and research</p>
                    </div>
                  </div>
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
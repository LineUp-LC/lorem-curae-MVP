import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase-browser';
import { UserProfile, SubscriptionPlanRow } from '../../lib/supabase';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserProfile(profileData as UserProfile);
      }

      // Load subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });
      
      if (plansError) throw plansError;
      
      // Parse features field if it's a string
      const parsedPlans: SubscriptionPlanRow[] = (plansData || []).map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : Array.isArray(plan.features) 
            ? plan.features 
            : []
      }));
      
      setPlans(parsedPlans);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (!userProfile) {
      alert('Please sign in to subscribe');
      return;
    }

    // In production, this would integrate with Stripe
    alert(`Subscription to ${planName} will be implemented with Stripe integration`);
  };

  const getTierBadge = (tier: string | null) => {
    const badges: Record<string, { text: string; color: string }> = {
      free: { text: 'Current Plan', color: 'bg-cream text-warm-gray' },
      plus: { text: 'Current Plan', color: 'bg-light/30 text-primary-700' },
      premium: { text: 'Current Plan', color: 'bg-amber-100 text-amber-700' }
    };
    return badges[tier || 'free'] || badges.free;
  };

  const isCurrentPlan = (planName: string) => {
    if (!userProfile || !userProfile.subscription_tier) return false;
    return userProfile.subscription_tier.toLowerCase() === planName.toLowerCase().replace('nutrire ', '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-warm-gray">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-dark text-white py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-light mb-8">Unlock premium features and support sustainable skincare</p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-deep shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-deep shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Yearly
                <span className="ml-2 px-2 py-1 bg-primary text-white rounded-full text-xs font-bold">
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.name);
              const isPremium = plan.name.toLowerCase().includes('premium');
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const monthlyEquivalent = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : null;
              const featuresArray = Array.isArray(plan.features) ? plan.features : [];

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                    isPremium ? 'border-primary relative transform scale-105' : 'border-blush'
                  }`}
                >
                  {isPremium && (
                    <div className="bg-gradient-to-r from-primary via-teal-500 to-primary text-white text-center py-3 font-bold text-sm">
                      ⭐ PREMIUM - MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className={`text-2xl font-serif font-bold mb-2 ${isPremium ? 'text-primary' : 'text-deep'}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-bold ${isPremium ? 'text-primary' : 'text-deep'}`}>
                          ${price}
                        </span>
                        <span className="text-warm-gray">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {monthlyEquivalent && (
                        <p className={`text-sm mt-1 ${isPremium ? 'text-primary' : 'text-primary'}`}>
                          ${monthlyEquivalent}/month when billed annually
                        </p>
                      )}
                    </div>

                    {isCurrent ? (
                      <div className={`w-full py-3 rounded-lg font-medium text-center ${getTierBadge(userProfile?.subscription_tier || 'free').color}`}>
                        {getTierBadge(userProfile?.subscription_tier || 'free').text}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.name)}
                        className={`w-full py-3 rounded-lg font-bold transition-colors whitespace-nowrap ${
                          isPremium
                            ? 'bg-gradient-to-r from-primary via-teal-500 to-primary text-white hover:from-primary hover:via-teal-600 hover:to-dark shadow-lg'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {plan.price_monthly === 0 ? 'Get Started' : 'Subscribe Now'}
                      </button>
                    )}

                    <div className="mt-8 space-y-4">
                      <div className="flex items-start gap-3">
                        <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                        <p className="text-warm-gray text-sm">
                          Join up to <strong>{plan.max_communities === 999 ? 'unlimited' : plan.max_communities}</strong> communities
                        </p>
                      </div>
                      {plan.can_create_communities && (
                        <div className="flex items-start gap-3">
                          <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                          <p className="text-warm-gray text-sm">Create your own communities</p>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                        <p className="text-warm-gray text-sm">
                          <strong>{plan.storage_limit_mb}MB</strong> storage for uploads
                        </p>
                      </div>
                      {plan.marketplace_discount > 0 && (
                        <div className="flex items-start gap-3">
                          <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                          <p className="text-warm-gray text-sm">
                            <strong>{plan.marketplace_discount}%</strong> marketplace discount
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                        <p className="text-warm-gray text-sm">
                          <strong>{plan.cashback_percentage}%</strong> affiliate cashback
                        </p>
                      </div>
                      {featuresArray.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <i className={`ri-check-line text-xl flex-shrink-0 ${isPremium ? 'text-primary' : 'text-primary'}`}></i>
                          <p className="text-warm-gray text-sm">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16 border border-blush">
            <div className="bg-gradient-to-r from-primary to-dark text-white p-6">
              <h2 className="text-3xl font-serif font-bold text-center">Feature Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-deep">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-deep">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Communities to Join</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-warm-gray">
                        {plan.max_communities === 999 ? 'Unlimited' : plan.max_communities}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Create Communities</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.can_create_communities ? (
                          <i className="ri-check-line text-primary text-xl"></i>
                        ) : (
                          <i className="ri-close-line text-blush text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Storage Limit</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-warm-gray">
                        {plan.storage_limit_mb}MB
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Marketplace Discount</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-warm-gray">
                        {plan.marketplace_discount}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Affiliate Cashback</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center text-sm text-warm-gray">
                        {plan.cashback_percentage}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Profile Customization</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.name !== 'Nutrire Free' && plan.name !== 'Curae Free' ? (
                          <i className="ri-check-line text-primary text-xl"></i>
                        ) : (
                          <i className="ri-close-line text-blush text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Brand-Sponsored Packages</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.name !== 'Nutrire Free' && plan.name !== 'Curae Free' ? (
                          <i className="ri-check-line text-primary text-xl"></i>
                        ) : (
                          <i className="ri-close-line text-blush text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Data Impact Dashboard</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.name === 'Curae Luxe Premium' || plan.name === 'Nutrire Premium' ? (
                          <span className="text-sm text-warm-gray">Detailed Reports</span>
                        ) : (
                          <i className="ri-check-line text-primary text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-deep">Custom App Icon</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-6 py-4 text-center">
                        {plan.name === 'Curae Luxe Premium' || plan.name === 'Nutrire Premium' ? (
                          <i className="ri-check-line text-primary text-xl"></i>
                        ) : (
                          <i className="ri-close-line text-blush text-xl"></i>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-deep text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-cream rounded-xl shadow-sm p-6 border border-blush">
                <h3 className="text-lg font-semibold text-deep mb-2">Can I change plans anytime?</h3>
                <p className="text-warm-gray">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any charges or credits.
                </p>
              </div>

              <div className="bg-cream rounded-xl shadow-sm p-6 border border-blush">
                <h3 className="text-lg font-semibold text-deep mb-2">What payment methods do you accept?</h3>
                <p className="text-warm-gray">
                  We accept all major credit cards, debit cards, and digital wallets through our secure 
                  payment processor Stripe.
                </p>
              </div>

              <div className="bg-cream rounded-xl shadow-sm p-6 border border-blush">
                <h3 className="text-lg font-semibold text-deep mb-2">Is there a free trial?</h3>
                <p className="text-warm-gray">
                  Our Free plan gives you full access to core features with no time limit. You can upgrade 
                  anytime to unlock premium features.
                </p>
              </div>

              <div className="bg-cream rounded-xl shadow-sm p-6 border border-blush">
                <h3 className="text-lg font-semibold text-deep mb-2">How does the cashback work?</h3>
                <p className="text-warm-gray">
                  When you purchase through our affiliate links, you earn cashback credits based on your tier. 
                  Credits can be redeemed for marketplace discounts or future purchases.
                </p>
              </div>

              <div className="bg-cream rounded-xl shadow-sm p-6 border border-blush">
                <h3 className="text-lg font-semibold text-deep mb-2">What happens to my data if I cancel?</h3>
                <p className="text-warm-gray">
                  Your personal data remains yours. If you cancel, you'll revert to the Free plan and keep 
                  access to your routines and communities (within Free tier limits). You can delete your 
                  account anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
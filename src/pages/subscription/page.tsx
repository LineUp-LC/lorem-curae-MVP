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
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="py-12 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold mb-3 text-deep">Choose Your Plan</h1>
            <p className="text-base text-warm-gray mb-6 max-w-lg mx-auto">Unlock premium features to enhance your skincare journey</p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 border border-blush/50 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  billingCycle === 'monthly'
                    ? 'bg-deep text-white shadow-sm'
                    : 'text-warm-gray hover:text-deep'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-deep text-white shadow-sm'
                    : 'text-warm-gray hover:text-deep'
                }`}
              >
                Yearly
                <span className="px-1.5 py-0.5 bg-primary text-white rounded-full text-xs font-medium">
                  -25%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {plans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.name);
              const isPremium = plan.name.toLowerCase().includes('premium');
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const monthlyEquivalent = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : null;
              const featuresArray = Array.isArray(plan.features) ? plan.features : [];

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl overflow-hidden border transition-all ${
                    isPremium ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-blush/50 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isPremium && (
                    <div className="bg-primary text-white text-center py-2 text-xs font-medium tracking-wide">
                      Most Popular
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className={`text-lg font-semibold mb-1 ${isPremium ? 'text-primary' : 'text-deep'}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${isPremium ? 'text-primary' : 'text-deep'}`}>
                          ${price}
                        </span>
                        <span className="text-sm text-warm-gray">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {monthlyEquivalent && (
                        <p className="text-xs text-warm-gray mt-0.5">
                          ${monthlyEquivalent}/mo billed annually
                        </p>
                      )}
                    </div>

                    {isCurrent ? (
                      <div className={`w-full py-2.5 rounded-lg text-sm font-medium text-center ${getTierBadge(userProfile?.subscription_tier || 'free').color}`}>
                        {getTierBadge(userProfile?.subscription_tier || 'free').text}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.name)}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          isPremium
                            ? 'bg-primary text-white hover:bg-dark'
                            : 'bg-deep text-white hover:bg-deep/90'
                        }`}
                      >
                        {plan.price_monthly === 0 ? 'Get Started' : 'Subscribe'}
                      </button>
                    )}

                    <div className="mt-4 pt-4 border-t border-blush/30 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                        <p className="text-warm-gray text-xs">
                          <span className="font-medium text-deep">{plan.max_communities === 999 ? 'Unlimited' : plan.max_communities}</span> communities
                        </p>
                      </div>
                      {plan.can_create_communities && (
                        <div className="flex items-center gap-2">
                          <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                          <p className="text-warm-gray text-xs">Create communities</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                        <p className="text-warm-gray text-xs">
                          <span className="font-medium text-deep">{plan.storage_limit_mb}MB</span> storage
                        </p>
                      </div>
                      {plan.marketplace_discount > 0 && (
                        <div className="flex items-center gap-2">
                          <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                          <p className="text-warm-gray text-xs">
                            <span className="font-medium text-deep">{plan.marketplace_discount}%</span> marketplace discount
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                        <p className="text-warm-gray text-xs">
                          <span className="font-medium text-deep">{plan.cashback_percentage}%</span> cashback
                        </p>
                      </div>
                      {featuresArray.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <i className="ri-check-line text-base text-primary flex-shrink-0"></i>
                          <p className="text-warm-gray text-xs">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-white rounded-xl overflow-hidden mb-12 border border-blush/50 shadow-sm">
            <div className="bg-cream/50 border-b border-blush/30 p-4">
              <h2 className="text-lg font-semibold text-deep text-center">Feature Comparison</h2>
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
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-deep text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              <details className="bg-white rounded-xl border border-blush/30 group">
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium text-deep">
                  Can I change plans anytime?
                  <i className="ri-arrow-down-s-line text-warm-gray group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-5 pb-4 text-sm text-warm-gray">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-blush/30 group">
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium text-deep">
                  What payment methods do you accept?
                  <i className="ri-arrow-down-s-line text-warm-gray group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-5 pb-4 text-sm text-warm-gray">
                  We accept all major credit cards, debit cards, and digital wallets through Stripe.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-blush/30 group">
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium text-deep">
                  Is there a free trial?
                  <i className="ri-arrow-down-s-line text-warm-gray group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-5 pb-4 text-sm text-warm-gray">
                  Our Free plan gives you access to core features with no time limit.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-blush/30 group">
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium text-deep">
                  How does cashback work?
                  <i className="ri-arrow-down-s-line text-warm-gray group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-5 pb-4 text-sm text-warm-gray">
                  Earn cashback credits on affiliate purchases based on your tier, redeemable for discounts.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-blush/30 group">
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-medium text-deep">
                  What happens if I cancel?
                  <i className="ri-arrow-down-s-line text-warm-gray group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="px-5 pb-4 text-sm text-warm-gray">
                  You'll revert to the Free plan and keep access to your data within Free tier limits.
                </p>
              </details>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
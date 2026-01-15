import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase-browser';

interface AffiliatePartner {
  id: string;
  brand_name: string;
  description: string;
  logo_url: string;
  commission_rate: number;
  tracking_code: string;
  status: string;
  website_url: string;
}

interface AffiliateTransaction {
  id: string;
  brand_name: string;
  amount: number;
  commission_percentage: number;
  cashback_amount: number;
  status: string;
  created_at: string;
  product_name?: string;
}

interface AffiliateClick {
  id: string;
  partner_id: string;
  product_name: string;
  click_timestamp: string;
  converted: boolean;
  brand_name?: string;
}

export default function AffiliateDashboardPage() {
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [transactions, setTransactions] = useState<AffiliateTransaction[]>([]);
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'transactions' | 'analytics'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load affiliate partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('status', 'active')
        .order('brand_name');
      
      if (partnersError) throw partnersError;
      setPartners(partnersData || []);

      // Load user's affiliate transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('affiliate_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Load recent clicks (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: clicksData, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select(`
          *,
          affiliate_partners!inner(brand_name)
        `)
        .eq('user_id', user.id)
        .gte('click_timestamp', thirtyDaysAgo.toISOString())
        .order('click_timestamp', { ascending: false })
        .limit(100);
      
      if (clicksError) throw clicksError;
      
      const processedClicks = (clicksData || []).map(click => ({
        ...click,
        brand_name: (click as any).affiliate_partners?.brand_name || 'Unknown'
      }));
      setClicks(processedClicks);
      
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateLink = (partner: AffiliatePartner, productName?: string) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      ref: partner.tracking_code,
      source: 'dashboard',
      ...(productName && { product: productName })
    });
    return `${baseUrl}/affiliate-redirect?${params.toString()}&destination=${encodeURIComponent(partner.website_url)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  // Calculate statistics
  const totalEarnings = transactions.reduce((sum, t) => sum + t.cashback_amount, 0);
  const pendingEarnings = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.cashback_amount, 0);
  const clickCount = clicks.length;
  const conversionRate = clicks.length > 0 ? (clicks.filter(c => c.converted).length / clicks.length * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-taupe mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-2">Affiliate Dashboard</h1>
            <p className="text-sm text-warm-gray max-w-2xl mx-auto">
              Track your earnings from beauty brand partnerships and manage your affiliate links
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-taupe-100 rounded-lg">
                  <i className="ri-money-dollar-circle-line text-2xl text-taupe"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg">
                  <i className="ri-time-line text-2xl text-amber-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">${pendingEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                  <i className="ri-cursor-line text-2xl text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clicks (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{clickCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-taupe-100 rounded-lg">
                  <i className="ri-bar-chart-line text-2xl text-taupe"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                { key: 'partners', label: 'Partners', icon: 'ri-team-line' },
                { key: 'transactions', label: 'Transactions', icon: 'ri-exchange-line' },
                { key: 'analytics', label: 'Analytics', icon: 'ri-line-chart-line' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-taupe text-taupe'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${icon} text-lg`}></i>
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          transaction.status === 'completed' ? 'bg-taupe-100' : 'bg-amber-100'
                        }`}>
                          <i className={`${
                            transaction.status === 'completed' ? 'ri-check-line text-taupe' : 'ri-time-line text-amber-600'
                          } text-lg`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.brand_name}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.product_name || 'Product purchase'} • {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">+${transaction.cashback_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8">
                      <i className="ri-exchange-line text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">No transactions yet. Start shopping to earn cashback!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Performing Partners */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Top Partners</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.slice(0, 6).map((partner) => (
                    <div key={partner.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                          <img src={partner.logo_url} alt={partner.brand_name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{partner.brand_name}</h3>
                          <p className="text-sm text-taupe">{partner.commission_rate}% commission</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generateAffiliateLink(partner))}
                        className="w-full px-4 py-2 bg-taupe text-white rounded-lg hover:bg-taupe-700 transition-colors text-sm font-medium"
                      >
                        Copy Link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Affiliate Partners</h2>
              <div className="space-y-6">
                {partners.map((partner) => (
                  <div key={partner.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl overflow-hidden border">
                          <img src={partner.logo_url} alt={partner.brand_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{partner.brand_name}</h3>
                          <p className="text-gray-600 mb-3">{partner.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1 text-taupe">
                              <i className="ri-percent-line"></i>
                              <span>{partner.commission_rate}% commission</span>
                            </span>
                            <span className="flex items-center space-x-1 text-gray-500">
                              <i className="ri-shield-check-line"></i>
                              <span className="capitalize">{partner.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => copyToClipboard(generateAffiliateLink(partner))}
                          className="flex items-center space-x-2 px-4 py-2 bg-taupe text-white rounded-lg hover:bg-taupe-700 transition-colors"
                        >
                          <i className="ri-link text-lg"></i>
                          <span>Copy Link</span>
                        </button>
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <i className="ri-external-link-line text-lg"></i>
                          <span>Visit Store</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Brand</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Product</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Commission</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Cashback</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-4 px-2 text-gray-900">{transaction.brand_name}</td>
                        <td className="py-4 px-2 text-gray-600">{transaction.product_name || 'N/A'}</td>
                        <td className="py-4 px-2 text-gray-900">${transaction.amount.toFixed(2)}</td>
                        <td className="py-4 px-2 text-gray-900">{transaction.commission_percentage}%</td>
                        <td className="py-4 px-2 font-medium text-taupe">${transaction.cashback_amount.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-taupe-100 text-taupe-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <i className="ri-exchange-line text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Click Analytics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Click Analytics (Last 30 Days)</h2>
                <div className="space-y-4">
                  {clicks.slice(0, 10).map((click) => (
                    <div key={click.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          click.converted ? 'bg-taupe-100' : 'bg-gray-100'
                        }`}>
                          <i className={`${
                            click.converted ? 'ri-check-line text-taupe' : 'ri-cursor-line text-gray-500'
                          } text-lg`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{click.brand_name}</p>
                          <p className="text-sm text-gray-600">
                            {click.product_name || 'General click'} • {new Date(click.click_timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        click.converted ? 'bg-taupe-100 text-taupe-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {click.converted ? 'Converted' : 'Click'}
                      </span>
                    </div>
                  ))}
                  {clicks.length === 0 && (
                    <div className="text-center py-8">
                      <i className="ri-cursor-line text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">No clicks recorded in the last 30 days</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance by Brand */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Performance by Brand</h2>
                <div className="space-y-4">
                  {partners.map((partner) => {
                    const partnerTransactions = transactions.filter(t => t.brand_name === partner.brand_name);
                    const partnerClicks = clicks.filter(c => c.brand_name === partner.brand_name);
                    const totalEarned = partnerTransactions.reduce((sum, t) => sum + t.cashback_amount, 0);
                    const clickCount = partnerClicks.length;
                    const conversionRate = clickCount > 0 ? (partnerTransactions.length / clickCount * 100) : 0;

                    return (
                      <div key={partner.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                            <img src={partner.logo_url} alt={partner.brand_name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{partner.brand_name}</h3>
                            <p className="text-sm text-gray-600">{partner.commission_rate}% commission rate</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-medium text-gray-900">${totalEarned.toFixed(2)} earned</p>
                          <p className="text-sm text-gray-600">{clickCount} clicks • {conversionRate.toFixed(1)}% conversion</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
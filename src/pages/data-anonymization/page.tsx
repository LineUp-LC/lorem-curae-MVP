import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface AnonymizationStats {
  totalDataPoints: number;
  contributingUsers: number;
  lastProcessed: string;
  categories: Record<string, number>;
}

interface DataInsights {
  userSegments: Record<string, number>;
  popularIngredients: Record<string, number>;
  trendingConcerns: Record<string, number>;
  purchasePatterns: Record<string, number>;
  routinePreferences: Record<string, number>;
}

const DataAnonymizationPage: React.FC = () => {
  const [stats, setStats] = useState<AnonymizationStats | null>(null);
  const [insights, setInsights] = useState<DataInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  useEffect(() => {
    fetchAnonymizationStats();
    fetchInsights();
  }, [selectedTimeframe]);

  const fetchAnonymizationStats = async () => {
    try {
      // Get total data points
      const { count: totalDataPoints } = await supabase
        .from('anonymized_data_points')
        .select('*', { count: 'exact', head: true });

      // Get contributing users count
      const { count: contributingUsers } = await supabase
        .from('data_impact_contributions')
        .select('*', { count: 'exact', head: true })
        .eq('opted_in', true);

      // Get category breakdown
      const { data: categoryData } = await supabase
        .from('anonymized_data_points')
        .select('category')
        .gte('timestamp', new Date(Date.now() - parseInt(selectedTimeframe) * 24 * 60 * 60 * 1000).toISOString());

      const categories = categoryData?.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get last processed time
      const { data: lastProcessedData } = await supabase
        .from('data_impact_contributions')
        .select('last_contribution_at')
        .not('last_contribution_at', 'is', null)
        .order('last_contribution_at', { ascending: false })
        .limit(1);

      setStats({
        totalDataPoints: totalDataPoints || 0,
        contributingUsers: contributingUsers || 0,
        lastProcessed: lastProcessedData?.[0]?.last_contribution_at || 'Never',
        categories
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const dateFrom = new Date(Date.now() - parseInt(selectedTimeframe) * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-anonymization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'get_anonymized_insights',
          filters: {
            date_from: dateFrom,
            date_to: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUserData = async () => {
    setProcessing(true);
    try {
      // Get all opted-in users
      const { data: contributors } = await supabase
        .from('data_impact_contributions')
        .select('user_id')
        .eq('opted_in', true);

      if (contributors) {
        for (const contributor of contributors.slice(0, 5)) { // Process first 5 for demo
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-anonymization`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              action: 'process_user_data',
              user_id: contributor.user_id
            })
          });

          const result = await response.json();
          console.log(`Processed user ${contributor.user_id}:`, result);
        }
      }

      await fetchAnonymizationStats();
      await fetchInsights();
    } catch (error) {
      console.error('Error processing user data:', error);
    } finally {
      setProcessing(false);
    }
  };

  const generateResearchDataset = async () => {
    try {
      const dateFrom = new Date(Date.now() - parseInt(selectedTimeframe) * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-anonymization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'generate_research_dataset',
          filters: {
            date_from: dateFrom,
            date_to: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        // Download dataset
        const blob = new Blob([JSON.stringify(data.dataset, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anonymized-dataset-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating dataset:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading anonymization dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Anonymization Pipeline</h1>
          <p className="text-gray-600">Manage and monitor the secure anonymization of user data for research and advocacy.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={processUserData}
                disabled={processing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {processing ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-database-2-line mr-2"></i>
                    Process Data
                  </>
                )}
              </button>

              <button
                onClick={generateResearchDataset}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
              >
                <i className="ri-download-line mr-2"></i>
                Export Dataset
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="ri-database-line text-emerald-600 text-lg"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDataPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-blue-600 text-lg"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contributing Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.contributingUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-purple-600 text-lg"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anonymization Level</p>
                  <p className="text-2xl font-bold text-gray-900">Full</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-orange-600 text-lg"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Processed</p>
                  <p className="text-sm font-bold text-gray-900">
                    {stats.lastProcessed !== 'Never' 
                      ? new Date(stats.lastProcessed).toLocaleDateString() 
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Categories */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Categories Processed</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className={`ri-${getCategoryIcon(category)}-line text-gray-600 text-xl`}></i>
                  </div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</p>
                  <p className="text-lg font-bold text-emerald-600">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Segments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h3>
              <div className="space-y-3">
                {Object.entries(insights.userSegments).map(([segment, count]) => (
                  <div key={segment} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{segment.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Ingredients */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Ingredients</h3>
              <div className="space-y-3">
                {Object.entries(insights.popularIngredients).map(([ingredient, count]) => (
                  <div key={ingredient} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{ingredient.replace('-', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Concerns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Concerns</h3>
              <div className="space-y-3">
                {Object.entries(insights.trendingConcerns).map(([concern, count]) => (
                  <div key={concern} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{concern.replace('-', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Patterns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Patterns</h3>
              <div className="space-y-3">
                {Object.entries(insights.purchasePatterns).map(([pattern, count]) => (
                  <div key={pattern} className="flex justify-between items-center">
                    <span className="text-gray-700">${pattern}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="w-6 h-6 text-blue-600 mr-3 mt-0.5">
              <i className="ri-shield-check-line text-lg"></i>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Privacy & Security</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                All data processed through this pipeline is fully anonymized and contains no personally identifiable information. 
                User segments are created using non-identifying characteristics, and all individual user data is aggregated 
                before being made available to research partners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'search': return 'search';
    case 'purchase': return 'shopping-cart';
    case 'routine': return 'calendar';
    case 'ingredient_interest': return 'flask';
    case 'community_engagement': return 'group';
    default: return 'database';
  }
}

export default DataAnonymizationPage;
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Types
interface ProductStats {
  total_products: number;
  published_products: number;
  total_buyers: number;
  top_selling_products: Array<{
    id: string;
    name: string;
    buyers: number;
  }>;
}

interface PatchTestStats {
  total_patch_tests: number;
  avg_completion_rate: number;
  avg_reaction_rate: number;
  highest_risk_products: Array<{
    product_id: string;
    product_name: string;
    reaction_rate: number;
  }>;
}

interface AudienceStats {
  total_messages: number;
  unread_messages: number;
  message_types: {
    question: number;
    patch_test: number;
    feedback: number;
  };
}

interface AnalyticsData {
  product_stats: ProductStats;
  patch_test_stats: PatchTestStats;
  audience_stats: AudienceStats;
}

// Navigation items
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/creator/dashboard', icon: 'home' },
  { label: 'My Products', path: '/creator/products', icon: 'package' },
  { label: 'Patch Tests', path: '/creator/patch-tests', icon: 'clipboard' },
  { label: 'Audience', path: '/creator/audience', icon: 'users' },
  { label: 'Analytics', path: '/creator/analytics', icon: 'chart' },
  { label: 'Storefront', path: '/creator/storefront', icon: 'store' },
];

// Icons
const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    home: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    package: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    clipboard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    store: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    trending: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    mail: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    alert: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

// Sidebar Component
const CreatorSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-deep/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-warm-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-warm-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-serif font-semibold text-deep">Lorem Curae</span>
          </Link>
          <p className="text-xs text-warm-gray-500 mt-1">Creator Studio</p>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-warm-gray-600 hover:bg-warm-gray-50 hover:text-deep'
                  }
                `}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

// Header Component
const CreatorHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="sticky top-0 bg-white border-b border-warm-gray-100 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-warm-gray-500 hover:text-deep transition-colors"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="flex-1 lg:flex-none" />

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">C</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Stat Card Component
const StatCard = ({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: string;
}) => {
  return (
    <div className="bg-white rounded-2xl border border-warm-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-warm-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-semibold text-deep mt-1">{value}</p>
          {sublabel && (
            <p className="text-xs text-warm-gray-400 mt-1">{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Icon name={icon} className="w-5 h-5 text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
};

// Section Card Component
const SectionCard = ({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-warm-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-warm-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon name={icon} className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-semibold text-deep">{title}</h2>
          {subtitle && (
            <p className="text-sm text-warm-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

// Risk Badge Component
const RiskBadge = ({ rate }: { rate: number }) => {
  const percentage = rate * 100;
  let color = 'bg-sage-100 text-sage-700';
  let label = 'Low';

  if (percentage >= 25) {
    color = 'bg-primary-100 text-primary-700';
    label = 'High';
  } else if (percentage >= 10) {
    color = 'bg-warm-gray-100 text-warm-gray-700';
    label = 'Medium';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Message Type Badge Component
const MessageTypeBadge = ({ type, count }: { type: string; count: number }) => {
  const config: Record<string, { label: string; color: string }> = {
    question: { label: 'Questions', color: 'bg-primary-100 text-primary-700' },
    patch_test: { label: 'Patch Test', color: 'bg-sage-100 text-sage-700' },
    feedback: { label: 'Feedback', color: 'bg-warm-gray-100 text-warm-gray-700' },
  };

  const { label, color } = config[type] || { label: type, color: 'bg-warm-gray-100 text-warm-gray-700' };

  return (
    <div className="flex items-center justify-between py-2">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}>
        {label}
      </span>
      <span className="text-lg font-semibold text-deep">{count}</span>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, label, color = 'primary' }: { value: number; label: string; color?: string }) => {
  const percentage = Math.round(value * 100);
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-500',
    sage: 'bg-sage-500',
    warm: 'bg-warm-gray-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-warm-gray-600">{label}</span>
        <span className="text-sm font-semibold text-deep">{percentage}%</span>
      </div>
      <div className="h-2 bg-warm-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
};

// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
        <Icon name="alert" className="w-6 h-6 text-primary-500" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-deep mb-2">Failed to load analytics</h3>
      <p className="text-sm text-warm-gray-600 mb-4">
        We couldn't fetch your analytics data. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-warm-gray-100 p-5 h-28">
            <div className="h-4 bg-warm-gray-200 rounded w-1/3 mb-3" />
            <div className="h-8 bg-warm-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-warm-gray-100 h-64" />
      ))}
    </div>
  );
};

// Main Page Component
export default function CreatorAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/creator/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(true);
      // Mock data for development
      setAnalytics({
        product_stats: {
          total_products: 12,
          published_products: 8,
          total_buyers: 234,
          top_selling_products: [
            { id: '1', name: 'Hydrating Serum', buyers: 87 },
            { id: '2', name: 'Gentle Cleanser', buyers: 65 },
            { id: '3', name: 'Vitamin C Moisturizer', buyers: 52 },
          ],
        },
        patch_test_stats: {
          total_patch_tests: 6,
          avg_completion_rate: 0.78,
          avg_reaction_rate: 0.12,
          highest_risk_products: [
            { product_id: '4', product_name: 'Retinol Night Cream', reaction_rate: 0.28 },
            { product_id: '5', product_name: 'AHA Exfoliant', reaction_rate: 0.18 },
            { product_id: '6', product_name: 'Niacinamide Serum', reaction_rate: 0.05 },
          ],
        },
        audience_stats: {
          total_messages: 156,
          unread_messages: 12,
          message_types: {
            question: 67,
            patch_test: 45,
            feedback: 44,
          },
        },
      });
      setError(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <CreatorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <CreatorHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-deep">
                Analytics
              </h1>
              <p className="text-warm-gray-600 mt-1">
                Insights into your products, patch tests, and audience.
              </p>
            </motion.div>

            {loading ? (
              <LoadingSkeleton />
            ) : error && !analytics ? (
              <ErrorState onRetry={fetchAnalytics} />
            ) : analytics ? (
              <div className="space-y-8">
                {/* Quick Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <StatCard
                    label="Total Products"
                    value={analytics.product_stats.total_products}
                    sublabel={`${analytics.product_stats.published_products} published`}
                    icon="package"
                  />
                  <StatCard
                    label="Total Buyers"
                    value={analytics.product_stats.total_buyers}
                    icon="users"
                  />
                  <StatCard
                    label="Patch Tests"
                    value={analytics.patch_test_stats.total_patch_tests}
                    sublabel={`${formatPercentage(analytics.patch_test_stats.avg_completion_rate)} avg completion`}
                    icon="shield"
                  />
                  <StatCard
                    label="Messages"
                    value={analytics.audience_stats.total_messages}
                    sublabel={`${analytics.audience_stats.unread_messages} unread`}
                    icon="mail"
                  />
                </motion.div>

                {/* Section A: Product Performance */}
                <SectionCard
                  title="Product Performance"
                  subtitle="Overview of your product sales"
                  icon="trending"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-cream rounded-xl p-4">
                          <p className="text-sm text-warm-gray-500">Published</p>
                          <p className="text-2xl font-semibold text-deep">
                            {analytics.product_stats.published_products}
                            <span className="text-sm font-normal text-warm-gray-400 ml-1">
                              / {analytics.product_stats.total_products}
                            </span>
                          </p>
                        </div>
                        <div className="bg-cream rounded-xl p-4">
                          <p className="text-sm text-warm-gray-500">Total Buyers</p>
                          <p className="text-2xl font-semibold text-deep">
                            {analytics.product_stats.total_buyers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top Selling Products */}
                    <div>
                      <h3 className="text-sm font-medium text-warm-gray-500 mb-3">
                        Top Selling Products
                      </h3>
                      <div className="space-y-3">
                        {analytics.product_stats.top_selling_products.map((product, index) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between py-2 border-b border-warm-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium text-deep">
                                {product.name}
                              </span>
                            </div>
                            <span className="text-sm text-warm-gray-600">
                              {product.buyers} buyers
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Section B: Patch Test Insights */}
                <SectionCard
                  title="Patch Test Insights"
                  subtitle="Safety metrics and risk analysis"
                  icon="shield"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Metrics */}
                    <div className="space-y-6">
                      <ProgressBar
                        value={analytics.patch_test_stats.avg_completion_rate}
                        label="Average Completion Rate"
                        color="sage"
                      />
                      <ProgressBar
                        value={analytics.patch_test_stats.avg_reaction_rate}
                        label="Average Reaction Rate"
                        color={analytics.patch_test_stats.avg_reaction_rate > 0.25 ? 'primary' : analytics.patch_test_stats.avg_reaction_rate > 0.1 ? 'warm' : 'sage'}
                      />
                      <div className="bg-cream rounded-xl p-4">
                        <p className="text-sm text-warm-gray-500">Total Patch Tests</p>
                        <p className="text-2xl font-semibold text-deep">
                          {analytics.patch_test_stats.total_patch_tests}
                        </p>
                      </div>
                    </div>

                    {/* Highest Risk Products */}
                    <div>
                      <h3 className="text-sm font-medium text-warm-gray-500 mb-3">
                        Highest Risk Products
                      </h3>
                      <div className="space-y-3">
                        {analytics.patch_test_stats.highest_risk_products.map((product) => (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between py-3 px-4 bg-cream rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-deep truncate">
                                {product.product_name}
                              </p>
                              <p className="text-xs text-warm-gray-500 mt-0.5">
                                {formatPercentage(product.reaction_rate)} reaction rate
                              </p>
                            </div>
                            <RiskBadge rate={product.reaction_rate} />
                          </div>
                        ))}
                      </div>
                      {analytics.patch_test_stats.highest_risk_products.some(p => p.reaction_rate > 0.25) && (
                        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                          <p className="text-xs text-primary-700">
                            <span className="font-semibold">Action recommended:</span> Products with high reaction rates may require formula review or additional safety warnings.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {/* Section C: Audience Engagement */}
                <SectionCard
                  title="Audience Engagement"
                  subtitle="Communication metrics and message breakdown"
                  icon="mail"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cream rounded-xl p-4">
                        <p className="text-sm text-warm-gray-500">Total Messages</p>
                        <p className="text-2xl font-semibold text-deep">
                          {analytics.audience_stats.total_messages}
                        </p>
                      </div>
                      <div className="bg-primary-50 rounded-xl p-4">
                        <p className="text-sm text-primary-600">Unread</p>
                        <p className="text-2xl font-semibold text-primary-700">
                          {analytics.audience_stats.unread_messages}
                        </p>
                      </div>
                    </div>

                    {/* Message Type Breakdown */}
                    <div>
                      <h3 className="text-sm font-medium text-warm-gray-500 mb-3">
                        Messages by Type
                      </h3>
                      <div className="bg-cream rounded-xl p-4 space-y-1">
                        <MessageTypeBadge type="question" count={analytics.audience_stats.message_types.question} />
                        <MessageTypeBadge type="patch_test" count={analytics.audience_stats.message_types.patch_test} />
                        <MessageTypeBadge type="feedback" count={analytics.audience_stats.message_types.feedback} />
                      </div>
                    </div>
                  </div>

                  {analytics.audience_stats.unread_messages > 0 && (
                    <div className="mt-6 pt-4 border-t border-warm-gray-100">
                      <Link
                        to="/creator/audience"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        View all messages
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </SectionCard>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

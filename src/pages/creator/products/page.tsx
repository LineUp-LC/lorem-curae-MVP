import { motion } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion/motionVariants';

// Types
interface Product {
  id: string;
  name: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  price: number;
  inventory: number;
  created_at: string;
  updated_at: string;
  patch_tests_count: number;
  total_buyers: number;
}

type StatusFilter = 'all' | 'draft' | 'pending_review' | 'published' | 'archived';

// Mock creator data (will be replaced with real auth later)
const creator = {
  display_name: 'Dr. Skin Example',
  email: 'creator@example.com',
};

// Sidebar navigation items
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'home', href: '/creator/dashboard' },
  { id: 'products', label: 'My Products', icon: 'package', href: '/creator/products' },
  { id: 'programs', label: 'My Programs', icon: 'book', href: '/creator/programs' },
  { id: 'patch-tests', label: 'Patch Tests', icon: 'clipboard', href: '/creator/patch-tests' },
  { id: 'library', label: 'Library', icon: 'folder', href: '/creator/library' },
  { id: 'audience', label: 'Audience', icon: 'users', href: '/creator/audience' },
  { id: 'earnings', label: 'Earnings', icon: 'dollar', href: '/creator/earnings' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/creator/settings' },
];

// Status filter options
const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Icon component
function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    package: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    book: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    clipboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    folder: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dollar: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    close: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    external: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    chevronRight: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    ),
    refresh: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    cube: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format price
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Status Badge Component
function StatusBadge({ status }: { status: Product['status'] }) {
  const statusConfig = {
    draft: {
      label: 'Draft',
      className: 'bg-warm-gray/10 text-warm-gray border-warm-gray/20',
    },
    pending_review: {
      label: 'Pending Review',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    published: {
      label: 'Published',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    archived: {
      label: 'Archived',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl border border-blush-200 p-5 hover:border-blush-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Product info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Icon name="cube" className="w-5 h-5 text-primary-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-deep truncate">{product.name}</h3>
              <p className="text-sm text-warm-gray">{formatPrice(product.price)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={product.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-gray">
            <span>Created {formatDate(product.created_at)}</span>
            <span>Updated {formatDate(product.updated_at)}</span>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right">
          <div>
            <p className="text-xs text-warm-gray">Inventory</p>
            <p className="text-sm font-medium text-deep">{product.inventory} units</p>
          </div>
          <div>
            <p className="text-xs text-warm-gray">Buyers</p>
            <p className="text-sm font-medium text-deep">{product.total_buyers}</p>
          </div>
          <div>
            <p className="text-xs text-warm-gray">Patch Tests</p>
            <p className="text-sm font-medium text-deep">{product.patch_tests_count}</p>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4 pt-4 border-t border-blush-100 flex justify-end">
        <button
          disabled
          className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          View details
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  if (isFiltered) {
    return (
      <div className="bg-white rounded-xl border border-blush-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-gray/10 flex items-center justify-center">
          <Icon name="package" className="w-8 h-8 text-warm-gray" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-deep mb-2">
          No products match this filter
        </h3>
        <p className="text-sm text-warm-gray">
          Try selecting a different status to see more products.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blush-200 p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center">
        <Icon name="package" className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-deep mb-2">No products yet</h3>
      <p className="text-sm text-warm-gray max-w-sm mx-auto mb-6">
        Once you add a product, it will appear here. You'll be able to manage patch tests,
        inventory, and analytics.
      </p>
      <button
        disabled
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="plus" className="w-4 h-4" />
        Add your first product
      </button>
    </div>
  );
}

// Error State Component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <h3 className="font-medium text-red-800 mb-2">Failed to load products</h3>
      <p className="text-sm text-red-600 mb-4">
        Something went wrong while fetching your products. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
      >
        <Icon name="refresh" className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-blush-200 p-5 animate-pulse"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blush-200" />
            <div className="flex-1">
              <div className="h-5 bg-blush-200 rounded w-48 mb-2" />
              <div className="h-4 bg-blush-100 rounded w-24" />
            </div>
          </div>
          <div className="h-6 bg-blush-100 rounded w-20 mb-3" />
          <div className="h-3 bg-blush-100 rounded w-64" />
        </div>
      ))}
    </div>
  );
}

// Filter Bar Component
function FilterBar({
  activeFilter,
  onFilterChange,
  productCounts,
}: {
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  productCounts: Record<StatusFilter, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = productCounts[filter.value];

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-blush-200 text-warm-gray hover:border-primary-300 hover:text-primary-600'
              }
            `}
          >
            {filter.label}
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isActive ? 'bg-white/20 text-white' : 'bg-blush-100 text-warm-gray'}
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Sidebar Component
function CreatorSidebar({
  isOpen,
  onClose,
  activeItem = 'products',
}: {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-deep/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-blush-200 z-50
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-blush-200">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-semibold text-deep">Lorem Curae</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-warm-gray hover:text-deep transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Creator badge */}
        <div className="px-4 py-3 border-b border-blush-200">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            Creator Platform
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-warm-gray hover:bg-cream hover:text-deep'
                  }
                `}
              >
                <Icon name={item.icon} className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Help link at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blush-200">
          <a
            href="/faq"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-warm-gray hover:bg-cream hover:text-deep transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help & Support
          </a>
        </div>
      </aside>
    </>
  );
}

// Header Component
function CreatorHeader({
  creator,
  onMenuClick,
}: {
  creator: { display_name: string; email: string };
  onMenuClick: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b border-blush-200 flex items-center justify-between px-4 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-warm-gray hover:text-deep transition-colors"
      >
        <Icon name="menu" />
      </button>

      {/* Page title - hidden on mobile */}
      <div className="hidden lg:block">
        <h1 className="font-serif text-xl font-semibold text-deep">My Products</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* View public profile link */}
        <a
          href="#"
          className="hidden sm:flex items-center gap-1.5 text-sm text-warm-gray hover:text-primary-500 transition-colors"
        >
          View public profile
          <Icon name="external" className="w-4 h-4" />
        </a>

        {/* Creator info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-deep">{creator.display_name}</p>
            <p className="text-xs text-warm-gray">{creator.email}</p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-600">
              {getInitials(creator.display_name)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Main Products Page
export default function CreatorProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculate product counts for filters
  const productCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: products.length,
      draft: 0,
      pending_review: 0,
      published: 0,
      archived: 0,
    };

    products.forEach((product) => {
      counts[product.status]++;
    });

    return counts;
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') {
      return products;
    }
    return products.filter((product) => product.status === activeFilter);
  }, [products, activeFilter]);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <CreatorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="products"
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <CreatorHeader
          creator={creator}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Page header */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={transitions.normal}
            >
              <h2 className="font-serif text-2xl font-semibold text-deep mb-1 lg:hidden">
                My Products
              </h2>
              <p className="text-warm-gray">
                Manage the products you sell on the marketplace.
              </p>
            </motion.div>

            {/* Filter bar */}
            {!isLoading && !error && products.length > 0 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.normal, delay: 0.1 }}
              >
                <FilterBar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  productCounts={productCounts}
                />
              </motion.div>
            )}

            {/* Content states */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay: 0.2 }}
            >
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <ErrorState onRetry={fetchProducts} />
              ) : products.length === 0 ? (
                <EmptyState isFiltered={false} />
              ) : filteredProducts.length === 0 ? (
                <EmptyState isFiltered={true} />
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product count summary */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <motion.p
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ ...transitions.normal, delay: 0.3 }}
                className="text-sm text-warm-gray text-center"
              >
                Showing {filteredProducts.length} of {products.length} product
                {products.length !== 1 ? 's' : ''}
              </motion.p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

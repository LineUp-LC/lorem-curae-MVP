import { motion } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion/motionVariants';

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

// Quick action buttons
const QUICK_ACTIONS = [
  { label: 'Create New Program', icon: 'plus' },
  { label: 'Start a Patch Test', icon: 'clipboard' },
  { label: 'Invite a Test Group', icon: 'users' },
];

// Mock stats
const STATS = [
  { label: 'Active Programs', value: 0 },
  { label: 'Patch Tests Running', value: 0 },
  { label: 'Total Testers', value: 0 },
];

// Coming soon features
const COMING_SOON_FEATURES = [
  {
    title: 'Programs & Curriculum',
    description: 'Create structured skincare programs with lessons, routines, and progress tracking for your audience.',
  },
  {
    title: 'Patch Test Management',
    description: 'Run controlled patch tests with your community and collect valuable feedback on products and ingredients.',
  },
  {
    title: 'Audience & Feedback',
    description: 'Understand your community with insights on engagement, demographics, and feedback trends.',
  },
  {
    title: 'Earnings & Payouts',
    description: 'Track your revenue from programs, affiliate commissions, and manage your payout preferences.',
  },
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
    plus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
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

// Sidebar Component
function CreatorSidebar({
  isOpen,
  onClose,
  activeItem = 'overview',
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
        <h1 className="font-serif text-xl font-semibold text-deep">Creator Dashboard</h1>
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

// Stats Card Component
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-blush-200 p-5">
      <p className="text-sm text-warm-gray mb-1">{label}</p>
      <p className="text-3xl font-serif font-semibold text-deep">{value}</p>
    </div>
  );
}

// Coming Soon Card Component
function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-blush-200 p-6 relative overflow-hidden">
      {/* Coming soon badge */}
      <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sage/10 text-sage border border-sage/20">
        Coming soon
      </span>

      <h3 className="font-serif text-lg font-semibold text-deep mb-2 pr-24">{title}</h3>
      <p className="text-sm text-warm-gray leading-relaxed">{description}</p>
    </div>
  );
}

// Main Dashboard Page
export default function CreatorDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <CreatorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="overview"
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
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Panel */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={transitions.normal}
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white"
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold mb-2">
                Welcome back, {creator.display_name.split(' ')[0]}
              </h2>
              <p className="text-primary-100 max-w-2xl">
                This is your creator home base. Soon you'll see your programs, patch tests,
                and audience insights here. We're building something special for skincare educators like you.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.section
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay: 0.1 }}
            >
              <h3 className="font-serif text-lg font-semibold text-deep mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-blush-200 rounded-lg text-sm font-medium text-warm-gray hover:border-primary-300 hover:text-primary-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Icon name={action.icon} className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Stats Grid */}
            <motion.section
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay: 0.2 }}
            >
              <h3 className="font-serif text-lg font-semibold text-deep mb-4">Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STATS.map((stat) => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </motion.section>

            {/* Coming Soon Features */}
            <motion.section
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay: 0.3 }}
            >
              <h3 className="font-serif text-lg font-semibold text-deep mb-4">What's Coming</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMING_SOON_FEATURES.map((feature) => (
                  <ComingSoonCard
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </motion.section>

            {/* Help Section */}
            <motion.section
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.normal, delay: 0.4 }}
              className="bg-white rounded-xl border border-blush-200 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-deep mb-1">
                    Need help getting started?
                  </h3>
                  <p className="text-sm text-warm-gray">
                    Check out our creator guide or reach out to our support team.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="/faq"
                    className="inline-flex items-center justify-center px-4 py-2 border border-blush-300 rounded-lg text-sm font-medium text-deep hover:bg-cream transition-colors"
                  >
                    View FAQ
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

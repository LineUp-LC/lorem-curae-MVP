import { motion } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion/motionVariants';

// Types
interface Message {
  id: string;
  sender_name: string | null;
  sender_email: string;
  product_name: string | null;
  type: 'question' | 'patch_test' | 'feedback';
  subject: string;
  body: string;
  created_at: string;
  read: boolean;
}

type TypeFilter = 'all' | 'question' | 'patch_test' | 'feedback';
type ReadFilter = 'all' | 'unread' | 'read';

// Mock creator data
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

// Filter options
const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'question', label: 'Questions' },
  { value: 'patch_test', label: 'Patch Tests' },
  { value: 'feedback', label: 'Feedback' },
];

const READ_FILTERS: { value: ReadFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
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
    inbox: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    reply: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
    send: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    refresh: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Format full date
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Type Badge Component
function TypeBadge({ type }: { type: Message['type'] }) {
  const config = {
    question: {
      label: 'Question',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    patch_test: {
      label: 'Patch Test',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    feedback: {
      label: 'Feedback',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const { label, className } = config[type];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

// Message Row Component
function MessageRow({
  message,
  isSelected,
  onClick,
}: {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
}) {
  const senderDisplay = message.sender_name || message.sender_email;

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 text-left border-b border-blush-100 transition-colors
        ${isSelected ? 'bg-primary-50' : 'hover:bg-cream'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="pt-1.5">
          {!message.read && (
            <div className="w-2 h-2 rounded-full bg-primary-500" />
          )}
          {message.read && <div className="w-2 h-2" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-sm truncate ${!message.read ? 'font-semibold text-deep' : 'text-deep'}`}>
              {senderDisplay}
            </span>
            <span className="text-xs text-warm-gray flex-shrink-0">
              {formatDate(message.created_at)}
            </span>
          </div>

          <p className={`text-sm truncate mb-1 ${!message.read ? 'font-medium text-deep' : 'text-warm-gray'}`}>
            {message.subject}
          </p>

          <div className="flex items-center gap-2">
            <TypeBadge type={message.type} />
            {message.product_name && (
              <span className="text-xs text-warm-gray truncate">
                {message.product_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Message Detail Component
function MessageDetail({
  message,
  onReply,
  isReplying,
  replySent,
}: {
  message: Message;
  onReply: (replyMessage: string) => void;
  isReplying: boolean;
  replySent: boolean;
}) {
  const [replyText, setReplyText] = useState('');
  const senderDisplay = message.sender_name || 'Anonymous';

  const handleSubmit = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-blush-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600">
                {getInitials(senderDisplay)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-deep">{senderDisplay}</h3>
              <p className="text-sm text-warm-gray">{message.sender_email}</p>
            </div>
          </div>
          <TypeBadge type={message.type} />
        </div>

        {message.product_name && (
          <div className="flex items-center gap-2 mb-3">
            <Icon name="package" className="w-4 h-4 text-warm-gray" />
            <span className="text-sm text-warm-gray">Re: {message.product_name}</span>
          </div>
        )}

        <h2 className="font-serif text-xl font-semibold text-deep mb-2">{message.subject}</h2>
        <p className="text-xs text-warm-gray">{formatFullDate(message.created_at)}</p>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-deep">
          <p className="whitespace-pre-wrap">{message.body}</p>
        </div>
      </div>

      {/* Reply Box */}
      <div className="p-6 border-t border-blush-200 bg-cream/50">
        {replySent ? (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Icon name="check" className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Reply sent successfully</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="reply" className="w-4 h-4 text-warm-gray" />
              <span className="text-sm font-medium text-deep">Reply</span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none mb-3"
            />
            <button
              onClick={handleSubmit}
              disabled={!replyText.trim() || isReplying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="send" className="w-4 h-4" />
              {isReplying ? 'Sending...' : 'Send Reply'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  if (isFiltered) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-gray/10 flex items-center justify-center">
            <Icon name="inbox" className="w-8 h-8 text-warm-gray" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-deep mb-2">
            No messages match this filter
          </h3>
          <p className="text-sm text-warm-gray">
            Try adjusting your filters to see more messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center">
          <Icon name="inbox" className="w-8 h-8 text-primary-500" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-deep mb-2">No messages yet</h3>
        <p className="text-sm text-warm-gray max-w-sm">
          Your audience messages will appear here once customers start interacting with your products.
        </p>
      </div>
    </div>
  );
}

// No Selection State
function NoSelectionState() {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-cream/30">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blush-100 flex items-center justify-center">
          <Icon name="inbox" className="w-8 h-8 text-warm-gray" />
        </div>
        <h3 className="font-medium text-deep mb-1">Select a message</h3>
        <p className="text-sm text-warm-gray">
          Choose a message from the list to view details
        </p>
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="divide-y divide-blush-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blush-200 mt-1.5" />
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-blush-200 rounded w-32" />
                <div className="h-3 bg-blush-100 rounded w-16" />
              </div>
              <div className="h-4 bg-blush-100 rounded w-48 mb-2" />
              <div className="h-5 bg-blush-100 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error State
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <Icon name="inbox" className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-medium text-red-800 mb-2">Failed to load messages</h3>
        <p className="text-sm text-red-600 mb-4">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          <Icon name="refresh" className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

// Sidebar Component
function CreatorSidebar({
  isOpen,
  onClose,
  activeItem = 'audience',
}: {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-deep/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-blush-200 z-50
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
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

        <div className="px-4 py-3 border-b border-blush-200">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            Creator Platform
          </span>
        </div>

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
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-warm-gray hover:text-deep transition-colors"
      >
        <Icon name="menu" />
      </button>

      <div className="hidden lg:block">
        <h1 className="font-serif text-xl font-semibold text-deep">Audience Inbox</h1>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="#"
          className="hidden sm:flex items-center gap-1.5 text-sm text-warm-gray hover:text-primary-500 transition-colors"
        >
          View public profile
          <Icon name="external" className="w-4 h-4" />
        </a>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-deep">{creator.display_name}</p>
            <p className="text-xs text-warm-gray">{creator.email}</p>
          </div>

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

// Main Page Component
export default function CreatorAudiencePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [isReplying, setIsReplying] = useState(false);
  const [replySent, setReplySent] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/audience/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (typeFilter !== 'all' && msg.type !== typeFilter) return false;
      if (readFilter === 'unread' && msg.read) return false;
      if (readFilter === 'read' && !msg.read) return false;
      return true;
    });
  }, [messages, typeFilter, readFilter]);

  // Get selected message
  const selectedMessage = useMemo(() => {
    return messages.find((msg) => msg.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  // Unread count
  const unreadCount = useMemo(() => {
    return messages.filter((msg) => !msg.read).length;
  }, [messages]);

  // Handle message selection
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessageId(message.id);
    setReplySent(false);

    if (!message.read) {
      // Mark as read
      try {
        await fetch('/api/creator/audience/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: message.id }),
        });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, read: true } : msg
          )
        );
      } catch (err) {
        console.error('Failed to mark message as read');
      }
    }
  };

  // Handle reply
  const handleReply = async (replyMessage: string) => {
    if (!selectedMessageId) return;

    setIsReplying(true);

    try {
      const response = await fetch('/api/creator/audience/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessageId,
          message: replyMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      setReplySent(true);
    } catch (err) {
      console.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const isFiltered = typeFilter !== 'all' || readFilter !== 'all';

  return (
    <div className="min-h-screen bg-cream flex">
      <CreatorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="audience"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <CreatorHeader
          creator={creator}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page header */}
          <div className="p-4 lg:p-6 border-b border-blush-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-deep mb-1 lg:hidden">
                  Audience Inbox
                </h2>
                <p className="text-warm-gray text-sm">
                  View and respond to messages from your customers.
                  {unreadCount > 0 && (
                    <span className="ml-2 text-primary-500 font-medium">
                      {unreadCount} unread
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-gray">Type:</span>
                <div className="flex gap-1">
                  {TYPE_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setTypeFilter(filter.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${
                          typeFilter === filter.value
                            ? 'bg-primary-500 text-white'
                            : 'bg-blush-100 text-warm-gray hover:bg-blush-200'
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-gray">Status:</span>
                <div className="flex gap-1">
                  {READ_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setReadFilter(filter.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${
                          readFilter === filter.value
                            ? 'bg-primary-500 text-white'
                            : 'bg-blush-100 text-warm-gray hover:bg-blush-200'
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Message list (left) */}
            <div className="w-full lg:w-96 border-r border-blush-200 bg-white flex flex-col overflow-hidden">
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <ErrorState onRetry={fetchMessages} />
              ) : messages.length === 0 ? (
                <EmptyState isFiltered={false} />
              ) : filteredMessages.length === 0 ? (
                <EmptyState isFiltered={true} />
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <MessageRow
                      key={message.id}
                      message={message}
                      isSelected={selectedMessageId === message.id}
                      onClick={() => handleSelectMessage(message)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Message detail (right) */}
            <div className="hidden lg:flex flex-1 flex-col bg-white overflow-hidden">
              {selectedMessage ? (
                <MessageDetail
                  message={selectedMessage}
                  onReply={handleReply}
                  isReplying={isReplying}
                  replySent={replySent}
                />
              ) : (
                <NoSelectionState />
              )}
            </div>
          </div>

          {/* Mobile message detail modal */}
          {selectedMessage && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
              <div className="h-14 flex items-center px-4 border-b border-blush-200">
                <button
                  onClick={() => setSelectedMessageId(null)}
                  className="p-2 -ml-2 text-warm-gray hover:text-deep transition-colors"
                >
                  <Icon name="close" />
                </button>
                <span className="ml-2 font-medium text-deep">Message</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessageDetail
                  message={selectedMessage}
                  onReply={handleReply}
                  isReplying={isReplying}
                  replySent={replySent}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

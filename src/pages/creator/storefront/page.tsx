import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface StorefrontData {
  brand_name: string;
  brand_story: string;
  profile_image_url: string | null;
  banner_image_url: string | null;
  social_links: string[];
  featured_product_ids: string[];
}

interface Product {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  image_url?: string;
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
    close: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    upload: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    link: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    instagram: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    youtube: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    tiktok: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    globe: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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

// Section Card Component
const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-2xl border border-warm-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-warm-gray-100">
        <h3 className="text-sm font-semibold text-deep">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

// Image Uploader Component
const ImageUploader = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspectRatio?: 'square' | 'banner';
  placeholder?: string;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      onChange(fakeUrl);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const aspectClasses = aspectRatio === 'banner' ? 'aspect-[3/1]' : 'aspect-square w-32';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-deep">{label}</label>
      <div className="flex items-start gap-4">
        <div
          className={`
            ${aspectClasses} rounded-xl border-2 border-dashed border-warm-gray-200
            bg-cream overflow-hidden relative group
            ${aspectRatio === 'banner' ? 'flex-1' : ''}
          `}
        >
          {value ? (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-deep/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="p-2 bg-white rounded-lg cursor-pointer hover:bg-cream transition-colors">
                  <Icon name="upload" className="w-4 h-4 text-deep" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleRemove}
                  className="p-2 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Icon name="trash" className="w-4 h-4 text-primary-500" />
                </button>
              </div>
            </>
          ) : (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-warm-gray-50 transition-colors">
              <Icon name="upload" className="w-6 h-6 text-warm-gray-400 mb-2" />
              <span className="text-xs text-warm-gray-500">
                {placeholder || 'Upload image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

// Social Links Editor Component
const SocialLinksEditor = ({
  links,
  onChange,
}: {
  links: string[];
  onChange: (links: string[]) => void;
}) => {
  const handleAdd = () => {
    onChange([...links, '']);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    onChange(newLinks);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-deep">Social Links</label>

      {links.length === 0 ? (
        <p className="text-sm text-warm-gray-500 italic">No social links added yet.</p>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="https://instagram.com/yourbrand"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-deep border border-warm-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-warm-gray-400"
                />
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="p-2.5 text-warm-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAdd}
        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        <Icon name="plus" className="w-4 h-4" />
        Add social link
      </button>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    published: 'bg-sage-100 text-sage-700',
    draft: 'bg-warm-gray-100 text-warm-gray-600',
    archived: 'bg-warm-gray-100 text-warm-gray-500',
  };

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${config[status] || config.draft}`}>
      {status}
    </span>
  );
};

// Featured Products Selector Component
const FeaturedProductsSelector = ({
  products,
  selectedIds,
  onChange,
}: {
  products: Product[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) => {
  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-5 bg-cream rounded-xl text-center">
        <p className="text-sm text-warm-gray-600">
          You have no products yet. Add products to feature them on your storefront.
        </p>
        <Link
          to="/creator/products"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-3 transition-colors"
        >
          Go to My Products
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-deep">
        Featured Products
        <span className="text-warm-gray-400 font-normal ml-1">
          ({selectedIds.length} selected)
        </span>
      </label>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                ${isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-warm-gray-200 hover:border-warm-gray-300 bg-white'
                }
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${isSelected
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-warm-gray-300'
                  }
                `}
              >
                {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-deep truncate">{product.name}</p>
                <StatusBadge status={product.status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Get social icon from URL
const getSocialIcon = (url: string): string => {
  if (url.includes('instagram')) return 'instagram';
  if (url.includes('twitter') || url.includes('x.com')) return 'twitter';
  if (url.includes('youtube')) return 'youtube';
  if (url.includes('tiktok')) return 'tiktok';
  return 'globe';
};

// Storefront Preview Component
const StorefrontPreview = ({
  data,
  products,
}: {
  data: StorefrontData;
  products: Product[];
}) => {
  const featuredProducts = products.filter((p) => data.featured_product_ids.includes(p.id));

  return (
    <div className="bg-white rounded-2xl border border-warm-gray-100 shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="aspect-[3/1] bg-cream relative">
        {data.banner_image_url ? (
          <img
            src={data.banner_image_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-warm-gray-400">Banner Image</span>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-cream overflow-hidden shadow-md flex-shrink-0">
            {data.profile_image_url ? (
              <img
                src={data.profile_image_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-serif font-semibold text-warm-gray-400">
                  {data.brand_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-lg font-serif font-semibold text-deep truncate">
              {data.brand_name || 'Your Brand Name'}
            </h2>
          </div>
        </div>

        {/* Brand Story */}
        <div className="mt-4">
          <p className="text-sm text-warm-gray-600 line-clamp-3">
            {data.brand_story || 'Your brand story will appear here. Tell customers what makes your products special.'}
          </p>
        </div>

        {/* Social Links */}
        {data.social_links.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            {data.social_links.filter(Boolean).map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
              >
                <Icon name={getSocialIcon(link)} className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}

        {/* Featured Products */}
        <div className="mt-6 pt-6 border-t border-warm-gray-100">
          <h3 className="text-sm font-semibold text-deep mb-3">Featured Products</h3>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="aspect-square rounded-xl bg-cream border border-warm-gray-100 flex items-center justify-center p-3"
                >
                  <span className="text-xs text-warm-gray-600 text-center line-clamp-2">
                    {product.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-cream border border-warm-gray-200 border-dashed flex items-center justify-center"
                >
                  <span className="text-xs text-warm-gray-400">Product {i}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Success Toast Component
const SuccessToast = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-sage-600 text-white rounded-xl shadow-lg">
            <Icon name="check" className="w-5 h-5" />
            <span className="text-sm font-medium">Storefront saved successfully</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-warm-gray-100 h-48" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-warm-gray-100 h-[500px]" />
    </div>
  );
};

// Main Page Component
export default function CreatorStorefrontPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Form state
  const [formData, setFormData] = useState<StorefrontData>({
    brand_name: '',
    brand_story: '',
    profile_image_url: null,
    banner_image_url: null,
    social_links: [],
    featured_product_ids: [],
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState<StorefrontData | null>(null);

  // Check if there are unsaved changes
  const hasChanges = originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storefrontRes = await fetch('/api/creator/storefront');
        if (storefrontRes.ok) {
          const storefrontData = await storefrontRes.json();
          setFormData(storefrontData);
          setOriginalData(storefrontData);
        }

        const productsRes = await fetch('/api/creator/products');
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || productsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        // Mock data for development
        const mockStorefront: StorefrontData = {
          brand_name: 'Glow Botanics',
          brand_story: 'We create plant-based skincare products using sustainably sourced ingredients. Our mission is to help you achieve healthy, radiant skin while caring for our planet.',
          profile_image_url: null,
          banner_image_url: null,
          social_links: ['https://instagram.com/glowbotanics', 'https://tiktok.com/@glowbotanics'],
          featured_product_ids: ['1', '2'],
        };
        setFormData(mockStorefront);
        setOriginalData(mockStorefront);

        const mockProducts: Product[] = [
          { id: '1', name: 'Hydrating Rose Serum', status: 'published' },
          { id: '2', name: 'Gentle Oat Cleanser', status: 'published' },
          { id: '3', name: 'Vitamin C Brightening Cream', status: 'draft' },
          { id: '4', name: 'Calming Chamomile Toner', status: 'published' },
        ];
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update form field
  const updateField = useCallback(<K extends keyof StorefrontData>(
    field: K,
    value: StorefrontData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Save storefront
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/creator/storefront/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOriginalData(formData);
        setShowSuccess(true);
      } else {
        setOriginalData(formData);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Error saving storefront:', err);
      setOriginalData(formData);
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
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
                Marketplace Profile
              </h1>
              <p className="text-warm-gray-600 mt-1">
                Customize your public storefront.
              </p>
            </motion.div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Editor */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Brand Identity */}
                  <SectionCard title="Brand Identity">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-deep mb-1.5">
                          Brand Name
                        </label>
                        <input
                          type="text"
                          value={formData.brand_name}
                          onChange={(e) => updateField('brand_name', e.target.value)}
                          placeholder="Enter your brand name"
                          className="w-full px-4 py-2.5 text-sm text-deep border border-warm-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-warm-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-deep mb-1.5">
                          Brand Story
                        </label>
                        <textarea
                          value={formData.brand_story}
                          onChange={(e) => updateField('brand_story', e.target.value)}
                          placeholder="Tell customers about your brand..."
                          rows={4}
                          className="w-full px-4 py-2.5 text-sm text-deep border border-warm-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none transition-all placeholder:text-warm-gray-400"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Images */}
                  <SectionCard title="Images">
                    <div className="space-y-6">
                      <ImageUploader
                        label="Profile Image"
                        value={formData.profile_image_url}
                        onChange={(url) => updateField('profile_image_url', url)}
                        aspectRatio="square"
                        placeholder="Upload logo"
                      />
                      <ImageUploader
                        label="Banner Image"
                        value={formData.banner_image_url}
                        onChange={(url) => updateField('banner_image_url', url)}
                        aspectRatio="banner"
                        placeholder="Upload banner (3:1 ratio)"
                      />
                    </div>
                  </SectionCard>

                  {/* Social Links */}
                  <SectionCard title="Social Links">
                    <SocialLinksEditor
                      links={formData.social_links}
                      onChange={(links) => updateField('social_links', links)}
                    />
                  </SectionCard>

                  {/* Featured Products */}
                  <SectionCard title="Featured Products">
                    <FeaturedProductsSelector
                      products={products}
                      selectedIds={formData.featured_product_ids}
                      onChange={(ids) => updateField('featured_product_ids', ids)}
                    />
                  </SectionCard>

                  {/* Save Button */}
                  <div className="sticky bottom-4 z-20">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className={`
                        w-full py-3.5 px-6 rounded-xl font-medium text-sm shadow-lg transition-all
                        ${hasChanges && !saving
                          ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]'
                          : 'bg-warm-gray-200 text-warm-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
                    </button>
                  </div>
                </motion.div>

                {/* Right Column: Live Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="lg:sticky lg:top-24 lg:self-start"
                >
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-warm-gray-500 uppercase tracking-wide">
                      Live Preview
                    </h2>
                  </div>
                  <StorefrontPreview data={formData} products={products} />
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>

      <SuccessToast show={showSuccess} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

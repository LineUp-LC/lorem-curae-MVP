import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentlyViewed, type RecentlyViewedProduct } from '../../lib/utils/recentlyViewedState';
import { buildSearchIndex, getCategoryFilter, matchesFirstLetter, type SearchResult } from '../../lib/utils/searchIndex';

/**
 * SearchOverlay Component
 *
 * Color Scheme (Lorem Curae):
 * - Primary: #C4704D (coral)
 * - Light: #E8A888 (light coral)
 * - Dark: #8B4D35 (dark coral)
 * - Cream: #FDF8F5 (background)
 * - Deep: #2D2A26 (text)
 * - Sage: #7A8B7A (accents)
 * - Warm Gray: #6B635A (body text)
 */

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentlyViewedFilter, setRecentlyViewedFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Recently viewed products
  const { items: recentlyViewedItems } = useRecentlyViewed();

  const categories = ['All', 'Products', 'Ingredients', 'Pages'];

  // Build search index dynamically from product + ingredient + page data
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  // Derive recently viewed filter options from actual data
  const recentlyViewedFilters = useMemo(() => {
    const categorySet = new Set<string>();
    for (const item of recentlyViewedItems) {
      if (item.category) categorySet.add(item.category.toLowerCase());
    }
    const categoryLabels: Record<string, string> = {
      cleanser: 'Cleanser',
      toner: 'Toner',
      serum: 'Serum',
      essence: 'Essence',
      moisturizer: 'Moisturizer',
      sunscreen: 'SPF',
      treatment: 'Treatment',
      'eye-care': 'Eye',
      'lip-care': 'Lip',
      mask: 'Mask',
      exfoliator: 'Exfoliator',
      oil: 'Oil',
      mist: 'Mist',
      tool: 'Tools',
    };
    return Array.from(categorySet)
      .sort()
      .map(value => ({
        value,
        label: categoryLabels[value] || value.charAt(0).toUpperCase() + value.slice(1),
      }));
  }, [recentlyViewedItems]);

  // Focus input when open, reset state when closed
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setRecentlyViewedFilter(null);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Global escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap — keep Tab within the modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  // Filter search results
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    const categoryFilter = getCategoryFilter(activeCategory);
    const query = searchQuery.toLowerCase();

    const filtered = searchIndex.filter(result => {
      if (!matchesFirstLetter(query, result.title)) return false;
      const matchesQuery =
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === null || result.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });

    setResults(filtered);
    setActiveIndex(-1);
  }, [searchQuery, activeCategory, searchIndex]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    onClose();
    setSearchQuery('');
  };

  const handleQuickLinkClick = (path: string) => {
    navigate(path);
    onClose();
    setSearchQuery('');
  };

  const handleRecentlyViewedClick = (product: RecentlyViewedProduct) => {
    navigate(`/product-detail?id=${product.id}`);
    onClose();
    setSearchQuery('');
  };

  // Filter recently viewed items by category
  const filteredRecentlyViewed = recentlyViewedFilter
    ? recentlyViewedItems.filter(item =>
        item.category?.toLowerCase() === recentlyViewedFilter.toLowerCase()
      )
    : recentlyViewedItems;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          resultRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          resultRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const index = activeIndex >= 0 ? activeIndex : 0;
        handleResultClick(results[index]);
        break;
      }
    }
  }, [results, activeIndex]);

  if (!isOpen) return null;

  // Category badge colors using Lorem Curae palette
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Product':
        return 'bg-[#C4704D]/10 text-[#C4704D]';
      case 'Ingredient':
        return 'bg-[#E8A888]/20 text-[#8B4D35]';
      default:
        return 'bg-[#FDF8F5] text-[#6B635A]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/50 backdrop-blur-sm motion-safe:animate-enter-fade isolate" onClick={onClose}>
      <style>{`
        .lc-search {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
        }
        .lc-search-input::placeholder {
          color: #6B635A;
          opacity: 0.6;
        }
      `}</style>
      <div className="lc-search flex items-start justify-center min-h-screen px-3 sm:px-4 pt-24 pb-6 sm:pb-10">
        <div
          ref={modalRef}
          className="max-w-2xl w-full mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden motion-safe:animate-enter-up will-change-transform border border-[#E8D4CC]/30"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Search Input */}
          <div className="p-4 sm:p-6 border-b border-[#E8D4CC]/30 bg-gradient-to-b from-[#FDF8F5] to-white">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[#C4704D]/10 flex-shrink-0">
                <i className="ri-search-line text-xl sm:text-2xl text-[#C4704D]"></i>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, ingredients, and more..."
                className="lc-search-input flex-1 text-sm sm:text-base outline-none text-[#2D2A26] bg-transparent min-w-0"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                aria-controls="search-results-list"
              />
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[#FDF8F5] transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close search"
              >
                <i className="ri-close-line text-xl sm:text-2xl text-[#6B635A]"></i>
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center space-x-1.5 mt-5 sm:mt-6 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-5 sm:px-7 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-[#C4704D] text-white'
                      : 'bg-[#FDF8F5] text-[#6B635A] hover:bg-[#E8D4CC]/50'
                  }`}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[40vh] sm:max-h-[360px] overflow-y-auto" id="search-results-list" role="listbox">
            {searchQuery.trim() === '' ? (
              <div className="p-6 sm:p-10 flex flex-col items-center justify-center">
                <h3 className="text-sm sm:text-base font-semibold text-[#2D2A26] mb-1" style={{ fontFamily: 'var(--lc-font-serif)' }}>Start Searching</h3>
                <p className="text-xs sm:text-sm text-[#6B635A]">Find products, ingredients, and more</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-[#E8D4CC]/50">
                  <i className="ri-file-search-line text-3xl sm:text-4xl text-[#6B635A]/60"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#2D2A26] mb-2" style={{ fontFamily: 'var(--lc-font-serif)' }}>No Results Found</h3>
                <p className="text-sm sm:text-base text-[#6B635A]">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8D4CC]/30">
                {results.map((result, index) => (
                  <div
                    key={`${result.category}-${result.id}`}
                    ref={el => { resultRefs.current[index] = el; }}
                    id={`search-result-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={() => handleResultClick(result)}
                    className={`p-3 sm:p-4 transition-colors duration-fast cursor-pointer motion-safe:animate-enter-right motion-stagger-fill ${
                      index === activeIndex
                        ? 'bg-[#FDF8F5] outline outline-2 outline-[#C4704D]/30'
                        : 'hover:bg-[#FDF8F5]'
                    }`}
                    style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {result.image ? (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#FDF8F5]">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 rounded-lg bg-[#C4704D]/10">
                          <i className={`text-xl sm:text-2xl text-[#C4704D] ${
                            result.category === 'Page' ? 'ri-file-text-line' :
                            result.category === 'Product' ? 'ri-shopping-bag-line' :
                            'ri-flask-line'
                          }`}></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-[#2D2A26] truncate text-sm sm:text-base">{result.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryBadgeClass(result.category)}`}>
                            {result.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#6B635A] truncate">{result.description}</p>
                      </div>
                      <i className="ri-arrow-right-line text-lg sm:text-xl text-[#C4704D]/50"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section: Recently Viewed */}
          {recentlyViewedItems.length > 0 && (
            <div className="border-t border-[#E8D4CC]/30 bg-[#FDF8F5]/50">
              {/* Header with filters */}
              <div className="px-4 sm:px-6 pt-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <i className="ri-history-line text-sm text-[#C4704D]"></i>
                    <p className="text-xs font-semibold text-[#2D2A26]">
                      Recently Viewed
                    </p>
                  </div>
                  {/* Condensed filter chips with scroll indicator */}
                  {recentlyViewedFilters.length > 0 && (
                    <div className="relative flex-1 min-w-0">
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pr-6">
                        <button
                          onClick={() => setRecentlyViewedFilter(null)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                            recentlyViewedFilter === null
                              ? 'bg-[#C4704D] text-white'
                              : 'text-[#6B635A] hover:bg-[#E8D4CC]/50'
                          }`}
                        >
                          All
                        </button>
                        {recentlyViewedFilters.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setRecentlyViewedFilter(
                              recentlyViewedFilter === filter.value ? null : filter.value
                            )}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                              recentlyViewedFilter === filter.value
                                ? 'bg-[#C4704D] text-white'
                                : 'text-[#6B635A] hover:bg-[#E8D4CC]/50'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      {/* Scroll indicator */}
                      <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
                        <div className="w-6 h-full bg-gradient-to-l from-[#FDF8F5] to-transparent"></div>
                        <i className="ri-arrow-right-s-line text-[#C4704D] text-sm -ml-4"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal scrollable product list */}
              <div className="flex items-stretch gap-3 overflow-x-auto pb-4 px-4 sm:px-6 scrollbar-hide">
                {filteredRecentlyViewed.length > 0 ? (
                  filteredRecentlyViewed.slice(0, 10).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleRecentlyViewedClick(product)}
                      className="flex-shrink-0 w-28 bg-white rounded-lg p-2 border border-[#E8D4CC]/50 hover:border-[#C4704D]/50 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-full h-20 rounded-md overflow-hidden bg-[#FDF8F5] mb-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-shopping-bag-line text-xl text-[#C4704D]/30"></i>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-[#C4704D] uppercase tracking-wide truncate">
                        {product.brand}
                      </p>
                      <h5 className="text-xs font-medium text-[#2D2A26] truncate leading-tight">
                        {product.name}
                      </h5>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#6B635A] py-2">
                    No products in this category
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;

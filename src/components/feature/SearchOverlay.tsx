import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface SearchResult {
  id: number;
  title: string;
  category: 'Product' | 'Service' | 'Ingredient' | 'Business' | 'Page';
  description: string;
  image?: string;
  link: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (productId: number) => void;
}

const SearchOverlay = ({ isOpen, onClose, onProductClick }: SearchOverlayProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Products', 'Services', 'Ingredients', 'Businesses', 'Pages'];

  const allResults: SearchResult[] = [
    {
      id: 1,
      title: 'Vitamin C Serum',
      category: 'Product',
      description: 'Brightening serum with 15% L-Ascorbic Acid',
      image: 'https://readdy.ai/api/search-image?query=luxury%20vitamin%20c%20serum%20bottle%20with%20dropper%20on%20clean%20white%20background%20minimalist%20product%20photography%20bright%20lighting&width=80&height=80&seq=1&orientation=squarish',
      link: '/product-detail?id=1'
    },
    {
      id: 2,
      title: 'Hydrating Facial',
      category: 'Service',
      description: 'Deep hydration treatment for dry skin',
      image: 'https://readdy.ai/api/search-image?query=spa%20facial%20treatment%20room%20with%20soft%20lighting%20and%20skincare%20products%20professional%20aesthetic%20clean%20environment&width=80&height=80&seq=2&orientation=squarish',
      link: '/services/1'
    },
    {
      id: 3,
      title: 'Niacinamide',
      category: 'Ingredient',
      description: 'Vitamin B3 for pore refinement and brightening',
      image: 'https://readdy.ai/api/search-image?query=niacinamide%20molecule%20scientific%20illustration%20on%20white%20background%20clean%20minimal%20design%20chemistry%20aesthetic&width=80&height=80&seq=3&orientation=squarish',
      link: '/ingredient-patch-test?ingredient=niacinamide'
    },
    {
      id: 4,
      title: 'Retinol Night Cream',
      category: 'Product',
      description: 'Anti-aging cream with 0.5% retinol',
      image: 'https://readdy.ai/api/search-image?query=luxury%20night%20cream%20jar%20elegant%20packaging%20on%20white%20background%20premium%20skincare%20product%20photography%20soft%20lighting&width=80&height=80&seq=4&orientation=squarish',
      link: '/product-detail?id=2'
    },
    {
      id: 5,
      title: 'Glow Spa & Wellness',
      category: 'Business',
      description: 'Premium skincare clinic specializing in facials',
      image: 'https://readdy.ai/api/search-image?query=modern%20spa%20reception%20area%20with%20plants%20and%20natural%20light%20clean%20aesthetic%20professional%20wellness%20center%20interior&width=80&height=80&seq=5&orientation=squarish',
      link: '/services/1'
    },
    {
      id: 6,
      title: 'Hyaluronic Acid',
      category: 'Ingredient',
      description: 'Powerful humectant for intense hydration',
      image: 'https://readdy.ai/api/search-image?query=hyaluronic%20acid%20molecule%20water%20droplets%20scientific%20illustration%20clean%20white%20background%20chemistry%20aesthetic&width=80&height=80&seq=6&orientation=squarish',
      link: '/ingredient-patch-test?ingredient=hyaluronic-acid'
    },
    {
      id: 7,
      title: 'Chemical Peel Treatment',
      category: 'Service',
      description: 'Professional exfoliation for skin renewal',
      image: 'https://readdy.ai/api/search-image?query=professional%20skincare%20treatment%20room%20with%20equipment%20clean%20aesthetic%20spa%20environment%20soft%20lighting&width=80&height=80&seq=7&orientation=squarish',
      link: '/services/2'
    },
    {
      id: 8,
      title: 'Gentle Cleanser',
      category: 'Product',
      description: 'pH-balanced cleanser for sensitive skin',
      image: 'https://readdy.ai/api/search-image?query=gentle%20facial%20cleanser%20bottle%20on%20white%20background%20minimalist%20product%20photography%20clean%20aesthetic%20soft%20lighting&width=80&height=80&seq=8&orientation=squarish',
      link: '/product-detail?id=3'
    },
    {
      id: 9,
      title: 'Skin Quiz',
      category: 'Page',
      description: 'Discover your perfect skincare routine',
      link: '/discover'
    },
    {
      id: 10,
      title: 'Ingredient Library',
      category: 'Page',
      description: 'Explore skincare ingredients and their benefits',
      link: '/ingredients'
    },
    {
      id: 11,
      title: 'Pure Botanicals',
      category: 'Business',
      description: 'Natural and organic skincare storefront',
      image: 'https://readdy.ai/api/search-image?query=natural%20botanical%20skincare%20products%20display%20with%20plants%20clean%20aesthetic%20organic%20beauty%20store%20interior&width=80&height=80&seq=11&orientation=squarish',
      link: '/storefront/1'
    },
    {
      id: 12,
      title: 'Salicylic Acid',
      category: 'Ingredient',
      description: 'BHA for acne treatment and pore cleansing',
      image: 'https://readdy.ai/api/search-image?query=salicylic%20acid%20molecule%20scientific%20illustration%20on%20white%20background%20clean%20minimal%20chemistry%20aesthetic&width=80&height=80&seq=12&orientation=squarish',
      link: '/ingredient-patch-test?ingredient=salicylic-acid'
    }
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = allResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || 
                             result.category === activeCategory.slice(0, -1) ||
                             (activeCategory === 'Businesses' && result.category === 'Business');
      return matchesQuery && matchesCategory;
    });

    setResults(filtered);
  }, [searchQuery, activeCategory]);

  const handleResultClick = (result: SearchResult) => {
    if (result.category === 'Product' && onProductClick) {
      onProductClick(result.id);
    } else {
      navigate(result.link);
    }
    onClose();
    setSearchQuery('');
  };

  const handleQuickLinkClick = (path: string) => {
    navigate(path);
    onClose();
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Category badge colors using Lorem Curae palette
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Product':
        return 'bg-[#C4704D]/10 text-[#C4704D]';
      case 'Service':
        return 'bg-[#7A8B7A]/10 text-[#7A8B7A]';
      case 'Ingredient':
        return 'bg-[#E8A888]/20 text-[#8B4D35]';
      case 'Business':
        return 'bg-[#E8D4CC] text-[#6B635A]';
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
      <div className="lc-search min-h-screen px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-10">
        <div 
          className="max-w-3xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden motion-safe:animate-enter-up will-change-transform border border-[#E8D4CC]/30"
          onClick={(e) => e.stopPropagation()}
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
                placeholder="Search products, services..."
                className="lc-search-input flex-1 text-base sm:text-lg outline-none text-[#2D2A26] bg-transparent min-w-0"
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
            <div className="flex items-center space-x-2 mt-3 sm:mt-4 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-[#C4704D] text-white'
                      : 'bg-[#FDF8F5] text-[#6B635A] hover:bg-[#E8D4CC]/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[50vh] sm:max-h-[500px] overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-[#C4704D]/10">
                  <i className="ri-search-2-line text-3xl sm:text-4xl text-[#C4704D]/60"></i>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#2D2A26] mb-2" style={{ fontFamily: 'var(--lc-font-serif)' }}>Start Searching</h3>
                <p className="text-sm sm:text-base text-[#6B635A]">Find products, services, ingredients, and more</p>
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
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 sm:p-4 hover:bg-[#FDF8F5] transition-colors duration-fast cursor-pointer motion-safe:animate-enter-right motion-stagger-fill"
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
                            result.category === 'Service' ? 'ri-service-line' :
                            result.category === 'Ingredient' ? 'ri-flask-line' :
                            'ri-store-line'
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

          {/* Quick Links */}
          {searchQuery.trim() === '' && (
            <div className="p-4 sm:p-6 bg-[#FDF8F5] border-t border-[#E8D4CC]/30">
              <h4 className="text-xs sm:text-sm font-semibold text-[#6B635A] mb-2 sm:mb-3 uppercase tracking-wider">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLinkClick('/discover')}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg hover:bg-[#C4704D]/5 hover:border-[#C4704D]/20 border border-transparent transition-colors cursor-pointer text-left"
                >
                  <i className="ri-compass-line text-[#C4704D]"></i>
                  <span className="text-xs sm:text-sm font-medium text-[#2D2A26]">Discover</span>
                </button>
                <button
                  onClick={() => handleQuickLinkClick('/ingredients')}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg hover:bg-[#C4704D]/5 hover:border-[#C4704D]/20 border border-transparent transition-colors cursor-pointer text-left"
                >
                  <i className="ri-flask-line text-[#C4704D]"></i>
                  <span className="text-xs sm:text-sm font-medium text-[#2D2A26]">Ingredients</span>
                </button>
                <button
                  onClick={() => handleQuickLinkClick('/services')}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg hover:bg-[#C4704D]/5 hover:border-[#C4704D]/20 border border-transparent transition-colors cursor-pointer text-left"
                >
                  <i className="ri-service-line text-[#C4704D]"></i>
                  <span className="text-xs sm:text-sm font-medium text-[#2D2A26]">Services</span>
                </button>
                <button
                  onClick={() => handleQuickLinkClick('/marketplace')}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg hover:bg-[#C4704D]/5 hover:border-[#C4704D]/20 border border-transparent transition-colors cursor-pointer text-left"
                >
                  <i className="ri-store-line text-[#C4704D]"></i>
                  <span className="text-xs sm:text-sm font-medium text-[#2D2A26]">Marketplace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
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

  const handleResultClick = (link: string) => {
    navigate(link);
    onClose();
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="min-h-screen px-4 pt-20 pb-10">
        <div 
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-sage-100">
                <i className="ri-search-line text-2xl text-sage-700"></i>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, services, ingredients, businesses..."
                className="flex-1 text-lg outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close search"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-sage-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[500px] overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-sage-50">
                  <i className="ri-search-2-line text-4xl text-sage-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Searching</h3>
                <p className="text-gray-600">Find products, services, ingredients, and more</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-gray-100">
                  <i className="ri-file-search-line text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result.link)}
                    className="p-4 hover:bg-sage-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      {result.image ? (
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 rounded-lg bg-sage-100">
                          <i className={`text-2xl text-sage-600 ${
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
                          <h4 className="font-semibold text-gray-900 truncate">{result.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            result.category === 'Product' ? 'bg-blue-100 text-blue-700' :
                            result.category === 'Service' ? 'bg-purple-100 text-purple-700' :
                            result.category === 'Ingredient' ? 'bg-green-100 text-green-700' :
                            result.category === 'Business' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{result.description}</p>
                      </div>
                      <i className="ri-arrow-right-line text-xl text-gray-400"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {searchQuery.trim() === '' && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleResultClick('/discover')}
                  className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-sage-50 transition-colors cursor-pointer text-left"
                >
                  <i className="ri-compass-line text-sage-600"></i>
                  <span className="text-sm font-medium text-gray-800">Skin Quiz</span>
                </button>
                <button
                  onClick={() => handleResultClick('/ingredients')}
                  className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-sage-50 transition-colors cursor-pointer text-left"
                >
                  <i className="ri-flask-line text-sage-600"></i>
                  <span className="text-sm font-medium text-gray-800">Ingredients</span>
                </button>
                <button
                  onClick={() => handleResultClick('/services')}
                  className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-sage-50 transition-colors cursor-pointer text-left"
                >
                  <i className="ri-service-line text-sage-600"></i>
                  <span className="text-sm font-medium text-gray-800">Services</span>
                </button>
                <button
                  onClick={() => handleResultClick('/marketplace')}
                  className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg hover:bg-sage-50 transition-colors cursor-pointer text-left"
                >
                  <i className="ri-store-line text-sage-600"></i>
                  <span className="text-sm font-medium text-gray-800">Marketplace</span>
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

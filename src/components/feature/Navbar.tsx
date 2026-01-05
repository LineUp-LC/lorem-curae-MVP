import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import SearchOverlay from './SearchOverlay';
import { useCartCount } from '../../lib/utils/cartState';

/**
 * Navbar Component
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

// Static data moved outside component to prevent recreation on each render
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Discover', path: '/discover' },
  { name: 'Skin Survey', path: '/skin-survey-account' },
  { name: 'Ingredients', path: '/ingredients' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Nutrire', path: '/community' },
  { name: 'About', path: '/about' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const cartCount = useCartCount();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Close mobile menu and profile dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isHomePage = location.pathname === '/';

  return (
    <>
      <style>{`
        .lc-nav {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
        }
        .lc-nav-scrolled {
          background: rgba(253, 248, 245, 0.95) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(196, 112, 77, 0.1);
        }
        .lc-nav-link {
          color: #6B635A !important;
          font-weight: 500;
          transition: color 0.3s ease;
          position: relative;
        }
        .lc-nav-link:hover {
          color: #C4704D !important;
        }
        .lc-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #C4704D;
          transition: width 0.3s ease;
        }
        .lc-nav-link:hover::after {
          width: 100%;
        }
        .lc-logo {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif) !important;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #2D2A26;
        }
        .lc-mobile-link {
          color: #2D2A26;
          transition: all 0.2s ease;
        }
        .lc-mobile-link:hover {
          background: rgba(196, 112, 77, 0.08);
          color: #C4704D;
        }
      `}</style>
      <nav
        className={`lc-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || showMobileMenu ? 'lc-nav-scrolled shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                isScrolled || !isHomePage || showMobileMenu 
                  ? 'text-[#2D2A26] hover:bg-[#C4704D]/10' 
                  : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle menu"
            >
              <i className={`${showMobileMenu ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center cursor-pointer">
              <span className={`lc-logo text-3xl transition-colors ${
                isScrolled || !isHomePage || showMobileMenu ? 'text-[#2D2A26]' : 'text-white'
              }`}>
                Lorem Curae
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className="lc-nav-link transition-colors cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isScrolled || !isHomePage || showMobileMenu 
                    ? 'text-[#2D2A26] hover:bg-[#C4704D]/10' 
                    : 'text-white hover:bg-white/20'
                }`}
                aria-label="Search"
              >
                <i className="ri-search-line text-xl"></i>
              </button>

              {/* Cart Button */}
              <Link
                to="/cart"
                className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isScrolled || !isHomePage || showMobileMenu
                    ? 'text-[#2D2A26] hover:bg-[#C4704D]/10'
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Shopping Cart"
              >
                <i className="ri-shopping-cart-line text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C4704D] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all cursor-pointer ${
                    isScrolled || !isHomePage || showMobileMenu 
                      ? 'ring-[#E8A888]/50 hover:ring-[#C4704D]' 
                      : 'ring-white/30 hover:ring-white/50'
                  }`}
                  aria-label="Profile"
                >
                  <img 
                    src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=navbar-avatar&orientation=squarish"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>
                <ProfileDropdown 
                  isOpen={showProfileDropdown} 
                  onClose={() => setShowProfileDropdown(false)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t border-[#E8D4CC]/30 motion-safe:animate-enter-down">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="lc-mobile-link block px-4 py-3 rounded-lg font-medium transition-colors duration-fast cursor-pointer motion-safe:animate-enter-right motion-stagger-fill"
                  style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
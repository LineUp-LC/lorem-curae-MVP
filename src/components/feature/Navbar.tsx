import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import SearchOverlay from './SearchOverlay';
import { useCartCount } from '../../lib/utils/cartState';

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'Skin Survey', path: '/skin-survey-account' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Community', path: '/community' },
    { name: 'About', path: '/about' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || showMobileMenu ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                isScrolled || !isHomePage || showMobileMenu ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle menu"
            >
              <i className={`${showMobileMenu ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <span className={`text-lg sm:text-xl font-semibold tracking-wide transition-colors ${
                isScrolled || !isHomePage || showMobileMenu ? 'text-black' : 'text-white'
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
                  className="text-forest-800 hover:text-sage-600 font-medium transition-colors cursor-pointer"
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
                  isScrolled || !isHomePage || showMobileMenu ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/20'
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
                    ? 'text-black hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Shopping Cart"
              >
                <i className="ri-shopping-cart-line text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all cursor-pointer ${
                    isScrolled || !isHomePage || showMobileMenu ? 'ring-sage-200 hover:ring-sage-400' : 'ring-white/30 hover:ring-white/50'
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
          <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-4 py-3 text-forest-800 hover:bg-sage-50 hover:text-sage-600 rounded-lg font-medium transition-colors cursor-pointer animate-slide-in-right"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
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
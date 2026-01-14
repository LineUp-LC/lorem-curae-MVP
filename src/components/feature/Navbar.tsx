// =====================================================
// FILE: src/components/feature/Navbar.tsx
// LOCATION: Replace your existing Navbar.tsx file
// =====================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import SearchOverlay from './SearchOverlay';
import { useCartCount } from '../../lib/utils/cartState';

/**
 * Navbar Component - MOBILE OPTIMIZED
 *
 * Mobile Fixes Applied:
 * - Fixed height container (64px mobile, 80px desktop)
 * - iOS safe area support (env(safe-area-inset-top))
 * - 44px minimum tap targets for accessibility
 * - Body scroll lock when mobile menu is open
 * - Full-screen mobile menu overlay
 * - Logo won't wrap on small screens
 *
 * Visual behavior:
 * - Before scroll: Transparent background, white icons/logo
 * - After scroll: Cream background, dark icons/logo
 */

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  // Use light (white) text/icons when not scrolled and mobile menu is closed
  // On scroll or mobile menu open, switch to dark text with cream background
  const useLightText = !isScrolled && !showMobileMenu;

  return (
    <>
      <style>{`
        /* ===== NAVBAR MOBILE FIXES ===== */
        .lc-nav {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
        }
        
        /* Fixed header container with stable height and safe area */
        .lc-nav-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding-top: env(safe-area-inset-top, 0px);
          transition: all 0.3s ease;
        }
        
        /* Inner header with fixed height to prevent layout shift */
        .lc-nav-inner {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
        }
        
        @media (min-width: 640px) {
          .lc-nav-inner {
            height: 80px;
            padding: 0 1.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .lc-nav-inner {
            padding: 0 3rem;
          }
        }
        
        .lc-nav-scrolled {
          background: rgba(253, 248, 245, 0.95) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(196, 112, 77, 0.1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .lc-nav-link {
          color: #6B635A !important;
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.125rem;
          font-weight: 500;
          transition: color 0.3s ease;
          position: relative;
          white-space: nowrap;
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
        
        /* Logo - prevent wrapping, responsive size */
        .lc-logo {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif) !important;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #2D2A26;
          white-space: nowrap;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        @media (min-width: 640px) {
          .lc-logo {
            font-size: 1.875rem;
          }
        }
        
        /* Mobile menu - full screen overlay below header */
        .lc-mobile-menu {
          position: fixed;
          top: calc(64px + env(safe-area-inset-top, 0px));
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          z-index: 40;
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        /* Mobile links with proper tap targets */
        .lc-mobile-link {
          color: #2D2A26;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
          font-weight: 500;
          border-radius: 0.5rem;
          min-height: 48px;
        }
        
        .lc-mobile-link:hover,
        .lc-mobile-link:active {
          background: rgba(196, 112, 77, 0.08);
          color: #C4704D;
        }
        
        /* Icon buttons - 44px minimum tap target */
        .lc-nav-icon-btn {
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        
        /* Right side icons container */
        .lc-nav-icons {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        @media (min-width: 640px) {
          .lc-nav-icons {
            gap: 0.5rem;
          }
        }

        /* Ensure desktop nav visibility at lg breakpoint */
        @media (min-width: 1024px) {
          .lc-mobile-btn { display: none !important; }
          .lc-desktop-nav { display: flex !important; }
          .lc-mobile-menu { display: none !important; }
        }
      `}</style>
      
      {/* Fixed header container with safe area */}
      <header
        className={`lc-nav-container ${
          useLightText ? 'bg-transparent' : 'lc-nav-scrolled'
        }`}
      >
        <div className="lc-nav-inner">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`lc-nav-icon-btn lc-mobile-btn lg:hidden ${
              useLightText
                ? 'text-white hover:bg-white/20'
                : 'text-[#2D2A26] hover:bg-[#C4704D]/10'
            }`}
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={showMobileMenu}
          >
            <i className={`${showMobileMenu ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={`lc-logo transition-colors ${
              useLightText ? 'text-white' : 'text-[#2D2A26]'
            }`}>
              Lorem Curae
            </span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex lc-desktop-nav items-center space-x-10" role="navigation">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="lc-nav-link"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="lc-nav-icons">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lc-nav-icon-btn text-[#2D2A26] hover:bg-[#C4704D]/10"
              aria-label="Search"
            >
              <i className="ri-search-line text-xl"></i>
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="lc-nav-icon-btn relative text-[#2D2A26] hover:bg-[#C4704D]/10"
              aria-label={`Shopping Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <i className="ri-shopping-cart-line text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C4704D] text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Profile Button */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="lc-nav-icon-btn overflow-hidden ring-2 ring-[#E8A888]/50 hover:ring-[#C4704D]"
                aria-label="Profile menu"
                aria-expanded={showProfileDropdown}
              >
                <img 
                  src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=navbar-avatar&orientation=squarish"
                  alt=""
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </button>
              <ProfileDropdown 
                isOpen={showProfileDropdown} 
                onClose={() => setShowProfileDropdown(false)} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full screen overlay */}
      {showMobileMenu && (
        <nav className="lc-mobile-menu lg:hidden" role="navigation" aria-label="Mobile navigation">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className="lc-mobile-link motion-safe:animate-enter-right"
                style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
                onClick={() => setShowMobileMenu(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
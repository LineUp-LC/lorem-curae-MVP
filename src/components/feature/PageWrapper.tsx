import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PageWrapper Component
 * 
 * Provides consistent Lorem Curae styling across all pages.
 * 
 * MOBILE FIXES APPLIED:
 * - Responsive header offset (64px mobile, 80px desktop)
 * - iOS safe area support via env(safe-area-inset-top)
 * - Dynamic viewport height (100dvh) for mobile browsers
 * 
 * Color Scheme:
 * - Primary: #C4704D (coral)
 * - Light: #E8A888 (light coral)
 * - Dark: #8B4D35 (dark coral)
 * - Cream: #FDF8F5 (background)
 * - Deep: #2D2A26 (text)
 * - Sage: #7A8B7A (accents)
 * - Warm Gray: #6B635A (body text)
 * - Blush: #E8D4CC (subtle accents)
 */

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`lc-page-wrapper ${className}`}>
      <style>{`
        .lc-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(180deg, #FDF8F5 0%, #FFF9F5 50%, #FFFBF8 100%);
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          color: #2D2A26;
        }
        
        .lc-page-wrapper h1,
        .lc-page-wrapper h2,
        .lc-page-wrapper h3,
        .lc-page-wrapper h4 {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          color: #2D2A26;
        }
        
        /* FIXED: Mobile-first with safe area support */
        .lc-page-content {
          padding-top: calc(64px + env(safe-area-inset-top, 0px));
          min-height: 100vh;
          min-height: 100dvh;
        }
        
        @media (min-width: 640px) {
          .lc-page-content {
            padding-top: calc(80px + env(safe-area-inset-top, 0px));
          }
        }
        
        /* Sage overrides */
        .lc-page-wrapper .bg-taupe-50 { background-color: rgba(122, 139, 122, 0.08) !important; }
        .lc-page-wrapper .bg-taupe-100 { background-color: rgba(122, 139, 122, 0.12) !important; }
        .lc-page-wrapper .bg-taupe-500 { background-color: #7A8B7A !important; }
        .lc-page-wrapper .bg-taupe { background-color: #6A7B6A !important; }
        .lc-page-wrapper .text-taupe { color: #7A8B7A !important; }
        .lc-page-wrapper .text-taupe-700 { color: #6A7B6A !important; }
        .lc-page-wrapper .border-taupe-200 { border-color: rgba(122, 139, 122, 0.2) !important; }
        .lc-page-wrapper .hover\\:bg-taupe-50:hover { background-color: rgba(122, 139, 122, 0.08) !important; }
        .lc-page-wrapper .hover\\:bg-taupe-700:hover { background-color: #5A6B5A !important; }
        
        /* Coral overrides */
        .lc-page-wrapper .bg-primary-50 { background-color: rgba(196, 112, 77, 0.06) !important; }
        .lc-page-wrapper .bg-primary-100 { background-color: rgba(196, 112, 77, 0.1) !important; }
        .lc-page-wrapper .bg-primary-500 { background-color: #C4704D !important; }
        .lc-page-wrapper .bg-primary-600 { background-color: #8B4D35 !important; }
        .lc-page-wrapper .text-primary-500 { color: #C4704D !important; }
        .lc-page-wrapper .text-primary-600 { color: #8B4D35 !important; }
        .lc-page-wrapper .border-primary-200 { border-color: rgba(196, 112, 77, 0.2) !important; }
        
        /* Forest/Deep overrides */
        .lc-page-wrapper .bg-deep-900 { background-color: #2D2A26 !important; }
        .lc-page-wrapper .text-deep { color: #3D3A36 !important; }
        .lc-page-wrapper .text-deep-900 { color: #2D2A26 !important; }
        
        /* Cream overrides */
        .lc-page-wrapper .bg-cream-50 { background-color: #FFFBF8 !important; }
        .lc-page-wrapper .bg-cream-100 { background-color: #FDF8F5 !important; }
        
        /* Focus states */
        .lc-page-wrapper .focus\\:ring-taupe-500:focus { --tw-ring-color: #7A8B7A !important; }
        .lc-page-wrapper .focus\\:ring-primary-500:focus { --tw-ring-color: #C4704D !important; }
      `}</style>
      <Navbar />
      <div className="lc-page-content">
        {children}
      </div>
      <Footer />
    </div>
  );
}
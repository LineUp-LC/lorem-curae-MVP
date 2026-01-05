import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  staggerContainer,
  staggerItem,
  viewportOnce,
  EASING,
  TIMING,
} from '../../lib/motion/motionVariants';

/**
 * Footer Component
 * 
 * Motion design:
 * - Micro-value statement: soft fade + lift
 * - Links: underline slide-in on hover
 * - Logo: gentle opacity pulse
 * - Columns: staggered fade-in
 */

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

const linkHover = {
  x: 3,
  color: '#E8A888',
  transition: { duration: 0.2 },
};

export default function Footer() {
  return (
    <footer className="lc-footer">
      <style>{`
        .lc-footer {
          background: #2D2A26;
          color: white;
          padding: 4rem 2rem 2rem;
        }
        
        .lc-footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }
        
        .lc-footer-brand {
          max-width: 280px;
        }
        
        .lc-footer-logo {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.75rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
          display: block;
        }
        
        .lc-footer-tagline {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        
        .lc-social-icons {
          display: flex;
          gap: 0.75rem;
        }
        
        .lc-social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .lc-social-icon:hover {
          background: #C4704D;
          transform: scale(1.1);
        }
        
        .lc-footer-column h4 {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 1.25rem;
        }
        
        .lc-footer-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .lc-footer-column li {
          margin-bottom: 0.75rem;
        }
        
        .lc-footer-link {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          display: inline-block;
          position: relative;
        }
        
        /* Underline slide-in effect */
        .lc-footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #C4704D;
          transition: width 0.3s ease;
        }
        
        .lc-footer-link:hover::after {
          width: 100%;
        }
        
        .lc-footer-newsletter {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .lc-footer-input {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 0;
          color: white;
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          outline: none;
        }
        
        .lc-footer-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .lc-footer-input:focus {
          border-color: #C4704D;
        }
        
        .lc-footer-submit {
          background: transparent;
          border: none;
          color: #C4704D;
          cursor: pointer;
          padding: 0.5rem;
          transition: transform 0.3s ease;
        }
        
        .lc-footer-submit:hover {
          transform: translateX(3px);
        }
        
        .lc-footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .lc-footer-badges {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .lc-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .lc-badge svg {
          width: 16px;
          height: 16px;
          opacity: 0.6;
        }
        
        .lc-footer-statement {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .lc-footer {
            padding: 3rem 1.5rem 2rem;
          }
          
          .lc-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          
          .lc-footer-brand {
            grid-column: span 2;
            max-width: 100%;
          }
        }
      `}</style>

      <motion.div
        className="lc-footer-grid"
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Brand Column with logo pulse */}
        <motion.div className="lc-footer-brand" variants={columnVariants}>
          <motion.span 
            className="lc-footer-logo"
            animate={{ 
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Lorem Curae
          </motion.span>
          <p className="lc-footer-tagline">
            Empowering authentic skincare journeys through science-backed personalization, holistic wellness, and collective wisdom.
          </p>
          <div className="lc-social-icons">
            {['Instagram', 'TikTok', 'YouTube'].map((platform, i) => (
              <motion.a 
                key={platform}
                href="#" 
                className="lc-social-icon"
                aria-label={platform}
                whileHover={{ scale: 1.1, backgroundColor: '#C4704D' }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {i === 0 && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>}
                  {i === 1 && <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>}
                  {i === 2 && <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>}
                </svg>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Tools Column */}
        <motion.div className="lc-footer-column" variants={columnVariants}>
          <h4>Tools</h4>
          <ul>
            {['Product Finder', 'AI Guide', 'Product Compare', 'Ingredient Library', 'Routine Tracker'].map((item) => (
              <li key={item}>
                <motion.div whileHover={linkHover}>
                  <Link to="/discover" className="lc-footer-link">{item}</Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Community Column */}
        <motion.div className="lc-footer-column" variants={columnVariants}>
          <h4>Community</h4>
          <ul>
            {['Stories', 'Marketplace', 'Reviews'].map((item) => (
              <li key={item}>
                <motion.div whileHover={linkHover}>
                  <Link to="/community" className="lc-footer-link">{item}</Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Support Column */}
        <motion.div className="lc-footer-column" variants={columnVariants}>
          <h4>Support</h4>
          <ul>
            {['Contact Us', 'FAQ', 'Accessibility'].map((item) => (
              <li key={item}>
                <motion.div whileHover={linkHover}>
                  <Link to="/contact" className="lc-footer-link">{item}</Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Newsletter Column */}
        <motion.div className="lc-footer-column" variants={columnVariants}>
          <h4>Stay Connected</h4>
          <div className="lc-footer-newsletter">
            <input 
              type="email" 
              placeholder="Your email" 
              className="lc-footer-input"
            />
            <motion.button 
              className="lc-footer-submit"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              →
            </motion.button>
          </div>
          <motion.div whileHover={linkHover}>
            <Link to="/privacy" className="lc-footer-link">Privacy Policy</Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer bottom with micro-value statement */}
      <motion.div 
        className="lc-footer-bottom"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: TIMING.slow, ease: EASING.gentle }}
      >
        <div className="lc-footer-badges">
          <span className="lc-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            WCAG 2.1 AA
          </span>
          <span className="lc-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Cruelty-Free
          </span>
          <span className="lc-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Indie Supported
          </span>
        </div>
        <motion.p 
          className="lc-footer-statement"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: TIMING.slow }}
        >
          Built for every skin. Every story. Every journey.
        </motion.p>
      </motion.div>
    </footer>
  );
}
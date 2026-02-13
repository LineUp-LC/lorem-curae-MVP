import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  slideInFromLeft,
  slideInFromRight,
  staggerContainer,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * DifferentiationSection Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 4: Enhanced Lorem Curae description with:
 *   - "Community-reviewed retailers"
 *   - "retailer comparison"
 *   - "verified marketplace products"
 *   - "where you can go for support and overall advice"
 */

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.fast,
      ease: EASING.gentle,
    },
  },
};

const quoteVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.slower,
      ease: EASING.premium,
    },
  },
};

// EDIT 4: Enhanced Lorem Curae description with all requested elements
const competitors = [
  { name: "Sephora & Ulta", issue: "Inventory first, fit second. Product suggestions aren't personalized and don't adapt to your skin type, concerns, or progress, leaving you to guess what works for you.", isUs: false },
  { name: 'Amazon', issue: 'Counterfeit risk. Zero personalization. Review manipulation.', isUs: false },
  { name: 'Google', issue: 'SEO-gamed results. Sponsored content disguised as advice.', isUs: false },
  { name: 'INCIdecoder', issue: 'Great for data, but no personalization or guidance.', isUs: false },
  {
    name: 'Lorem Curae',
    issue: 'Personalized recommendations, community-reviewed retailers, product and retailer comparison tools, verified marketplace products, science-backed guidance, and a supportive community with a personal AI skincare assistant that walks the journey with you.',
    isUs: true
  },
];

export default function DifferentiationSection() {
  return (
    <section className="lc-differentiation">
      <style>{`
        .lc-differentiation {
          padding: 6rem 2rem;
          background: #2D2A26;
          color: white;
          overflow: hidden;
        }
        
        .lc-diff-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1100px;
          margin: 0 auto;
          align-items: center;
        }
        
        .lc-diff-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          font-weight: 500;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          color: white;
        }
        
        .lc-diff-title em {
          font-style: italic;
          color: #E8A888;
        }
        
        .lc-diff-text {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 2rem;
        }
        
        .lc-comparison-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .lc-comparison-item {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .lc-comparison-item:last-child {
          border-bottom: none;
        }
        
        .lc-comparison-item strong {
          color: white;
          font-weight: 600;
        }
        
        .lc-comparison-item span {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .lc-comparison-item.lc-us-item span {
          color: rgba(255, 255, 255, 0.85);
        }
        
        .lc-icon-wrapper {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lc-them-icon {
          color: rgba(255, 255, 255, 0.3);
          font-size: 1.25rem;
        }
        
        .lc-us-icon {
          color: #E8A888;
          font-size: 1.25rem;
        }
        
        .lc-diff-visual {
          background: linear-gradient(135deg, rgba(196, 112, 77, 0.3), rgba(122, 139, 122, 0.2));
          border-radius: 24px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .lc-diff-visual::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(232, 168, 136, 0.2), transparent 50%);
        }
        
        .lc-diff-quote {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.5rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .lc-differentiation {
            padding: 4rem 1.5rem;
          }
          
          .lc-diff-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .lc-diff-visual {
            height: 300px;
          }
        }
      `}</style>

      <motion.div 
        className="lc-diff-grid"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Left content - slides in from left */}
        <motion.div variants={slideInFromLeft}>
          <motion.h2
            className="lc-diff-title"
            variants={fadeInUpSoft}
          >
            We're not Sephora. We're not Amazon. We're on your side.
          </motion.h2>
          <motion.p 
            className="lc-diff-text"
            variants={fadeInUpSoft}
          >
            Big retailers want you to buy. Search engines want you to click. Ingredient databases give you data without direction. We built Lorem Curae because we were tired of navigating a system designed to sell, not to serve.
          </motion.p>
          
          {/* Comparison list with staggered animation */}
          <motion.ul 
            className="lc-comparison-list"
            variants={staggerContainer}
          >
            {competitors.map((competitor, index) => (
              <motion.li 
                key={index} 
                className={`lc-comparison-item ${competitor.isUs ? 'lc-us-item' : ''}`}
                variants={listItemVariants}
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.span 
                  className="lc-icon-wrapper"
                  variants={iconVariants}
                >
                  <span className={competitor.isUs ? 'lc-us-icon' : 'lc-them-icon'}>
                    {competitor.isUs ? '✓' : '✕'}
                  </span>
                </motion.span>
                <div>
                  <strong>{competitor.name}:</strong>{' '}
                  <span>{competitor.issue}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        
        {/* Right visual - slides in from right */}
        <motion.div 
          className="lc-diff-visual"
          variants={slideInFromRight}
        >
          <motion.p 
            className="lc-diff-quote"
            variants={quoteVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            Your skin is unique.<br />
            Your tools should be too.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
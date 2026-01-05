import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  staggerContainerSlow,
  cardHover,
  drawPath,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * ConnectedSystemSection Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 2: Added "and builds the foundation for your personalized experience" to skin quiz sentence
 * - Edit 3: Smart Product Finder pain - added "and finding retailers that sell faulty products..."
 * - Edit 4: Smart Product Finder description - combined products and retailers search
 * - Edit 5: Smart Product Finder outcome - replaced with trusted retailers text
 * - Edit 6: Renamed "AI Skincare Guide" to "Curae AI" + added interaction-based answers
 * - Edit 7: Product Comparison - changed "any two" to "up to three"
 * - Edit 8: Routine Tracking pain - added "and not having someone to guide you..."
 * - Edit 9: Routine Tracking description - added personalization and assessment text
 * - Edit 10: NEW CARD - Progress Assessment and Feedback
 * 
 * CSS UPDATES:
 * - Added align-items: stretch to .lc-system-grid for equal card heights
 * - Added flex layout to .lc-system-card for proper content distribution
 * - Added margin-top: auto to .lc-card-outcome to push it to bottom
 */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

const tools = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: 'Smart Product Finder',
    // EDIT 3: Added retailer/faulty products pain point
    pain: 'The pain: Endless scrolling through products that weren\'t made for your skin—and finding retailers that sell faulty products, never knowing if the product actually works.',
    // EDIT 4: Combined products AND retailers search into one cohesive sentence
    description: 'Search for products and reputable retailers the way you actually think about skincare—by concern, ingredient, price, or skin type.',
    // EDIT 5: Replaced outcome with trusted retailers text
    outcome: 'Find trusted retailers that sell your recommended product based on your skin profile',
    link: '/discover',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    // EDIT 6: Renamed to "Curae AI"
    title: 'Curae AI',
    pain: 'The pain: Conflicting advice from the internet, influencers, and even derms.',
    // EDIT 6: Added interaction-based answers
    description: 'Ask anything and get answers grounded in peer-reviewed research, not sponsored content—and answers based on your interactions and overall journey within the site.',
    outcome: 'Trusted answers, tailored to you',
    link: '/ai-chat',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Product Comparison',
    pain: 'The pain: Wondering if the $68 serum is actually better than the $19 one.',
    // EDIT 7: Changed "any two" to "up to three"
    description: 'Compare up to three products side-by-side: ingredients, concentration, price-per-ml, and compatibility.',
    outcome: 'Spend smarter, not more',
    link: '/discover',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Ingredient Library',
    pain: 'The pain: Reading ingredient lists like they\'re written in another language.',
    description: 'Every ingredient decoded: what it does, who it\'s for, what to pair it with (and what to avoid).',
    outcome: 'Finally understand what you\'re putting on your face',
    link: '/ingredients',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Routine Tracking',
    // EDIT 8: Added guidance pain point
    pain: 'The pain: Forgetting what you used when, never knowing what\'s working, and not having someone to guide you throughout your process.',
    // EDIT 9: Added personalization and assessment text
    description: 'Build AM/PM routines with smart conflict detection. Track your progress over time—further enhancing your personalization so Curae can assess the progress you\'ve tracked for a selected time period.',
    outcome: 'Build consistency, see results',
    link: '/routines',
  },
  // EDIT 10: NEW CARD - Progress Assessment and Feedback
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Progress Assessment and Feedback',
    pain: 'The pain: Trying new routines without any way to measure if they\'re actually working—or knowing when it\'s time to adjust.',
    description: 'Curae analyzes your tracked routines and skin progress over time, providing personalized feedback and actionable insights. See what\'s working, what needs adjustment, and receive tailored recommendations based on your real results.',
    outcome: 'Data-driven insights that evolve with your skin',
    link: '/my-skin',
  },
];

export default function ConnectedSystemSection() {
  return (
    <section className="lc-connected-system" id="finder">
      <style>{`
        .lc-connected-system {
          background: linear-gradient(180deg, #FFFBF8 0%, #F8F4F0 100%);
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .lc-connected-system::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(196, 112, 77, 0.2), transparent);
        }
        
        .lc-section-intro {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
        }
        
        .lc-section-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #C4704D;
          margin-bottom: 1rem;
          display: block;
        }
        
        .lc-section-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 500;
          margin-bottom: 1.25rem;
          letter-spacing: -0.01em;
          color: #2D2A26;
        }
        
        .lc-section-description {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1.0625rem;
          color: #6B635A;
          line-height: 1.7;
        }
        
        .lc-section-description em {
          font-style: italic;
          color: #C4704D;
        }
        
        /* Connecting line SVG */
        .lc-connecting-line {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 200px;
          pointer-events: none;
          opacity: 0.3;
        }
        
        .lc-system-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          align-items: stretch;
        }
        
        .lc-system-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid rgba(196, 112, 77, 0.08);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .lc-system-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #C4704D, #E8A888);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .lc-system-card:hover::before {
          opacity: 1;
        }
        
        .lc-card-icon {
          width: 48px;
          height: 48px;
          background: rgba(196, 112, 77, 0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #C4704D;
        }
        
        .lc-card-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #2D2A26;
        }
        
        .lc-card-pain {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          color: #8B4D35;
          font-weight: 500;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(196, 112, 77, 0.1);
        }
        
        .lc-card-description {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          color: #6B635A;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        
        .lc-card-outcome {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.8125rem;
          color: #7A8B7A;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        @media (max-width: 768px) {
          .lc-connected-system {
            padding: 4rem 1.5rem;
          }
          
          .lc-system-card {
            padding: 2rem;
          }
        }
      `}</style>

      {/* Decorative connecting line with draw animation */}
      <svg className="lc-connecting-line" viewBox="0 0 800 200">
        <motion.path
          d="M0,100 Q200,50 400,100 T800,100"
          stroke="#C4704D"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 4"
          variants={drawPath}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        />
      </svg>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionVariants}
      >
        {/* Section intro with fade + lift */}
        <motion.div className="lc-section-intro" variants={titleVariants}>
          <motion.span 
            className="lc-section-label"
            variants={fadeInUpSoft}
          >
            One Ecosystem, Infinite Clarity
          </motion.span>
          <motion.h2 
            className="lc-section-title"
            variants={fadeInUpSoft}
          >
            Six tools that work together—so you don't have to
          </motion.h2>
          {/* EDIT 2: Added "and builds the foundation for your personalized experience" */}
          <motion.p 
            className="lc-section-description"
            variants={fadeInUpSoft}
          >
            Each feature feeds into the next. Your skin quiz informs your product recommendations and builds the foundation for your personalized experience. Your ingredient knowledge shapes your comparisons. This isn't a collection of tools—it's a connected system built around <em>your</em> skin.
          </motion.p>
        </motion.div>
        
        {/* Cards grid with staggered animation */}
        <motion.div 
          className="lc-system-grid"
          variants={staggerContainerSlow}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={cardHover}
            >
              <Link to={tool.link} className="lc-system-card">
                <motion.div 
                  className="lc-card-icon"
                  variants={iconVariants}
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: 'rgba(196, 112, 77, 0.15)',
                    transition: { duration: 0.3 }
                  }}
                >
                  {tool.icon}
                </motion.div>
                <h3 className="lc-card-title">{tool.title}</h3>
                <p className="lc-card-pain">{tool.pain}</p>
                <p className="lc-card-description">{tool.description}</p>
                <span className="lc-card-outcome">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {tool.outcome}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
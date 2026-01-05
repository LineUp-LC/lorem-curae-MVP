import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  slideInFromLeft,
  slideInFromRight,
  cardHover,
  buttonHover,
  buttonTap,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * MarketplaceSection Component
 * 
 * Motion design:
 * - Creator cards: fade + slide from left
 * - Content: slide from right
 * - Product cards: hover lift + CTA slide-up
 * - Quote: soft typewriter effect
 */

const creatorCardVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
};

// Typewriter hook for quote effect
function useTypewriter(text: string, speed: number = 30, startDelay: number = 500) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    
    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      
      return () => clearInterval(interval);
    }, startDelay);
    
    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayText, isComplete };
}

export default function MarketplaceSection() {
  const quote = "After years of struggling with sensitive skin, I created a line that celebrates gentle, effective ingredients. Every formula is tested on real people with real concerns—not just in a lab.";
  const { displayText, isComplete } = useTypewriter(quote, 25, 800);

  return (
    <section className="lc-marketplace-section" id="marketplace">
      <style>{`
        .lc-marketplace-section {
          padding: 6rem 2rem;
          background: linear-gradient(180deg, #F8F4F0 0%, #FFFBF8 100%);
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
          color: #2D2A26;
        }
        
        .lc-section-description {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1.0625rem;
          color: #6B635A;
          line-height: 1.7;
        }
        
        .lc-marketplace-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
          align-items: center;
        }
        
        .lc-creator-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(196, 112, 77, 0.08);
        }
        
        .lc-creator-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .lc-creator-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E8A888, #7A8B7A);
        }
        
        .lc-creator-name {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.25rem;
          font-weight: 600;
          color: #2D2A26;
        }
        
        .lc-creator-title {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.8125rem;
          color: #6B635A;
        }
        
        .lc-creator-quote {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          color: #6B635A;
          font-style: italic;
          line-height: 1.7;
          min-height: 100px;
        }
        
        /* Cursor blink for typewriter */
        .lc-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #C4704D;
          margin-left: 2px;
          animation: blink 1s infinite;
          vertical-align: text-bottom;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .lc-marketplace-content h3 {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.75rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: #2D2A26;
        }
        
        .lc-marketplace-content p {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1rem;
          color: #6B635A;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        
        .lc-btn-primary {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          font-weight: 600;
          padding: 1rem 2rem;
          background: #C4704D;
          color: white;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        @media (max-width: 768px) {
          .lc-marketplace-section {
            padding: 4rem 1.5rem;
          }
          
          .lc-marketplace-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Section intro */}
        <motion.div className="lc-section-intro">
          <motion.span 
            className="lc-section-label"
            variants={fadeInUpSoft}
          >
            Curated Marketplace
          </motion.span>
          <motion.h2 
            className="lc-section-title"
            variants={fadeInUpSoft}
          >
            Shop from creators who care as much as you do
          </motion.h2>
          <motion.p 
            className="lc-section-description"
            variants={fadeInUpSoft}
          >
            Our marketplace features verified indie brands and small-batch creators who prioritize transparency, efficacy, and ethics.
          </motion.p>
        </motion.div>
        
        <div className="lc-marketplace-grid">
          {/* Creator card with typewriter quote */}
          <motion.div
            variants={creatorCardVariants}
            whileHover={cardHover}
          >
            <div className="lc-creator-card">
              <motion.div 
                className="lc-creator-header"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: TIMING.normal }}
              >
                <motion.div 
                  className="lc-creator-avatar"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div>
                  <div className="lc-creator-name">Maya Chen</div>
                  <div className="lc-creator-title">Founder, Gentle Glow Naturals</div>
                </div>
              </motion.div>
              <p className="lc-creator-quote">
                "{displayText}"
                {!isComplete && <span className="lc-cursor" />}
              </p>
            </div>
          </motion.div>
          
          {/* Content with slide from right */}
          <motion.div 
            className="lc-marketplace-content"
            variants={slideInFromRight}
          >
            <h3>Not your average product shelf</h3>
            <p>
              Big-box retailers prioritize bestsellers. We prioritize fit. Our marketplace connects you directly with independent creators who formulate with intention.
            </p>
            <motion.div
              whileHover={buttonHover}
              whileTap={buttonTap}
              style={{ display: 'inline-block' }}
            >
              <Link to="/marketplace" className="lc-btn-primary">
                Explore Marketplace
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
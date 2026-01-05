import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  staggerGrid,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * IngredientSection Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 1: Card size consistency - balanced ingredient benefits for equal card sizing
 * - All 10 ingredients with consistent character counts in benefits
 */

const tileVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

const tileHover = {
  y: -6,
  boxShadow: '0 15px 35px rgba(196, 112, 77, 0.1)',
  borderColor: '#C4704D',
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

// EDIT 1: Balanced ingredient benefits for equal card sizing (each ~40-50 characters)
const ingredients = [
  { name: 'Hyaluronic Acid', benefit: 'Deep hydration by drawing moisture into skin' },
  { name: 'Niacinamide', benefit: 'Strengthens barrier and evens skin tone' },
  { name: 'Retinol', benefit: 'Reduces fine lines and boosts cell turnover' },
  { name: 'Vitamin C', benefit: 'Brightens dark spots with antioxidant power' },
  { name: 'Ceramides', benefit: 'Restores your skin\'s natural barrier' },
  { name: 'Peptides', benefit: 'Signals collagen for improved firmness' },
  { name: 'Salicylic Acid', benefit: 'Clears breakouts by exfoliating pores' },
  { name: 'Azelaic Acid', benefit: 'Calms redness and fades acne marks' },
  { name: 'Squalane', benefit: 'Lightweight oil that mimics natural sebum' },
  { name: 'Centella Asiatica', benefit: 'Soothes irritation and aids healing' },
];

export default function IngredientSection() {
  return (
    <section className="lc-ingredient-section" id="ingredients">
      <style>{`
        .lc-ingredient-section {
          padding: 6rem 2rem;
          background: linear-gradient(180deg, #FFFBF8 0%, #FDF8F5 100%);
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
        
        .lc-ingredient-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        
        .lc-ingredient-card {
          background: white;
          padding: 1.5rem 1.25rem;
          border-radius: 16px;
          text-align: center;
          border: 1px solid rgba(196, 112, 77, 0.08);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          min-height: 130px;
        }
        
        .lc-ingredient-name {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.0625rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2D2A26;
        }
        
        .lc-ingredient-benefit {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          color: #6B635A;
          line-height: 1.5;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lc-section-cta {
          text-align: center;
          margin-top: 3rem;
        }
        
        .lc-btn-secondary {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          font-weight: 600;
          padding: 1rem 2rem;
          background: transparent;
          color: #2D2A26;
          border: 1.5px solid rgba(45, 42, 38, 0.2);
          border-radius: 100px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        @media (max-width: 1024px) {
          .lc-ingredient-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .lc-ingredient-section {
            padding: 4rem 1.5rem;
          }
          
          .lc-ingredient-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .lc-ingredient-card {
            min-height: 120px;
          }
        }
      `}</style>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Section intro with fade + lift */}
        <motion.div className="lc-section-intro">
          <motion.span 
            className="lc-section-label"
            variants={fadeInUpSoft}
          >
            Ingredient Transparency
          </motion.span>
          <motion.h2 
            className="lc-section-title"
            variants={fadeInUpSoft}
          >
            Knowledge is your best skincare product
          </motion.h2>
          <motion.p 
            className="lc-section-description"
            variants={fadeInUpSoft}
          >
            Understanding ingredients means you stop buying on hype and start buying on science. Our library gives you the truth about every ingredient—what it does, who it's for, and what to watch out for.
          </motion.p>
        </motion.div>
        
        {/* Ingredient grid with staggered zoom + fade */}
        <motion.div 
          className="lc-ingredient-grid"
          variants={staggerGrid}
        >
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={index}
              variants={tileVariants}
              whileHover={tileHover}
            >
              <Link to="/ingredients" className="lc-ingredient-card">
                <div className="lc-ingredient-name">{ingredient.name}</div>
                <div className="lc-ingredient-benefit">{ingredient.benefit}</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA with hover animation */}
        <motion.div 
          className="lc-section-cta"
          variants={fadeInUpSoft}
        >
          <motion.div
            whileHover={{ 
              borderColor: '#C4704D',
              color: '#C4704D',
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            style={{ display: 'inline-block' }}
          >
            <Link to="/ingredients" className="lc-btn-secondary">
              Explore Full Ingredient Library →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
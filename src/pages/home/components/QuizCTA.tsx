import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  buttonHover,
  buttonTap,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * QuizCTA Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 2: Changed "Take the Skin Quiz" to "Take the Skin Survey"
 * - Removed "inbox" from results text
 */

const boxVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 30,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

export default function QuizCTA() {
  return (
    <section className="lc-cta-section">
      <style>{`
        .lc-cta-section {
          padding: 6rem 2rem;
          background: #FDF8F5;
          text-align: center;
        }
        
        .lc-cta-box {
          max-width: 700px;
          margin: 0 auto;
          padding: 4rem;
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(196, 112, 77, 0.1);
          box-shadow: 0 20px 60px rgba(45, 42, 38, 0.06);
          position: relative;
          overflow: hidden;
        }
        
        .lc-cta-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #C4704D, #E8A888, #7A8B7A);
        }
        
        .lc-cta-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 500;
          margin-bottom: 1rem;
          color: #2D2A26;
        }
        
        .lc-cta-text {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1rem;
          color: #6B635A;
          margin-bottom: 2rem;
          line-height: 1.7;
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
        
        .lc-cta-timer {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.8125rem;
          color: #7A8B7A;
          margin-top: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .lc-cta-section {
            padding: 4rem 1.5rem;
          }
          
          .lc-cta-box {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>

      <motion.div
        className="lc-cta-box"
        variants={boxVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.h2 
          className="lc-cta-title"
          variants={contentVariants}
        >
          Your skin journey starts with one question
        </motion.h2>
        
        <motion.p 
          className="lc-cta-text"
          variants={contentVariants}
        >
          Our 2-minute adaptive survey learns your skin type, concerns, lifestyle, and goals. From there, every recommendation, every comparison, every piece of guidance is tailored to you.
        </motion.p>
        
        {/* EDIT 2: Changed to "Take the Skin Survey" */}
        <motion.div variants={contentVariants}>
          <motion.div
            whileHover={buttonHover}
            whileTap={buttonTap}
            style={{ display: 'inline-block' }}
          >
            <Link to="/skin-survey" className="lc-btn-primary">
              Take the Skin Survey
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="lc-cta-timer"
          variants={contentVariants}
        >
          No account required. Results instantly.
        </motion.p>
      </motion.div>
    </section>
  );
}
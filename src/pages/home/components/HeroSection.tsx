import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  buttonHover,
  buttonTap,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * HeroSection Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 1: Added "trusted and reputable retailers" to subhead
 * - Edit 2: Changed "Take the Skin Quiz" to "Take the Skin Survey"
 */

// Unified upward motion variants
const heroVariants = {
  badge: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.slow,
        ease: EASING.premium,
      },
    },
  },
  headline: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.slower,
        ease: EASING.premium,
      },
    },
  },
  subhead: {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.slow,
        ease: EASING.gentle,
      },
    },
  },
  problem: {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.slow,
        ease: EASING.gentle,
      },
    },
  },
  cta: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.gentle,
      },
    },
  },
};

// Container with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default function HeroSection() {
  return (
    <section className="lc-hero">
      <style>{`
        .lc-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .lc-hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 6rem 2rem;
          position: relative;
          z-index: 1;
        }
        
        /* Animated gradient background */
        .lc-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #FDF8F5 0%,
            #F8F4F0 20%,
            #FDF8F5 40%,
            #E8D4CC 60%,
            #FDF8F5 80%,
            #FFFBF8 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Decorative orbs */
        .lc-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        
        .lc-hero-orb-1 {
          width: 600px;
          height: 600px;
          background: rgba(232, 168, 136, 0.2);
          top: -200px;
          right: -100px;
        }
        
        .lc-hero-orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(122, 139, 122, 0.12);
          bottom: -100px;
          left: -100px;
        }
        
        .lc-hero-orb-3 {
          width: 300px;
          height: 300px;
          background: rgba(196, 112, 77, 0.1);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .lc-hero-badge {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #C4704D;
          background: rgba(196, 112, 77, 0.08);
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          margin-bottom: 2rem;
          border: 1px solid rgba(196, 112, 77, 0.15);
        }
        
        .lc-hero-headline {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 500;
          line-height: 1.15;
          max-width: 900px;
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
          color: #2D2A26;
        }
        
        .lc-hero-headline em {
          font-style: italic;
          color: #C4704D;
        }
        
        .lc-hero-subhead {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1.125rem;
          color: #6B635A;
          max-width: 650px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }
        
        .lc-problem-statement {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.9375rem;
          color: #6B635A;
          max-width: 650px;
          line-height: 1.8;
          margin-bottom: 3rem;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          border: 1px solid rgba(196, 112, 77, 0.08);
          backdrop-filter: blur(10px);
        }
        
        .lc-problem-statement strong {
          color: #2D2A26;
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
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-block;
        }
        
        @media (max-width: 768px) {
          .lc-hero-content {
            padding: 4rem 1.5rem;
          }
        }
      `}</style>

      {/* Animated background */}
      <div className="lc-hero-bg" />
      
      {/* Decorative orbs - gentle upward floating */}
      <motion.div 
        className="lc-hero-orb lc-hero-orb-1"
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div 
        className="lc-hero-orb lc-hero-orb-2"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div 
        className="lc-hero-orb lc-hero-orb-3"
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.1, 0.14, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div 
        className="lc-hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div 
          className="lc-hero-badge"
          variants={heroVariants.badge}
        >
          Skincare, finally decoded
        </motion.div>
        
        {/* Headline */}
        <motion.h1 
          className="lc-hero-headline"
          variants={heroVariants.headline}
        >
          Stop guessing.<br />
          Start <em>understanding</em> your skin.
        </motion.h1>
        
        {/* Subhead - with "trusted and reputable retailers" */}
        <motion.p 
          className="lc-hero-subhead"
          variants={heroVariants.subhead}
        >
          The first platform that connects your skin profile to personalized product recommendations, trusted and reputable retailers, ingredient science, and a community that actually gets it.
        </motion.p>
        
        {/* Problem statement */}
        <motion.div 
          className="lc-problem-statement"
          variants={heroVariants.problem}
        >
          <strong>The skincare industry has a problem:</strong> You're drowning in influencer picks, algorithm-driven ads, and ingredient lists that read like chemistry exams. You've tried the "holy grail" products that worked for everyone but you. It's not your fault—you've never had the right tools.
        </motion.div>
        
        {/* CTA - EDIT 2: Changed to "Take the Skin Survey" */}
        <motion.div variants={heroVariants.cta}>
          <motion.div
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            <Link to="/skin-survey" className="lc-btn-primary">
              Take the Skin Survey
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
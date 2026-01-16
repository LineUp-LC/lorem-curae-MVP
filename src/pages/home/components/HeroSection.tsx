import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fadeIn,
  fadeInUpSoft,
  staggerContainer,
  buttonHover,
  buttonTap,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * HeroSection Component
 *
 * Clean, focused hero with:
 * - Clear headline and subhead
 * - Single CTA
 * - Premium motion animations
 * - Animated gradient background with floating orbs
 */

// Hero-specific motion variants
const heroVariants = {
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
};

// Subtle pulse animation for CTA
const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Container with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

export default function HeroSection() {
  const navigate = useNavigate();

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
          padding: 8rem 2rem 6rem;
          position: relative;
          z-index: 1;
          min-height: 100vh;
          justify-content: center;
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

        .lc-hero-headline {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          font-weight: 500;
          line-height: 1.1;
          max-width: 800px;
          margin-bottom: 5rem;
          letter-spacing: -0.01em;
          color: #2D2A26;
        }

        .lc-hero-subhead {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          color: #6B635A;
          max-width: 1000px;
          line-height: 1.8;
          margin-bottom: 3rem;
          font-weight: 400;
        }

        .lc-hero-subhead em {
          font-style: italic;
          color: #C4704D;
        }

        /* CTA Container */
        .lc-cta-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .lc-btn-start {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1.0625rem;
          font-weight: 600;
          padding: 1.25rem 3rem;
          background: #C4704D;
          color: white;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.3s ease;
        }

        .lc-btn-start:hover {
          background: #B5614A;
        }

        @media (max-width: 768px) {
          .lc-hero-content {
            padding: 6rem 1.5rem 4rem;
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
        {/* Headline */}
        <motion.h1
          className="lc-hero-headline"
          variants={heroVariants.headline}
        >
          Skincare clarity starts here.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          className="lc-hero-subhead"
          variants={heroVariants.subhead}
        >
          Lorem Curae is one of the only platforms built to connect your unique skin profile with <em>personalized guidance</em>, <em>trusted retailers</em>, <em>ingredient clarity</em>, and <em>community support</em> into one connected experience. Everything works together so you never have to navigate skincare alone — and finally see <em>clarity</em> where there used to be confusion.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          className="lc-cta-container"
          variants={heroVariants.subhead}
        >
          <motion.div
            animate="pulse"
            variants={pulseVariants}
            style={{ borderRadius: '100px' }}
          >
            <motion.button
              className="lc-btn-start"
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={() => navigate('/skin-survey')}
            >
              Take the Skin Survey
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

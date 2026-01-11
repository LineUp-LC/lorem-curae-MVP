import { useNavigate } from 'react-router-dom';
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
 * CONVERSION OPTIMIZATIONS:
 * - Value props above the fold
 * - "Start Here" CTA with visual pulse cue
 * - One-sentence promise
 * - Trust indicators
 * - 5-step micro-stepper journey
 * - Mini testimonial from Sarah M.
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

// Pulse animation for CTA visual cue
const pulseVariants = {
  pulse: {
    scale: [1, 1.02, 1],
    boxShadow: [
      '0 0 0 0 rgba(196, 112, 77, 0.4)',
      '0 0 0 10px rgba(196, 112, 77, 0)',
      '0 0 0 0 rgba(196, 112, 77, 0)',
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Journey steps for micro-stepper
const journeySteps = [
  { number: 1, label: 'Take the survey', icon: 'ri-questionnaire-line' },
  { number: 2, label: 'Get science-backed product + retailer recommendations', icon: 'ri-sparkling-line' },
  { number: 3, label: 'Build your routine with confidence', icon: 'ri-calendar-check-line' },
  { number: 4, label: 'Track your progress', icon: 'ri-line-chart-line' },
  { number: 5, label: 'Receive insights that strengthen your personalization', icon: 'ri-lightbulb-flash-line' },
  { number: 6, label: 'Earn discounts when you purchase through our retailer links', icon: 'ri-discount-percent-line' },
];

// Trust indicators
const trustIndicators = [
  { icon: 'ri-flask-line', label: 'Science-backed guidance' },
  { icon: 'ri-store-2-line', label: 'Community-reviewed retailers' },
  { icon: 'ri-eye-line', label: 'Ingredient transparency' },
];

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
          font-size: clamp(2.75rem, 6vw, 5rem);
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

        .lc-hero-promise {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.125rem, 2vw, 1.375rem);
          font-weight: 500;
          color: #2D2A26;
          max-width: 600px;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .lc-hero-subhead {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
          color: #6B635A;
          max-width: 650px;
          line-height: 1.75;
          margin-bottom: 2rem;
        }

        /* Trust Indicators */
        .lc-trust-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding: 1rem 0;
        }

        .lc-trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.8125rem;
          color: #6B635A;
        }

        .lc-trust-item i {
          color: #7A8B7A;
          font-size: 1rem;
        }

        /* CTA Container */
        .lc-cta-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .lc-btn-start {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 1rem;
          font-weight: 600;
          padding: 1.125rem 2.5rem;
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
          position: relative;
        }

        .lc-btn-start i {
          font-size: 1.25rem;
        }

        .lc-cta-helper {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.8125rem;
          color: #7A8B7A;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .lc-cta-helper i {
          font-size: 0.875rem;
        }

        /* Micro-stepper */
        .lc-journey-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(196, 112, 77, 0.1);
          backdrop-filter: blur(10px);
          max-width: 100%;
          overflow-x: auto;
        }

        .lc-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 90px;
          max-width: 120px;
          text-align: center;
        }

        .lc-step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(196, 112, 77, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C4704D;
          font-size: 1.125rem;
        }

        .lc-step-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.6875rem;
          color: #6B635A;
          font-weight: 500;
          line-height: 1.3;
        }

        .lc-step-connector {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, rgba(196, 112, 77, 0.3), rgba(196, 112, 77, 0.1));
          flex-shrink: 0;
        }

        /* Testimonial snippet */
        .lc-hero-testimonial {
          margin-top: 2.5rem;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          border: 1px solid rgba(196, 112, 77, 0.08);
          max-width: 500px;
          text-align: left;
        }

        .lc-hero-testimonial-quote {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 0.9375rem;
          font-style: italic;
          color: #2D2A26;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .lc-hero-testimonial-author {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          color: #6B635A;
        }

        @media (max-width: 768px) {
          .lc-hero-content {
            padding: 4rem 1.5rem;
          }

          .lc-trust-row {
            gap: 1rem;
          }

          .lc-trust-item {
            font-size: 0.75rem;
          }

          .lc-journey-stepper {
            padding: 1rem;
            gap: 0.25rem;
          }

          .lc-step {
            min-width: 60px;
          }

          .lc-step-icon {
            width: 32px;
            height: 32px;
            font-size: 0.875rem;
          }

          .lc-step-label {
            font-size: 0.625rem;
          }

          .lc-step-connector {
            width: 12px;
          }

          .lc-hero-testimonial {
            padding: 1rem;
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

        {/* Subhead - value proposition */}
        <motion.p
          className="lc-hero-subhead"
          variants={heroVariants.subhead}
        >
         The only platform that unifies your skin profile with science‑backed recommendations and community‑reviewed retailers — all supported by a community that actually gets it.
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          className="lc-trust-row"
          variants={heroVariants.subhead}
        >
          {trustIndicators.map((item, index) => (
            <span key={index} className="lc-trust-item">
              <i className={item.icon}></i>
              {item.label}
            </span>
          ))}
        </motion.div>

        {/* Primary CTA with visual cue */}
        <motion.div
          className="lc-cta-container"
          variants={heroVariants.cta}
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
              <i className="ri-arrow-right-circle-line"></i>
              Start Here
            </motion.button>
          </motion.div>
          <span className="lc-cta-helper">
            <i className="ri-time-line"></i>
            Takes 2 minutes. No account required.
          </span>
        </motion.div>

        {/* Micro-stepper journey */}
        <motion.div
          className="lc-journey-stepper"
          variants={heroVariants.problem}
        >
          {journeySteps.map((step, index) => (
            <motion.div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="lc-step">
                <div className="lc-step-icon">
                  <i className={step.icon}></i>
                </div>
                <span className="lc-step-label">{step.label}</span>
              </div>
              {index < journeySteps.length - 1 && <div className="lc-step-connector" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Mini testimonial */}
        <motion.div
          className="lc-hero-testimonial"
          variants={heroVariants.problem}
        >
          <p className="lc-hero-testimonial-quote">
            "Lorem Curae was the first place that actually understood my skin—not just sold to it."
          </p>
          <p className="lc-hero-testimonial-author">
            — Sarah M., Combination Skin
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * WhyThisMattersSection Component
 *
 * Captures the problem statement and pain points
 * immediately below the hero section.
 */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
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

const painPoints = [
  {
    icon: 'ri-question-line',
    title: 'Conflicting advice',
    description: "It's hard to know what's real when every source says something different.",
  },
  {
    icon: 'ri-heart-pulse-line',
    title: '"Holy grail" failures',
    description: "It's frustrating when products promise results but don't match your skin once you try them.",
  },
  {
    icon: 'ri-tools-line',
    title: 'Missing tools',
    description: "You've been doing your best — you just haven't had the right guidance yet.",
  },
];

export default function WhyThisMattersSection() {
  return (
    <section className="lc-why-matters">
      <style>{`
        .lc-why-matters {
          padding: 4rem 2rem;
          background: linear-gradient(180deg, #FFFBF8 0%, #FDF8F5 100%);
          border-top: 1px solid rgba(196, 112, 77, 0.08);
        }

        .lc-why-matters-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .lc-why-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #C4704D;
          margin-bottom: 1rem;
          display: block;
        }

        .lc-why-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 500;
          color: #2D2A26;
          margin-bottom: 2.5rem;
        }

        .lc-pain-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .lc-pain-item {
          text-align: center;
          padding: 1.5rem;
        }

        .lc-pain-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(196, 112, 77, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #C4704D;
          font-size: 1.25rem;
        }

        .lc-pain-title {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1.125rem;
          font-weight: 600;
          color: #2D2A26;
          margin-bottom: 0.5rem;
        }

        .lc-pain-description {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          color: #6B635A;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .lc-why-matters {
            padding: 3rem 1.5rem;
          }

          .lc-pain-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .lc-pain-item {
            padding: 1rem;
          }
        }
      `}</style>

      <motion.div
        className="lc-why-matters-container"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionVariants}
      >
        <motion.span className="lc-why-label" variants={itemVariants}>
          Why This Matters
        </motion.span>

        <motion.h2 className="lc-why-title" variants={itemVariants}>
          Understanding your skin shouldn't feel impossible — but the industry made it that way.
        </motion.h2>

        <motion.div className="lc-pain-grid" variants={sectionVariants}>
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              className="lc-pain-item"
              variants={itemVariants}
            >
              <div className="lc-pain-icon">
                <i className={point.icon}></i>
              </div>
              <h3 className="lc-pain-title">{point.title}</h3>
              <p className="lc-pain-description">{point.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

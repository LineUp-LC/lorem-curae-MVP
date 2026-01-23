import { motion } from 'framer-motion';
import { EASING } from '../../../lib/motion/motionVariants';

/**
 * ScrollIndicator Component
 *
 * Gentle floating arrow with text that scrolls to the next section.
 * Uses premium motion: soft, slow, never bouncy.
 */

// Gentle float animation - soft vertical movement
const floatVariants = {
  animate: {
    y: [0, 8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASING.natural,
    },
  },
};

// Fade in with delay after hero content loads
const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 1.2,
      ease: EASING.gentle,
    },
  },
};

export default function ScrollIndicator() {
  const handleScroll = () => {
    const target = document.getElementById('why-lorem-curae');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className="lc-scroll-indicator"
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      <style>{`
        .lc-scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 3rem;
          cursor: pointer;
        }

        .lc-scroll-text {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 1rem;
          font-weight: 500;
          color: #6B635A;
          letter-spacing: 0.02em;
        }

        .lc-scroll-arrow {
          width: 24px;
          height: 24px;
          color: #C4704D;
        }

        .lc-scroll-indicator:hover .lc-scroll-text {
          color: #C4704D;
        }

        .lc-scroll-indicator:hover .lc-scroll-arrow {
          color: #B5614A;
        }

        @media (max-width: 768px) {
          .lc-scroll-indicator {
            margin-top: 2rem;
          }

          .lc-scroll-text {
            font-size: 0.9375rem;
          }
        }
      `}</style>

      <button
        onClick={handleScroll}
        className="lc-scroll-indicator-btn"
        aria-label="Scroll to Why Lorem Curae section"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span className="lc-scroll-text">Why Lorem Curae?</span>
        <motion.div animate="animate" variants={floatVariants}>
          <svg
            className="lc-scroll-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
    </motion.div>
  );
}

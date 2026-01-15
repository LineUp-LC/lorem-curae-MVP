import { motion } from 'framer-motion';
import {
  fadeInUpSoft,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from '../../../lib/motion/motionVariants';

/**
 * WhyWeExistSection Component
 *
 * Section 2 — WHY WE EXIST
 * A premium manifesto statement with editorial styling.
 * Direction A (warm, settling light) + Direction B (editorial clarity)
 */

export default function WhyWeExistSection() {
  return (
    <section className="lc-why-we-exist">
      <style>{`
        .lc-why-we-exist {
          padding: 4rem 2rem 6rem;
          background: linear-gradient(180deg, #FFFCFA 0%, #FDF8F5 40%, #FFFBF8 100%);
          position: relative;
          overflow: hidden;
        }

        /* Gradient bleed from hero - seamless transition */
        .lc-why-we-exist::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(180deg, rgba(250, 232, 222, 0.3) 0%, transparent 100%);
          pointer-events: none;
        }

        .lc-why-we-exist-container {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
          position: relative;
        }

        /* Oversized decorative quotation mark */
        .lc-quote-mark {
          position: absolute;
          top: -2.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 12rem;
          line-height: 1;
          color: rgba(196, 112, 77, 0.04);
          pointer-events: none;
          user-select: none;
        }

        /* Thin accent line above text */
        .lc-accent-line {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(196, 112, 77, 0.3), transparent);
          margin: 0 auto 2rem;
          border-radius: 1px;
        }

        .lc-why-we-exist-text {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          font-weight: 400;
          color: #2D2A26;
          line-height: 1.8;
          letter-spacing: 0.01em;
          position: relative;
          z-index: 1;
        }

        /* Opening hook - slightly different treatment */
        .lc-text-hook {
          display: block;
          font-size: clamp(1.375rem, 2.8vw, 1.625rem);
          color: #2D2A26;
          margin-bottom: 0.75rem;
        }

        .lc-why-we-exist-text em {
          font-style: italic;
          color: #C4704D;
        }

        /* Subtle emphasis on "never fair" */
        .lc-text-emphasis {
          color: #8B7355;
        }

        @media (max-width: 768px) {
          .lc-why-we-exist {
            padding: 3rem 1.5rem 5rem;
          }

          .lc-quote-mark {
            font-size: 8rem;
            top: -1.5rem;
          }
        }
      `}</style>

      <motion.div
        className="lc-why-we-exist-container"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        {/* Decorative quotation mark */}
        <motion.span
          className="lc-quote-mark"
          variants={fadeInUpSoft}
          aria-hidden="true"
        >
          "
        </motion.span>

        {/* Accent line */}
        <motion.div
          className="lc-accent-line"
          variants={staggerItem}
        />

        {/* Main text with staggered sentences */}
        <motion.p className="lc-why-we-exist-text" variants={staggerItem}>
          <span className="lc-text-hook">
            You've been expected to figure out skincare alone.
          </span>
          <span className="lc-text-emphasis">That was never fair.</span>{' '}
          The industry sells you products, routines, and "holy grails" without ever
          helping you understand your skin. Lorem Curae exists to change that —
          with tools built around <em>clarity</em>, not confusion.
        </motion.p>
      </motion.div>
    </section>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  fadeInUpSoft,
  staggerContainer,
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

// Step sequence animation variants
const stepSequenceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const stepItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

// Sequential flow: 1 → 2 → arrow → 3 → arrow → 4 → arrow → 5 → arrow → 6
// Each step appears after the previous arrow finishes
const LOOP_STEP_REVEAL_DELAYS = [0.3, 1.6, 2.9, 4.2]; // by map index: [step2, step3, step4, step5]

const createStepRevealVariants = (delay: number) => ({
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.slow, // 0.8s
      ease: EASING.gentle,
      delay,
    },
  },
});

// Passthrough container — propagates hidden/visible without stagger
// Children control their own timing via explicit delays
const revealContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0,
      delayChildren: 0,
    },
  },
};

// Gentle float for endpoint arrows (step 1 ↔ circle ↔ step 6)
const endpointArrowFloat = {
  y: [0, 6, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: EASING.natural,
  },
};

// Arrow draw animation — each arrow draws after its step appears, before the next step
const ARROW_DRAW_DURATION = 0.4;
// Flow: step appears → arrow draws → next step appears
const ARROW_DRAW_DELAYS = [1.2, 2.5, 3.8, 5.1]; // by map index: [step2, step3, step4, step5]

const createArrowDrawVariants = (delayIndex: number, isReplay = false) => {
  // On replay (hover), use 0 delay for immediate animation
  const delay = isReplay ? 0 : ARROW_DRAW_DELAYS[delayIndex];

  return {
    arc: {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { duration: ARROW_DRAW_DURATION, ease: EASING.gentle, delay },
          opacity: { duration: 0.3, ease: EASING.gentle, delay },
        },
      },
    },
    chevron: {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { duration: 0.3, ease: EASING.gentle, delay: delay + ARROW_DRAW_DURATION * 0.7 },
          opacity: { duration: 0.2, ease: EASING.gentle, delay: delay + ARROW_DRAW_DURATION * 0.7 },
        },
      },
    },
  };
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
    pain: "The pain: Endless scrolling through products that weren't made for your skin—and finding retailers that sell faulty products, never knowing if the product actually works.",
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
    pain: "The pain: Reading ingredient lists like they're written in another language.",
    description: "Every ingredient decoded: what it does, who it's for, what to pair it with (and what to avoid).",
    outcome: "Finally understand what you're putting on your face",
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
    pain: "The pain: Forgetting what you used when, never knowing what's working, and not having someone to guide you throughout your process.",
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
    pain: "The pain: Trying new routines without any way to measure if they're actually working—or knowing when it's time to adjust.",
    description: "Curae analyzes your tracked routines and skin progress over time, providing personalized feedback and actionable insights. See what's working, what needs adjustment, and receive tailored recommendations based on your real results.",
    outcome: 'Data-driven insights that evolve with your skin',
    link: '/my-skin',
  },
];

// Journey steps in cyclical order
const journeySteps = [
  'Take the survey',
  'Get personalized recommendations',
  'Build your routine',
  'Track your progress',
  'Receive evolving insights',
  'Earn rewards',
];

// Arrow pointing inward (toward center)
const InwardArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12l7-7 7 7" />
  </svg>
);

// Curved arc arrow for quadrant steps (follows circle geometry)
const CurvedArrow = ({
  delayIndex = 0,
  reducedMotion = false,
  isReplay = false,
}: {
  delayIndex?: number;
  reducedMotion?: boolean;
  isReplay?: boolean;
}) => {
  if (reducedMotion) {
    return (
      <svg width="120" height="60" viewBox="0 0 126 60" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 50 Q60 22 116 50" fill="none" />
        <path d="M111 41l5 9-9 5" fill="none" strokeWidth="2.5" />
      </svg>
    );
  }

  const variants = createArrowDrawVariants(delayIndex, isReplay);

  return (
    <svg width="120" height="60" viewBox="0 0 126 60" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M4 50 Q60 22 116 50"
        fill="none"
        variants={variants.arc}
        {...(isReplay ? { initial: 'hidden', animate: 'visible' } : {})}
      />
      <motion.path
        d="M111 41l5 9-9 5"
        fill="none"
        strokeWidth="2.5"
        variants={variants.chevron}
        {...(isReplay ? { initial: 'hidden', animate: 'visible' } : {})}
      />
    </svg>
  );
};

// LoopStep component - handles hover state for arrow replay animation
const LoopStep = ({
  step,
  index,
  reducedMotion,
}: {
  step: string;
  index: number;
  reducedMotion: boolean;
}) => {
  // Track hover count to force arrow remount and replay animation
  const [hoverCount, setHoverCount] = useState(0);

  const handleMouseEnter = () => {
    // Don't replay on reduced motion
    if (reducedMotion) return;
    setHoverCount((prev) => prev + 1);
  };

  return (
    <motion.div
      className="lc-loop-step"
      variants={reducedMotion ? undefined : createStepRevealVariants(LOOP_STEP_REVEAL_DELAYS[index])}
      role="listitem"
      onMouseEnter={handleMouseEnter}
    >
      <span className="lc-loop-number" aria-hidden="true">
        {index + 2}
      </span>
      <span className="lc-loop-label">{step}</span>
      <span className="lc-loop-arrow" aria-hidden="true">
        {/* Key change forces remount → animation replays from hidden state */}
        <CurvedArrow
          key={hoverCount}
          delayIndex={index}
          reducedMotion={reducedMotion}
          isReplay={hoverCount > 0}
        />
      </span>
    </motion.div>
  );
};

export default function ConnectedSystemSection() {
  const prefersReducedMotion = useReducedMotion();
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

        /* Journey wrapper - contains top step, circle loop, bottom step */
        .lc-journey-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 580px;
          --step-size: 44px;
          --loop-shift-y: -7rem;
          --loop-shift-x: -1.5rem;
          margin: calc(3rem + var(--loop-shift-y)) auto 0;
          transform: translateX(var(--loop-shift-x));
        }

        /* Standalone endpoint steps (above/below circle) */
        .lc-journey-endpoint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          text-align: center;
        }

        .lc-journey-top {
          margin-bottom: 0;
          position: relative;
          --top-shift-x: 1rem;
          --top-shift-y: 7.3rem;
          left: var(--top-shift-x);
          top: var(--top-shift-y);
        }

        .lc-journey-bottom {
          margin-top: 0;
          position: relative;
          --bottom-shift-x: 1.3rem;
          --bottom-shift-y: -rem;
          left: var(--bottom-shift-x);
          top: var(--bottom-shift-y);
        }

        /* Directional arrows connecting endpoints to circle */
        .lc-endpoint-arrow {
          color: #C4704D;
          opacity: 0.5;
          display: flex;
          align-items: center;
          justify-content: center;
          --endpoint-arrow-offset: 0.75rem;
          padding: var(--endpoint-arrow-offset) 0;
          position: relative;
        }

        .lc-arrow-top {
          --arrow-top-shift-x: 1rem;
          --arrow-top-shift-y: 7.3rem;
          left: var(--arrow-top-shift-x);
          top: var(--arrow-top-shift-y);
        }

        .lc-arrow-down svg {
          transform: rotate(180deg);
        }

        .lc-endpoint-arrow-bottom {
          --arrow-bottom-shift-x: 1.3rem;
          --arrow-bottom-shift-y: -1.1rem;
          left: var(--arrow-bottom-shift-x);
          top: var(--arrow-bottom-shift-y);
        }

        .lc-endpoint-arrow-bottom svg {
          transform: rotate(180deg);
        }

        /* Circular journey loop */
        .lc-journey-loop {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          --radius: 42%;
          --step-offset-x: -60px;
          --track-shift-x: 3.4rem;
          --track-shift-y: 3rem;
          --circle-shift-x: -2rem;
          transform: translateX(var(--circle-shift-x));
        }

        /* Track wrapper - positions independently from step nodes */
        .lc-loop-track-wrapper {
          position: absolute;
          inset: 0;
          transform: translate(var(--track-shift-x), var(--track-shift-y));
          pointer-events: none;
        }

        /* Central circle track (animated SVG) */
        .lc-loop-track {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 52%;
          height: 52%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation:
            lcTrackSpin 35s linear infinite,
            lcTrackBreathe 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .lc-track-pulse {
          animation: lcTrackPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes lcTrackSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes lcTrackPulse {
          0%, 100% { stroke-width: 2; stroke-opacity: 1; }
          50% { stroke-width: 3; stroke-opacity: 0.5; }
        }

        @keyframes lcTrackBreathe {
          0%, 100% { scale: 1; }
          25% { scale: 1.018; }
          50% { scale: 0.985; }
          75% { scale: 1.01; }
        }

        /* Individual step node */
        .lc-loop-step {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          text-align: center;
          width: 110px;
          transform: translate(calc(-50% + var(--step-offset-x)), -50%);
        }

        .lc-loop-number {
          width: var(--step-size);
          height: var(--step-size);
          min-width: var(--step-size);
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(196, 112, 77, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          font-weight: 600;
          color: #C4704D;
          box-shadow: 0 4px 12px rgba(196, 112, 77, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lc-loop-step:hover .lc-loop-number {
          background: rgba(196, 112, 77, 0.08);
          border-color: #C4704D;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(196, 112, 77, 0.2);
        }

        .lc-loop-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          font-weight: 500;
          color: #6B635A;
          line-height: 1.4;
          transition: color 0.3s ease;
        }

        .lc-loop-step:hover .lc-loop-label {
          color: #2D2A26;
        }

        /* Inward arrow */
        .lc-loop-arrow {
          color: #C4704D;
          opacity: 0.5;
          margin-top: 0.25rem;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lc-loop-step:hover .lc-loop-arrow {
          opacity: 0.9;
        }

        /* Step positions using CSS trigonometry - 90° intervals at diagonal quadrants */
        /* Step 2 → top-left, Step 3 → top-right, Step 4 → bottom-right, Step 5 → bottom-left */
        /* nth-child offset by 1 (track wrapper comes first) */
        .lc-loop-step:nth-child(2) {
          top: calc(50% + var(--radius) * sin(-135deg));
          left: calc(50% + var(--radius) * cos(-135deg));
        }
        .lc-loop-step:nth-child(3) {
          top: calc(50% + var(--radius) * sin(-45deg));
          left: calc(50% + var(--radius) * cos(-45deg));
        }
        .lc-loop-step:nth-child(4) {
          top: calc(50% + var(--radius) * sin(45deg));
          left: calc(50% + var(--radius) * cos(45deg));
        }
        .lc-loop-step:nth-child(5) {
          top: calc(50% + var(--radius) * sin(135deg));
          left: calc(50% + var(--radius) * cos(135deg));
        }

        /* Arrow rotation - point toward next step (clockwise arc) */
        .lc-loop-step:nth-child(2) .lc-loop-arrow { transform: rotate(0deg); }
        .lc-loop-step:nth-child(3) .lc-loop-arrow { transform: rotate(90deg); }
        .lc-loop-step:nth-child(4) .lc-loop-arrow { transform: rotate(180deg); }
        .lc-loop-step:nth-child(5) .lc-loop-arrow { transform: rotate(-90deg); }

        /* Individual arrow position offsets */
        .lc-loop-step:nth-child(2) .lc-loop-arrow {
          position: relative;
          --arrow-2-shift-x: 10.4rem;
          --arrow-2-shift-y: -7.5rem;
          left: var(--arrow-2-shift-x);
          top: var(--arrow-2-shift-y);
        }
        .lc-loop-step:nth-child(3) .lc-loop-arrow {
          position: relative;
          --arrow-3-shift-x: 2.6rem;
          --arrow-3-shift-y: 6.3rem;
          left: var(--arrow-3-shift-x);
          top: var(--arrow-3-shift-y);
        }
        .lc-loop-step:nth-child(4) .lc-loop-arrow {
          position: relative;
          --arrow-4-shift-x: -11rem;
          --arrow-4-shift-y: -2.8rem;
          left: var(--arrow-4-shift-x);
          top: var(--arrow-4-shift-y);
        }
        .lc-loop-step:nth-child(5) .lc-loop-arrow {
          position: relative;
          --arrow-5-shift-x: -3rem;
          --arrow-5-shift-y: -15.5rem;
          left: var(--arrow-5-shift-x);
          top: var(--arrow-5-shift-y);
        }

        /* Hover arrow animation preserves base rotation */
        .lc-loop-step:nth-child(2):hover .lc-loop-arrow { transform: rotate(0deg) translateY(3px); }
        .lc-loop-step:nth-child(3):hover .lc-loop-arrow { transform: rotate(90deg) translateY(3px); }
        .lc-loop-step:nth-child(4):hover .lc-loop-arrow { transform: rotate(180deg) translateY(3px); }
        .lc-loop-step:nth-child(5):hover .lc-loop-arrow { transform: rotate(-90deg) translateY(3px); }

        /* Mobile: linear vertical list */
        @media (max-width: 768px) {
          .lc-journey-wrapper {
            --loop-shift-y: 0rem;
            --loop-shift-x: 0rem;
            margin: 3rem auto 0;
            transform: none;
            max-width: 100%;
          }

          .lc-journey-endpoint {
            flex-direction: row;
            text-align: left;
            width: 100%;
            gap: 1rem;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(196, 112, 77, 0.1);
          }

          .lc-journey-top {
            margin-bottom: 0;
          }

          .lc-journey-bottom {
            margin-top: 0;
          }

          .lc-journey-loop {
            aspect-ratio: auto;
            display: flex;
            flex-direction: column;
            gap: 0;
            padding: 0;
            --step-offset-x: 0px;
            --circle-shift-x: 0rem;
            transform: none;
          }

          .lc-loop-track-wrapper,
          .lc-loop-track {
            display: none;
          }

          .lc-loop-step {
            position: relative;
            transform: none !important;
            flex-direction: row;
            max-width: 100%;
            text-align: left;
            width: 100%;
            gap: 1rem;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid rgba(196, 112, 77, 0.1);
          }

          .lc-loop-step:nth-child(n) {
            top: auto !important;
            left: auto !important;
          }

          .lc-loop-label {
            font-size: 0.9375rem;
          }

          .lc-loop-arrow {
            display: none;
          }

          .lc-endpoint-arrow {
            display: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .lc-loop-track,
          .lc-track-pulse {
            animation: none !important;
          }
          .lc-loop-track {
            transform: translate(-50%, -50%);
            scale: 1;
          }
          .lc-loop-number,
          .lc-loop-label,
          .lc-loop-arrow {
            transition: none;
          }
          .lc-loop-step:hover .lc-loop-number {
            transform: none;
          }
          .lc-loop-step:hover .lc-loop-arrow {
            transform: none;
          }
          /* Preserve base arrow rotation without animation */
          .lc-loop-step:nth-child(2) .lc-loop-arrow,
          .lc-loop-step:nth-child(2):hover .lc-loop-arrow { transform: rotate(45deg); }
          .lc-loop-step:nth-child(3) .lc-loop-arrow,
          .lc-loop-step:nth-child(3):hover .lc-loop-arrow { transform: rotate(135deg); }
          .lc-loop-step:nth-child(4) .lc-loop-arrow,
          .lc-loop-step:nth-child(4):hover .lc-loop-arrow { transform: rotate(225deg); }
          .lc-loop-step:nth-child(5) .lc-loop-arrow,
          .lc-loop-step:nth-child(5):hover .lc-loop-arrow { transform: rotate(315deg); }
        }

        /* High contrast mode */
        @media (forced-colors: active) {
          .lc-loop-number {
            border: 2px solid ButtonText;
          }
          .lc-loop-label {
            color: CanvasText;
          }
          .lc-loop-track circle {
            stroke: ButtonText;
          }
          .lc-loop-arrow {
            color: LinkText;
          }
        }

        /* Connecting line SVG */
        .lc-connecting-line {
          position: absolute;
          top: 470px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 100%;
          pointer-events: none;
          opacity: 0.3;
        }

        @media (max-width: 1024px) {
          .lc-connecting-line {
            display: none;
          }
        }

        .lc-system-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          align-items: stretch;
        }

        @media (max-width: 1024px) {
          .lc-system-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .lc-system-grid {
            grid-template-columns: 1fr;
          }
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
          align-items: flex-start;
          gap: 0.5rem;
          margin-top: auto;
        }

        .lc-card-outcome svg {
          flex-shrink: 0;
          margin-top: 0.15rem;
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

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={sectionVariants}
      >
        {/* Decorative connecting line with draw animation */}
        <svg className="lc-connecting-line" viewBox="0 0 800 500">
          <motion.path
            d="M 50,80 L 750,80 C 750,160 720,240 500,270 C 280,300 100,370 50,420 L 750,420"
            stroke="#C4704D"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 4"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  pathLength: { duration: 2.4, ease: EASING.gentle },
                  opacity: { duration: TIMING.fast },
                },
              },
            }}
          />
        </svg>

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
            One ecosystem. Infinite clarity.
          </motion.h2>
          <motion.p
            className="lc-section-description"
            variants={fadeInUpSoft}
          >
            Everything you do on Lorem Curae strengthens the next step. Your skin survey unlocks tailored recommendations. Your ingredient understanding shapes smarter comparisons. Your routines and progress help Curae learn with you. It's not a set of tools — it's a guided journey built around your skin.
          </motion.p>

          {/* Journey cycle - top step, circle loop (steps 2-5), bottom step */}
          <motion.div
            className="lc-journey-wrapper"
            variants={prefersReducedMotion ? undefined : revealContainerVariants}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView={prefersReducedMotion ? undefined : "visible"}
            viewport={viewportOnce}
            role="list"
            aria-label="Your skincare journey cycle"
          >
            {/* Step 1 - above circle (reveals first: delay 0s) */}
            <motion.div
              className="lc-journey-endpoint lc-journey-top"
              variants={prefersReducedMotion ? undefined : createStepRevealVariants(0)}
              role="listitem"
            >
              <span className="lc-loop-number" aria-hidden="true">1</span>
              <span className="lc-loop-label">{journeySteps[0]}</span>
            </motion.div>

            {/* Arrow: Step 1 → Circle */}
            <motion.span
              className="lc-endpoint-arrow lc-arrow-top lc-arrow-down"
              aria-hidden="true"
              animate={prefersReducedMotion ? undefined : endpointArrowFloat}
            >
              <InwardArrow />
            </motion.span>

            {/* Circular loop - steps 2–5 */}
            <motion.div
              className="lc-journey-loop"
              variants={prefersReducedMotion ? undefined : revealContainerVariants}
              role="presentation"
            >
              {/* Dashed circular track (independently positionable) */}
              <div className="lc-loop-track-wrapper" aria-hidden="true">
                <svg className="lc-loop-track" viewBox="0 0 200 200" fill="none">
                  <circle
                    className="lc-track-base"
                    cx="100" cy="100" r="97"
                    stroke="rgba(196,112,77,0.25)"
                    strokeWidth="2"
                    strokeDasharray="10 41"
                  />
                  <circle
                    className="lc-track-pulse"
                    cx="100" cy="100" r="97"
                    stroke="rgba(196,112,77,0.25)"
                    strokeWidth="2"
                    strokeDasharray="10 41"
                    strokeDashoffset="-25.5"
                  />
                </svg>
              </div>

              {/* Steps 2–5 positioned around the circle */}
              {journeySteps.slice(1, 5).map((step, index) => (
                <LoopStep
                  key={step}
                  step={step}
                  index={index}
                  reducedMotion={!!prefersReducedMotion}
                />
              ))}
            </motion.div>

            {/* Arrow: Circle → Step 6 (points down toward Step 6) */}
            <motion.span
              className="lc-endpoint-arrow lc-endpoint-arrow-bottom"
              aria-hidden="true"
              animate={prefersReducedMotion ? undefined : endpointArrowFloat}
            >
              <InwardArrow />
            </motion.span>

            {/* Step 6 - below circle (reveals last: delay 5.5s) */}
            <motion.div
              className="lc-journey-endpoint lc-journey-bottom"
              variants={prefersReducedMotion ? undefined : createStepRevealVariants(5.5)}
              role="listitem"
            >
              <span className="lc-loop-number" aria-hidden="true">6</span>
              <span className="lc-loop-label">{journeySteps[5]}</span>
            </motion.div>
          </motion.div>
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
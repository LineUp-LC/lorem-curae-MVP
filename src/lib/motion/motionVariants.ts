/**
 * Lorem Curae Motion Design System
 * 
 * Motion Philosophy:
 * - Soft, slow, premium feel
 * - Calm and intentional - never bouncy or playful
 * - Science-backed elegance
 * - Human warmth with subtle sophistication
 * 
 * Easing curves use cubic-bezier for smooth, natural motion
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// TIMING CONSTANTS
// ============================================

export const TIMING = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
  slower: 1.0,
  slowest: 1.2,
} as const;

// ============================================
// EASING CURVES
// Premium, smooth easing - never bouncy
// ============================================

export const EASING = {
  // Smooth ease out - most common for entrances
  smooth: [0.25, 0.1, 0.25, 1.0] as const,
  // Gentle deceleration - for subtle reveals
  gentle: [0.4, 0.0, 0.2, 1.0] as const,
  // Premium feel - slow start, smooth finish
  premium: [0.6, 0.0, 0.2, 1.0] as const,
  // Natural movement
  natural: [0.4, 0.0, 0.6, 1.0] as const,
  // For exits
  exit: [0.4, 0.0, 1.0, 1.0] as const,
};

// ============================================
// BASE TRANSITIONS
// ============================================

export const transitions: Record<string, Transition> = {
  default: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
  slow: {
    duration: TIMING.slow,
    ease: EASING.gentle,
  },
  premium: {
    duration: TIMING.slower,
    ease: EASING.premium,
  },
  fast: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
};

// ============================================
// FADE VARIANTS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
};

export const fadeInUpSoft: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.premium,
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.slow,
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.slow,
  },
};

// ============================================
// SLIDE VARIANTS
// ============================================

export const slideInFromLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
};

export const slideInFromBottom: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
};

// ============================================
// SCALE VARIANTS
// ============================================

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.slow,
  },
};

export const zoomIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.premium,
  },
};

export const zoomInSoft: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.slow,
  },
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// For grid layouts - randomized feel
export const staggerGrid: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// STAGGER CHILDREN VARIANTS
// ============================================

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
};

export const staggerItemScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 10,
  },
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

// ============================================
// HOVER VARIANTS
// ============================================

export const hoverLift = {
  y: -4,
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

export const hoverScaleSoft = {
  scale: 1.01,
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

export const hoverGlow = {
  boxShadow: '0 20px 40px rgba(196, 112, 77, 0.15)',
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

// Button hover with scale and shadow
export const buttonHover = {
  scale: 1.02,
  y: -2,
  boxShadow: '0 10px 30px rgba(196, 112, 77, 0.25)',
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

export const buttonTap = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: EASING.smooth,
  },
};

// Card hover
export const cardHover = {
  y: -6,
  boxShadow: '0 25px 50px rgba(45, 42, 38, 0.08)',
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

// ============================================
// SVG PATH ANIMATION
// For drawing lines/icons
// ============================================

export const drawPath: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: TIMING.slower,
        ease: EASING.gentle,
      },
      opacity: {
        duration: TIMING.fast,
      },
    },
  },
};

export const drawPathSlow: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: TIMING.slowest,
        ease: EASING.natural,
      },
      opacity: {
        duration: TIMING.fast,
      },
    },
  },
};

// ============================================
// SPECIAL EFFECTS
// ============================================

// Soft pulse for attention (AI icon, etc.)
export const softPulse: Variants = {
  initial: {
    opacity: 0.7,
    scale: 1,
  },
  animate: {
    opacity: [0.7, 1, 0.7],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: EASING.natural,
    },
  },
};

// Gentle float
export const gentleFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: EASING.natural,
    },
  },
};

// Highlight flash (for conflict detection)
export const highlightFlash: Variants = {
  initial: {
    backgroundColor: 'transparent',
  },
  flash: {
    backgroundColor: ['transparent', 'rgba(196, 112, 77, 0.15)', 'transparent'],
    transition: {
      duration: 0.8,
      ease: EASING.gentle,
    },
  },
};

// ============================================
// MODAL / OVERLAY VARIANTS
// ============================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.gentle,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

// ============================================
// PARALLAX HELPERS
// ============================================

export const createParallaxVariant = (offset: number): Variants => ({
  hidden: { y: offset },
  visible: {
    y: 0,
    transition: {
      duration: TIMING.slower,
      ease: EASING.gentle,
    },
  },
});

// ============================================
// COUNTER ANIMATION HELPER
// For count-up effects
// ============================================

export const counterTransition: Transition = {
  duration: 2,
  ease: EASING.gentle,
};

// ============================================
// VIEWPORT SETTINGS
// Common viewport configurations
// ============================================

export const viewportOnce = {
  once: true,
  margin: '-50px',
};

export const viewportRepeat = {
  once: false,
  margin: '-100px',
  amount: 0.3,
};

// ============================================
// COMPOSED ANIMATIONS
// Ready-to-use animation props
// ============================================

export const animateOnScroll = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: viewportOnce,
};

export const animateOnScrollRepeat = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: viewportRepeat,
};

// ============================================
// CSS ANIMATION SNIPPETS
// For non-Framer animations
// ============================================

export const cssAnimations = {
  // Animated gradient background
  animatedGradient: `
    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
    
    .lc-animated-gradient {
      background: linear-gradient(
        135deg,
        #FDF8F5 0%,
        #E8D4CC 25%,
        #FDF8F5 50%,
        #E8A888 75%,
        #FDF8F5 100%
      );
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
    }
  `,
  
  // Cursor blink for typing effect
  cursorBlink: `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    .lc-cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: #C4704D;
      margin-left: 2px;
      animation: blink 1s infinite;
    }
  `,
  
  // Soft glow pulse
  glowPulse: `
    @keyframes glowPulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(196, 112, 77, 0.2);
      }
      50% {
        box-shadow: 0 0 40px rgba(196, 112, 77, 0.4);
      }
    }
    
    .lc-glow-pulse {
      animation: glowPulse 3s ease-in-out infinite;
    }
  `,
  
  // Underline slide in
  underlineSlide: `
    .lc-underline-hover {
      position: relative;
    }
    
    .lc-underline-hover::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background: #C4704D;
      transition: width 0.3s ease;
    }
    
    .lc-underline-hover:hover::after {
      width: 100%;
    }
  `,
  
  // Typewriter effect
  typewriter: `
    @keyframes typewriter {
      from { width: 0; }
      to { width: 100%; }
    }
    
    .lc-typewriter {
      overflow: hidden;
      white-space: nowrap;
      animation: typewriter 3s steps(40) forwards;
    }
  `,
};

// ============================================
// TYPE EXPORTS
// ============================================

export type MotionVariant = typeof fadeInUp;
export type MotionTransition = typeof transitions.default;
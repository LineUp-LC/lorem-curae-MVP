import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import {
  fadeInUpSoft,
  viewportOnce,
  EASING,
  TIMING,
} from '../../../lib/motion/motionVariants';

/**
 * TestimonialSection Component
 * 
 * Motion design:
 * - Quote: soft fade + slight lift with AnimatePresence
 * - Author: staggered reveal
 * - Dots: scale animation on active
 * - Stats: count-up animation on scroll
 */

const quoteVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.premium,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

// Counter component for animated numbers
function AnimatedCounter({ 
  target, 
  suffix = '', 
  duration = 2,
  decimals = 0,
}: { 
  target: number; 
  suffix?: string; 
  duration?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration,
        ease: EASING.gentle,
        onUpdate: (value) => {
          if (decimals > 0) {
            setCount(parseFloat(value.toFixed(decimals)));
          } else {
            setCount(Math.round(value));
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, target, duration, decimals]);
  
  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
    </span>
  );
}

const testimonials = [
  {
    quote: "For the first time, I felt like someone understood my skin instead of trying to sell me something.",
    name: "Sarah M.",
    skin: "Combination Skin",
    journey: ""
  },
  {
    quote: "I stopped guessing. I finally understood my skin — and everything changed.",
    name: "Daniel R.",
    skin: "Oily Skin",
    journey: ""
  },
  {
    quote: "I didn't feel alone anymore. The guidance finally made skincare make sense.",
    name: "Keisha L.",
    skin: "Sensitive Skin",
    journey: ""
  },
];

const stats = [
  { number: 10000, suffix: '+', label: 'Community Members', decimals: 0 },
  { number: 100, suffix: '+', label: 'Marketplace Brands', decimals: 0 },
  { number: 1200, suffix: '+', label: 'Ingredients Decoded', decimals: 0 },
  { number: 4.9, suffix: '', label: 'App Store Rating', decimals: 1 },
];

export default function TestimonialSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="lc-testimonial-section" id="community">
      <style>{`
        .lc-testimonial-section {
          padding: 6rem 2rem;
          background: white;
        }
        
        .lc-testimonial-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        
        .lc-section-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #C4704D;
          margin-bottom: 2rem;
          display: block;
        }
        
        .lc-quote-container {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .lc-testimonial-quote {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: #2D2A26;
        }
        
        .lc-testimonial-author {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
        }
        
        .lc-author-name {
          font-size: 1rem;
          font-weight: 600;
          color: #2D2A26;
          margin-bottom: 0.25rem;
        }
        
        .lc-author-details {
          font-size: 0.875rem;
          color: #6B635A;
        }
        
        .lc-testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        
        .lc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(196, 112, 77, 0.2);
          cursor: pointer;
          border: none;
          padding: 0;
          transition: all 0.3s ease;
        }
        
        .lc-dot.active {
          background: #C4704D;
          width: 24px;
          border-radius: 4px;
        }
        
        .lc-social-proof {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(196, 112, 77, 0.1);
        }
        
        .lc-proof-stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          flex-wrap: wrap;
        }
        
        .lc-stat-item {
          text-align: center;
        }
        
        .lc-stat-number {
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: #C4704D;
          margin-bottom: 0.25rem;
        }
        
        .lc-stat-label {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
          font-size: 0.875rem;
          color: #6B635A;
        }
        
        @media (max-width: 768px) {
          .lc-testimonial-section {
            padding: 4rem 1.5rem;
          }
          
          .lc-proof-stats {
            gap: 2rem;
          }
          
          .lc-stat-number {
            font-size: 2rem;
          }
        }
      `}</style>

      <motion.div
        className="lc-testimonial-container"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span
          className="lc-section-label"
          variants={fadeInUpSoft}
        >
          You're not the only one who felt lost before finding clarity.
        </motion.span>
        
        {/* Quote with AnimatePresence for smooth transitions */}
        <div className="lc-quote-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              variants={quoteVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <blockquote className="lc-testimonial-quote">
                "{testimonials[activeTestimonial].quote}"
              </blockquote>
              
              <div className="lc-testimonial-author">
                <div className="lc-author-name">{testimonials[activeTestimonial].name}</div>
                <div className="lc-author-details">
                  {testimonials[activeTestimonial].skin}{testimonials[activeTestimonial].journey && ` • ${testimonials[activeTestimonial].journey}`}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation dots with scale animation */}
        <div className="lc-testimonial-dots">
          {testimonials.map((_, i) => (
            <motion.button 
              key={i} 
              className={`lc-dot ${i === activeTestimonial ? 'active' : ''}`}
              onClick={() => setActiveTestimonial(i)}
              aria-label={`View testimonial ${i + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        
        {/* Stats with count-up animation */}
        <motion.div 
          className="lc-social-proof"
          variants={fadeInUpSoft}
        >
          <div className="lc-proof-stats">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="lc-stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: TIMING.normal,
                  ease: EASING.gentle,
                }}
              >
                <div className="lc-stat-number">
                  <AnimatedCounter 
                    target={stat.number} 
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="lc-stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
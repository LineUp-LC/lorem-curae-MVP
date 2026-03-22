/**
 * PersonalizingLoader — contextual loading indicator for scan flow AI/web features.
 *
 * Renders a pulsing icon, cycling status messages, and an indeterminate progress bar.
 * Used exclusively in the /scan result page for AI analysis and web search states.
 */

import { useState, useEffect } from 'react';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';

interface PersonalizingLoaderProps {
  steps: string[];
  stepInterval?: number;
  icon?: 'ai' | 'search';
}

export default function PersonalizingLoader({
  steps,
  stepInterval = 2500,
  icon = 'ai',
}: PersonalizingLoaderProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (steps.length <= 1) return;
    const timer = setInterval(() => {
      setStepIdx(prev => (prev + 1) % steps.length);
    }, stepInterval);
    return () => clearInterval(timer);
  }, [steps, stepInterval]);

  return (
    <div className="bg-cream/50 rounded-xl p-6 flex flex-col items-center gap-3">
      {/* Pulsing icon */}
      <div className="personalizing-loader-pulse">
        {icon === 'ai' ? (
          <NeuralBloomIcon className="w-6 h-6 text-primary" />
        ) : (
          <i className="ri-search-line text-xl text-primary" />
        )}
      </div>

      {/* Cycling step text */}
      <p className="text-sm text-warm-gray text-center transition-opacity duration-300">
        {steps[stepIdx]}
      </p>

      {/* Indeterminate progress bar */}
      <div className="w-full max-w-[200px] h-[2px] bg-primary/15 rounded-full overflow-hidden">
        <div className="personalizing-loader-bar h-full bg-primary rounded-full" />
      </div>

      {/* Inline styles for animations — scoped to this component */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .personalizing-loader-pulse {
            animation: personalizing-pulse 2s ease-in-out infinite;
          }
          .personalizing-loader-bar {
            width: 40%;
            animation: personalizing-slide 1.8s infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .personalizing-loader-bar {
            width: 100%;
            opacity: 0.4;
          }
        }
        @keyframes personalizing-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes personalizing-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

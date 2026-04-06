/**
 * PersonalizingLoader — contextual loading indicator for scan flow AI/web features.
 *
 * Renders a pulsing icon, cycling status messages, and an indeterminate progress bar.
 * Used exclusively in the /scan result page for AI analysis and web search states.
 */

import { useState, useEffect, useRef } from 'react';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';

interface PersonalizingLoaderProps {
  steps: string[];
  stepInterval?: number;
  icon?: 'ai' | 'search';
  /** When provided (0-100), renders a determinate progress bar with percentage label. */
  progress?: number;
  /** Called 250ms after progress reaches 100. Use to delay parent unmount so the completed bar is visible. */
  onComplete?: () => void;
}

export default function PersonalizingLoader({
  steps,
  stepInterval = 2500,
  icon = 'ai',
  progress,
  onComplete,
}: PersonalizingLoaderProps) {
  const isDeterminate = progress !== undefined;

  const [stepIdx, setStepIdx] = useState(0);

  // Internal display value — creeps smoothly between hard thresholds passed by consumers
  const [displayProgress, setDisplayProgress] = useState(progress ?? 0);
  // Ceiling for current creep stage: threshold + headroom, never reaches next real threshold early
  const creepCapRef = useRef(progress ?? 0);

  // Keep onComplete ref in sync so the timeout always calls the latest callback
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Snap display to new threshold immediately, then set a new creep ceiling
  useEffect(() => {
    if (progress === undefined) return;
    setDisplayProgress(progress);
    // Cap = threshold + 15%, hard ceiling at 99 (100 reserved for real completion)
    creepCapRef.current = progress === 100 ? 100 : Math.min(99, progress + 15);
  }, [progress]);

  // Smooth creep interval: ease-out feel — fast near floor, slow near ceiling
  useEffect(() => {
    if (!isDeterminate) return;
    const id = setInterval(() => {
      setDisplayProgress(prev => {
        const cap = creepCapRef.current;
        if (prev >= cap) return prev;
        // Proportional step shrinks as gap closes → natural ease-out
        const gap = cap - prev;
        const step = Math.max(0.1, Math.min(1.2, gap * 0.05));
        return Math.min(cap, prev + step);
      });
    }, 200);
    return () => clearInterval(id);
  }, [isDeterminate]);

  // When real progress reaches 100, hold for 250ms then call onComplete
  useEffect(() => {
    if (progress === undefined || progress < 100) return;
    const t = setTimeout(() => { onCompleteRef.current?.(); }, 250);
    return () => clearTimeout(t);
  }, [progress]);

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

      {/* Progress bar */}
      <div className="w-full max-w-[200px] h-[3px] bg-primary/15 rounded-full overflow-hidden">
        {isDeterminate ? (
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
          />
        ) : (
          <div className="personalizing-loader-bar h-full bg-primary rounded-full" />
        )}
      </div>

      {/* Percentage label (determinate only) */}
      {isDeterminate && (
        <span className="text-xs font-medium text-primary tabular-nums">{Math.round(displayProgress)}%</span>
      )}

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

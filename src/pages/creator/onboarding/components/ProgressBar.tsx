import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Welcome', 'Profile', 'Verification', 'Terms'];

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Step indicators */}
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={label}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : isActive
                        ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                        : 'bg-blush-200 text-warm-gray'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isActive || isCompleted ? 'text-deep' : 'text-warm-gray'}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress line */}
      <div className="relative h-1 bg-blush-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
        />
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  scrollBlock?: ScrollLogicalPosition;
  action?: () => void; // Optional action to run before showing step
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'time-filter',
    title: 'Morning or Evening',
    description: 'Switch between Morning and Evening routines using the toggle. Each has steps optimized for that time of day — sunscreen for AM, treatments for PM.',
    icon: 'ri-sun-line',
    targetSelector: '[title="Show only morning routine steps (cleansing, SPF, etc.)"]',
    position: 'bottom',
    scrollBlock: 'center',
  },
  {
    id: 'routine-steps',
    title: 'Your Routine Steps',
    description: 'Each card is a step in your routine. Steps marked "Recommended" are essential for most skin types. Browse products to add them to each step.',
    icon: 'ri-layout-grid-line',
    targetSelector: '.routine-steps-container',
    position: 'right',
    scrollBlock: 'center',
  },
  {
    id: 'drag-drop',
    title: 'Drag to Reorder',
    description: 'Use the grip handle in the top-right corner of any step card to drag and reorder your routine. Customize the order that works for you.',
    icon: 'ri-drag-move-line',
    targetSelector: '[data-tutorial="first-drag-handle"]',
    position: 'left',
    scrollBlock: 'center',
  },
  {
    id: 'custom-steps',
    title: 'Add Custom Steps',
    description: 'Need something specific? Click "+ Add Custom Step" for products like essences, face mists, or spot treatments that don\'t fit standard steps.',
    icon: 'ri-add-circle-line',
    targetSelector: '[class*="border-dashed"][class*="border-primary"]',
    position: 'left',
    scrollBlock: 'center',
  },
  {
    id: 'completion-tracking',
    title: 'Track Daily Completion',
    description: 'Once you\'ve added products, a checkmark circle appears in the top-left of each step card. Check off steps as you complete your routine — progress resets daily so you can track consistency over time.',
    icon: 'ri-checkbox-circle-line',
    targetSelector: '.routine-steps-container .border-blush',
    position: 'right',
    scrollBlock: 'center',
  },
  {
    id: 'notes-tab',
    title: 'Routine Notes',
    description: 'Switch to the "Routine Notes" tab to journal how your skin looks and feels. Add photos, track reactions, and note what\'s working.',
    icon: 'ri-file-text-line',
    targetSelector: '[title="Track daily observations and skin progress"]',
    position: 'bottom',
    scrollBlock: 'center',
  },
  {
    id: 'progress-assessment',
    title: 'Progress Assessment',
    description: 'In the Notes tab, use "Progress Assessment" to analyze your skincare journey over a selected time period, receiving personalized insights and suggestions.',
    icon: 'ri-line-chart-line',
    targetSelector: '[data-tutorial="progress-assessment"]',
    position: 'bottom',
    scrollBlock: 'center',
    action: () => {
      // Click the Notes tab to switch to it
      const notesTab = document.querySelector('[title="Track daily observations and skin progress"]') as HTMLElement;
      if (notesTab) notesTab.click();
    },
  },
];

interface RoutineTutorialProps {
  onComplete: () => void;
}

interface ModalPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export default function RoutineTutorial({ onComplete }: RoutineTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [modalPosition, setModalPosition] = useState<ModalPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  // Calculate modal position based on target element
  const calculatePosition = useCallback(() => {
    const target = document.querySelector(step.targetSelector);
    if (!target || !modalRef.current) {
      // Fallback to center if target not found
      setModalPosition(null);
      setTargetRect(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const modalWidth = 380;
    const modalHeight = modalRef.current.offsetHeight || 400;
    const padding = 24; // Increased padding
    const arrowOffset = 20; // Increased offset to keep modal away from target

    setTargetRect(rect);

    let top = 0;
    let left = 0;
    let arrowPosition = step.position;

    // Calculate position based on step's preferred position
    switch (step.position) {
      case 'bottom':
        top = rect.bottom + arrowOffset + padding;
        left = rect.left + rect.width / 2 - modalWidth / 2;
        arrowPosition = 'top';
        break;
      case 'top':
        top = rect.top - modalHeight - arrowOffset - padding;
        left = rect.left + rect.width / 2 - modalWidth / 2;
        arrowPosition = 'bottom';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - modalHeight / 2;
        left = rect.left - modalWidth - arrowOffset - padding;
        arrowPosition = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - modalHeight / 2;
        left = rect.right + arrowOffset + padding;
        arrowPosition = 'left';
        break;
    }

    // Keep modal within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) left = padding;
    if (left + modalWidth > viewportWidth - padding) left = viewportWidth - modalWidth - padding;
    if (top < padding) top = padding;
    if (top + modalHeight > viewportHeight - padding) top = viewportHeight - modalHeight - padding;

    setModalPosition({ top, left, arrowPosition });
  }, [step]);

  // Recalculate on step change and window resize
  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [calculatePosition]);

  // Add highlight to target element and scroll into view
  useEffect(() => {
    // Run action first if present (e.g., switch tabs)
    if (step.action) {
      step.action();
    }

    // Small delay to let any tab switch complete
    const timeoutId = setTimeout(() => {
      const target = document.querySelector(step.targetSelector) as HTMLElement;
      if (target) {
        // Scroll target into view with smooth animation
        target.scrollIntoView({
          behavior: 'smooth',
          block: step.scrollBlock || 'center',
          inline: 'nearest'
        });

        // Delay to let scroll complete before repositioning modal
        setTimeout(() => {
          calculatePosition();
        }, 400);

        target.style.zIndex = '45';
        target.style.boxShadow = '0 0 0 4px rgba(196, 112, 77, 0.3), 0 0 20px rgba(196, 112, 77, 0.2)';
        target.style.borderRadius = '12px';
        target.style.transition = 'box-shadow 0.3s ease';
      }
    }, step.action ? 300 : 0);

    return () => {
      clearTimeout(timeoutId);
      // Clean up highlight from target
      const target = document.querySelector(step.targetSelector) as HTMLElement;
      if (target) {
        target.style.boxShadow = '';
        target.style.zIndex = '';
      }
    };
  }, [step, calculatePosition]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('routineBuilderTutorialComplete', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  // Arrow component based on position
  const Arrow = ({ position }: { position: string }) => {
    const baseClasses = "absolute w-0 h-0";
    const arrowSize = "border-8";

    switch (position) {
      case 'top':
        return (
          <div className={`${baseClasses} left-1/2 -translate-x-1/2 -top-4 ${arrowSize} border-l-transparent border-r-transparent border-t-transparent border-b-white`} />
        );
      case 'bottom':
        return (
          <div className={`${baseClasses} left-1/2 -translate-x-1/2 -bottom-4 ${arrowSize} border-l-transparent border-r-transparent border-b-transparent border-t-white`} />
        );
      case 'left':
        return (
          <div className={`${baseClasses} top-1/2 -translate-y-1/2 -left-4 ${arrowSize} border-t-transparent border-b-transparent border-l-transparent border-r-white`} />
        );
      case 'right':
        return (
          <div className={`${baseClasses} top-1/2 -translate-y-1/2 -right-4 ${arrowSize} border-t-transparent border-b-transparent border-r-transparent border-l-white`} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Semi-transparent overlay - visible but not blocking */}
      <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none" />

      {/* Positioned Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 w-[380px] max-w-[calc(100vw-32px)]"
        style={modalPosition ? {
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          transition: 'top 0.3s ease, left 0.3s ease',
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Arrow */}
          {modalPosition && <Arrow position={modalPosition.arrowPosition} />}

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-warm-gray">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                Skip Tutorial
              </button>
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <i className={`${step.icon} text-primary text-2xl`}></i>
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-serif font-bold text-deep text-center mb-2">
              {step.title}
            </h3>
            <p className="text-warm-gray text-center text-sm mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Step Dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === currentStep
                      ? 'bg-primary w-5'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-deep rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium text-sm cursor-pointer"
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

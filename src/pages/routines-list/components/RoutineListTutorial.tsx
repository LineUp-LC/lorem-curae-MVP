import { useState, useEffect, useRef, useCallback } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetSelector?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'routine-cards',
    title: 'Your Routines',
    description: 'Build your routine and each card will represent a saved routine. You\'ll be able to see the name, step count, AM/PM breakdown, and completion at a glance.',
    icon: 'ri-layout-grid-line',
    targetSelector: '[data-tutorial="build-routine"]',
  },
  {
    id: 'edit-routine',
    title: 'Edit Your Routine',
    description: 'Tap "Edit" to open the Routine Builder and adjust steps, reorder products, or add new ones to your routine.',
    icon: 'ri-pencil-line',
  },
  {
    id: 'routine-notes',
    title: 'Routine Notes',
    description: 'Tap "Notes" to journal how your skin looks and feels after following your routine. Add photos & track reactions. Your entries build a timeline of your skincare journey.',
    icon: 'ri-file-text-line',
  },
  {
    id: 'progress-assessment',
    title: 'Progress Assessment',
    description: 'Inside Notes, use "Progress Assessment" to analyze your skincare journey over a selected time period. Curae provides personalized insights and suggestions based on your tracked data.',
    icon: 'ri-line-chart-line',
  },
  {
    id: 'version-history',
    title: 'Version History',
    description: 'Every time you update a routine, a new version is saved. Tap the history icon to view past versions and see how your routine has evolved over time.',
    icon: 'ri-history-line',
  },
  {
    id: 'kebab-menu',
    title: 'Share or Delete',
    description: 'Tap the three-dot menu on any routine card to share your routine with others or delete it entirely.',
    icon: 'ri-more-2-fill',
  },
];

interface RoutineListTutorialProps {
  onComplete: () => void;
}

export default function RoutineListTutorial({ onComplete }: RoutineListTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const hasTarget = !!step.targetSelector;

  const calculatePosition = useCallback(() => {
    if (!step.targetSelector) {
      setPosition(null);
      return;
    }

    const target = document.querySelector(step.targetSelector) as HTMLElement;
    const modal = modalRef.current;
    if (!target || !modal) {
      setPosition(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const modalWidth = modal.offsetWidth || 360;
    const modalHeight = modal.offsetHeight || 300;
    const gap = 16;
    const padding = 16;
    const viewportWidth = window.innerWidth;

    // Try right side first
    let left = rect.right + gap;
    let top = rect.top + rect.height / 2 - modalHeight / 2;

    // If not enough room on right, try below
    if (left + modalWidth > viewportWidth - padding) {
      left = rect.left + rect.width / 2 - modalWidth / 2;
      top = rect.bottom + gap;
    }

    // Clamp within viewport
    if (left < padding) left = padding;
    if (left + modalWidth > viewportWidth - padding) left = viewportWidth - modalWidth - padding;
    if (top < padding) top = padding;

    setPosition({ top, left });
  }, [step]);

  // Position + highlight for targeted steps
  useEffect(() => {
    if (!step.targetSelector) {
      setPosition(null);
      return;
    }

    const target = document.querySelector(step.targetSelector) as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.position = 'relative';
      target.style.zIndex = '45';
      target.style.boxShadow = '0 0 0 4px rgba(196, 112, 77, 0.3), 0 0 20px rgba(196, 112, 77, 0.15)';
      target.style.transition = 'box-shadow 0.3s ease';

      // Delay to let scroll finish before positioning
      const timer = setTimeout(calculatePosition, 350);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
        target.style.boxShadow = '';
        target.style.zIndex = '';
      };
    }
  }, [step, calculatePosition]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('routineListTutorialComplete', 'true');
    onComplete();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`fixed z-50 max-w-sm w-full ${hasTarget && position ? '' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-4'}`}
        style={hasTarget && position ? {
          top: `${position.top}px`,
          left: `${position.left}px`,
          transition: 'top 0.3s ease, left 0.3s ease',
        } : undefined}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                onClick={handleComplete}
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

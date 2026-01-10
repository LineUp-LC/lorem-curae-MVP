import { useState } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'time-filter',
    title: 'Choose Your Routine Time',
    description: 'Filter your routine by Morning, Evening, or view Both. Each time has specific steps optimized for that part of your day.',
    icon: 'ri-time-line',
  },
  {
    id: 'routine-steps',
    title: 'Your Routine Steps',
    description: 'Scroll horizontally to see all your skincare steps. Each card represents one step in your routine, from cleanser to moisturizer.',
    icon: 'ri-list-ordered',
  },
  {
    id: 'drag-drop',
    title: 'Reorder Your Steps',
    description: 'Use the grip handle in the top-right corner of each card to drag and reorder your routine steps.',
    icon: 'ri-drag-move-line',
  },
  {
    id: 'add-products',
    title: 'Add Your Products',
    description: '"Add from Saved" uses products you\'ve bookmarked. "Browse" lets you discover new products that fit each step.',
    icon: 'ri-add-circle-line',
  },
  {
    id: 'routine-summary',
    title: 'Track Your Progress',
    description: 'The summary shows your progress. Once you\'ve added products, hit "Save My Routine" to keep your personalized routine.',
    icon: 'ri-save-line',
  },
  {
    id: 'notes-tab',
    title: 'Track Daily Notes',
    description: 'Switch to the "Routine Notes" tab to log your daily skincare observations. Photos and notes help personalize your AI recommendations.',
    icon: 'ri-file-text-line',
  },
];

interface RoutineTutorialProps {
  onComplete: () => void;
}

export default function RoutineTutorial({ onComplete }: RoutineTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-warm-gray">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-warm-gray hover:text-deep transition-colors"
            >
              Skip Tutorial
            </button>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <i className={`${step.icon} text-primary text-3xl`}></i>
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-serif font-bold text-deep text-center mb-4">
            {step.title}
          </h3>
          <p className="text-warm-gray text-center mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Step Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary w-6'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-deep rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

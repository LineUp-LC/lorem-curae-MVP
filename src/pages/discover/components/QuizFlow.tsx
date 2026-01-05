import { useState } from 'react';

interface QuizFlowProps {
  onComplete: (data: any) => void;
}

const QuizFlow = ({ onComplete }: QuizFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const questions = [
    {
      id: 'skinType',
      question: 'What is your skin type?',
      subtitle: 'Choose the option that best describes your skin',
      options: [
        { value: 'dry', label: 'Dry', icon: 'ri-drop-line', description: 'Tight, flaky, or rough texture' },
        { value: 'oily', label: 'Oily', icon: 'ri-contrast-drop-line', description: 'Shiny, enlarged pores' },
        { value: 'combination', label: 'Combination', icon: 'ri-contrast-2-line', description: 'Oily T-zone, dry cheeks' },
        { value: 'normal', label: 'Normal', icon: 'ri-checkbox-circle-line', description: 'Balanced, not too oily or dry' },
        { value: 'sensitive', label: 'Sensitive', icon: 'ri-heart-pulse-line', description: 'Easily irritated, reactive' },
      ],
    },
    {
      id: 'concerns',
      question: 'What are your main skin concerns?',
      subtitle: 'Select all that apply',
      multiple: true,
      options: [
        { value: 'acne', label: 'Acne & Breakouts', icon: 'ri-alert-line' },
        { value: 'aging', label: 'Fine Lines & Aging', icon: 'ri-time-line' },
        { value: 'hyperpigmentation', label: 'Dark Spots', icon: 'ri-contrast-drop-2-line' },
        { value: 'redness', label: 'Redness & Irritation', icon: 'ri-heart-pulse-line' },
        { value: 'dullness', label: 'Dull Skin', icon: 'ri-sun-line' },
        { value: 'texture', label: 'Uneven Texture', icon: 'ri-grid-line' },
      ],
    },
    {
      id: 'goals',
      question: 'What are your skincare goals?',
      subtitle: 'Help us personalize your routine',
      multiple: true,
      options: [
        { value: 'hydration', label: 'Deep Hydration', icon: 'ri-water-flash-line' },
        { value: 'brightening', label: 'Brighter Complexion', icon: 'ri-sun-line' },
        { value: 'antiaging', label: 'Anti-Aging', icon: 'ri-time-line' },
        { value: 'clear', label: 'Clear Skin', icon: 'ri-checkbox-circle-line' },
        { value: 'soothing', label: 'Calm & Soothe', icon: 'ri-heart-line' },
        { value: 'glow', label: 'Healthy Glow', icon: 'ri-flashlight-line' },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: string) => {
    const question = questions[currentStep];
    
    if (question.multiple) {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v: string) => v !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: value });
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canProceed = currentQuestion.multiple 
    ? answers[currentQuestion.id]?.length > 0 
    : answers[currentQuestion.id];

  return (
    <div className="min-h-screen py-12 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-taupe">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-taupe rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-serif text-deep-900 mb-4">
            {currentQuestion.question}
          </h1>
          <p className="text-lg text-gray-600">{currentQuestion.subtitle}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.multiple
              ? answers[currentQuestion.id]?.includes(option.value)
              : answers[currentQuestion.id] === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-taupe bg-taupe-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-taupe-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isSelected ? 'bg-taupe text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`${option.icon} text-2xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-deep-900 mb-1">
                      {option.label}
                    </h3>
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <i className="ri-checkbox-circle-fill text-2xl text-taupe"></i>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-deep hover:bg-gray-100 cursor-pointer'
            }`}
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span>Back</span>
          </button>

          {currentQuestion.multiple && (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-8 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                canProceed
                  ? 'bg-taupe text-white hover:bg-taupe-700 shadow-md hover:shadow-lg cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{currentStep === questions.length - 1 ? 'See Results' : 'Continue'}</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizFlow;
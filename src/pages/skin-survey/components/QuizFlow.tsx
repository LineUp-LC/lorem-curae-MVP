import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SurveyData {
  skinType: string[];
  concerns: string[];
  acneType: string[];
  scarringType: string[];
  complexion: string;
  allergens: string[];
  preferences: string[];
  lifestyle: string[];
  routine: string[];
}

// FIXED: Added props interface for onComplete callback
interface QuizFlowProps {
  onComplete?: (data: SurveyData) => void;
}

const QuizFlow = ({ onComplete }: QuizFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    skinType: [],
    concerns: [],
    acneType: [],
    scarringType: [],
    complexion: '',
    allergens: [],
    preferences: [],
    lifestyle: [],
    routine: []
  });
  const [allergenInput, setAllergenInput] = useState('');
  const [allergenSuggestions, setAllergenSuggestions] = useState<string[]>([]);

  const totalSteps = 8;

  const allergensList = [
    'Fragrance', 'Parabens', 'Sulfates', 'Alcohol', 'Silicones', 'Essential oils',
    'Retinoids', 'Alpha hydroxy acids', 'Beta hydroxy acids', 'Benzoyl peroxide',
    'Salicylic acid', 'Glycolic acid', 'Lactic acid', 'Vitamin C', 'Niacinamide',
    'Hyaluronic acid', 'Ceramides', 'Peptides', 'Chemical sunscreens', 'Physical sunscreens'
  ];

  const handleMultiSelect = (category: keyof SurveyData, value: string) => {
    setSurveyData(prev => {
      const current = prev[category];
  
      // Only proceed if this field is an array
      if (!Array.isArray(current)) return prev;
  
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  const handleSingleSelect = (category: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAllergenInput = (value: string) => {
    setAllergenInput(value);
    if (value.length > 0) {
      const filtered = allergensList.filter(allergen =>
        allergen.toLowerCase().includes(value.toLowerCase()) &&
        !surveyData.allergens.includes(allergen)
      );
      setAllergenSuggestions(filtered.slice(0, 5));
    } else {
      setAllergenSuggestions([]);
    }
  };

  const addAllergen = (allergen: string) => {
    if (surveyData.allergens.length < 10 && !surveyData.allergens.includes(allergen)) {
      setSurveyData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergen]
      }));
      setAllergenInput('');
      setAllergenSuggestions([]);
    }
  };

  const removeAllergen = (allergen: string) => {
    setSurveyData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(item => item !== allergen)
    }));
  };

  const getNextStep = () => {
    if (currentStep === 2) {
      // If concerns include acne or scarring, go to specific questions
      if (surveyData.concerns.includes('Scarring') || 
          (surveyData.concerns.includes('Acne Prone') && surveyData.concerns.includes('Scarring'))) {
        return 3; // Scarring type question
      } else if (surveyData.concerns.includes('Acne Prone')) {
        return 4; // Acne type question
      } else {
        return 5; // Skip to complexion
      }
    }
    if (currentStep === 3) {
      // After scarring, check if acne was also selected
      if (surveyData.concerns.includes('Acne Prone')) {
        return 4; // Acne type question
      } else {
        return 5; // Skip to complexion
      }
    }
    return currentStep + 1;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return surveyData.skinType.length > 0;
      case 2: return surveyData.concerns.length > 0;
      case 3: return surveyData.scarringType.length > 0;
      case 4: return surveyData.acneType.length > 0;
      case 5: return surveyData.complexion !== '';
      case 6: return true; // Allergens are optional
      case 7: return surveyData.preferences.length > 0;
      case 8: return surveyData.lifestyle.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your skin type?</h2>
            <p className="text-gray-600 mb-8">Select all that apply to your skin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('skinType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.skinType.includes(type)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What are your skin concerns?</h2>
            <p className="text-gray-600 mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Uneven Skin Tone', 'Dullness', 'Enlarged Pores', 'Textural Irregularities',
                'Damaged Skin Barrier', 'Signs of Aging', 'Acne Prone', 'Sun Protection',
                'Exzema', 'Lack of Hydration', 'Sun Damage', 'Rosacea', 'Dark Circles',
                'Congested skin', 'Scarring', 'Looking for gentle products'
              ].map((concern) => (
                <button
                  key={concern}
                  onClick={() => handleMultiSelect('concerns', concern)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.concerns.includes(concern)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What type of scarring?</h2>
            <p className="text-gray-600 mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Ice Pick', 'Rolling', 'Boxcar'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('scarringType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.scarringType.includes(type)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What type of acne?</h2>
            <p className="text-gray-600 mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Blackheads', 'Whiteheads', 'Pustule', 'Papule', 'Cystic', 'Nodule', 'Fungal'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('acneType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.acneType.includes(type)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your skin complexion?</h2>
            <p className="text-gray-600 mb-8">Select your skin tone</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Very Fair', 'Fair', 'Light', 'Medium', 'Olive', 'Dark', 'Very Dark'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleSingleSelect('complexion', tone)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.complexion === tone
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Any known allergens?</h2>
            <p className="text-gray-600 mb-8">Type to search and add allergens (maximum 10)</p>
            
            <div className="relative mb-6">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => handleAllergenInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && allergenInput.trim()) {
                    addAllergen(allergenInput.trim());
                  }
                }}
                placeholder="Type allergen name..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none"
                disabled={surveyData.allergens.length >= 10}
              />
              
              {allergenSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {allergenSuggestions.map((allergen) => (
                    <button
                      key={allergen}
                      onClick={() => addAllergen(allergen)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                    >
                      {allergen}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {surveyData.allergens.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Selected allergens:</p>
                <div className="flex flex-wrap gap-2">
                  {surveyData.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center space-x-2 bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{allergen}</span>
                      <button
                        onClick={() => removeAllergen(allergen)}
                        className="hover:text-sage-900 cursor-pointer"
                      >
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product preferences</h2>
            <p className="text-gray-600 mb-8">Select your preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Chemicals', 'Vegan', 'Plant-Based', 'Fragrance-free', 'Gluten-Free',
                'Alcohol-Free', 'Silicone-free', 'Cruelty-Free'
              ].map((preference) => (
                <button
                  key={preference}
                  onClick={() => handleMultiSelect('preferences', preference)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.preferences.includes(preference)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lifestyle factors</h2>
            <p className="text-gray-600 mb-8">Tell us about your routine</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Active lifestyle', 'Indoor work environment', 'Frequent travel',
                'High stress levels', 'Limited time for routine', 'Detailed routine preferred',
                'Budget conscious', 'Premium products preferred'
              ].map((factor) => (
                <button
                  key={factor}
                  onClick={() => handleMultiSelect('lifestyle', factor)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.lifestyle.includes(factor)
                      ? 'border-sage-600 bg-sage-50 text-sage-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // FIXED: Call onComplete when quiz is finished
  useEffect(() => {
    if (currentStep > totalSteps && onComplete) {
      onComplete(surveyData);
    }
  }, [currentStep, totalSteps]);

  if (currentStep > totalSteps) {
    return (
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-sage-100 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-3xl text-sage-600"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Survey Completed!</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for completing your skin survey. We're analyzing your responses to create your personalized skincare profile.
          </p>
          <Link
            to="/skin-survey/results"
            className="inline-flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Check Results</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sage-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            currentStep === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-arrow-left-line"></i>
          <span>Previous</span>
        </button>

        <button
          onClick={() => setCurrentStep(getNextStep())}
          disabled={!canProceed()}
          className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            canProceed()
              ? 'bg-sage-600 hover:bg-sage-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Next</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </main>
  );
};

export default QuizFlow;
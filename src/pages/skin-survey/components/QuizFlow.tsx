import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SurveyData {
  sexAtBirth: string;
  skinType: string[];
  concerns: string[];
  acneType: string[];
  scarringType: string[];
  complexion: string;
  allergens: string[];
  preferences: string[];
  lifestyle: string[];
  routine: string[];
  // Extended lifestyle factors
  sleepPattern: string;
  stressLevel: string;
  dietPattern: string;
  waterIntake: string;
  exerciseFrequency: string;
  environmentalExposure: string[];
}

// FIXED: Added props interface for onComplete callback
interface QuizFlowProps {
  onComplete?: (data: SurveyData) => void;
}

const QuizFlow = ({ onComplete }: QuizFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    sexAtBirth: '',
    skinType: [],
    concerns: [],
    acneType: [],
    scarringType: [],
    complexion: '',
    allergens: [],
    preferences: [],
    lifestyle: [],
    routine: [],
    sleepPattern: '',
    stressLevel: '',
    dietPattern: '',
    waterIntake: '',
    exerciseFrequency: '',
    environmentalExposure: []
  });
  const [allergenInput, setAllergenInput] = useState('');
  const [allergenSuggestions, setAllergenSuggestions] = useState<string[]>([]);

  const totalSteps = 14; // Updated total steps to include new lifestyle questions

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
    if (currentStep === 3) {
      // After concerns, check for scarring or acne
      if (surveyData.concerns.includes('Scarring') || 
          (surveyData.concerns.includes('Acne Prone') && surveyData.concerns.includes('Scarring'))) {
        return 4; // Scarring type question
      } else if (surveyData.concerns.includes('Acne Prone')) {
        return 5; // Acne type question
      } else {
        return 6; // Skip to complexion
      }
    }
    if (currentStep === 4) {
      // After scarring, check if acne was also selected
      if (surveyData.concerns.includes('Acne Prone')) {
        return 5; // Acne type question
      } else {
        return 6; // Skip to complexion
      }
    }
    return currentStep + 1;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return surveyData.sexAtBirth !== '';
      case 2: return surveyData.skinType.length > 0;
      case 3: return surveyData.concerns.length > 0;
      case 4: return surveyData.scarringType.length > 0;
      case 5: return surveyData.acneType.length > 0;
      case 6: return surveyData.complexion !== '';
      case 7: return true; // Allergens are optional
      case 8: return surveyData.preferences.length > 0;
      case 9: return surveyData.lifestyle.length > 0;
      case 10: return surveyData.sleepPattern !== '';
      case 11: return surveyData.stressLevel !== '';
      case 12: return surveyData.dietPattern !== '';
      case 13: return surveyData.waterIntake !== '';
      case 14: return surveyData.exerciseFrequency !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      // NEW FIRST QUESTION: Sex at Birth
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">What is your sex assigned at birth?</h2>
            <p className="text-warm-gray mb-8">This helps us tailor recommendations based on biological skin differences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Male', 'Female'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('sexAtBirth', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.sexAtBirth === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">What's your skin type?</h2>
            <p className="text-warm-gray mb-8">Select all that apply to your skin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('skinType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.skinType.includes(type)
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">What are your skin concerns?</h2>
            <p className="text-warm-gray mb-8">Select all that apply</p>
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
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">What type of scarring?</h2>
            <p className="text-warm-gray mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Ice Pick', 'Rolling', 'Boxcar'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('scarringType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.scarringType.includes(type)
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
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
            <h2 className="text-3xl font-bold text-deep mb-4">What type of acne?</h2>
            <p className="text-warm-gray mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Blackheads', 'Whiteheads', 'Papules', 'Pustules', 'Nodules', 'Cysts'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('acneType', type)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.acneType.includes(type)
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">What's your skin tone?</h2>
            <p className="text-warm-gray mb-8">Select your Fitzpatrick skin type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Type I - Very Fair',
                'Type II - Fair',
                'Type III - Medium',
                'Type IV - Olive',
                'Type V - Brown',
                'Type VI - Dark Brown/Black'
              ].map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleSingleSelect('complexion', tone)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.complexion === tone
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">Any known allergens?</h2>
            <p className="text-warm-gray mb-8">Type to search and add allergens (maximum 10)</p>
            
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
                className="w-full p-4 border-2 border-blush rounded-lg focus:border-primary focus:outline-none bg-white text-deep"
                disabled={surveyData.allergens.length >= 10}
              />
              
              {allergenSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-blush rounded-lg shadow-lg z-10 mt-1">
                  {allergenSuggestions.map((allergen) => (
                    <button
                      key={allergen}
                      onClick={() => addAllergen(allergen)}
                      className="w-full p-3 text-left hover:bg-cream transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg text-warm-gray hover:text-deep"
                    >
                      {allergen}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {surveyData.allergens.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-warm-gray mb-3">Selected allergens:</p>
                <div className="flex flex-wrap gap-2">
                  {surveyData.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="inline-flex items-center space-x-2 bg-light/30 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{allergen}</span>
                      <button
                        onClick={() => removeAllergen(allergen)}
                        className="hover:text-dark cursor-pointer"
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

      case 8:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">Product preferences</h2>
            <p className="text-warm-gray mb-8">Select your preferences</p>
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
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">Lifestyle factors</h2>
            <p className="text-warm-gray mb-8">Tell us about your routine preferences</p>
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
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>
        );

      // NEW LIFESTYLE QUESTIONS
      case 10:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">How would you describe your sleep patterns?</h2>
            <p className="text-warm-gray mb-8">Sleep significantly impacts skin health and recovery</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Less than 5 hours',
                '5-6 hours',
                '7-8 hours',
                'More than 8 hours',
                'Irregular/Inconsistent'
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('sleepPattern', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.sleepPattern === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">How would you rate your stress levels?</h2>
            <p className="text-warm-gray mb-8">Stress can trigger various skin conditions and affect healing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Low - Generally calm',
                'Moderate - Occasional stress',
                'High - Frequently stressed',
                'Very High - Chronic stress'
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('stressLevel', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.stressLevel === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 12:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">How would you describe your diet?</h2>
            <p className="text-warm-gray mb-8">Nutrition plays a key role in skin health</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Balanced - Variety of whole foods',
                'Plant-based/Vegetarian',
                'High protein focus',
                'Processed/Fast food heavy',
                'Limited/Restricted diet',
                'Variable/Inconsistent'
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('dietPattern', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.dietPattern === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 13:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">How much water do you typically drink daily?</h2>
            <p className="text-warm-gray mb-8">Hydration is essential for healthy, glowing skin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Less than 4 glasses',
                '4-6 glasses',
                '7-8 glasses',
                'More than 8 glasses'
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('waterIntake', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.waterIntake === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 14:
        return (
          <div>
            <h2 className="text-3xl font-bold text-deep mb-4">How often do you exercise?</h2>
            <p className="text-warm-gray mb-8">Exercise affects circulation and skin health</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Rarely/Never',
                '1-2 times per week',
                '3-4 times per week',
                '5+ times per week',
                'Daily'
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('exerciseFrequency', option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer whitespace-nowrap ${
                    surveyData.exerciseFrequency === option
                      ? 'border-primary bg-primary-50 text-primary-700'
                      : 'border-blush hover:border-primary-300'
                  }`}
                >
                  {option}
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
          <div className="w-20 h-20 mx-auto mb-6 bg-light/30 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-3xl text-primary"></i>
          </div>
          <h1 className="text-4xl font-bold text-deep mb-4">Survey Completed!</h1>
          <p className="text-lg text-warm-gray mb-8 max-w-2xl mx-auto">
            Thank you for completing your skin survey. We're analyzing your responses to create your personalized skincare profile.
          </p>
          <Link
            to="/skin-survey/results"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
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
          <span className="text-sm text-warm-gray">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-warm-gray">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-blush rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-blush mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            currentStep === 1
              ? 'text-warm-gray/50 cursor-not-allowed'
              : 'text-warm-gray hover:text-deep'
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
              ? 'bg-primary hover:bg-dark text-white'
              : 'bg-blush text-warm-gray/50 cursor-not-allowed'
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
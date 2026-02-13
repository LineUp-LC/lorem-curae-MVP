import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';

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

// Skin tone options with Fitzpatrick scale colors
const skinToneOptions = [
  {
    value: 'Type I - Very Fair',
    label: 'Type I',
    shortLabel: 'Very Fair',
    color: '#F8E4D9',
    description: 'Burns easily, tans minimally. Redness appears quickly.',
  },
  {
    value: 'Type II - Fair',
    label: 'Type II',
    shortLabel: 'Fair',
    color: '#F0D5C4',
    description: 'Burns easily, tans minimally. Redness appears quickly.',
  },
  {
    value: 'Type III - Medium',
    label: 'Type III',
    shortLabel: 'Medium',
    color: '#D8B094',
    description: 'Sometimes burns, tans gradually. Redness may be less intense.',
  },
  {
    value: 'Type IV - Olive',
    label: 'Type IV',
    shortLabel: 'Olive',
    color: '#C49A6C',
    description: 'Can burn with prolonged exposure, tans more easily. Redness may be less visible.',
  },
  {
    value: 'Type V - Brown',
    label: 'Type V',
    shortLabel: 'Brown',
    color: '#A67C52',
    description: 'Can still burn even if redness is not obvious. Sun damage can occur without visible color change.',
  },
  {
    value: 'Type VI - Dark Brown/Black',
    label: 'Type VI',
    shortLabel: 'Deep',
    color: '#6B4423',
    description: 'Still vulnerable to UV damage. Burns may appear as tenderness or darker patches.',
  },
];

// FIXED: Added props interface for onComplete callback
interface QuizFlowProps {
  onComplete?: (data: SurveyData) => void;
}

const QuizFlow = ({ onComplete }: QuizFlowProps) => {
  // Persisted survey progress and answers
  const [currentStep, setCurrentStep, clearCurrentStep] = useLocalStorageState<number>(
    'survey_current_step',
    1
  );
  const [surveyData, setSurveyData, clearSurveyData] = useLocalStorageState<SurveyData>('survey_answers', {
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
  const [showOtherConcern, setShowOtherConcern] = useState(false);
  const [otherConcernInput, setOtherConcernInput] = useState('');

  const totalSteps = 15; // Updated total steps to include routine preferences

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
      case 10: return surveyData.routine.length > 0;
      case 11: return surveyData.sleepPattern !== '';
      case 12: return surveyData.stressLevel !== '';
      case 13: return surveyData.dietPattern !== '';
      case 14: return surveyData.waterIntake !== '';
      case 15: return surveyData.exerciseFrequency !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      // NEW FIRST QUESTION: Sex at Birth
      case 1:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What is your sex assigned at birth?</h2>
            <p className="text-warm-gray text-sm mb-6">This helps us tailor recommendations based on biological skin differences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Male', 'Female'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('sexAtBirth', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.sexAtBirth === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What's your skin type?</h2>
            <p className="text-warm-gray text-sm mb-6">Select the option that best describes your skin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSurveyData(prev => ({ ...prev, skinType: [type] }))}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.skinType.includes(type)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What are your skin concerns?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.concerns.includes(concern)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {concern}
                </button>
              ))}

              {/* Other Option */}
              <button
                onClick={() => setShowOtherConcern(!showOtherConcern)}
                className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                  showOtherConcern || surveyData.concerns.some(c => c.startsWith('Other:'))
                    ? 'border-primary bg-primary/5 text-deep shadow-sm'
                    : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <i className="ri-add-line"></i>
                  Other
                </span>
              </button>
            </div>

            {/* Other Concern Input */}
            {showOtherConcern && (
              <div className="mt-4 p-4 bg-cream/50 rounded-lg border border-blush">
                <label className="block text-sm font-medium text-deep mb-2">
                  Describe your other concern
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otherConcernInput}
                    onChange={(e) => setOtherConcernInput(e.target.value)}
                    placeholder="Type your specific concern..."
                    className="flex-1 p-3 border-2 border-blush rounded-lg focus:border-primary focus:outline-none bg-white text-deep"
                  />
                  <button
                    onClick={() => {
                      if (otherConcernInput.trim()) {
                        handleMultiSelect('concerns', `Other: ${otherConcernInput.trim()}`);
                        setOtherConcernInput('');
                      }
                    }}
                    disabled={!otherConcernInput.trim()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      otherConcernInput.trim()
                        ? 'bg-primary text-white hover:bg-dark'
                        : 'bg-blush text-warm-gray/50 cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                </div>

                {/* Show added custom concerns */}
                {surveyData.concerns.filter(c => c.startsWith('Other:')).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {surveyData.concerns.filter(c => c.startsWith('Other:')).map((concern) => (
                      <span
                        key={concern}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
                      >
                        {concern.replace('Other: ', '')}
                        <button
                          onClick={() => handleMultiSelect('concerns', concern)}
                          className="hover:text-dark cursor-pointer"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What type of scarring?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Ice Pick', 'Rolling', 'Boxcar'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('scarringType', type)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.scarringType.includes(type)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What type of acne?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Blackheads', 'Whiteheads', 'Papules', 'Pustules', 'Nodules', 'Cysts'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleMultiSelect('acneType', type)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.acneType.includes(type)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What's your skin tone?</h2>
            <p className="text-warm-gray mb-4">Select your Fitzpatrick skin type. Hover over swatches for details.</p>

            {/* Why we ask this explanation */}
            <div className="bg-cream/50 border border-blush rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-primary text-xl flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    <span className="font-medium text-deep">Why we ask this:</span> We use your skin tone to personalize product recommendations and sun-safety guidance. All skin tones can experience sun damage, even if redness is less visible.
                  </p>
                  <a
                    href="https://www.aad.org/public/everyday-care/sun-protection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-dark font-medium mt-2 transition-colors"
                  >
                    Learn more about sun safety
                    <i className="ri-external-link-line"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skinToneOptions.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => handleSingleSelect('complexion', tone.value)}
                  className={`group relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer ${
                    surveyData.complexion === tone.value
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color Swatch */}
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: tone.color }}
                      />
                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-sm rounded-lg px-4 py-3 shadow-xl min-w-[180px]">
                          {/* Large color preview */}
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-white/20 mx-auto mb-2"
                            style={{ backgroundColor: tone.color }}
                          />
                          <p className="font-semibold text-center">{tone.shortLabel}</p>
                          <p className="text-xs text-gray-300 text-center mt-1">{tone.description}</p>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-deep" />
                      </div>
                    </div>
                    {/* Label */}
                    <div>
                      <span className="font-medium">{tone.label}</span>
                      <span className="text-warm-gray"> - {tone.shortLabel}</span>
                    </div>
                  </div>
                  {/* Selected indicator */}
                  {surveyData.complexion === tone.value && (
                    <div className="absolute top-2 right-2">
                      <i className="ri-checkbox-circle-fill text-primary text-xl"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Any known allergens?</h2>
            <p className="text-warm-gray text-sm mb-6">Type to search and add allergens (maximum 10)</p>
            
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Product preferences</h2>
            <p className="text-warm-gray text-sm mb-6">Select your preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Chemicals', 'Vegan', 'Plant-Based', 'Fragrance-free', 'Gluten-Free',
                'Alcohol-Free', 'Silicone-free', 'Cruelty-Free'
              ].map((preference) => (
                <button
                  key={preference}
                  onClick={() => handleMultiSelect('preferences', preference)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.preferences.includes(preference)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Lifestyle factors</h2>
            <p className="text-warm-gray text-sm mb-6">Tell us about your daily environment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Active lifestyle', 'Indoor work environment', 'Frequent travel', 'High stress levels'
              ].map((factor) => (
                <button
                  key={factor}
                  onClick={() => handleMultiSelect('lifestyle', factor)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.lifestyle.includes(factor)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Routine & Product Preferences</h2>
            <p className="text-warm-gray text-sm mb-6">Tell us about your skincare habits and preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Limited time for routine', 'Detailed routine preferred',
                'Budget conscious', 'Premium products preferred'
              ].map((preference) => (
                <button
                  key={preference}
                  onClick={() => handleMultiSelect('routine', preference)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.routine.includes(preference)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        );

      // NEW LIFESTYLE QUESTIONS
      case 11:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you describe your sleep patterns?</h2>
            <p className="text-warm-gray text-sm mb-6">Sleep significantly impacts skin health and recovery</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.sleepPattern === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you rate your stress levels?</h2>
            <p className="text-warm-gray text-sm mb-6">Stress can trigger various skin conditions and affect healing</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.stressLevel === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you describe your diet?</h2>
            <p className="text-warm-gray text-sm mb-6">Nutrition plays a key role in skin health</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.dietPattern === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How much water do you typically drink daily?</h2>
            <p className="text-warm-gray text-sm mb-6">Hydration is essential for healthy, glowing skin</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.waterIntake === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 15:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How often do you exercise?</h2>
            <p className="text-warm-gray text-sm mb-6">Exercise affects circulation and skin health</p>
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
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.exerciseFrequency === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
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

  // Clear persisted survey data when completed
  const handleViewResults = () => {
    // Save final data to skinSurveyData for results page
    localStorage.setItem('skinSurveyData', JSON.stringify(surveyData));
    // Clear progress data (survey is complete)
    clearCurrentStep();
    clearSurveyData();
  };

  if (currentStep > totalSteps) {
    return (
      <main className="max-w-2xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-2xl text-primary"></i>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-deep mb-3">Survey Complete</h1>
          <p className="text-warm-gray text-sm mb-6">
            Thank you for completing your skin survey. We're analyzing your responses to create your personalized skincare profile.
          </p>
          <Link
            to="/my-skin"
            onClick={handleViewResults}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>View Your Skin Profile</span>
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
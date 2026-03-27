import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  sleepPattern: string;
  stressLevel: string;
  dietPattern: string;
  waterIntake: string;
  exerciseFrequency: string;
  environmentalExposure: string[];
  // Onboarding v2
  skincareExperience: string;
  monthlySpend: string;
  spendSatisfaction: string;
  spendPainPoints: string[];
  productCount: string;
  routineGoal: string;
  purchaseChannel: string[];
  retailerSatisfaction: string;
  retailerPainPoints: string[];
  frustrations: string[];
  frustrationFreeResponse: string;
  referralSource: string;
  referralSourceOther: string;
  skinGoal: string;
  searchFilters: {
    useClimate: boolean;
    usePreferences: boolean;
    useBudget: boolean;
    prioritizedGoals: string[];
  };
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

// Sortable goal item for Step 221 drag-and-drop
const SortableGoalItem = ({ id, index }: { id: string; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blush hover:border-primary/50 cursor-grab active:cursor-grabbing transition-colors"
    >
      <span className="text-warm-gray/40 text-sm font-medium w-6 text-center">{index + 1}</span>
      <i className="ri-draggable text-warm-gray/30"></i>
      <span className="text-deep text-sm font-medium flex-1">{id}</span>
    </div>
  );
};

const buildPrioritizationList = (data: SurveyData): string[] => {
  const items: string[] = [];
  if (data.skinGoal) items.push(data.skinGoal);
  data.concerns
    .filter(c => !c.startsWith('Other:'))
    .filter(c => !items.includes(c))
    .forEach(c => { if (items.length < 8) items.push(c); });
  return items;
};

const COMPLETION_STEP = 999;

const DEFAULT_SURVEY_DATA: SurveyData = {
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
  environmentalExposure: [],
  skincareExperience: '',
  monthlySpend: '',
  spendSatisfaction: '',
  spendPainPoints: [],
  productCount: '',
  routineGoal: '',
  purchaseChannel: [],
  retailerSatisfaction: '',
  retailerPainPoints: [],
  frustrations: [],
  frustrationFreeResponse: '',
  referralSource: '',
  referralSourceOther: '',
  skinGoal: '',
  searchFilters: { useClimate: true, usePreferences: true, useBudget: true, prioritizedGoals: [] },
};

interface QuizFlowProps {
  onComplete?: (data: SurveyData) => void;
}

const QuizFlow = ({ onComplete }: QuizFlowProps) => {
  // Persisted survey progress and answers
  const [currentStep, setCurrentStep, clearCurrentStep] = useLocalStorageState<number>(
    'survey_current_step',
    1
  );
  const [surveyData, setSurveyData, clearSurveyData] = useLocalStorageState<SurveyData>('survey_answers', DEFAULT_SURVEY_DATA);
  const [allergenInput, setAllergenInput] = useState('');
  const [allergenSuggestions, setAllergenSuggestions] = useState<string[]>([]);
  const [showOtherConcern, setShowOtherConcern] = useState(false);
  const [otherConcernInput, setOtherConcernInput] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigate = useNavigate();

  // DnD sensors for step 221
  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  // Migrate localStorage data from pre-v2 schema
  useEffect(() => {
    if (surveyData && (surveyData as any).searchFilters === undefined) {
      setSurveyData(prev => ({
        ...DEFAULT_SURVEY_DATA,
        ...prev,
        searchFilters: DEFAULT_SURVEY_DATA.searchFilters,
      }));
    }
  }, []);

  // Initialize prioritized goals when entering step 221
  useEffect(() => {
    if (currentStep === 221 && surveyData.searchFilters.prioritizedGoals.length === 0) {
      const goals = buildPrioritizationList(surveyData);
      if (goals.length > 0) {
        setSurveyData(prev => ({
          ...prev,
          searchFilters: { ...prev.searchFilters, prioritizedGoals: goals },
        }));
      }
    }
  }, [currentStep]);

  // Warn on browser tab close / refresh when survey is in progress
  const isInProgress = currentStep > 1 && currentStep < COMPLETION_STEP;
  useEffect(() => {
    if (!isInProgress) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInProgress]);

  // Intercept in-app link clicks during survey (capturing phase fires before React Router)
  useEffect(() => {
    if (!isInProgress) return;
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingPath(href);
      setShowExitModal(true);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isInProgress]);

  // Intercept browser back/forward button
  useEffect(() => {
    if (!isInProgress) return;
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setPendingPath(null);
      setShowExitModal(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isInProgress]);

  const handleExitSurvey = () => {
    clearCurrentStep();
    clearSurveyData();
    localStorage.removeItem('skinSurveyData');
    setShowExitModal(false);
    navigate(pendingPath || '/');
    setPendingPath(null);
  };

  const handleContinueSurvey = () => {
    setShowExitModal(false);
    setPendingPath(null);
  };

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

  const handleToggleSearchFilter = (key: 'useClimate' | 'usePreferences' | 'useBudget') => {
    setSurveyData(prev => ({
      ...prev,
      searchFilters: {
        ...prev.searchFilters,
        [key]: !prev.searchFilters[key],
      },
    }));
  };

  const handleGoalReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSurveyData(prev => {
      const goals = [...prev.searchFilters.prioritizedGoals];
      const oldIndex = goals.indexOf(active.id as string);
      const newIndex = goals.indexOf(over.id as string);
      return {
        ...prev,
        searchFilters: {
          ...prev.searchFilters,
          prioritizedGoals: arrayMove(goals, oldIndex, newIndex),
        },
      };
    });
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

  const getPrevStep = () => {
    // Existing conditional steps (acne/scarring)
    if (currentStep === 6) {
      if (surveyData.concerns.includes('Acne Prone')) return 5;
      else if (surveyData.concerns.includes('Scarring')) return 4;
      else return 3;
    }
    if (currentStep === 5) {
      if (surveyData.concerns.includes('Scarring')) return 4;
      else return 3;
    }
    // V2 branching
    if (currentStep === 170) return 17;
    if (currentStep === 171) return 170;
    if (currentStep === 18) {
      const hadBranch = ['Would like to spend less', 'Honestly not sure if I\'m getting my money\'s worth'].includes(surveyData.spendSatisfaction);
      return hadBranch ? 171 : 170;
    }
    if (currentStep === 180) return 18;
    if (currentStep === 19) {
      return surveyData.productCount === 'None yet \u2014 building from scratch' ? 18 : 180;
    }
    if (currentStep === 190) return 19;
    if (currentStep === 191) return 190;
    if (currentStep === 20) {
      return surveyData.retailerSatisfaction === 'Open to better options' ? 191 : 190;
    }
    if (currentStep === 21) return 20;
    if (currentStep === 22) return 21;
    if (currentStep === 220) return 22;
    if (currentStep === 221) return 220;
    return currentStep - 1;
  };

  const getNextStep = () => {
    // Existing conditional steps (acne/scarring)
    if (currentStep === 3) {
      if (surveyData.concerns.includes('Scarring') ||
          (surveyData.concerns.includes('Acne Prone') && surveyData.concerns.includes('Scarring'))) {
        return 4;
      } else if (surveyData.concerns.includes('Acne Prone')) {
        return 5;
      } else {
        return 6;
      }
    }
    if (currentStep === 4) {
      if (surveyData.concerns.includes('Acne Prone')) {
        return 5;
      } else {
        return 6;
      }
    }
    // V2 branching
    if (currentStep === 17) return 170;
    if (currentStep === 170) {
      const needsBranch = ['Would like to spend less', 'Honestly not sure if I\'m getting my money\'s worth'].includes(surveyData.spendSatisfaction);
      return needsBranch ? 171 : 18;
    }
    if (currentStep === 171) return 18;
    if (currentStep === 18) {
      return surveyData.productCount === 'None yet \u2014 building from scratch' ? 19 : 180;
    }
    if (currentStep === 180) return 19;
    if (currentStep === 19) return 190;
    if (currentStep === 190) {
      return surveyData.retailerSatisfaction === 'Open to better options' ? 191 : 20;
    }
    if (currentStep === 191) return 20;
    if (currentStep === 20) return 21;
    if (currentStep === 21) return 22;
    if (currentStep === 22) return 220;
    if (currentStep === 220) return 221;
    if (currentStep === 221) return COMPLETION_STEP;
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
      // V2 steps
      case 16: return surveyData.skincareExperience !== '';
      case 17: return surveyData.monthlySpend !== '';
      case 170: return surveyData.spendSatisfaction !== '';
      case 171: return surveyData.spendPainPoints.length > 0;
      case 18: return surveyData.productCount !== '';
      case 180: return surveyData.routineGoal !== '';
      case 19: return surveyData.purchaseChannel.length > 0;
      case 190: return surveyData.retailerSatisfaction !== '';
      case 191: return surveyData.retailerPainPoints.length > 0;
      case 20: return surveyData.frustrations.length > 0;
      case 21: return surveyData.referralSource !== '';
      case 22: return surveyData.skinGoal !== '';
      case 220: return true;
      case 221: return true;
      default: return false;
    }
  };

  const getProgressLabel = () => {
    if (currentStep <= 16) return `Step ${currentStep} of 16 \u2014 Skin Profile`;
    if ([17, 170, 171].includes(currentStep)) return 'Spending & Budget';
    if ([18, 180].includes(currentStep)) return 'Your Routine';
    if ([19, 190, 191].includes(currentStep)) return 'Where You Shop';
    if (currentStep === 20) return 'Your Frustrations';
    if (currentStep === 21) return 'Almost Done';
    if ([22, 220, 221].includes(currentStep)) return 'Final Setup';
    return '';
  };

  const getProgressPercent = () => {
    if (currentStep <= 16) return Math.round((currentStep / 22) * 100);
    if ([17, 170, 171].includes(currentStep)) return 75;
    if ([18, 180].includes(currentStep)) return 80;
    if ([19, 190, 191].includes(currentStep)) return 85;
    if (currentStep === 20) return 88;
    if (currentStep === 21) return 92;
    if ([22, 220, 221].includes(currentStep)) return 96;
    return 100;
  };

  const getCompletionCTA = () => {
    const { skinGoal, productCount, routineGoal } = surveyData;

    if (skinGoal === 'Figure out what caused a reaction') {
      return { label: 'Scan the Problem Product', description: 'Start with the product that caused issues \u2014 we\'ll flag every ingredient and what it could do to your skin.' };
    }
    if (skinGoal === 'Stop wasting money on bad products') {
      return { label: 'Check If a Product Is Worth It', description: 'Scan any product and we\'ll tell you if the ingredients justify the price \u2014 or if there\'s a better deal.' };
    }
    if (skinGoal === 'Simplify my current routine' || routineGoal === 'Simplify it \u2014 I feel like I\'m using too much') {
      return { label: 'Start Scanning Your Shelf', description: 'Grab the first product in your routine and scan it. We\'ll analyze each one and tell you what to keep and what to cut.' };
    }
    if (routineGoal === 'Add more \u2014 I know I\'m missing something') {
      return { label: 'Scan What You Already Use', description: 'Scan your current products \u2014 we\'ll identify the gaps and find what\'s missing.' };
    }
    if (skinGoal === 'Build a routine from scratch' && productCount === 'None yet \u2014 building from scratch') {
      return { label: 'Scan a Product You\'re Curious About', description: 'Start by scanning something you\'ve seen online, at a store, or at a friend\'s \u2014 we\'ll tell you if it fits your skin.' };
    }
    if (skinGoal === 'Understand what\'s in my current products') {
      return { label: 'Scan Something You Own', description: 'Pick any product from your shelf \u2014 we\'ll break down every ingredient for your skin.' };
    }
    return { label: 'Scan Your First Product', description: 'Grab the nearest skincare product and scan it \u2014 we\'ll show you if it\'s right for YOUR skin.' };
  };

  const renderStep = () => {
    switch (currentStep) {
      // Step 1: Sex at Birth
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

      // Step 2: Skin Type (added "Not Sure" option)
      case 2:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What's your skin type?</h2>
            <p className="text-warm-gray text-sm mb-6">Select the option that best describes your skin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Normal', tip: 'Your skin is generally balanced \u2014 not too oily or too dry, with few imperfections' },
                { label: 'Dry', tip: 'Your skin often feels tight, rough, or flaky, and may lack moisture throughout the day' },
                { label: 'Oily', tip: 'Your skin tends to look shiny, especially in the T-zone, and may be prone to clogged pores' },
                { label: 'Combination', tip: 'Some areas of your face are oily (usually forehead, nose, chin) while others feel dry or normal' },
                { label: 'Sensitive', tip: 'Your skin reacts easily to products or environment \u2014 redness, stinging, or irritation are common' },
                { label: 'Not Sure', tip: 'Don\'t worry \u2014 we\'ll help you figure it out based on your scan results and how your skin behaves throughout the day' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => setSurveyData(prev => ({ ...prev, skinType: [label] }))}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.skinType.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 3: Concerns (added 5 new concerns)
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
                'Congested skin', 'Scarring', 'Looking for gentle products',
                'Hyperpigmentation', 'Fine Lines', 'Wrinkles', 'Hormonal Breakouts',
                'Post-Inflammatory Marks'
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

      // Step 4: Scarring Type (conditional)
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

      // Step 5: Acne Type (conditional)
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

      // Step 6: Skin Tone (Fitzpatrick)
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

      // Step 7: Allergens
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

      // Step 8: Product Preferences
      case 8:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Product preferences</h2>
            <p className="text-warm-gray text-sm mb-6">Select your preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Cruelty-Free', tip: 'No animal testing at any stage of production' },
                { label: 'Vegan', tip: 'Contains no animal-derived ingredients whatsoever' },
                { label: 'Fragrance-Free', tip: 'Free from added synthetic or natural fragrances that can irritate sensitive skin' },
                { label: 'Organic', tip: 'Made with organically farmed ingredients, free from synthetic pesticides' },
                { label: 'Dermatologist Tested', tip: 'Clinically evaluated by dermatologists for safety and efficacy' },
                { label: 'Hypoallergenic', tip: 'Formulated to minimize the risk of allergic reactions' },
                { label: 'Paraben-Free', tip: 'Free from paraben preservatives, which some prefer to avoid' },
                { label: 'Sulfate-Free', tip: 'No harsh sulfate cleansing agents that can strip natural oils' },
                { label: 'Plant-Based', tip: 'Primarily derived from botanical and plant sources' },
                { label: 'Gluten-Free', tip: 'Free from gluten-containing ingredients, important for those with sensitivities' },
                { label: 'Alcohol-Free', tip: 'No drying alcohols that can dehydrate or irritate the skin' },
                { label: 'Silicone-Free', tip: 'Free from silicones, which some find can clog pores or cause buildup' },
                { label: 'Budget conscious', tip: 'Helps us surface effective options at lower price points' },
                { label: 'Premium products preferred', tip: 'Indicates interest in high-performance and luxury formulations' },
                { label: 'Prefer multi-use products', tip: 'Products that serve multiple purposes, like a moisturizer with SPF' },
                { label: 'Prefer travel-friendly sizes', tip: 'Indicates a preference for portable or mini-sized products' },
                { label: 'K-Beauty', tip: 'Korean skincare philosophy focusing on gentle, layered hydration and barrier care' },
                { label: 'Prefer natural/clean ingredients', tip: 'Preference for products without synthetic fragrances, parabens, or harsh chemicals' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleMultiSelect('preferences', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.preferences.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 9: Lifestyle Factors
      case 9:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Lifestyle factors</h2>
            <p className="text-warm-gray text-sm mb-6">Tell us about your daily environment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Active lifestyle', tip: 'You exercise regularly \u2014 running, gym, sports, or other physical activities' },
                { label: 'Indoor work environment', tip: 'You spend most of your working hours indoors, such as in an office or at home' },
                { label: 'Frequent travel', tip: 'You travel often, whether for work or leisure, and experience different climates regularly' },
                { label: 'High stress levels', tip: 'You feel stressed on most days from work, personal life, or other responsibilities' },
                { label: 'Outdoor work environment', tip: 'You spend a significant part of your day working outdoors or commuting in open air' },
                { label: 'Frequently wears makeup', tip: 'You wear makeup on most days, whether a full face or just a few key products' },
                { label: 'Screen time heavy', tip: 'You spend many hours a day in front of screens \u2014 computer, phone, or tablet' },
                { label: 'Sun exposure daily', tip: 'You spend noticeable time in direct sunlight each day, whether by choice or routine' },
                { label: 'Wears glasses or headsets regularly', tip: 'You wear eyeglasses, sunglasses, or over-ear headsets for extended periods daily' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleMultiSelect('lifestyle', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.lifestyle.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 10: Routine Preferences
      case 10:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Routine Preferences</h2>
            <p className="text-warm-gray text-sm mb-6">Tell us about your skincare routine habits</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Limited time for routine', tip: 'Helps us suggest quick, efficient routines that fit a busy schedule' },
                { label: 'Detailed routine preferred', tip: 'Indicates you enjoy a thorough, multi-step skincare ritual' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => setSurveyData(prev => ({ ...prev, routine: prev.routine.includes(label) ? [] : [label] }))}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.routine.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 11: Sleep Pattern
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

      // Step 12: Stress Level
      case 12:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you rate your stress levels?</h2>
            <p className="text-warm-gray text-sm mb-6">Stress can trigger various skin conditions and affect healing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Low - Generally calm', tip: 'You rarely feel stressed and tend to feel relaxed most of the time' },
                { label: 'Moderate - Occasional stress', tip: 'You experience stress from time to time, such as during busy periods at work or life changes' },
                { label: 'High - Frequently stressed', tip: 'You feel stressed on most days, whether from work, relationships, or daily responsibilities' },
                { label: 'Very High - Chronic stress', tip: 'You feel overwhelmed or under pressure nearly all the time, with little relief' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('stressLevel', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.stressLevel === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 13: Diet Pattern
      case 13:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you describe your diet?</h2>
            <p className="text-warm-gray text-sm mb-6">Nutrition plays a key role in skin health</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Balanced - Variety of whole foods', tip: 'You eat a mix of fruits, vegetables, grains, proteins, and healthy fats on a regular basis' },
                { label: 'Plant-based/Vegetarian', tip: 'Your diet is mostly or entirely made up of plant-derived foods, with little to no meat' },
                { label: 'High protein focus', tip: 'Your meals emphasize protein-rich foods like meat, eggs, dairy, or protein supplements' },
                { label: 'Processed/Fast food heavy', tip: 'You frequently eat packaged, pre-made, or fast food meals rather than cooking from scratch' },
                { label: 'Limited/Restricted diet', tip: 'You follow a diet that excludes certain food groups, whether by choice or due to allergies or intolerances' },
                { label: 'Variable/Inconsistent', tip: 'Your eating habits change often \u2014 some days are healthier than others, with no set pattern' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('dietPattern', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.dietPattern === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 14: Water Intake
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

      // Step 15: Exercise Frequency
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

      // ====================================================================
      // ONBOARDING V2 STEPS (16 - 221)
      // ====================================================================

      // Step 16: Skincare Experience Level
      case 16:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How would you describe your skincare journey?</h2>
            <p className="text-warm-gray text-sm mb-6">This helps us calibrate the depth of our explanations and recommendations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Just getting started', tip: 'You\'re new to skincare and still figuring out the basics \u2014 that\'s exactly why we\'re here' },
                { label: 'I know the basics', tip: 'You have a routine but aren\'t sure if it\'s optimized for your skin' },
                { label: 'Skincare enthusiast', tip: 'You research ingredients, follow skincare creators, and actively experiment with products' },
                { label: 'Expert / Professional', tip: 'You work in skincare or have deep knowledge of ingredients, formulations, and routines' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('skincareExperience', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.skincareExperience === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 17: Monthly Spend
      case 17:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How much do you typically spend on skincare products per month?</h2>
            <p className="text-warm-gray text-sm mb-6">No judgment \u2014 this helps us find products in your comfort zone</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Under $25', '$25 - $50', '$50 - $100', '$100 - $200', '$200+', 'Not sure / It varies a lot'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('monthlySpend', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.monthlySpend === option
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

      // Step 170: Spend Satisfaction
      case 170:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How do you feel about what you're spending?</h2>
            <p className="text-warm-gray text-sm mb-6">This helps us calibrate whether to suggest alternatives or validate your current products</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Happy with it \u2014 I invest in what works', tip: 'We\'ll focus on optimizing what you have rather than finding cheaper alternatives' },
                { label: 'Would like to spend less', tip: 'We\'ll actively surface more affordable alternatives that match your skin profile' },
                { label: 'Willing to spend more for better results', tip: 'We\'ll include premium options when they genuinely outperform for your skin type' },
                { label: 'Honestly not sure if I\'m getting my money\'s worth', tip: 'We\'ll analyze whether your current products justify their price' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('spendSatisfaction', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.spendSatisfaction === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 171: Spend Pain Points (conditional)
      case 171:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What bothers you most about what you spend on skincare?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                'Products that promise results but don\'t deliver',
                'Expensive products that have the same ingredients as cheap ones',
                'Having to replace products too frequently',
                'Buying products I end up not using',
                'Subscription costs that add up',
                'Not knowing if a cheaper option would work just as well',
                'Getting influenced into buying products I don\'t need',
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleMultiSelect('spendPainPoints', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.spendPainPoints.includes(option)
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

      // Step 18: Current Product Count
      case 18:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How many skincare products are in your current routine?</h2>
            <p className="text-warm-gray text-sm mb-6">Include everything \u2014 cleansers, serums, moisturizers, sunscreen, treatments</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['None yet \u2014 building from scratch', '1-3 products', '4-6 products', '7-10 products', '10+ products'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('productCount', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.productCount === option
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

      // Step 180: Routine Goal (conditional)
      case 180:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What would you like to do with your routine?</h2>
            <p className="text-warm-gray text-sm mb-6">This tells our AI how to approach your product recommendations</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Simplify it \u2014 I feel like I\'m using too much', tip: 'We\'ll look for redundancies, flag products doing the same thing, and suggest a streamlined routine' },
                { label: 'Add more \u2014 I know I\'m missing something', tip: 'We\'ll identify gaps in your routine based on your skin type and concerns' },
                { label: 'Keep it the same but optimize what I have', tip: 'We\'ll check if your current products are the best options for your profile, or if swaps would improve results' },
                { label: 'Not sure \u2014 help me figure it out', tip: 'We\'ll analyze your products when you scan them and give you a full picture' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('routineGoal', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.routineGoal === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 19: Purchase Channels
      case 19:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Where do you usually buy skincare products?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply \u2014 helps us show you where to find products you'll love</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Sephora', tip: 'In-store or online' },
                { label: 'Ulta', tip: 'In-store or online' },
                { label: 'Amazon', tip: 'Including Subscribe & Save' },
                { label: 'Target / Walmart', tip: 'Drugstore and mass-market skincare' },
                { label: 'Drugstore \u2014 CVS, Walgreens', tip: 'Pharmacy-based skincare shopping' },
                { label: 'Brand websites (direct)', tip: 'Buying directly from the brand\'s own site' },
                { label: 'TikTok Shop', tip: 'Purchasing through TikTok\'s in-app shopping' },
                { label: 'K-Beauty sites \u2014 Stylevana, YesStyle', tip: 'Korean and Asian beauty specialty retailers' },
                { label: 'Subscription boxes', tip: 'Ipsy, BoxyCharm, FabFitFun, etc.' },
                { label: 'Dermatologist / Esthetician', tip: 'Professional-grade products from your provider' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleMultiSelect('purchaseChannel', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.purchaseChannel.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 190: Retailer Satisfaction
      case 190:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How do you feel about where you currently shop for skincare?</h2>
            <p className="text-warm-gray text-sm mb-6">This helps us decide whether to suggest the same stores or introduce new options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Satisfied \u2014 I trust where I shop', 'Open to better options'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('retailerSatisfaction', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.retailerSatisfaction === option
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

      // Step 191: Retailer Pain Points (conditional)
      case 191:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What do you wish was better about where you buy skincare?</h2>
            <p className="text-warm-gray text-sm mb-6">Select all that apply \u2014 our scan results can help address these</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Product authenticity concerns (worried about fakes)', tip: 'We\'ll flag products where counterfeit risk is higher' },
                { label: 'Product/packaging quality is hit or miss', tip: 'We\'ll surface retailers known for better fulfillment' },
                { label: 'Shipping costs or slow delivery', tip: 'We\'ll highlight retailers with free shipping thresholds' },
                { label: 'Limited selection for my skin type or concerns', tip: 'We\'ll introduce specialty retailers that cater to your needs' },
                { label: 'Hard to compare products or ingredients before buying', tip: 'This is exactly what our scan does' },
                { label: 'Prices feel inflated compared to other retailers', tip: 'We\'ll show price comparisons across retailers' },
                { label: 'Returns are difficult if a product doesn\'t work', tip: 'Scanning before buying reduces return likelihood' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleMultiSelect('retailerPainPoints', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.retailerPainPoints.includes(label)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 20: Frustrations (multi-select + free response)
      case 20:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What frustrates you the most about skincare or finding the right products?</h2>
            <p className="text-warm-gray text-sm mb-6">Select everything that resonates \u2014 and if you want to share more, we're listening</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Wasting money on products that don\'t work',
                'Conflicting advice from different sources',
                'Not knowing which ingredients are good for MY skin',
                'Ingredient lists are confusing and overwhelming',
                'Can\'t tell if a product is worth the price',
                'Don\'t know what products work well together',
                'Tried a product that caused a reaction and don\'t know why',
                'Too many steps \u2014 skincare feels like a chore',
                'Reviews are generic \u2014 I want opinions from people with MY skin type',
                'Don\'t know if my current routine is actually working',
                'Hard to find products for my specific skin tone',
                'Overwhelmed by the number of options available',
                'Trendy products that end up being overhyped',
                'Products that work for a while then stop working',
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleMultiSelect('frustrations', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.frustrations.includes(option)
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Free response textarea */}
            <div className="mt-6 p-5 bg-cream/50 rounded-xl border border-blush">
              <label className="block text-sm font-medium text-deep mb-2">
                Want to share more? We'd love to hear your story.
              </label>
              <p className="text-warm-gray text-xs mb-3">
                Be as detailed as possible \u2014 you can even recall specific events, bad purchases, or moments that made you frustrated. This helps our AI understand exactly what to solve for you.
              </p>
              <textarea
                value={surveyData.frustrationFreeResponse}
                onChange={(e) => handleSingleSelect('frustrationFreeResponse', e.target.value)}
                placeholder="Example: I bought a $60 vitamin C serum because everyone on TikTok raved about it, but it broke me out after a week. I still don't know if it was the vitamin C or something else in the formula..."
                className="w-full p-4 border-2 border-blush rounded-lg focus:border-primary focus:outline-none bg-white text-deep text-sm min-h-[120px] resize-y"
                maxLength={1000}
              />
              <p className="text-warm-gray/50 text-xs mt-2 text-right">
                {surveyData.frustrationFreeResponse.length}/1000
              </p>
            </div>
          </div>
        );

      // Step 21: Referral Source
      case 21:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">How did you discover Lorem Curae?</h2>
            <p className="text-warm-gray text-sm mb-6">Helps us find more people like you</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['TikTok', 'Instagram', 'YouTube', 'Reddit', 'Twitter / X', 'Friend or family member', 'App Store search', 'Google search', 'Product Hunt', 'Blog or article', 'Podcast', 'Other'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect('referralSource', option)}
                  className={`py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.referralSource === option
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Other text input */}
            {surveyData.referralSource === 'Other' && (
              <input
                type="text"
                value={surveyData.referralSourceOther}
                onChange={(e) => handleSingleSelect('referralSourceOther', e.target.value)}
                placeholder="Tell us where..."
                className="w-full mt-4 p-3 border-2 border-blush rounded-lg focus:border-primary focus:outline-none bg-white text-deep"
              />
            )}
          </div>
        );

      // Step 22: Primary Skin Goal
      case 22:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">What's the #1 thing you want Lorem Curae to help you with?</h2>
            <p className="text-warm-gray text-sm mb-6">Pick the one that matters most right now \u2014 you can always update this later</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Find products that actually work for my skin', tip: 'We\'ll prioritize personalized discovery and compatibility checking' },
                { label: 'Understand what\'s in my current products', tip: 'We\'ll focus on ingredient analysis and safety breakdowns' },
                { label: 'Build a routine from scratch', tip: 'We\'ll guide you through a step-by-step routine based on your skin profile' },
                { label: 'Simplify my current routine', tip: 'We\'ll help you identify what\'s redundant and what\'s essential' },
                { label: 'Stop wasting money on bad products', tip: 'We\'ll highlight cost-effective alternatives and flag ingredient dusting' },
                { label: 'Figure out what caused a reaction', tip: 'We\'ll track your products and help identify likely irritant ingredients over time' },
              ].map(({ label, tip }) => (
                <button
                  key={label}
                  onClick={() => handleSingleSelect('skinGoal', label)}
                  className={`relative py-3.5 px-4 rounded-xl border transition-all text-left cursor-pointer text-sm font-medium ${
                    surveyData.skinGoal === label
                      ? 'border-primary bg-primary/5 text-deep shadow-sm'
                      : 'border-blush hover:border-primary/50 hover:bg-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{label}</span>
                    <span className="group/tip relative flex-shrink-0">
                      <i className="ri-information-line text-xs text-warm-gray/40 group-hover/tip:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-10 pointer-events-none">
                        <div className="bg-deep text-white text-[11px] rounded-lg px-3 py-2 shadow-xl leading-relaxed min-w-[180px]">
                          {tip}
                        </div>
                      </div>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      // Step 220: Search Personalization Toggles
      case 220:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">When we search for products and recommendations, what should we factor in?</h2>
            <p className="text-warm-gray text-sm mb-6">You can toggle these on or off anytime in settings \u2014 this is just your starting preference</p>
            <div className="space-y-4">
              {([
                { key: 'useClimate' as const, label: 'Factor in my climate & weather', description: 'Adapt recommendations to your local UV, humidity, and season' },
                { key: 'usePreferences' as const, label: 'Factor in my product preferences', description: 'Filter by your preferences (cruelty-free, fragrance-free, etc.)' },
                { key: 'useBudget' as const, label: 'Factor in my budget', description: 'Prioritize products in your price range' },
              ]).map(({ key, label, description }) => {
                const isOn = surveyData.searchFilters[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleToggleSearchFilter(key)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-blush hover:border-primary/50 transition-all cursor-pointer text-left"
                  >
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium text-deep">{label}</p>
                      <p className="text-xs text-warm-gray mt-1">{description}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${isOn ? 'bg-primary' : 'bg-blush'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      // Step 221: Goal Prioritization (drag-and-drop)
      case 221:
        return (
          <div>
            <h2 className="font-serif text-2xl font-semibold text-deep mb-3">Last step \u2014 prioritize your skin goals</h2>
            <p className="text-warm-gray text-sm mb-6">Drag to reorder. The top items will get the most attention in your scans and recommendations.</p>
            {surveyData.searchFilters.prioritizedGoals.length > 0 ? (
              <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGoalReorder}
              >
                <SortableContext
                  items={surveyData.searchFilters.prioritizedGoals}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {surveyData.searchFilters.prioritizedGoals.map((goal, index) => (
                      <SortableGoalItem key={goal} id={goal} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-warm-gray/50 text-sm">Loading your goals...</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Call onComplete when quiz is finished
  useEffect(() => {
    if (currentStep >= COMPLETION_STEP && onComplete) {
      onComplete(surveyData);
    }
  }, [currentStep]);

  // Clear persisted survey data when completed
  const handleViewResults = () => {
    // Save final data to skinSurveyData for results page
    localStorage.setItem('skinSurveyData', JSON.stringify(surveyData));
    // Clear progress data (survey is complete)
    clearCurrentStep();
    clearSurveyData();
  };

  if (currentStep >= COMPLETION_STEP) {
    const cta = getCompletionCTA();
    return (
      <main className="max-w-2xl mx-auto px-6 lg:px-12 py-24 min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-2xl text-primary"></i>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-deep mb-3">Your Skin Profile Is Ready</h1>
          <p className="text-warm-gray text-sm mb-2">
            We've built a personalized profile based on your responses. Every scan, recommendation, and review you see will be tailored to your unique skin.
          </p>
          <p className="text-warm-gray/60 text-xs mb-8">
            You can update your profile anytime in settings.
          </p>

          {/* Primary CTA — leads to camera scan */}
          <Link
            to="/scan"
            onClick={handleViewResults}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-dark text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors cursor-pointer whitespace-nowrap shadow-lg mb-4"
          >
            <i className="ri-camera-line text-lg"></i>
            <span>{cta.label}</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
          <p className="text-warm-gray/60 text-xs mb-6">{cta.description}</p>

          {/* Secondary CTA — view profile */}
          <Link
            to="/my-skin"
            onClick={handleViewResults}
            className="text-sm text-warm-gray hover:text-deep underline underline-offset-4 transition-colors"
          >
            Or view your skin profile first
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
          <span className="text-sm text-warm-gray">{getProgressLabel()}</span>
          <span className="text-sm text-warm-gray">
            {getProgressPercent()}% Complete
          </span>
        </div>
        <div className="w-full bg-blush rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercent()}%` }}
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
          onClick={() => { setCurrentStep(Math.max(1, getPrevStep())); window.scrollTo(0, 0); }}
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
          onClick={() => { setCurrentStep(getNextStep()); window.scrollTo(0, 0); }}
          disabled={!canProceed()}
          className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            canProceed()
              ? 'bg-primary hover:bg-dark text-white'
              : 'bg-blush text-warm-gray/50 cursor-not-allowed'
          }`}
        >
          <span>{currentStep === 221 ? 'Complete' : 'Next'}</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>

      {/* Exit Intercept Modal */}
      {showExitModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleContinueSurvey}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="ri-error-warning-line text-2xl text-primary"></i>
            </div>
            <h2 className="font-serif text-xl font-semibold text-deep mb-3">Leave the survey?</h2>
            <p className="text-warm-gray text-sm mb-8">
              Your progress will be reset if you exit now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleContinueSurvey}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Continue Survey
              </button>
              <button
                onClick={handleExitSurvey}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-blush hover:border-primary text-warm-gray hover:text-deep px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Exit Survey
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default QuizFlow;

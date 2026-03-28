import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sessionState } from '../../lib/utils/sessionState';
import { useAuth } from '../../lib/auth/AuthContext';
import { updateUserProfile } from '../../lib/supabase';
import Dropdown from '../../components/ui/Dropdown';

interface SkinConcern {
  id: string;
  name: string;
  priority: number;
  description: string;
  recommendedIngredients: string[];
  icon: string;
}

interface Allergen {
  id: string;
  name: string;
  category: string;
}

interface UserPreference {
  id: string;
  category: string;
  value: string;
}

interface LifestyleFactors {
  sleepPattern: string;
  stressLevel: string;
  dietPattern: string;
  waterIntake: string;
  exerciseFrequency: string;
  environmentalExposure: string;
}

interface ExtendedSkinProfile {
  sexAtBirth?: string;
  complexion?: string;
  acneType?: string[];
  scarringType?: string[];
  environmentalExposure?: string[];
}

export default function MySkinPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [skinProfile, setSkinProfile] = useState({
    skinType: '',
    concerns: [] as string[],
    goals: [] as string[],
    sensitivities: [] as string[],
  });
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [lifestyleFactors, setLifestyleFactors] = useState<LifestyleFactors | null>(null);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedSkinProfile>({});
  const [showAddAllergen, setShowAddAllergen] = useState(false);
  const [newAllergen, setNewAllergen] = useState({ name: '', category: 'Synthetic' });

  // Collapsible category states
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    skinBasics: true,
    concernsGoals: true,
    lifestyle: false,
    preferences: false,
  });

  const [showServicePopup, setShowServicePopup] = useState(false);
  const [selectedConcernForService, setSelectedConcernForService] = useState<SkinConcern | null>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedConcernForProduct, setSelectedConcernForProduct] = useState<SkinConcern | null>(null);
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});
  const [showLifestyleCheckin, setShowLifestyleCheckin] = useState(false);
  const [editingLifestyle, setEditingLifestyle] = useState({
    sleepPattern: '',
    stressLevel: '',
    dietPattern: '',
    waterIntake: '',
    exerciseFrequency: '',
    environmentalExposure: '',
  });
  const [showPreferencesEdit, setShowPreferencesEdit] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState<string[]>([]);
  const [hasSurveyData, setHasSurveyData] = useState<boolean | null>(null);

  // Lifestyle options for the check-in
  const lifestyleOptions: Record<string, { emoji: string; options: string[] }> = {
    sleepPattern: { emoji: '🌙', options: ['Less than 5 hours', '5-6 hours', '7-8 hours', 'More than 8 hours'] },
    stressLevel: { emoji: '🧘', options: ['Low', 'Moderate', 'High', 'Very High'] },
    dietPattern: { emoji: '🥗', options: ['Balanced', 'Mostly Healthy', 'Variable', 'Could Improve'] },
    waterIntake: { emoji: '💧', options: ['Less than 4 cups', '4-6 cups', '6-8 cups', 'More than 8 cups'] },
    exerciseFrequency: { emoji: '🏃', options: ['Rarely', '1-2 times/week', '3-4 times/week', 'Daily'] },
    environmentalExposure: { emoji: '🌆', options: ['Urban/City', 'Suburban', 'Rural', 'High Pollution', 'Low Pollution'] },
  };

  const lifestyleLabels: Record<string, string> = {
    sleepPattern: 'How much sleep do you get?',
    stressLevel: 'What\'s your stress level?',
    dietPattern: 'How would you describe your diet?',
    waterIntake: 'Daily water intake?',
    exerciseFrequency: 'How often do you exercise?',
    environmentalExposure: 'Your environment?',
  };

  const handleSaveLifestyle = async () => {
    setLifestyleFactors(editingLifestyle);
    // Save to localStorage
    const existingData = JSON.parse(localStorage.getItem('skinSurveyData') || '{}');
    existingData.lifestyle = editingLifestyle;
    localStorage.setItem('skinSurveyData', JSON.stringify(existingData));
    setShowLifestyleCheckin(false);

    // Sync to Supabase for authenticated users
    if (profile?.id) {
      const existingPrefs = (profile.preferences as Record<string, any>) || {};
      const existingSurvey = existingPrefs.surveyAnswers || {};
      await updateUserProfile(profile.id, {
        preferences: {
          ...existingPrefs,
          surveyAnswers: { ...existingSurvey, ...editingLifestyle },
        },
      });
    }
  };

  // Product preference options
  const preferenceOptions = [
    { id: 'cruelty-free', label: 'Cruelty-Free', icon: 'ri-heart-line' },
    { id: 'vegan', label: 'Vegan', icon: 'ri-leaf-line' },
    { id: 'fragrance-free', label: 'Fragrance-Free', icon: 'ri-drop-line' },
    { id: 'organic', label: 'Organic', icon: 'ri-plant-line' },
    { id: 'dermatologist-tested', label: 'Dermatologist Tested', icon: 'ri-stethoscope-line' },
    { id: 'hypoallergenic', label: 'Hypoallergenic', icon: 'ri-shield-check-line' },
    { id: 'paraben-free', label: 'Paraben-Free', icon: 'ri-prohibited-line' },
    { id: 'sulfate-free', label: 'Sulfate-Free', icon: 'ri-water-flash-line' },
    { id: 'budget-friendly', label: 'Budget-Friendly', icon: 'ri-money-dollar-circle-line' },
    { id: 'luxury', label: 'Luxury/Premium', icon: 'ri-vip-diamond-line' },
  ];

  const handleTogglePreference = (prefLabel: string) => {
    setEditingPreferences(prev =>
      prev.includes(prefLabel)
        ? prev.filter(p => p !== prefLabel)
        : [...prev, prefLabel]
    );
  };

  const handleSavePreferences = async () => {
    // Convert to UserPreference format
    const newPreferences: UserPreference[] = editingPreferences.map((pref, index) => ({
      id: `pref-${index}`,
      category: 'Product Preference',
      value: pref,
    }));

    setPreferences(newPreferences);

    // Save to localStorage
    const existingData = JSON.parse(localStorage.getItem('skinSurveyData') || '{}');
    existingData.preferences = editingPreferences;
    localStorage.setItem('skinSurveyData', JSON.stringify(existingData));

    // Update session state
    sessionState.updatePreferences({ goals: editingPreferences });

    setShowPreferencesEdit(false);

    // Sync to Supabase for authenticated users
    if (profile?.id) {
      const existingPrefs = (profile.preferences as Record<string, any>) || {};
      const existingSurvey = existingPrefs.surveyAnswers || {};
      await updateUserProfile(profile.id, {
        preferences: {
          ...existingPrefs,
          surveyAnswers: { ...existingSurvey, preferences: editingPreferences },
        },
      });
    }
  };

  const openPreferencesEdit = () => {
    // Initialize with current preferences
    const currentPrefs = preferences.map(p => p.value);
    setEditingPreferences(currentPrefs);
    setShowPreferencesEdit(true);
  };

  useEffect(() => {
    sessionState.navigateTo('/my-skin');
    loadSurveyData();
  }, [profile]);

  const loadSurveyData = () => {
    try {
      // Priority: Supabase profile > localStorage
      let surveyData = null;

      // Check for authenticated user with server data
      if (profile?.preferences?.surveyAnswers) {
        console.log('[DataSync] Loading survey data from Supabase profile');
        surveyData = profile.preferences.surveyAnswers;
      } else {
        // Fallback to localStorage for guests
        const savedSurvey = localStorage.getItem('skinSurveyData');
        if (savedSurvey) {
          console.log('[DataSync] Loading survey data from localStorage');
          surveyData = JSON.parse(savedSurvey);
        }
      }

      // Check if survey has meaningful data (at least skin type or concerns)
      const hasValidSurveyData = surveyData && (
        (surveyData.skinTypes && surveyData.skinTypes.length > 0) ||
        (surveyData.skinType && surveyData.skinType.length > 0) ||
        (surveyData.concerns && surveyData.concerns.length > 0) ||
        profile?.skin_type
      );

      if (hasValidSurveyData) {
        setHasSurveyData(true);

        // Map survey data to skin profile (handle both skinType and skinTypes)
        const primarySkinType = surveyData.skinTypes?.[0] || surveyData.skinType?.[0] || profile?.skin_type || 'Normal';
        const mappedConcerns = mapSurveyConcernsToConcerns(surveyData.concerns || []);
        // Get allergens from profile preferences or survey data
        const allergenList = profile?.preferences?.allergens || surveyData.allergens || [];
        const mappedAllergens = allergenList.map((allergen: string, index: number) => ({
          id: `allergen-${index}`,
          name: allergen,
          category: 'User Added'
        }));
        const mappedPreferences = mapSurveyPreferences(surveyData);

        // Update state
        setSkinProfile({
          skinType: primarySkinType,
          concerns: surveyData.concerns || [],
          goals: [],
          sensitivities: surveyData.allergens || [],
        });

        setConcerns(mappedConcerns);
        setAllergens(mappedAllergens);
        setPreferences(mappedPreferences);

        // Extract lifestyle factors from survey data
        if (surveyData.sleepPattern || surveyData.stressLevel || surveyData.dietPattern ||
            surveyData.waterIntake || surveyData.exerciseFrequency || surveyData.environmentalExposure) {
          setLifestyleFactors({
            sleepPattern: surveyData.sleepPattern || '',
            stressLevel: surveyData.stressLevel || '',
            dietPattern: surveyData.dietPattern || '',
            waterIntake: surveyData.waterIntake || '',
            exerciseFrequency: surveyData.exerciseFrequency || '',
            environmentalExposure: Array.isArray(surveyData.environmentalExposure)
              ? surveyData.environmentalExposure.join(', ')
              : surveyData.environmentalExposure || '',
          });
        }

        // Extended profile data (also check profile.preferences for fitzpatrickType)
        setExtendedProfile({
          sexAtBirth: surveyData.sexAtBirth || '',
          complexion: profile?.preferences?.fitzpatrickType || surveyData.complexion || '',
          acneType: surveyData.acneType || [],
          scarringType: surveyData.scarringType || [],
          environmentalExposure: Array.isArray(surveyData.environmentalExposure)
            ? surveyData.environmentalExposure
            : [],
        });

        // Sync with session state
        sessionState.updatePreferences({
          skinType: primarySkinType,
          concerns: surveyData.concerns || [],
          sensitivities: surveyData.allergens || [],
        });
      } else {
        // No valid survey data - show empty state
        setHasSurveyData(false);
      }
    } catch (error) {
      console.error('Error loading survey data:', error);
      setHasSurveyData(false);
    }
  };

  const loadDefaultData = () => {
    const mockConcerns: SkinConcern[] = [
      {
        id: '1',
        name: 'Acne & Breakouts',
        priority: 1,
        description: 'Active breakouts and acne-prone skin requiring targeted treatment',
        recommendedIngredients: ['Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide', 'Tea Tree Oil', 'Retinoids'],
        icon: 'ri-drop-line',
      },
      {
        id: '2',
        name: 'Uneven Skin Tone',
        priority: 2,
        description: 'Hyperpigmentation and post-inflammatory marks',
        recommendedIngredients: ['Vitamin C', 'Alpha Arbutin', 'Kojic Acid', 'Tranexamic Acid', 'Licorice Root'],
        icon: 'ri-contrast-2-line',
      },
      {
        id: '3',
        name: 'Fine Lines & Wrinkles',
        priority: 3,
        description: 'Signs of aging including wrinkles and loss of elasticity',
        recommendedIngredients: ['Retinol', 'Peptides', 'Hyaluronic Acid', 'Vitamin E', 'Coenzyme Q10'],
        icon: 'ri-time-line',
      },
    ];

    const mockAllergens: Allergen[] = [
      { id: '1', name: 'Fragrance', category: 'Synthetic' },
      { id: '2', name: 'Essential Oils', category: 'Natural' },
    ];

    const mockPreferences: UserPreference[] = [
      { id: '1', category: 'Product Type', value: 'Cruelty-Free' },
      { id: '2', category: 'Product Type', value: 'Vegan' },
    ];

    setConcerns(mockConcerns);
    setAllergens(mockAllergens);
    setPreferences(mockPreferences);
  };

  const mapSurveyConcernsToConcerns = (surveyConcerns: string[]): SkinConcern[] => {
    const concernMapping: { [key: string]: SkinConcern } = {
      'Acne Prone': {
        id: 'acne',
        name: 'Acne & Breakouts',
        priority: 1,
        description: 'Active breakouts and acne-prone skin requiring targeted treatment',
        recommendedIngredients: ['Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide', 'Tea Tree Oil', 'Retinoids'],
        icon: 'ri-drop-line',
      },
      'Uneven Skin Tone': {
        id: 'pigmentation',
        name: 'Uneven Skin Tone',
        priority: 2,
        description: 'Hyperpigmentation and post-inflammatory marks',
        recommendedIngredients: ['Vitamin C', 'Alpha Arbutin', 'Kojic Acid', 'Tranexamic Acid', 'Licorice Root'],
        icon: 'ri-contrast-2-line',
      },
      'Signs of Aging': {
        id: 'aging',
        name: 'Fine Lines & Wrinkles',
        priority: 3,
        description: 'Signs of aging including wrinkles and loss of elasticity',
        recommendedIngredients: ['Retinol', 'Peptides', 'Hyaluronic Acid', 'Vitamin E', 'Coenzyme Q10'],
        icon: 'ri-time-line',
      },
      'Lack of Hydration': {
        id: 'dryness',
        name: 'Dryness & Dehydration',
        priority: 4,
        description: 'Lack of moisture and compromised skin barrier',
        recommendedIngredients: ['Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Squalane', 'Shea Butter'],
        icon: 'ri-water-flash-line',
      },
      'Enlarged Pores': {
        id: 'pores',
        name: 'Enlarged Pores',
        priority: 5,
        description: 'Visible pores that need refinement',
        recommendedIngredients: ['Niacinamide', 'Salicylic Acid', 'Retinol', 'Clay Masks'],
        icon: 'ri-focus-3-line',
      },
      'Damaged Skin Barrier': {
        id: 'barrier',
        name: 'Barrier Repair',
        priority: 6,
        description: 'Compromised skin barrier needing restoration',
        recommendedIngredients: ['Ceramides', 'Centella Asiatica', 'Niacinamide', 'Panthenol'],
        icon: 'ri-shield-line',
      },
      'Rosacea': {
        id: 'rosacea',
        name: 'Redness & Rosacea',
        priority: 7,
        description: 'Persistent redness and sensitivity',
        recommendedIngredients: ['Azelaic Acid', 'Centella Asiatica', 'Green Tea', 'Niacinamide'],
        icon: 'ri-heart-pulse-line',
      },
      'Dullness': {
        id: 'dullness',
        name: 'Dullness',
        priority: 8,
        description: 'Lack of radiance and glow',
        recommendedIngredients: ['Vitamin C', 'AHA', 'Niacinamide', 'Licorice Root'],
        icon: 'ri-sun-line',
      },
      'Scarring': {
        id: 'scarring',
        name: 'Scarring',
        priority: 9,
        description: 'Post-acne marks and textural scarring',
        recommendedIngredients: ['Retinol', 'Vitamin C', 'Niacinamide', 'Alpha Arbutin'],
        icon: 'ri-contrast-drop-line',
      },
      'Textural Irregularities': {
        id: 'texture',
        name: 'Textural Irregularities',
        priority: 10,
        description: 'Uneven skin texture and rough patches',
        recommendedIngredients: ['AHA', 'BHA', 'Retinol', 'Niacinamide'],
        icon: 'ri-grid-line',
      },
    };

    const mapped: SkinConcern[] = [];
    let priority = 1;

    surveyConcerns.forEach(concern => {
      if (concernMapping[concern]) {
        mapped.push({
          ...concernMapping[concern],
          priority: priority++,
        });
      }
    });

    // If no mapped concerns, add a default
    if (mapped.length === 0) {
      mapped.push({
        id: 'general',
        name: 'General Skin Health',
        priority: 1,
        description: 'Maintaining healthy, balanced skin',
        recommendedIngredients: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin C', 'Ceramides'],
        icon: 'ri-heart-line',
      });
    }

    return mapped;
  };

  const mapSurveyPreferences = (surveyData: any): UserPreference[] => {
    const prefs: UserPreference[] = [];
    let id = 1;

    // Map preferences (but NOT skin types or complexion)
    if (surveyData.preferences && surveyData.preferences.length > 0) {
      surveyData.preferences.forEach((pref: string) => {
        prefs.push({
          id: `${id++}`,
          category: 'Product Preference',
          value: pref,
        });
      });
    }

    // Map lifestyle
    if (surveyData.lifestyle) {
      if (surveyData.lifestyle.skinCareTime) {
        prefs.push({
          id: `${id++}`,
          category: 'Routine Time',
          value: surveyData.lifestyle.skinCareTime,
        });
      }
      if (surveyData.lifestyle.stressLevel) {
        prefs.push({
          id: `${id++}`,
          category: 'Stress Level',
          value: surveyData.lifestyle.stressLevel,
        });
      }
    }

    return prefs;
  };


  const handlePrioritize = (concern: SkinConcern, destination: 'products' | 'services') => {
    try {
      sessionState.trackInteraction('click', 'prioritize-concern', { concern: concern.name, destination });
      if (destination === 'products') {
        setSelectedConcernForProduct(concern);
        setShowProductPopup(true);
      } else {
        setSelectedConcernForService(concern);
        setShowServicePopup(true);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleAddAllergen = () => {
    try {
      if (newAllergen.name.trim()) {
        const existingAllergen = allergens.find(a => a.name.toLowerCase() === newAllergen.name.trim().toLowerCase());
        if (existingAllergen) {
          alert('This allergen already exists in your list.');
          return;
        }
        
        const updatedAllergens = [
          ...allergens,
          {
            id: Date.now().toString(),
            name: newAllergen.name.trim(),
            category: newAllergen.category,
          },
        ];
        setAllergens(updatedAllergens);
        
        // Update session state
        const allergenNames = updatedAllergens.map(a => a.name);
        sessionState.updatePreferences({ sensitivities: allergenNames });
        sessionState.trackInteraction('click', 'add-allergen', { allergen: newAllergen.name });
        
        setNewAllergen({ name: '', category: 'Synthetic' });
        setShowAddAllergen(false);
      }
    } catch (error) {
      console.error('Error adding allergen:', error);
    }
  };

  const handleRemoveAllergen = (id: string) => {
    try {
      const updatedAllergens = allergens.filter(a => a.id !== id);
      setAllergens(updatedAllergens);
      
      // Update session state
      const allergenNames = updatedAllergens.map(a => a.name);
      sessionState.updatePreferences({ sensitivities: allergenNames });
      sessionState.trackInteraction('click', 'remove-allergen', { id });
    } catch (error) {
      console.error('Error removing allergen:', error);
    }
  };

  const handleRetakeQuiz = () => {
    try {
      sessionState.trackInteraction('click', 'retake-quiz');
      navigate('/skin-survey-account');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Helper function to get Fitzpatrick color
  const getFitzpatrickColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Type I - Very Fair': '#F8E4D9',
      'Type II - Fair': '#F0D5C4',
      'Type III - Medium': '#D8B094',
      'Type IV - Olive': '#C49A6C',
      'Type V - Brown': '#A67C52',
      'Type VI - Dark Brown/Black': '#6B4423',
    };
    return colors[type] || '#D8B094';
  };

  // Helper function to get Fitzpatrick description
  const getFitzpatrickDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'Type I - Very Fair': 'Burns easily, rarely tans. High sun sensitivity.',
      'Type II - Fair': 'Burns easily, tans minimally. High sun sensitivity.',
      'Type III - Medium': 'Sometimes burns, tans gradually. Moderate sun sensitivity.',
      'Type IV - Olive': 'Rarely burns, tans easily. Lower sun sensitivity.',
      'Type V - Brown': 'Very rarely burns, tans darkly. Lower sun sensitivity.',
      'Type VI - Dark Brown/Black': 'Never burns, deeply pigmented. Still needs sun protection.',
    };
    return descriptions[type] || 'Sun protection recommended for all skin types.';
  };

  // Helper function to get environment icon
  const getEnvironmentIcon = (factor: string): string => {
    const icons: Record<string, string> = {
      'Urban/City': 'ri-building-line',
      'Suburban': 'ri-home-4-line',
      'Rural': 'ri-plant-line',
      'High Pollution': 'ri-cloud-windy-line',
      'Low Pollution': 'ri-leaf-line',
      'Dry Climate': 'ri-sun-line',
      'Humid Climate': 'ri-rainy-line',
      'Cold Climate': 'ri-snowy-line',
      'Hot Climate': 'ri-temp-hot-line',
      'Air Conditioning': 'ri-windy-line',
      'Central Heating': 'ri-fire-line',
    };
    return icons[factor] || 'ri-map-pin-line';
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleIngredients = (concernId: string) => {
    setExpandedIngredients(prev => ({
      ...prev,
      [concernId]: !prev[concernId],
    }));
  };

  // Loading state
  if (hasSurveyData === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-gray text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Empty state - no survey completed
  if (hasSurveyData === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <main className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="ri-user-heart-line text-4xl text-primary"></i>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-4">
                Your Skin Profile
              </h1>

              {/* Description */}
              <p className="text-warm-gray text-base mb-8 max-w-md mx-auto">
                Complete your skin survey to unlock personalized recommendations,
                track your concerns, and build a routine tailored to your unique skin.
              </p>

              {/* CTA */}
              <button
                onClick={() => navigate('/onboarding')}
                className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-dark transition-colors cursor-pointer"
              >
                Start Survey
              </button>

              {/* Benefits */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-white rounded-xl border border-blush">
                  <div className="w-10 h-10 mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="ri-focus-3-line text-xl text-primary"></i>
                  </div>
                  <h3 className="font-semibold text-deep text-sm mb-1">Identify Concerns</h3>
                  <p className="text-xs text-warm-gray">Understand your skin's unique needs and challenges.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-blush">
                  <div className="w-10 h-10 mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="ri-flask-line text-xl text-primary"></i>
                  </div>
                  <h3 className="font-semibold text-deep text-sm mb-1">Ingredient Matches</h3>
                  <p className="text-xs text-warm-gray">Get recommended ingredients for your concerns.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-blush">
                  <div className="w-10 h-10 mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="ri-calendar-check-line text-xl text-primary"></i>
                  </div>
                  <h3 className="font-semibold text-deep text-sm mb-1">Build Routines</h3>
                  <p className="text-xs text-warm-gray">AI-powered routines that evolve with your skin.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep">
                My Skin Profile
              </h1>
              <button
                onClick={() => navigate('/routines-list')}
                className="px-4 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-cream transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                Routine
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
            </div>
            <p className="text-sm text-warm-gray">
              Your personalized skin analysis
            </p>
          </div>

          {/* Category Cards */}
          <div className="space-y-4">
            {/* 1. Skin Basics */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 overflow-hidden">
              <button
                onClick={() => toggleCategory('skinBasics')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i className="ri-user-heart-line text-primary text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Skin Basics</h2>
                    <p className="text-xs text-warm-gray">Type, allergens & conditions</p>
                  </div>
                </div>
                <i className={`ri-arrow-${expandedCategories.skinBasics ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
              </button>

              {expandedCategories.skinBasics && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Skin Type */}
                    {skinProfile.skinType && (
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-warm-gray mb-1">Skin Type</p>
                        <p className="text-sm font-semibold text-deep">{skinProfile.skinType}</p>
                      </div>
                    )}

                    {/* Fitzpatrick Type */}
                    {extendedProfile.complexion && (
                      <div className="p-3 bg-gradient-to-br from-primary-50 to-cream rounded-lg border border-blush">
                        <p className="text-xs text-warm-gray mb-1">Fitzpatrick Type</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: getFitzpatrickColor(extendedProfile.complexion) }}
                          />
                          <p className="text-sm font-semibold text-deep truncate">{extendedProfile.complexion.split(' - ')[0]}</p>
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    <div className="p-3 bg-primary-50/50 rounded-lg border border-blush">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-warm-gray">Allergies</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAddAllergen(true); }}
                          className="text-xs text-primary hover:text-dark cursor-pointer"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-deep">{allergens.length} items</p>
                    </div>

                    {/* Acne Types */}
                    {extendedProfile.acneType && extendedProfile.acneType.length > 0 && (
                      <div className="p-3 bg-primary-50/50 rounded-lg border border-blush">
                        <p className="text-xs text-warm-gray mb-1">Acne Types</p>
                        <p className="text-sm font-semibold text-deep">{extendedProfile.acneType.length} types</p>
                      </div>
                    )}

                    {/* Scarring Types */}
                    {extendedProfile.scarringType && extendedProfile.scarringType.length > 0 && (
                      <div className="p-3 bg-cream/50 rounded-lg border border-blush">
                        <p className="text-xs text-warm-gray mb-1">Scarring</p>
                        <p className="text-sm font-semibold text-deep">{extendedProfile.scarringType.length} types</p>
                      </div>
                    )}
                  </div>

                  {/* Allergens Detail */}
                  {allergens.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-warm-gray/10">
                      <p className="text-xs font-medium text-warm-gray mb-2">Allergens to avoid:</p>
                      <div className="flex flex-wrap gap-2">
                        {allergens.map((allergen) => (
                          <span
                            key={allergen.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200"
                          >
                            <i className="ri-close-circle-line text-xs"></i>
                            {allergen.name}
                            <button
                              onClick={() => handleRemoveAllergen(allergen.id)}
                              className="ml-1 hover:text-primary-800 cursor-pointer"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Allergen Form */}
                  {showAddAllergen && (
                    <div className="mt-3 p-3 bg-cream rounded-lg">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Allergen name"
                          value={newAllergen.name}
                          onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                          className="flex-1 px-3 py-2 text-sm border border-blush rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Dropdown
                          id="allergen-category"
                          value={newAllergen.category}
                          onChange={(value) => setNewAllergen({ ...newAllergen, category: value })}
                          options={[
                            { value: 'Synthetic', label: 'Synthetic' },
                            { value: 'Natural', label: 'Natural' },
                            { value: 'Chemical', label: 'Chemical' },
                            { value: 'Preservative', label: 'Preservative' },
                          ]}
                          className="min-w-[140px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddAllergen} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-dark cursor-pointer">Add</button>
                        <button onClick={() => setShowAddAllergen(false)} className="px-3 py-1.5 bg-warm-gray/20 text-warm-gray text-sm rounded-lg cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Concerns & Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 overflow-hidden">
              <button
                onClick={() => toggleCategory('concernsGoals')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i className="ri-focus-3-line text-primary text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Concerns</h2>
                    <p className="text-xs text-warm-gray">{concerns.length} active concerns</p>
                  </div>
                </div>
                <i className={`ri-arrow-${expandedCategories.concernsGoals ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
              </button>

              {expandedCategories.concernsGoals && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4 space-y-3">
                    {concerns.map((concern) => (
                      <div
                        key={concern.id}
                        className="p-3 bg-cream/50 rounded-lg border border-blush hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {concern.priority}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <i className={`${concern.icon} text-lg text-deep`}></i>
                              <h3 className="font-semibold text-deep text-sm">{concern.name}</h3>
                            </div>
                            <p className="text-xs text-warm-gray mb-2 line-clamp-1">{concern.description}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(expandedIngredients[concern.id]
                                ? concern.recommendedIngredients
                                : concern.recommendedIngredients.slice(0, 3)
                              ).map((ing, idx) => (
                                <Link
                                  key={idx}
                                  to={`/ingredients?id=${ing.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                                  className="px-2 py-0.5 bg-white text-deep text-xs rounded-full border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer"
                                >
                                  {ing}
                                </Link>
                              ))}
                              {concern.recommendedIngredients.length > 3 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleIngredients(concern.id);
                                  }}
                                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer font-medium"
                                  aria-expanded={expandedIngredients[concern.id]}
                                  aria-label={expandedIngredients[concern.id]
                                    ? 'Show fewer ingredients'
                                    : `Show ${concern.recommendedIngredients.length - 3} more ingredients`}
                                >
                                  {expandedIngredients[concern.id]
                                    ? 'Show less'
                                    : `+${concern.recommendedIngredients.length - 3}`}
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-warm-gray/70 italic mb-2">
                              <i className="ri-search-eye-line mr-1"></i>Look for these ingredients in products
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePrioritize(concern, 'products')}
                                className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium cursor-pointer hover:bg-dark transition-colors"
                              >
                                <i className="ri-shopping-bag-line mr-1"></i>Products
                              </button>
                              <button
                                onClick={() => handlePrioritize(concern, 'services')}
                                className="px-3 py-1.5 bg-white border border-primary text-deep rounded-md text-xs font-medium cursor-pointer hover:bg-cream transition-colors"
                              >
                                <i className="ri-store-line mr-1"></i>Services
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Lifestyle & Environment */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 overflow-hidden">
              <button
                onClick={() => toggleCategory('lifestyle')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i className="ri-sun-foggy-line text-primary text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Lifestyle & Environment</h2>
                    <p className="text-xs text-warm-gray">Daily habits & exposure factors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLifestyle({
                        sleepPattern: lifestyleFactors?.sleepPattern || '',
                        stressLevel: lifestyleFactors?.stressLevel || '',
                        dietPattern: lifestyleFactors?.dietPattern || '',
                        waterIntake: lifestyleFactors?.waterIntake || '',
                        exerciseFrequency: lifestyleFactors?.exerciseFrequency || '',
                        environmentalExposure: lifestyleFactors?.environmentalExposure || '',
                      });
                      setShowLifestyleCheckin(true);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); (e.target as HTMLElement).click(); } }}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <i className="ri-edit-line mr-1"></i>Update
                  </span>
                  <i className={`ri-arrow-${expandedCategories.lifestyle ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
                </div>
              </button>

              {expandedCategories.lifestyle && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {lifestyleFactors?.sleepPattern && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Sleep</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.sleepPattern.replace(/\s*hours?\s*/i, 'h')}</p>
                      </div>
                    )}

                    {lifestyleFactors?.stressLevel && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Stress</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.stressLevel.split(' - ')[0]}</p>
                      </div>
                    )}

                    {lifestyleFactors?.dietPattern && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Diet</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.dietPattern.split('/')[0]}</p>
                      </div>
                    )}

                    {lifestyleFactors?.waterIntake && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Hydration</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.waterIntake.replace('glasses', 'glasses/day')}</p>
                      </div>
                    )}

                    {lifestyleFactors?.exerciseFrequency && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Exercise</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.exerciseFrequency.replace('times per week', '×/week')}</p>
                      </div>
                    )}

                    {lifestyleFactors?.environmentalExposure && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-warm-gray/60 mb-0.5">Environment</p>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.environmentalExposure}</p>
                      </div>
                    )}
                  </div>

                  {/* Environmental Exposure Tags */}
                  {extendedProfile.environmentalExposure && extendedProfile.environmentalExposure.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-warm-gray/10">
                      <p className="text-xs font-medium text-warm-gray mb-2">Environmental factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {extendedProfile.environmentalExposure.map((factor, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-sage-50 text-sage-700 text-xs rounded-full border border-sage-200"
                          >
                            <i className={`${getEnvironmentIcon(factor)} text-xs`}></i>
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!lifestyleFactors && (
                    <p className="pt-4 text-sm text-warm-gray text-center">No lifestyle data available. Retake quiz to add.</p>
                  )}
                </div>
              )}
            </div>

            {/* 4. Product Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 overflow-hidden">
              <button
                onClick={() => toggleCategory('preferences')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i className="ri-shopping-bag-line text-primary text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Product Preferences</h2>
                    <p className="text-xs text-warm-gray">{preferences.length} preferences set</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreferencesEdit();
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); (e.target as HTMLElement).click(); } }}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <i className="ri-edit-line mr-1"></i>Update
                  </span>
                  <i className={`ri-arrow-${expandedCategories.preferences ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
                </div>
              </button>

              {expandedCategories.preferences && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4">
                    {preferences.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {preferences.map((pref) => (
                          <span key={pref.id} className="px-3 py-1.5 bg-cream/50 rounded-full border border-blush text-sm text-deep font-medium">
                            {pref.value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-warm-gray text-center py-4">No preferences set. Retake quiz to add.</p>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Service Selection Popup */}
      {showServicePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowServicePopup(false)}
              className="absolute top-4 right-4 text-warm-gray/60 hover:text-warm-gray transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-store-line text-deep text-3xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-2">Find Services</h3>
              <p className="text-warm-gray text-sm">
                {selectedConcernForService && `for ${selectedConcernForService.name}`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigate('/marketplace', { state: { concernFilter: selectedConcernForService?.name } });
                  setShowServicePopup(false);
                }}
                className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="ri-shopping-bag-3-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-semibold">Marketplace</p>
                  <p className="text-sm text-light">Browse curated services and products</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </button>

              <button
                onClick={() => {
                  navigate('/services', { state: { concernFilter: selectedConcernForService?.name } });
                  setShowServicePopup(false);
                }}
                className="w-full px-6 py-4 bg-white border-2 border-primary text-deep rounded-xl hover:bg-cream transition-colors text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="ri-search-line text-2xl text-deep"></i>
                </div>
                <div>
                  <p className="font-semibold">Search for Services</p>
                  <p className="text-sm text-warm-gray">Find specific skincare services</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Popup */}
      {showProductPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowProductPopup(false)}
              className="absolute top-4 right-4 text-warm-gray/60 hover:text-warm-gray transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <i className="ri-shopping-bag-line text-deep text-3xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-2">Find Products</h3>
              <p className="text-warm-gray text-sm">
                {selectedConcernForProduct && `for ${selectedConcernForProduct.name}`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigate('/marketplace', { state: { concernFilter: selectedConcernForProduct?.name } });
                  setShowProductPopup(false);
                }}
                className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="ri-shopping-bag-3-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-semibold">Marketplace</p>
                  <p className="text-sm text-white">Browse curated products and services</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </button>

              <button
                onClick={() => {
                  navigate('/discover', { state: { concernFilter: selectedConcernForProduct?.name } });
                  setShowProductPopup(false);
                }}
                className="w-full px-6 py-4 bg-white border-2 border-primary text-deep rounded-xl hover:bg-cream transition-colors text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="ri-search-line text-2xl text-deep"></i>
                </div>
                <div>
                  <p className="font-semibold">Search for Products</p>
                  <p className="text-sm text-warm-gray">Find specific skincare products</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle Check-in Modal */}
      {showLifestyleCheckin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush">
              <h3 className="font-serif text-lg font-bold text-deep">Lifestyle Check-in</h3>
              <button
                onClick={() => setShowLifestyleCheckin(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-gray/10 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {Object.entries(lifestyleOptions).map(([key, { emoji, options }]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-warm-gray mb-2">{lifestyleLabels[key]}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setEditingLifestyle(prev => ({ ...prev, [key]: option }))}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                          editingLifestyle[key as keyof typeof editingLifestyle] === option
                            ? 'bg-primary text-white'
                            : 'bg-white text-deep border border-blush hover:border-primary/40'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-5 border-t border-blush">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLifestyleCheckin(false)}
                  className="px-4 py-2 text-sm text-warm-gray hover:text-deep transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLifestyle}
                  className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Preferences Edit Modal */}
      {showPreferencesEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-2xl shadow-2xl max-w-xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush">
              <h3 className="font-serif text-lg font-bold text-deep">Product Preferences</h3>
              <button
                onClick={() => setShowPreferencesEdit(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-gray/10 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((option) => {
                  const isSelected = editingPreferences.includes(option.label);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleTogglePreference(option.label)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-white text-deep border border-blush hover:border-primary/40'
                      }`}
                    >
                      {isSelected && <i className="ri-check-line text-sm"></i>}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-blush">
              <div className="flex items-center gap-3">
                <span className="text-xs text-warm-gray">
                  {editingPreferences.length} selected
                </span>
                {editingPreferences.length > 0 && (
                  <button
                    onClick={() => setEditingPreferences([])}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreferencesEdit(false)}
                  className="px-4 py-2 text-sm text-warm-gray hover:text-deep transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

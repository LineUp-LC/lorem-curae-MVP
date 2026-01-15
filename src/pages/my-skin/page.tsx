import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState } from '../../lib/utils/sessionState';

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

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MySkinPage() {
  const navigate = useNavigate();
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

  // Assessment states
  const [selectedConcern, setSelectedConcern] = useState<string>('');
  const [showConcernDropdown, setShowConcernDropdown] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1month');
  const [assessmentMessages, setAssessmentMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI skin assessment assistant. Select a concern and timeframe to analyze your progress.',
      timestamp: new Date(),
    },
  ]);
  const [assessmentInput, setAssessmentInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [selectedConcernForService, setSelectedConcernForService] = useState<SkinConcern | null>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [selectedConcernForProduct, setSelectedConcernForProduct] = useState<SkinConcern | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [expandedIngredients, setExpandedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    sessionState.navigateTo('/my-skin');
    loadSurveyData();
  }, []);

  const loadSurveyData = () => {
    try {
      const savedSurvey = localStorage.getItem('skinSurveyData');
      if (savedSurvey) {
        const surveyData = JSON.parse(savedSurvey);
        
        // Map survey data to skin profile
        const primarySkinType = surveyData.skinType?.[0] || 'Normal';
        const mappedConcerns = mapSurveyConcernsToConcerns(surveyData.concerns || []);
        const mappedAllergens = (surveyData.allergens || []).map((allergen: string, index: number) => ({
          id: `allergen-${index}`,
          name: allergen,
          category: 'User Added'
        }));
        const mappedPreferences = mapSurveyPreferences(surveyData);

        // Save raw concern strings for matching, not SkinConcern objects
        // This ensures DiscoverPage can use these directly with matching.ts
        localStorage.setItem('userConcerns', JSON.stringify(surveyData.concerns || []));


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

        // Extended profile data
        setExtendedProfile({
          sexAtBirth: surveyData.sexAtBirth || '',
          complexion: surveyData.complexion || '',
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
        // Load default mock data if no survey data
        loadDefaultData();
      }
    } catch (error) {
      console.error('Error loading survey data:', error);
      loadDefaultData();
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

  const basicProducts = [
    {
      id: '1',
      name: 'Gentle Cleanser',
      description: 'pH-balanced, non-stripping formula for daily cleansing',
      icon: 'ri-bubble-chart-line',
    },
    {
      id: '2',
      name: 'Hydrating Moisturizer',
      description: 'Locks in moisture and strengthens skin barrier',
      icon: 'ri-drop-line',
    },
    {
      id: '3',
      name: 'Broad Spectrum SPF 30+',
      description: 'Daily sun protection against UVA/UVB rays',
      icon: 'ri-sun-line',
    },
  ];

  const timeframes = [
    { id: '1day', label: '1 Day', value: '1 day' },
    { id: '1week', label: '1 Week', value: '1 week' },
    { id: '1month', label: '1 Month', value: '1 month' },
    { id: '3months', label: '3 Months', value: '3 months' },
    { id: '6months', label: '6 Months', value: '6 months' },
  ];

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

  const handleSelectConcern = (concern: SkinConcern) => {
    setSelectedConcern(concern.name);
    setShowConcernDropdown(false);
    
    sessionState.trackInteraction('selection', 'assessment-concern', { concern: concern.name });
    
    // Generate initial assessment
    const initialAssessment: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Great! I'll assess your progress with ${concern.name} over the ${timeframes.find(t => t.id === selectedTimeframe)?.label.toLowerCase()} timeframe. Based on your routine and notes, I can provide insights on improvements, setbacks, and recommendations.`,
      timestamp: new Date(),
    };
    setAssessmentMessages([assessmentMessages[0], initialAssessment]);
  };

  const handleTimeframeChange = (timeframeId: string) => {
    setSelectedTimeframe(timeframeId);
    
    sessionState.trackInteraction('selection', 'assessment-timeframe', { timeframe: timeframeId });
    
    if (selectedConcern) {
      const timeframeLabel = timeframes.find(t => t.id === timeframeId)?.label.toLowerCase();
      const updateMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Timeframe updated to ${timeframeLabel}. I'll now analyze your ${selectedConcern} progress over this period.`,
        timestamp: new Date(),
      };
      setAssessmentMessages(prev => [...prev, updateMessage]);
    }
  };

  const handleSendAssessmentMessage = () => {
    if (!assessmentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: assessmentInput,
      timestamp: new Date(),
    };
    setAssessmentMessages(prev => [...prev, userMessage]);
    
    sessionState.trackInteraction('input', 'assessment-query', { query: assessmentInput });
    
    setAssessmentInput('');
    setIsAssessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAssessmentResponse(assessmentInput, selectedConcern, selectedTimeframe);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setAssessmentMessages(prev => [...prev, aiMessage]);
      setIsAssessing(false);
    }, 1500);
  };

  const generateAssessmentResponse = (query: string, concern: string, timeframe: string): string => {
    const timeframeLabel = timeframes.find(t => t.id === timeframe)?.label.toLowerCase() || '1 month';
    
    if (!concern) {
      return 'Please select a concern first so I can provide a targeted assessment of your progress.';
    }

    const lowerQuery = query.toLowerCase();
    
    // Personalized responses based on user's actual concerns
    const concernData = concerns.find(c => c.name === concern);
    const ingredients = concernData?.recommendedIngredients.slice(0, 3).join(', ') || 'targeted ingredients';
    
    if (lowerQuery.includes('progress') || lowerQuery.includes('improvement')) {
      return `Based on your ${timeframeLabel} journey with ${concern}:\n\n📊 **Progress Analysis:**\n• Visible improvements in affected areas\n• Reduced severity of symptoms\n• Better skin texture and tone\n\n✨ **Key Observations:**\n• Your consistent routine is showing results\n• Products with ${ingredients} are working well\n• Continue current regimen for optimal results\n\n💡 **Recommendation:** Keep tracking your progress with photos and notes. You're on the right path!`;
    }
    
    if (lowerQuery.includes('product') || lowerQuery.includes('routine')) {
      return `For your ${concern} over ${timeframeLabel}:\n\n🎯 **Product Effectiveness:**\n• Active ingredients (${ingredients}) are showing positive results\n• No adverse reactions detected\n• Absorption and application timing are optimal\n\n📋 **Routine Assessment:**\n• Morning routine: Well-balanced\n• Evening routine: Effective treatment application\n• Consistency: Excellent (95%+)\n\n💡 **Suggestion:** Consider adding a weekly treatment for enhanced results.`;
    }
    
    if (lowerQuery.includes('concern') || lowerQuery.includes('issue')) {
      return `Analyzing your ${concern} over ${timeframeLabel}:\n\n⚠️ **Current Status:**\n• Overall improvement: 65%\n• Active concerns: Decreasing\n• New issues: Minimal\n\n🔍 **Detailed Insights:**\n• Initial phase showed adjustment period\n• Mid-period demonstrated clear improvements\n• Recent progress is steady and consistent\n\n💡 **Next Steps:** Continue current routine and reassess in 2 weeks.`;
    }
    
    return `Assessment for ${concern} (${timeframeLabel}):\n\n📈 **Overall Progress:** Positive trajectory\n\n🎯 **Key Findings:**\n• Your skin is responding well to treatment\n• Consistency in routine is paying off\n• Recommended ingredients (${ingredients}) are effective\n\n💪 **Strengths:**\n• Regular product application\n• Good documentation in notes\n• Following recommended guidelines\n\n💡 **Recommendations:**\n• Continue current routine\n• Take weekly progress photos\n• Stay patient - results take time\n\nWhat specific aspect would you like me to analyze further?`;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep">
                My Skin Profile
              </h1>
              <button
                onClick={handleRetakeQuiz}
                className="px-4 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-cream transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-refresh-line mr-2"></i>
                Retake Quiz
              </button>
            </div>
            <p className="text-sm text-warm-gray">
              Your personalized skin analysis
            </p>
          </div>

          {/* AI Assessment Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl p-4 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <i className="ri-line-chart-line text-xl"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-medium text-base">
                      Curae AI Assessment
                    </h2>
                    <p className="text-xs text-white/80">
                      Track your skincare journey
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <i className="ri-arrow-right-line text-lg"></i>
                </div>
              </div>
            </button>
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
                    <p className="text-xs text-warm-gray">Type, sensitivities & conditions</p>
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

                    {/* Sensitivities Count */}
                    <div className="p-3 bg-cream rounded-lg border border-blush">
                      <p className="text-xs text-warm-gray mb-1">Sensitivities</p>
                      <p className="text-sm font-semibold text-deep">{skinProfile.sensitivities.length || 0} tracked</p>
                      <p className="text-xs text-deep/60 leading-relaxed mt-1">Ingredients or factors your skin reacts to, like fragrance or certain actives.</p>
                    </div>

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
                        <select
                          value={newAllergen.category}
                          onChange={(e) => setNewAllergen({ ...newAllergen, category: e.target.value })}
                          className="px-3 py-2 text-sm border border-blush rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          <option value="Synthetic">Synthetic</option>
                          <option value="Natural">Natural</option>
                          <option value="Chemical">Chemical</option>
                          <option value="Preservative">Preservative</option>
                        </select>
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
                                <span key={idx} className="px-2 py-0.5 bg-white text-deep text-xs rounded-full border border-primary/20">
                                  {ing}
                                </span>
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
                  <div className="w-9 h-9 rounded-lg bg-sage/10 flex items-center justify-center">
                    <i className="ri-sun-foggy-line text-sage text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Lifestyle & Environment</h2>
                    <p className="text-xs text-warm-gray">Daily habits & exposure factors</p>
                  </div>
                </div>
                <i className={`ri-arrow-${expandedCategories.lifestyle ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
              </button>

              {expandedCategories.lifestyle && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {lifestyleFactors?.sleepPattern && (
                      <div className="p-3 bg-primary-50/50 rounded-lg border border-blush">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-moon-line text-primary text-sm"></i>
                          <p className="text-xs text-primary font-medium">Sleep</p>
                        </div>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.sleepPattern}</p>
                      </div>
                    )}

                    {lifestyleFactors?.stressLevel && (
                      <div className="p-3 bg-cream/50 rounded-lg border border-blush">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-mental-health-line text-primary text-sm"></i>
                          <p className="text-xs text-primary font-medium">Stress</p>
                        </div>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.stressLevel}</p>
                      </div>
                    )}

                    {lifestyleFactors?.dietPattern && (
                      <div className="p-3 bg-sage-50/50 rounded-lg border border-sage-200">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-restaurant-line text-sage text-sm"></i>
                          <p className="text-xs text-sage font-medium">Diet</p>
                        </div>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.dietPattern}</p>
                      </div>
                    )}

                    {lifestyleFactors?.waterIntake && (
                      <div className="p-3 bg-sage-50/50 rounded-lg border border-sage-200">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-drop-line text-sage text-sm"></i>
                          <p className="text-xs text-sage font-medium">Hydration</p>
                        </div>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.waterIntake}</p>
                      </div>
                    )}

                    {lifestyleFactors?.exerciseFrequency && (
                      <div className="p-3 bg-primary-50/50 rounded-lg border border-blush">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-run-line text-primary text-sm"></i>
                          <p className="text-xs text-primary font-medium">Exercise</p>
                        </div>
                        <p className="text-sm font-semibold text-deep">{lifestyleFactors.exerciseFrequency}</p>
                      </div>
                    )}

                    {lifestyleFactors?.environmentalExposure && (
                      <div className="p-3 bg-warm-gray-50/50 rounded-lg border border-warm-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-cloud-line text-warm-gray text-sm"></i>
                          <p className="text-xs text-warm-gray font-medium">Environment</p>
                        </div>
                        <p className="text-sm font-semibold text-deep truncate">{lifestyleFactors.environmentalExposure}</p>
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
                    <i className="ri-settings-3-line text-primary text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-bold text-deep">Product Preferences</h2>
                    <p className="text-xs text-warm-gray">{preferences.length} preferences set</p>
                  </div>
                </div>
                <i className={`ri-arrow-${expandedCategories.preferences ? 'up' : 'down'}-s-line text-warm-gray text-xl`}></i>
              </button>

              {expandedCategories.preferences && (
                <div className="px-5 pb-5 border-t border-warm-gray/10">
                  <div className="pt-4">
                    {preferences.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {preferences.map((pref) => (
                          <div key={pref.id} className="p-3 bg-primary-50/50 rounded-lg border border-blush">
                            <p className="text-xs text-primary mb-1">{pref.category}</p>
                            <p className="text-sm font-semibold text-deep">{pref.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-warm-gray text-center py-4">No preferences set. Retake quiz to add.</p>
                    )}

                    {/* Essential Products */}
                    <div className="mt-4 pt-4 border-t border-warm-gray/10">
                      <p className="text-xs font-medium text-warm-gray mb-3">Recommended essentials:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {basicProducts.map((product) => (
                          <div key={product.id} className="p-2 bg-cream/50 rounded-lg text-center">
                            <i className={`${product.icon} text-lg text-primary mb-1`}></i>
                            <p className="text-xs font-medium text-deep">{product.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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

      {/* AI Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowAssessmentModal(false)}
              className="absolute top-4 right-4 text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center">
                <i className="ri-line-chart-line text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-deep">
                  Curae AI Assessment
                </h2>
                <p className="text-sm text-warm-gray">
                  Track your skincare journey
                </p>
              </div>
            </div>

            {/* Assessment Controls */}
            <div className="space-y-4 mb-4">
              {/* Select Concern */}
              <div>
                <label className="block text-sm font-medium text-deep mb-2">
                  Select Your Concern
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowConcernDropdown(!showConcernDropdown)}
                    className="w-full px-4 py-3 bg-white border-2 border-blush rounded-lg text-left flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <span className={selectedConcern ? 'text-deep font-medium' : 'text-warm-gray/80'}>
                      {selectedConcern || 'Choose a concern...'}
                    </span>
                    <i className={`ri-arrow-${showConcernDropdown ? 'up' : 'down'}-s-line text-deep`}></i>
                  </button>

                  {showConcernDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blush rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {concerns.map((concern) => (
                        <button
                          key={concern.id}
                          onClick={() => handleSelectConcern(concern)}
                          className="w-full px-4 py-2 text-left hover:bg-cream transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className={`${concern.icon} text-deep text-lg`}></i>
                          <div>
                            <p className="font-medium text-deep text-sm">{concern.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeframe Selection - 3 columns */}
              <div>
                <label className="block text-sm font-medium text-deep mb-2">
                  Assessment Timeframe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe.id}
                      onClick={() => handleTimeframeChange(timeframe.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        selectedTimeframe === timeframe.id
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white text-warm-gray hover:bg-blush'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Chat Box */}
            <div className="flex flex-col bg-white rounded-xl border-2 border-blush overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative">
                    <i className="ri-sparkling-2-fill text-lg"></i>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sage rounded-full border border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Curae AI</h3>
                    <p className="text-xs text-white/80">Ready to help</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[300px]">
                {assessmentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-cream text-deep border border-blush'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="ri-sparkling-2-fill text-primary text-xs"></i>
                          </div>
                          <span className="text-xs font-medium text-deep">Curae</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-warm-gray/60'}`}>
                        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isAssessing && (
                  <div className="flex justify-start">
                    <div className="bg-cream rounded-2xl px-4 py-2 border border-blush">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <i className="ri-sparkling-2-fill text-primary text-xs"></i>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-cream/50 border-t border-blush">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assessmentInput}
                    onChange={(e) => setAssessmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendAssessmentMessage()}
                    placeholder={selectedConcern ? 'Ask about your progress...' : 'Select a concern first...'}
                    disabled={!selectedConcern}
                    className="flex-1 px-4 py-2 border border-blush rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-cream disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendAssessmentMessage}
                    disabled={!assessmentInput.trim() || !selectedConcern}
                    className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <i className="ri-send-plane-fill text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

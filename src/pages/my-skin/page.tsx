import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState } from '../../utils/sessionState';

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

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// ... existing code ...

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
  const [showAddAllergen, setShowAddAllergen] = useState(false);
  const [newAllergen, setNewAllergen] = useState({ name: '', category: 'Synthetic' });
  
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

  // Load survey data on mount
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
        const primarySkinType = surveyData.skinTypes?.[0] || 'Normal';
        const mappedConcerns = mapSurveyConcernsToConcerns(surveyData.concerns || []);
        const mappedAllergens = (surveyData.allergens || []).map((allergen: string, index: number) => ({
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
        name: 'Hyperpigmentation',
        priority: 2,
        description: 'Dark spots, uneven skin tone, and post-inflammatory marks',
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
        name: 'Hyperpigmentation',
        priority: 2,
        description: 'Dark spots, uneven skin tone, and post-inflammatory marks',
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

    // Map skin types
    if (surveyData.skinTypes && surveyData.skinTypes.length > 0) {
      surveyData.skinTypes.forEach((type: string) => {
        prefs.push({
          id: `${id++}`,
          category: 'Skin Type',
          value: type,
        });
      });
    }

    // Map preferences
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

    // Map complexion
    if (surveyData.complexion) {
      prefs.push({
        id: `${id++}`,
        category: 'Complexion',
        value: surveyData.complexion,
      });
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
        navigate('/discover', { state: { concernFilter: concern.name } });
      } else {
        navigate('/services', { state: { concernFilter: concern.name } });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F3] to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-['Cormorant_Garamond'] text-5xl font-bold text-[#2C5F4F]">
                My Skin Profile
              </h1>
              <button
                onClick={handleRetakeQuiz}
                className="px-6 py-3 bg-white border-2 border-[#2C5F4F] text-[#2C5F4F] rounded-lg hover:bg-[#F8F6F3] transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-refresh-line mr-2"></i>
                Retake Skin Quiz
              </button>
            </div>
            <p className="text-lg text-gray-600">
              Your personalized skin analysis based on your quiz results
            </p>
          </div>

          {/* Skin Type Display */}
          {skinProfile.skinType && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[#2C5F4F] to-[#3D7A63] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="ri-user-heart-line text-3xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-white/80 mb-1">Your Primary Skin Type</p>
                    <h2 className="text-3xl font-bold">{skinProfile.skinType}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assessment Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2C5F4F] to-[#3D7A63] flex items-center justify-center">
                  <i className="ri-line-chart-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                    Curae AI Assessment
                  </h2>
                  <p className="text-sm text-gray-600">
                    Track and analyze your skincare journey with AI insights
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Assessment Controls */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Select Concern */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C5F4F] mb-2">
                      Select Your Concern
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowConcernDropdown(!showConcernDropdown)}
                        className="w-full px-4 py-3 bg-[#F8F6F3] border-2 border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-[#2C5F4F]/30 transition-colors cursor-pointer"
                      >
                        <span className={selectedConcern ? 'text-[#2C5F4F] font-medium' : 'text-gray-500'}>
                          {selectedConcern || 'Choose a concern...'}
                        </span>
                        <i className={`ri-arrow-${showConcernDropdown ? 'up' : 'down'}-s-line text-[#2C5F4F]`}></i>
                      </button>
                      
                      {showConcernDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {concerns.map((concern) => (
                            <button
                              key={concern.id}
                              onClick={() => handleSelectConcern(concern)}
                              className="w-full px-4 py-3 text-left hover:bg-[#F8F6F3] transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              <i className={`${concern.icon} text-[#2C5F4F] text-xl`}></i>
                              <div>
                                <p className="font-medium text-[#2C5F4F]">{concern.name}</p>
                                <p className="text-xs text-gray-500">Priority {concern.priority}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeframe Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C5F4F] mb-2">
                      Assessment Timeframe
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeframes.map((timeframe) => (
                        <button
                          key={timeframe.id}
                          onClick={() => handleTimeframeChange(timeframe.id)}
                          className={`px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                            selectedTimeframe === timeframe.id
                              ? 'bg-[#2C5F4F] text-white shadow-md'
                              : 'bg-[#F8F6F3] text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {timeframe.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assessment Info */}
                  {selectedConcern && (
                    <div className="p-4 bg-gradient-to-br from-[#2C5F4F]/5 to-[#E8956C]/5 rounded-lg border border-[#2C5F4F]/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2C5F4F] flex items-center justify-center flex-shrink-0">
                          <i className="ri-information-line text-white text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#2C5F4F] mb-1">Current Assessment</h4>
                          <p className="text-sm text-gray-600">
                            Analyzing <strong>{selectedConcern}</strong> progress over{' '}
                            <strong>{timeframes.find(t => t.id === selectedTimeframe)?.label.toLowerCase()}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Chat Box */}
                <div className="lg:col-span-2 flex flex-col bg-gradient-to-br from-[#F8F6F3] to-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-[#2C5F4F] to-[#3D7A63] text-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <i className="ri-robot-2-line text-xl"></i>
                      </div>
                      <div>
                        <h3 className="font-bold">Curae AI</h3>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span>Curae AI Assessment</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
                    {assessmentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            message.type === 'user'
                              ? 'bg-[#2C5F4F] text-white'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                          }`}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-[#2C5F4F]/10 flex items-center justify-center">
                                <i className="ri-robot-2-line text-[#2C5F4F] text-xs"></i>
                              </div>
                              <span className="text-xs font-medium text-[#2C5F4F]">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isAssessing && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#2C5F4F]/10 flex items-center justify-center">
                              <i className="ri-robot-2-line text-[#2C5F4F] text-xs"></i>
                            </div>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-[#2C5F4F] animate-bounce"></div>
                              <div className="w-2 h-2 rounded-full bg-[#2C5F4F] animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-[#2C5F4F] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 bg-white border-t-2 border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={assessmentInput}
                        onChange={(e) => setAssessmentInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendAssessmentMessage()}
                        placeholder={selectedConcern ? 'Ask about your progress...' : 'Select a concern first...'}
                        disabled={!selectedConcern}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleSendAssessmentMessage}
                        disabled={!assessmentInput.trim() || !selectedConcern}
                        className="w-12 h-12 rounded-lg bg-[#2C5F4F] text-white flex items-center justify-center hover:bg-[#234839] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <i className="ri-send-plane-fill text-xl"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skin Concerns Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#2C5F4F]/10 flex items-center justify-center">
                  <i className="ri-heart-pulse-line text-[#2C5F4F] text-2xl"></i>
                </div>
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                    Your Skin Concerns
                  </h2>
                  <p className="text-sm text-gray-600">
                    Prioritized based on your skin quiz results
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {concerns.map((concern, index) => (
                  <div
                    key={concern.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-[#2C5F4F]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Priority Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#2C5F4F] text-white flex items-center justify-center font-bold text-lg">
                          {concern.priority}
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Concern Header */}
                        <div className="flex items-center gap-3 mb-2">
                          <i className={`${concern.icon} text-2xl text-[#2C5F4F]`}></i>
                          <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F]">
                            {concern.name}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{concern.description}</p>

                        {/* Recommended Ingredients */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#2C5F4F] mb-2">
                            Look for these ingredients:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {concern.recommendedIngredients.map((ingredient, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-[#F8F6F3] text-[#2C5F4F] text-xs font-medium rounded-full border border-[#2C5F4F]/20"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Prioritize Button */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePrioritize(concern, 'products')}
                            className="px-6 py-3 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-shopping-bag-line mr-2"></i>
                            Find Products
                          </button>
                          <button
                            onClick={() => handlePrioritize(concern, 'services')}
                            className="px-6 py-3 bg-white border-2 border-[#2C5F4F] text-[#2C5F4F] rounded-lg hover:bg-[#F8F6F3] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-store-line mr-2"></i>
                            Find Services
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Basic Products Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#E8956C]/10 flex items-center justify-center">
                  <i className="ri-shield-check-line text-[#E8956C] text-2xl"></i>
                </div>
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                    Essential Basic Products
                  </h2>
                  <p className="text-sm text-gray-600">
                    The foundation of every healthy skincare routine
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {basicProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-6 bg-[#F8F6F3] rounded-xl border border-gray-200"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-4">
                      <i className={`${product.icon} text-3xl text-[#2C5F4F]`}></i>
                    </div>
                    <h3 className="font-medium text-[#2C5F4F] text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allergens Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="ri-alert-line text-red-600 text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                      Your Allergens
                    </h2>
                    <p className="text-sm text-gray-600">
                      Ingredients to avoid in your products
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAllergen(true)}
                  className="px-6 py-3 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Allergen
                </button>
              </div>

              {/* Add Allergen Form */}
              {showAddAllergen && (
                <div className="mb-6 p-4 bg-[#F8F6F3] rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Allergen name"
                      value={newAllergen.name}
                      onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20"
                    />
                    <select
                      value={newAllergen.category}
                      onChange={(e) => setNewAllergen({ ...newAllergen, category: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20 cursor-pointer"
                    >
                      <option value="Synthetic">Synthetic</option>
                      <option value="Natural">Natural</option>
                      <option value="Chemical">Chemical</option>
                      <option value="Preservative">Preservative</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddAllergen}
                      className="px-6 py-2 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddAllergen(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Allergens List */}
              <div className="flex flex-wrap gap-3">
                {allergens.length > 0 ? allergens.map((allergen) => (
                  <div
                    key={allergen.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <i className="ri-close-circle-line text-red-600"></i>
                    <div>
                      <span className="text-sm font-medium text-red-900">{allergen.name}</span>
                      <span className="text-xs text-red-600 ml-2">({allergen.category})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAllergen(allergen.id)}
                      className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">No allergens added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#2C5F4F]/10 flex items-center justify-center">
                  <i className="ri-settings-3-line text-[#2C5F4F] text-2xl"></i>
                </div>
                <div>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                    Your Preferences
                  </h2>
                  <p className="text-sm text-gray-600">
                    Product preferences based on your lifestyle
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="p-4 bg-[#F8F6F3] rounded-lg border border-gray-200"
                  >
                    <p className="text-xs text-gray-500 mb-1">{pref.category}</p>
                    <p className="text-sm font-medium text-[#2C5F4F]">{pref.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

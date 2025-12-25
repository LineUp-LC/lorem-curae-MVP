import { useEffect, useState } from 'react';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { sessionState } from '../../../utils/sessionState';


interface SurveyData {
  skinTypes?: string[];
  skinType?: string | null;
  concerns: string[];
  goals?: string[];
  sensitivities?: string[];
  scarringTypes?: string[];
  acneTypes?: string[];
  complexion?: string;
  allergens?: string[];
  preferences?: string[];
  routinePreference?: string | null;
  budgetRange?: string | null;
  lifestyle?: {
    sleepHours?: string;
    stressLevel?: string;
    exercise?: string;
    skinCareTime?: string;
  } | string[];
}

const SurveyResultsPage = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);


  useEffect(() => {
    const savedData = localStorage.getItem('skinSurveyData');
    if (savedData) {
      const rawData = JSON.parse(savedData);
      
      // Normalize the data structure to handle both QuizFlow formats
      const normalizedData: SurveyData = {
        // Handle skinTypes: could be skinTypes array, skinType string, or skinType array
        skinTypes: rawData.skinTypes 
          || (rawData.skinType ? (Array.isArray(rawData.skinType) ? rawData.skinType : [rawData.skinType]) : [])
          || ['Normal'],
        concerns: rawData.concerns || [],
        goals: rawData.goals || [],
        sensitivities: rawData.sensitivities || [],
        scarringTypes: rawData.scarringTypes || [],
        acneTypes: rawData.acneTypes || [],
        complexion: rawData.complexion || 'Not specified',
        allergens: rawData.allergens || rawData.sensitivities || [],
        preferences: rawData.preferences || [],
        routinePreference: rawData.routinePreference || null,
        budgetRange: rawData.budgetRange || null,
        lifestyle: rawData.lifestyle || {
          sleepHours: 'Not specified',
          stressLevel: 'Not specified',
          exercise: 'Not specified',
          skinCareTime: 'Not specified',
        },
      };
      
      setSurveyData(normalizedData);

      const recs = generateRecommendations(normalizedData);
      setRecommendations(recs);

      // Store in sessionState for cross-component access (works for both guest and logged-in users)
      if (normalizedData.skinTypes && normalizedData.skinTypes.length > 0) {
        sessionState.setTempSkinType(normalizedData.skinTypes[0]);
      }
      if (normalizedData.concerns && normalizedData.concerns.length > 0) {
        sessionState.setTempConcerns(normalizedData.concerns);
      }

      const userProfile = {
        skinType: normalizedData.skinTypes?.[0] || 'Normal',
        concerns: normalizedData.concerns,
        sensitivities: normalizedData.allergens,
        preferences: {
          crueltyFree: normalizedData.preferences?.includes('Cruelty-Free'),
          vegan: normalizedData.preferences?.includes('Vegan'),
        },
        lifestyle: normalizedData.lifestyle,
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      // No survey data found - redirect to survey
      navigate('/skin-survey');
    }
  }, [navigate]);

  useEffect(() => {
    const saveSkinType = async () => {
      if (!surveyData || !surveyData.skinTypes) return;

      console.log("Saving skin type:", surveyData.skinTypes[0]);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("User:", user);

      if (userError || !user) {
        console.error("No logged-in user, cannot save skin type");
        return;
      }

      const { error } = await supabase
        .from("users_profiles")
        .upsert(
          {
            id: user.id,
            skin_type: surveyData.skinTypes[0] || "Normal",
            concerns: surveyData.concerns || [],
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error("Supabase error:", error);
      } else {
        console.log("Skin type saved successfully");
      }
    };

    saveSkinType();
  }, [surveyData]);

  const generateRecommendations = (data: SurveyData) => {
    const recs: any = {
      routineType: '',
      routineDescription: '',
      keyIngredients: [],
      avoidIngredients: [],
      lifestyleAdvice: [],
      priorityConcerns: [],
      recommendedProducts: [],
    };

    const skinTypes = data.skinTypes || [];
    const lifestyleData = typeof data.lifestyle === 'object' && !Array.isArray(data.lifestyle) 
      ? data.lifestyle 
      : { sleepHours: '', stressLevel: '', exercise: '', skinCareTime: '' };

    // Determine routine type based on skin types and lifestyle
    const hasMultipleSkinTypes = skinTypes.length > 1;
    const hasSensitiveSkin = skinTypes.includes('Sensitive') || skinTypes.includes('sensitive');
    const hasLimitedTime = lifestyleData.skinCareTime === 'Less than 5 min' || lifestyleData.skinCareTime === '5-10 min';

    if (hasSensitiveSkin) {
      recs.routineType = 'Gentle Barrier-Repair Routine';
      recs.routineDescription = 'Your sensitive skin needs a minimal, soothing routine that focuses on strengthening your skin barrier and avoiding irritation.';
    } else if (hasLimitedTime) {
      recs.routineType = 'Streamlined Essential Routine';
      recs.routineDescription = 'A simplified routine with multi-tasking products that deliver results without taking too much time.';
    } else if (skinTypes.some(t => t.toLowerCase() === 'dry')) {
      recs.routineType = 'Intensive Hydration Routine';
      recs.routineDescription = 'Your dry skin needs deep hydration and moisture-locking ingredients to maintain a healthy barrier.';
    } else if (skinTypes.some(t => t.toLowerCase() === 'oily')) {
      recs.routineType = 'Balancing & Clarifying Routine';
      recs.routineDescription = 'Control excess oil while maintaining hydration with lightweight, non-comedogenic products.';
    } else if (hasMultipleSkinTypes || skinTypes.some(t => t.toLowerCase() === 'combination')) {
      recs.routineType = 'Balanced Multi-Zone Routine';
      recs.routineDescription = 'Address different needs across your face with targeted treatments for combination skin.';
    } else {
      recs.routineType = 'Maintenance & Prevention Routine';
      recs.routineDescription = 'Keep your skin healthy and address specific concerns with a well-rounded routine.';
    }

    // Priority concerns (top 3)
    recs.priorityConcerns = (data.concerns || []).slice(0, 3);

    // Generate key ingredients based on concerns
    const ingredientMap: Record<string, string[]> = {
      'Acne Prone': ['Salicylic Acid', 'Niacinamide', 'Benzoyl Peroxide', 'Tea Tree Oil'],
      'acne': ['Salicylic Acid', 'Niacinamide', 'Benzoyl Peroxide', 'Tea Tree Oil'],
      'Signs of Aging': ['Retinol', 'Peptides', 'Vitamin C', 'Hyaluronic Acid'],
      'fine lines': ['Retinol', 'Peptides', 'Vitamin C', 'Hyaluronic Acid'],
      'Uneven Skin Tone': ['Vitamin C', 'Alpha Arbutin', 'Kojic Acid', 'Niacinamide'],
      'hyperpigmentation': ['Vitamin C', 'Alpha Arbutin', 'Kojic Acid', 'Niacinamide'],
      'Enlarged Pores': ['Niacinamide', 'Salicylic Acid', 'Retinol'],
      'Lack of Hydration': ['Hyaluronic Acid', 'Glycerin', 'Ceramides', 'Squalane'],
      'dryness': ['Hyaluronic Acid', 'Glycerin', 'Ceramides', 'Squalane'],
      'hydration': ['Hyaluronic Acid', 'Glycerin', 'Ceramides', 'Squalane'],
      'Dullness': ['Vitamin C', 'AHA', 'Niacinamide', 'Vitamin E'],
      'Sun Damage': ['Vitamin C', 'Retinol', 'Niacinamide', 'SPF 50+'],
      'Rosacea': ['Centella Asiatica', 'Azelaic Acid', 'Niacinamide', 'Green Tea Extract'],
      'redness': ['Centella Asiatica', 'Azelaic Acid', 'Niacinamide', 'Green Tea Extract'],
      'Eczema': ['Colloidal Oatmeal', 'Ceramides', 'Shea Butter', 'Centella Asiatica'],
      'Damaged Skin Barrier': ['Ceramides', 'Centella Asiatica', 'Panthenol', 'Squalane'],
      'Textural Irregularities': ['AHA', 'BHA', 'Retinol', 'Niacinamide'],
      'texture': ['AHA', 'BHA', 'Retinol', 'Niacinamide'],
      'Dark Circles': ['Caffeine', 'Vitamin K', 'Peptides', 'Hyaluronic Acid'],
      'Scarring': ['Niacinamide', 'Vitamin C', 'Retinol', 'Alpha Arbutin'],
      'Congested Skin': ['Salicylic Acid', 'Niacinamide', 'Clay', 'AHA'],
      'oiliness': ['Niacinamide', 'Salicylic Acid', 'Clay', 'Zinc'],
    };

    const ingredientSet = new Set<string>();
    (data.concerns || []).forEach(concern => {
      const ingredients = ingredientMap[concern] || ingredientMap[concern.toLowerCase()] || [];
      ingredients.slice(0, 2).forEach(ing => ingredientSet.add(ing));
    });

    // Add skin type specific ingredients
    if (skinTypes.some(t => t.toLowerCase() === 'dry')) {
      ingredientSet.add('Hyaluronic Acid');
      ingredientSet.add('Ceramides');
    }
    if (skinTypes.some(t => t.toLowerCase() === 'oily')) {
      ingredientSet.add('Niacinamide');
      ingredientSet.add('Salicylic Acid');
    }
    if (skinTypes.some(t => t.toLowerCase() === 'sensitive')) {
      ingredientSet.add('Centella Asiatica');
      ingredientSet.add('Panthenol');
    }

    recs.keyIngredients = Array.from(ingredientSet).slice(0, 6);

    // Ingredients to avoid based on allergens and preferences
    recs.avoidIngredients = [...(data.allergens || [])];
    if (data.preferences?.includes('Fragrance-free')) {
      recs.avoidIngredients.push('Fragrance', 'Essential Oils');
    }
    if (data.preferences?.includes('Alcohol-Free')) {
      recs.avoidIngredients.push('Alcohol Denat.');
    }
    if (data.preferences?.includes('Silicone-free')) {
      recs.avoidIngredients.push('Dimethicone', 'Cyclopentasiloxane');
    }

    // Generate lifestyle advice
    recs.lifestyleAdvice = generateLifestyleAdvice(lifestyleData, skinTypes);

    // Generate recommended products
    recs.recommendedProducts = generateProductRecommendations(data);

    return recs;
  };

  const generateLifestyleAdvice = (lifestyle: any, skinTypes: string[]) => {
    const advice: string[] = [];

    if (lifestyle.sleepHours === 'Less than 6 hours' || lifestyle.sleepHours === '6-7 hours') {
      advice.push('Try to get 7-9 hours of sleep for optimal skin repair and regeneration.');
    }
    if (lifestyle.stressLevel === 'High' || lifestyle.stressLevel === 'Very High') {
      advice.push('Consider stress-management techniques like meditation or yoga, as stress can trigger skin issues.');
    }
    if (lifestyle.exercise === 'Rarely' || lifestyle.exercise === 'Never') {
      advice.push('Regular exercise improves blood circulation, which helps deliver nutrients to your skin.');
    }
    
    // Add general advice
    advice.push('Drink at least 8 glasses of water daily for optimal skin hydration.');
    advice.push('Always remove makeup before bed to prevent clogged pores.');
    advice.push('Apply sunscreen daily, even on cloudy days, to prevent premature aging.');

    return advice.slice(0, 5);
  };

  const generateProductRecommendations = (data: SurveyData) => {
    const products: any[] = [];
    const skinTypes = data.skinTypes || [];
    const concerns = data.concerns || [];

    // Cleanser recommendation
    if (skinTypes.some(t => t.toLowerCase() === 'dry') || skinTypes.some(t => t.toLowerCase() === 'sensitive')) {
      products.push({
        category: 'Cleanser',
        name: 'Gentle Hydrating Cleanser',
        reason: 'A cream-based cleanser that removes impurities without stripping moisture',
        keyIngredients: ['Ceramides', 'Glycerin', 'Hyaluronic Acid'],
      });
    } else if (skinTypes.some(t => t.toLowerCase() === 'oily')) {
      products.push({
        category: 'Cleanser',
        name: 'Oil Control Gel Cleanser',
        reason: 'Effectively removes excess oil and unclogs pores without over-drying',
        keyIngredients: ['Salicylic Acid', 'Niacinamide', 'Green Tea'],
      });
    } else {
      products.push({
        category: 'Cleanser',
        name: 'Balanced Foam Cleanser',
        reason: 'A gentle foaming cleanser suitable for combination skin',
        keyIngredients: ['Centella Asiatica', 'Niacinamide', 'Panthenol'],
      });
    }

    // Serum recommendation based on top concern
    if (concerns.some(c => c.toLowerCase().includes('acne'))) {
      products.push({
        category: 'Treatment Serum',
        name: 'Clarifying BHA Serum',
        reason: 'Targets acne-causing bacteria and unclogs pores',
        keyIngredients: ['Salicylic Acid 2%', 'Niacinamide', 'Zinc'],
      });
    } else if (concerns.some(c => c.toLowerCase().includes('aging') || c.toLowerCase().includes('fine lines'))) {
      products.push({
        category: 'Treatment Serum',
        name: 'Retinol Night Serum',
        reason: 'Promotes cell turnover and reduces fine lines',
        keyIngredients: ['Retinol 0.5%', 'Peptides', 'Vitamin E'],
        warning: 'Start slowly - use 2-3 times per week initially',
      });
    } else if (concerns.some(c => c.toLowerCase().includes('hyperpigmentation') || c.toLowerCase().includes('dark spots'))) {
      products.push({
        category: 'Treatment Serum',
        name: 'Brightening Vitamin C Serum',
        reason: 'Fades dark spots and evens skin tone',
        keyIngredients: ['Vitamin C 15%', 'Ferulic Acid', 'Vitamin E'],
      });
    } else {
      products.push({
        category: 'Treatment Serum',
        name: 'Hydrating Hyaluronic Acid Serum',
        reason: 'Provides deep hydration and plumps skin',
        keyIngredients: ['Hyaluronic Acid', 'Vitamin B5', 'Ceramides'],
      });
    }

    // Moisturizer recommendation
    if (skinTypes.some(t => t.toLowerCase() === 'dry')) {
      products.push({
        category: 'Moisturizer',
        name: 'Rich Ceramide Barrier Cream',
        reason: 'Locks in moisture and repairs your skin barrier overnight',
        keyIngredients: ['Ceramides', 'Shea Butter', 'Squalane'],
      });
    } else if (skinTypes.some(t => t.toLowerCase() === 'oily')) {
      products.push({
        category: 'Moisturizer',
        name: 'Lightweight Gel Moisturizer',
        reason: 'Hydrates without adding shine or clogging pores',
        keyIngredients: ['Hyaluronic Acid', 'Niacinamide', 'Aloe Vera'],
      });
    } else {
      products.push({
        category: 'Moisturizer',
        name: 'Balanced Daily Moisturizer',
        reason: 'Provides optimal hydration for your skin type',
        keyIngredients: ['Ceramides', 'Niacinamide', 'Peptides'],
      });
    }

    // SPF (always recommended)
    products.push({
      category: 'SPF',
      name: 'Broad Spectrum SPF 50+ Sunscreen',
      reason: 'Essential daily protection against UV damage and premature aging',
      keyIngredients: ['Zinc Oxide', 'Niacinamide', 'Antioxidants'],
      warning: 'Apply every morning as your final step!',
    });

    return products.slice(0, 6);
  };

  if (!surveyData || !recommendations) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Personalized Skin Analysis</h1>
          <p className="text-lg text-gray-600">Based on your responses, we've created a tailored skincare plan just for you</p>
        </div>

        {/* Skin Profile Summary */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-heart-line text-2xl text-sage-600"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Your Skin Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skin Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Skin Type</h3>
              <div className="flex flex-wrap gap-2">
                {surveyData.skinTypes?.map((type) => (
                  <span key={type} className="px-4 py-2 bg-sage-100 text-sage-700 rounded-full font-medium capitalize">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Primary Concerns */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary Concerns</h3>
              <div className="flex flex-wrap gap-2">
                {recommendations.priorityConcerns.map((concern: string) => (
                  <span key={concern} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium capitalize">
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Routine Recommendation */}
        <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-xl p-8 border border-sage-100 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Recommended Routine</h2>
            <h3 className="text-2xl font-semibold text-sage-700 mb-4">{recommendations.routineType}</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {recommendations.routineDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.recommendedProducts.map((product: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-medium text-sage-600 uppercase tracking-wide">
                      {product.category}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900 mt-1">{product.name}</h4>
                  </div>
                  {product.warning && (
                    <i className="ri-error-warning-line text-amber-500 text-xl"></i>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.reason}</p>
                <div className="flex flex-wrap gap-2">
                  {product.keyIngredients.map((ing: string) => (
                    <span key={ing} className="text-xs px-2 py-1 bg-sage-50 text-sage-700 rounded">
                      {ing}
                    </span>
                  ))}
                </div>
                {product.warning && (
                  <p className="text-xs text-amber-600 mt-3 font-medium">⚠️ {product.warning}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Ingredients */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
              <i className="ri-flask-line text-2xl text-sage-600"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Key Ingredients for You</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.keyIngredients.map((ingredient: string) => (
              <div key={ingredient} className="bg-sage-50 rounded-lg p-4 text-center">
                <span className="text-sm font-medium text-sage-700">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients to Avoid */}
        {recommendations.avoidIngredients.length > 0 && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Ingredients to Avoid</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {recommendations.avoidIngredients.map((ingredient: string) => (
                <span key={ingredient} className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-medium">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle Advice */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
              <i className="ri-lightbulb-line text-2xl text-sage-600"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Lifestyle Recommendations</h2>
          </div>
          <div className="space-y-4">
            {recommendations.lifestyleAdvice.map((advice: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <i className="ri-arrow-right-s-line text-sage-600 mt-1"></i>
                <span className="text-gray-700">{advice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/discover')}
            className="bg-sage-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-sage-700 transition-colors text-lg whitespace-nowrap cursor-pointer"
          >
            Discover Products for You
            <i className="ri-arrow-right-line ml-2"></i>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SurveyResultsPage;
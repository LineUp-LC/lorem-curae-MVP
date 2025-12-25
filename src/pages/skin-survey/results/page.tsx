import { useEffect, useState } from 'react';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { sessionState } from '../../../utils/sessionState';


interface SurveyData {
  skinTypes: string[];
  concerns: string[];
  scarringTypes: string[];
  acneTypes: string[];
  complexion: string;
  allergens: string[];
  preferences: string[];
  lifestyle: {
    sleepHours: string;
    stressLevel: string;
    exercise: string;
    skinCareTime: string;
  };
}

const SurveyResultsPage = () => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);


  useEffect(() => {
    const savedData = localStorage.getItem('skinSurveyData');
    if (savedData) {
      const data: SurveyData = JSON.parse(savedData);
      setSurveyData(data);

      const recs = generateRecommendations(data);
      setRecommendations(recs);

      // Store in sessionState for cross-component access (works for both guest and logged-in users)
      if (data.skinTypes && data.skinTypes.length > 0) {
        sessionState.setTempSkinType(data.skinTypes[0]);
      }
      if (data.concerns && data.concerns.length > 0) {
        sessionState.setTempConcerns(data.concerns);
      }

      const userProfile = {
        skinType: data.skinTypes[0] || 'Normal',
        concerns: data.concerns,
        sensitivities: data.allergens,
        preferences: {
          crueltyFree: data.preferences.includes('Cruelty-Free'),
          vegan: data.preferences.includes('Vegan'),
        },
        lifestyle: data.lifestyle,
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, []);

  useEffect(() => {
    const saveSkinType = async () => {
      if (!surveyData) return;

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

    // Determine routine type based on skin types and lifestyle
    const hasMultipleSkinTypes = data.skinTypes.length > 1;
    const hasSensitiveSkin = data.skinTypes.includes('Sensitive');
    const hasLimitedTime = data.lifestyle.skinCareTime === 'Less than 5 min' || data.lifestyle.skinCareTime === '5-10 min';

    if (hasSensitiveSkin) {
      recs.routineType = 'Gentle Barrier-Repair Routine';
      recs.routineDescription = 'Your sensitive skin needs a minimal, soothing routine that focuses on strengthening your skin barrier and avoiding irritation.';
    } else if (hasLimitedTime) {
      recs.routineType = 'Streamlined Essential Routine';
      recs.routineDescription = 'A simplified routine with multi-tasking products that deliver results without taking too much time.';
    } else if (data.skinTypes.includes('Dry')) {
      recs.routineType = 'Intensive Hydration Routine';
      recs.routineDescription = 'Your dry skin needs deep hydration and moisture-locking ingredients to maintain a healthy barrier.';
    } else if (data.skinTypes.includes('Oily')) {
      recs.routineType = 'Balancing & Clarifying Routine';
      recs.routineDescription = 'Control excess oil while maintaining hydration with lightweight, non-comedogenic products.';
    } else if (hasMultipleSkinTypes || data.skinTypes.includes('Combination')) {
      recs.routineType = 'Balanced Multi-Zone Routine';
      recs.routineDescription = 'Address different needs across your face with targeted treatments for combination skin.';
    } else {
      recs.routineType = 'Maintenance & Prevention Routine';
      recs.routineDescription = 'Keep your skin healthy and address specific concerns with a well-rounded routine.';
    }

    // Priority concerns (top 3)
    recs.priorityConcerns = data.concerns.slice(0, 3);

    // Generate key ingredients based on concerns
    const ingredientMap: Record<string, string[]> = {
      'Acne Prone': ['Salicylic Acid', 'Niacinamide', 'Benzoyl Peroxide', 'Tea Tree Oil'],
      'Signs of Aging': ['Retinol', 'Peptides', 'Vitamin C', 'Hyaluronic Acid'],
      'Uneven Skin Tone': ['Vitamin C', 'Alpha Arbutin', 'Kojic Acid', 'Niacinamide'],
      'Enlarged Pores': ['Niacinamide', 'Salicylic Acid', 'Retinol'],
      'Lack of Hydration': ['Hyaluronic Acid', 'Glycerin', 'Ceramides', 'Squalane'],
      'Dullness': ['Vitamin C', 'AHA', 'Niacinamide', 'Vitamin E'],
      'Sun Damage': ['Vitamin C', 'Retinol', 'Niacinamide', 'SPF 50+'],
      'Rosacea': ['Centella Asiatica', 'Azelaic Acid', 'Niacinamide', 'Green Tea Extract'],
      'Eczema': ['Colloidal Oatmeal', 'Ceramides', 'Shea Butter', 'Centella Asiatica'],
      'Damaged Skin Barrier': ['Ceramides', 'Centella Asiatica', 'Panthenol', 'Squalane'],
      'Textural Irregularities': ['AHA', 'BHA', 'Retinol', 'Niacinamide'],
      'Dark Circles': ['Caffeine', 'Vitamin K', 'Peptides', 'Hyaluronic Acid'],
      'Scarring': ['Niacinamide', 'Vitamin C', 'Retinol', 'Alpha Arbutin'],
      'Congested Skin': ['Salicylic Acid', 'Niacinamide', 'Clay', 'AHA'],
    };

    const ingredientSet = new Set<string>();
    data.concerns.forEach(concern => {
      const ingredients = ingredientMap[concern] || [];
      ingredients.slice(0, 2).forEach(ing => ingredientSet.add(ing));
    });

    // Add skin type specific ingredients
    if (data.skinTypes.includes('Dry')) {
      ingredientSet.add('Hyaluronic Acid');
      ingredientSet.add('Ceramides');
    }
    if (data.skinTypes.includes('Oily')) {
      ingredientSet.add('Niacinamide');
      ingredientSet.add('Salicylic Acid');
    }
    if (data.skinTypes.includes('Sensitive')) {
      ingredientSet.add('Centella Asiatica');
      ingredientSet.add('Panthenol');
    }

    recs.keyIngredients = Array.from(ingredientSet).slice(0, 6);

    // Ingredients to avoid based on allergens and preferences
    recs.avoidIngredients = [...data.allergens];
    if (data.preferences.includes('Fragrance-free')) {
      recs.avoidIngredients.push('Fragrance', 'Essential Oils');
    }
    if (data.preferences.includes('Alcohol-Free')) {
      recs.avoidIngredients.push('Alcohol Denat.');
    }
    if (data.preferences.includes('Silicone-free')) {
      recs.avoidIngredients.push('Dimethicone', 'Cyclopentasiloxane');
    }

    // Lifestyle advice based on responses
    if (data.lifestyle.sleepHours === 'Less than 6') {
      recs.lifestyleAdvice.push('💤 Prioritize sleep: Aim for 7-8 hours to allow skin repair and regeneration');
    }
    if (data.lifestyle.stressLevel === 'High' || data.lifestyle.stressLevel === 'Very High') {
      recs.lifestyleAdvice.push('🧘 Manage stress: High stress can trigger inflammation and breakouts');
    }
    if (data.lifestyle.exercise === 'Never' || data.lifestyle.exercise === '1-2x/week') {
      recs.lifestyleAdvice.push('🏃 Increase activity: Exercise improves circulation and skin health');
    }
    if (data.lifestyle.skinCareTime === 'Less than 5 min') {
      recs.lifestyleAdvice.push('⏰ Consider multi-tasking products to maximize your limited skincare time');
    }

    // Add general advice
    recs.lifestyleAdvice.push('💧 Stay hydrated: Drink 8 glasses of water daily for skin health');
    recs.lifestyleAdvice.push('☀️ Never skip SPF: Daily sun protection is essential for all skin types');

    // Generate product recommendations based on concerns
    recs.recommendedProducts = generateProductRecommendations(data);

    return recs;
  };

  const generateProductRecommendations = (data: SurveyData) => {
    const products: any[] = [];

    // Cleanser recommendation
    if (data.skinTypes.includes('Dry') || data.skinTypes.includes('Sensitive')) {
      products.push({
        category: 'Cleanser',
        name: 'Gentle Hydrating Cleanser',
        reason: 'Non-stripping formula that cleanses without disrupting your skin barrier',
        keyIngredients: ['Glycerin', 'Ceramides', 'Panthenol'],
      });
    } else if (data.skinTypes.includes('Oily') || data.concerns.includes('Acne Prone')) {
      products.push({
        category: 'Cleanser',
        name: 'Foaming Salicylic Acid Cleanser',
        reason: 'Gently exfoliates and unclogs pores while controlling oil',
        keyIngredients: ['Salicylic Acid 2%', 'Niacinamide', 'Zinc'],
      });
    } else {
      products.push({
        category: 'Cleanser',
        name: 'Balanced pH Gel Cleanser',
        reason: 'Maintains skin\'s natural pH while effectively removing impurities',
        keyIngredients: ['Glycerin', 'Allantoin', 'Green Tea'],
      });
    }

    // Treatment/Serum recommendations based on top concerns
    if (data.concerns.includes('Acne Prone')) {
      products.push({
        category: 'Treatment',
        name: 'Niacinamide 10% + Zinc Serum',
        reason: 'Reduces inflammation, controls oil, and minimizes pores',
        keyIngredients: ['Niacinamide 10%', 'Zinc PCA'],
      });
    }

    if (data.concerns.includes('Signs of Aging')) {
      products.push({
        category: 'Treatment',
        name: 'Retinol 0.5% Night Serum',
        reason: 'Reduces fine lines, improves texture, and boosts collagen',
        keyIngredients: ['Retinol 0.5%', 'Peptides', 'Squalane'],
      });
    }

    if (data.concerns.includes('Uneven Skin Tone') || data.concerns.includes('Dullness')) {
      products.push({
        category: 'Serum',
        name: 'Vitamin C 15% Brightening Serum',
        reason: 'Fades dark spots and brightens overall complexion',
        keyIngredients: ['Vitamin C 15%', 'Ferulic Acid', 'Vitamin E'],
      });
    }

    if (data.concerns.includes('Lack of Hydration') || data.skinTypes.includes('Dry')) {
      products.push({
        category: 'Serum',
        name: 'Hyaluronic Acid + B5 Serum',
        reason: 'Deeply hydrates and plumps skin with multi-weight HA',
        keyIngredients: ['Hyaluronic Acid', 'Vitamin B5', 'Glycerin'],
      });
    }

    if (data.concerns.includes('Scarring')) {
      products.push({
        category: 'Treatment',
        name: 'Alpha Arbutin 2% + HA',
        reason: 'Fades post-acne marks and evens skin tone gently',
        keyIngredients: ['Alpha Arbutin 2%', 'Hyaluronic Acid', 'Kojic Acid'],
      });
    }

    // Moisturizer recommendation
    if (data.skinTypes.includes('Dry')) {
      products.push({
        category: 'Moisturizer',
        name: 'Rich Ceramide Barrier Cream',
        reason: 'Locks in moisture and repairs your skin barrier overnight',
        keyIngredients: ['Ceramides', 'Shea Butter', 'Squalane'],
      });
    } else if (data.skinTypes.includes('Oily')) {
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
          <div className="w-20 h-20 mx-auto mb-6 bg-sage-100 rounded-full flex items-center justify-center">
            <i className="ri-user-heart-line text-3xl text-sage-600"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Personalized Skin Profile</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your unique responses, we've created a customized skincare plan just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Skin Type */}
          <div className="bg-white rounded-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <i className="ri-drop-line text-2xl text-sage-600"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Your Skin Type</h2>
            </div>
            <div className="space-y-3">
              {surveyData.skinTypes.map((type) => (
                <div key={type} className="flex items-center space-x-3">
                  <i className="ri-check-line text-sage-600"></i>
                  <span className="text-gray-700 font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Concerns */}
          <div className="bg-white rounded-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <i className="ri-heart-pulse-line text-2xl text-sage-600"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Priority Concerns</h2>
            </div>
            <div className="space-y-3">
              {recommendations.priorityConcerns.map((concern: string, index: number) => (
                <div key={concern} className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-sage-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{concern}</span>
                </div>
              ))}
            </div>
            {surveyData.concerns.length > 3 && (
              <p className="text-sm text-gray-500 mt-4">
                +{surveyData.concerns.length - 3} additional concerns identified
              </p>
            )}
          </div>

          {/* Complexion */}
          <div className="bg-white rounded-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <i className="ri-palette-line text-2xl text-sage-600"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Skin Complexion</h2>
            </div>
            <div className="flex items-center space-x-3">
              <i className="ri-check-line text-sage-600"></i>
              <span className="text-gray-700 font-medium">{surveyData.complexion}</span>
            </div>
          </div>

          {/* Allergens & Sensitivities */}
          <div className="bg-white rounded-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-sage-600"></i>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Allergens to Avoid</h2>
            </div>
            <div className="space-y-3">
              {recommendations.avoidIngredients.length > 0 ? (
                recommendations.avoidIngredients.map((allergen: string) => (
                  <div key={allergen} className="flex items-center space-x-3">
                    <i className="ri-close-circle-line text-red-500"></i>
                    <span className="text-gray-700">{allergen}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-sage-600"></i>
                  <span className="text-gray-700">No known allergens</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acne/Scarring Details if applicable */}
        {(surveyData.acneTypes.length > 0 || surveyData.scarringTypes.length > 0) && (
          <div className="bg-white rounded-xl p-8 border border-gray-100 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specific Concerns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {surveyData.acneTypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i className="ri-medicine-bottle-line text-sage-600 mr-2"></i>
                    Acne Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {surveyData.acneTypes.map((type) => (
                      <span key={type} className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {surveyData.scarringTypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i className="ri-contrast-drop-line text-sage-600 mr-2"></i>
                    Scarring Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {surveyData.scarringTypes.map((type) => (
                      <span key={type} className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Ingredients */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mb-12">
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

        {/* Preferences */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
              <i className="ri-settings-line text-2xl text-sage-600"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Your Preferences</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {surveyData.preferences.map((preference) => (
              <div key={preference} className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="text-sm font-medium text-gray-700">{preference}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Routine */}
        <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-xl p-8 border border-sage-100 mb-12">
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
  onClick={() => navigate('/my-skin')}
  className="bg-sage-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-sage-700 transition-colors text-lg whitespace-nowrap cursor-pointer"
>
  View Your Complete Skin Profile
  <i className="ri-arrow-right-line ml-2"></i>
</button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SurveyResultsPage;
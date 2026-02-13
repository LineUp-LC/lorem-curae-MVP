import { useState, useEffect } from 'react';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

interface IngredientLibraryProps {
  onSelectIngredient: (id: string) => void;
}

// Map survey concern names to ingredient concern keys
const concernMapping: Record<string, string[]> = {
  'Uneven Skin Tone': ['uneven-tone', 'hyperpigmentation'],
  'Dullness': ['dullness'],
  'Enlarged Pores': ['large-pores'],
  'Textural Irregularities': ['texture'],
  'Damaged Skin Barrier': ['barrier-damage', 'sensitivity'],
  'Signs of Aging': ['wrinkles', 'fine-lines', 'sagging', 'loss-of-firmness'],
  'Acne Prone': ['acne', 'blackheads'],
  'Sun Protection': ['sun-damage'],
  'Exzema': ['sensitivity', 'irritation', 'redness'],
  'Lack of Hydration': ['dehydration'],
  'Sun Damage': ['sun-damage', 'hyperpigmentation'],
  'Rosacea': ['redness', 'sensitivity', 'irritation'],
  'Dark Circles': ['dark-circles'],
  'Congested skin': ['acne', 'blackheads', 'large-pores'],
  'Scarring': ['texture', 'hyperpigmentation'],
  'Looking for gentle products': ['sensitivity', 'irritation'],
};

const IngredientLibrary = ({ onSelectIngredient }: IngredientLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile from skinSurveyData
  useEffect(() => {
    const savedSurvey = localStorage.getItem('skinSurveyData');
    if (savedSurvey) {
      const surveyData = JSON.parse(savedSurvey);
      // Map survey concerns to ingredient concern keys
      const mappedConcerns: string[] = [];
      (surveyData.concerns || []).forEach((concern: string) => {
        const mapped = concernMapping[concern];
        if (mapped) {
          mappedConcerns.push(...mapped);
        }
      });
      // Remove duplicates
      const uniqueConcerns = [...new Set(mappedConcerns)];

      setUserProfile({
        concerns: uniqueConcerns,
        skinType: surveyData.skinType?.[0] || '',
        allergens: surveyData.allergens || [],
        preferences: surveyData.preferences || [],
        acneType: surveyData.acneType || [],
        rawConcerns: surveyData.concerns || [],
      });
    }
  }, []);

  const categories = [
    { id: 'all', name: 'All Ingredients', icon: 'ri-grid-line' },
    { id: 'hydration', name: 'Hydration', icon: 'ri-drop-line' },
    { id: 'brightening', name: 'Brightening', icon: 'ri-sun-line' },
    { id: 'antiaging', name: 'Anti-Aging', icon: 'ri-time-line' },
    { id: 'soothing', name: 'Soothing', icon: 'ri-heart-line' },
    { id: 'exfoliation', name: 'Exfoliation', icon: 'ri-contrast-drop-2-line' },
  ];

  const ingredients = [
    {
      id: 'hyaluronic-acid',
      name: 'Hyaluronic Acid',
      category: 'hydration',
      scientificName: 'Sodium Hyaluronate',
      rating: 4.8,
      reviews: 1243,
      benefits: ['Deep Hydration', 'Plumping', 'Anti-Aging'],
      description: 'A powerful humectant that attracts and retains moisture in the skin.',
      icon: 'ri-drop-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['dehydration', 'fine-lines', 'dullness'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: [],
      sensitivityRisk: 'low',
    },
    {
      id: 'niacinamide',
      name: 'Niacinamide',
      category: 'brightening',
      scientificName: 'Vitamin B3',
      rating: 4.9,
      reviews: 2156,
      benefits: ['Brightening', 'Pore Minimizing', 'Barrier Support'],
      description: 'A versatile vitamin that improves skin tone and strengthens the barrier.',
      icon: 'ri-star-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['hyperpigmentation', 'large-pores', 'uneven-tone'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: [],
      sensitivityRisk: 'low',
    },
    {
      id: 'retinol',
      name: 'Retinol',
      category: 'antiaging',
      scientificName: 'Vitamin A',
      rating: 4.7,
      reviews: 1876,
      benefits: ['Anti-Aging', 'Cell Turnover', 'Texture Improvement'],
      description: 'A gold-standard ingredient for reducing signs of aging and improving texture.',
      icon: 'ri-flashlight-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['wrinkles', 'fine-lines', 'texture'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: ['May cause irritation for sensitive skin', 'Avoid during pregnancy', 'Use sunscreen daily'],
      sensitivityRisk: 'high',
      acneTrigger: false,
    },
    {
      id: 'vitamin-c',
      name: 'Vitamin C',
      category: 'brightening',
      scientificName: 'Ascorbic Acid',
      rating: 4.6,
      reviews: 1654,
      benefits: ['Brightening', 'Antioxidant', 'Collagen Support'],
      description: 'A powerful antioxidant that brightens and protects skin from damage.',
      icon: 'ri-sun-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['hyperpigmentation', 'dullness', 'sun-damage'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: ['May cause tingling on sensitive skin', 'Store away from light'],
      sensitivityRisk: 'medium',
    },
    {
      id: 'ceramides',
      name: 'Ceramides',
      category: 'hydration',
      scientificName: 'Ceramide Complex',
      rating: 4.8,
      reviews: 987,
      benefits: ['Barrier Repair', 'Hydration', 'Protection'],
      description: 'Essential lipids that restore and maintain the skin\'s protective barrier.',
      icon: 'ri-shield-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['dehydration', 'sensitivity', 'barrier-damage'],
      priority: 2,
      hasSimilarReviews: false,
      warnings: [],
      sensitivityRisk: 'low',
    },
    {
      id: 'peptides',
      name: 'Peptides',
      category: 'antiaging',
      scientificName: 'Amino Acid Chains',
      rating: 4.7,
      reviews: 1123,
      benefits: ['Collagen Support', 'Firming', 'Anti-Aging'],
      description: 'Amino acid chains that signal skin to produce more collagen.',
      icon: 'ri-links-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['wrinkles', 'sagging', 'loss-of-firmness'],
      priority: 2,
      hasSimilarReviews: false,
      warnings: [],
      sensitivityRisk: 'low',
    },
    {
      id: 'centella-asiatica',
      name: 'Centella Asiatica',
      category: 'soothing',
      scientificName: 'Cica / Tiger Grass',
      rating: 4.9,
      reviews: 1432,
      benefits: ['Soothing', 'Healing', 'Anti-Inflammatory'],
      description: 'A botanical extract known for its calming and healing properties.',
      icon: 'ri-leaf-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['sensitivity', 'redness', 'irritation'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: [],
      sensitivityRisk: 'low',
    },
    {
      id: 'salicylic-acid',
      name: 'Salicylic Acid',
      category: 'exfoliation',
      scientificName: 'Beta Hydroxy Acid (BHA)',
      rating: 4.5,
      reviews: 1765,
      benefits: ['Exfoliation', 'Pore Clearing', 'Acne Treatment'],
      description: 'A BHA that penetrates pores to clear congestion and prevent breakouts.',
      icon: 'ri-contrast-drop-2-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['acne', 'blackheads', 'large-pores'],
      priority: 1,
      hasSimilarReviews: true,
      warnings: ['May cause dryness', 'Start with low concentration'],
      sensitivityRisk: 'medium',
      acneTrigger: false,
    },
    {
      id: 'glycolic-acid',
      name: 'Glycolic Acid',
      category: 'exfoliation',
      scientificName: 'Alpha Hydroxy Acid (AHA)',
      rating: 4.6,
      reviews: 1543,
      benefits: ['Exfoliation', 'Brightening', 'Texture Improvement'],
      description: 'An AHA that exfoliates the surface to reveal brighter, smoother skin.',
      icon: 'ri-contrast-line',
      color: 'text-primary',
      bgColor: 'bg-light/30',
      concerns: ['dullness', 'texture', 'hyperpigmentation'],
      priority: 2,
      hasSimilarReviews: false,
      warnings: ['May increase sun sensitivity', 'Not recommended for very sensitive skin'],
      sensitivityRisk: 'high',
    },
  ];

  // Get user's skin concerns for filter
  const userConcerns: string[] = userProfile?.concerns || [];
  const userSkinType = userProfile?.skinType || '';
  const userAllergens: string[] = userProfile?.allergens || [];
  const hasSensitiveSkin = userSkinType === 'Sensitive' ||
    userProfile?.rawConcerns?.some((c: string) =>
      ['Rosacea', 'Exzema', 'Damaged Skin Barrier', 'Looking for gentle products'].includes(c)
    );

  // Get personalized warnings for an ingredient based on user profile
  const getPersonalizedWarnings = (ingredient: typeof ingredients[0]) => {
    const warnings: string[] = [];

    // Check if user has sensitivity concerns and ingredient has sensitivity risk
    if (hasSensitiveSkin && ingredient.sensitivityRisk === 'high') {
      warnings.push('May irritate sensitive skin');
    }

    // Check if ingredient name matches any user allergens
    const ingredientNameLower = ingredient.name.toLowerCase();
    const scientificNameLower = ingredient.scientificName.toLowerCase();
    userAllergens.forEach((allergen: string) => {
      if (ingredientNameLower.includes(allergen.toLowerCase()) ||
          scientificNameLower.includes(allergen.toLowerCase())) {
        warnings.push(`Contains ${allergen} (in your allergen list)`);
      }
    });

    return warnings;
  };

  // Get benefits sorted by relevance to user concerns
  const getSortedBenefits = (ingredient: typeof ingredients[0]) => {
    const benefits = [...ingredient.benefits];

    // Prioritize benefits that match user concerns
    return benefits.sort((a, b) => {
      const aRelevant = userConcerns.some(c =>
        a.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(a.toLowerCase())
      );
      const bRelevant = userConcerns.some(c =>
        b.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(b.toLowerCase())
      );

      if (aRelevant && !bRelevant) return -1;
      if (!aRelevant && bRelevant) return 1;
      return 0;
    });
  };

  // Check if ingredient matches user's profile concerns
  const matchesUserConcerns = (ingredient: typeof ingredients[0]) => {
    return userConcerns.some(concern =>
      ingredient.concerns.some(ic =>
        ic.toLowerCase().includes(concern.toLowerCase()) ||
        concern.toLowerCase().includes(ic.toLowerCase())
      )
    );
  };

  // Sort ingredients: priority ingredients for selected concern or user concerns first
  const getSortedIngredients = (ingredientsList: typeof ingredients) => {
    return [...ingredientsList].sort((a, b) => {
      // If a specific concern is selected, prioritize by that
      if (selectedConcern) {
        const aMatches = a.concerns.includes(selectedConcern);
        const bMatches = b.concerns.includes(selectedConcern);

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
      } else if (userConcerns.length > 0) {
        // If "All" is selected, prioritize by user's profile concerns
        const aMatchesUser = matchesUserConcerns(a);
        const bMatchesUser = matchesUserConcerns(b);

        if (aMatchesUser && !bMatchesUser) return -1;
        if (!aMatchesUser && bMatchesUser) return 1;
      }

      // If both match or both don't match, sort by priority then rating
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.rating - a.rating;
    });
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredient.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedIngredients = getSortedIngredients(filteredIngredients);

  // Separate recommended and other ingredients
  const recommendedIngredients = selectedConcern
    ? sortedIngredients.filter(ing => ing.concerns.includes(selectedConcern))
    : userConcerns.length > 0
      ? sortedIngredients.filter(ing => matchesUserConcerns(ing))
      : [];
  const otherIngredients = selectedConcern
    ? sortedIngredients.filter(ing => !ing.concerns.includes(selectedConcern))
    : userConcerns.length > 0
      ? sortedIngredients.filter(ing => !matchesUserConcerns(ing))
      : sortedIngredients;

  return (
    <div className="py-12 px-6 lg:px-12 bg-cream">
      <div className="max-w-7xl mx-auto">
        {/* Header - Clean style matching Marketplace */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-serif text-deep mb-4">
            Ingredient Library
          </h1>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto">
            Explore our comprehensive database of skincare ingredients with science-backed explanations, safety ratings, and community reviews.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-warm-gray/60"></i>
            <input
              type="text"
              placeholder="Search ingredients by name or scientific name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-full border-2 border-blush focus:border-primary focus:outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Skin Concern Filter - Only show if user has concerns */}
        {userConcerns.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-sm font-semibold text-warm-gray mb-3">Your Skin Concerns</h3>
            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 xs:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
              <button
                onClick={() => setSelectedConcern(null)}
                className={`px-3 xs:px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  selectedConcern === null
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                }`}
              >
                All
              </button>
              {/* User's profile concerns only - no generic fallbacks */}
              {userConcerns.map((concern: string) => (
                <button
                  key={concern}
                  onClick={() => setSelectedConcern(concern)}
                  className={`px-3 xs:px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    selectedConcern === concern
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                  }`}
                >
                  {concern.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm font-semibold text-warm-gray mb-3">Categories</h3>
          <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 xs:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 xs:px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-warm-gray border border-blush hover:border-primary-300'
                }`}
              >
                <i className={`${category.icon} text-base`}></i>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-warm-gray">
            Showing <strong className="text-deep">{sortedIngredients.length}</strong> ingredients
          </p>
        </div>

        {/* Recommended for You Section */}
        {recommendedIngredients.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <NeuralBloomIcon size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-deep">Recommended for You</h2>
                <p className="text-sm text-warm-gray">
                  {selectedConcern
                    ? `Priority ingredients for ${selectedConcern.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`
                    : 'Based on your skin profile concerns'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {recommendedIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-primary ring-2 ring-primary/20 cursor-pointer group"
                >
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      <NeuralBloomIcon size={12} className="text-primary" />
                      Recommended for You
                    </span>
                    {ingredient.hasSimilarReviews && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-terracotta/10 text-terracotta text-xs font-semibold rounded-full shadow-sm">
                        <i className="ri-user-heart-line"></i>
                        Similar Skin Reviews
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 flex items-center justify-center ${ingredient.bgColor} rounded-full`}>
                      <i className={`${ingredient.icon} text-2xl ${ingredient.color}`}></i>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-deep mb-1 group-hover:text-primary transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-sm text-warm-gray/80 mb-3">{ingredient.scientificName}</p>

                  <p className="text-sm text-warm-gray leading-relaxed mb-3">
                    {ingredient.description}
                  </p>

                  {/* Personalized Warnings */}
                  {getPersonalizedWarnings(ingredient).length > 0 && (
                    <div className="mb-3">
                      {getPersonalizedWarnings(ingredient).map((warning, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full mr-1 mb-1">
                          <i className="ri-alert-line text-xs"></i>
                          {warning}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSortedBenefits(ingredient).slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          userConcerns.some(c => benefit.toLowerCase().includes(c.toLowerCase()))
                            ? 'bg-primary/10 text-primary'
                            : 'bg-cream text-deep'
                        }`}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-blush">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`ri-star-fill text-sm ${
                              star <= Math.round(ingredient.rating) ? 'text-amber-400' : 'text-blush'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-warm-gray">({ingredient.reviews})</span>
                    </div>
                    <i className="ri-arrow-right-line text-xl text-primary group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Ingredients / Other Ingredients Section */}
        {otherIngredients.length > 0 && (
          <div>
            {recommendedIngredients.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-deep mb-2">All Other Ingredients</h2>
                <p className="text-sm text-warm-gray">
                  Browse our complete ingredient library
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blush cursor-pointer group"
                >
                  {ingredient.hasSimilarReviews && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-terracotta/10 text-terracotta text-xs font-semibold rounded-full shadow-sm">
                        <i className="ri-user-heart-line"></i>
                        Similar Skin Reviews
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 flex items-center justify-center ${ingredient.bgColor} rounded-full`}>
                      <i className={`${ingredient.icon} text-2xl ${ingredient.color}`}></i>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-deep mb-1 group-hover:text-primary transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-sm text-warm-gray/80 mb-3">{ingredient.scientificName}</p>

                  <p className="text-sm text-warm-gray leading-relaxed mb-3">
                    {ingredient.description}
                  </p>

                  {/* Personalized Warnings */}
                  {getPersonalizedWarnings(ingredient).length > 0 && (
                    <div className="mb-3">
                      {getPersonalizedWarnings(ingredient).map((warning, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full mr-1 mb-1">
                          <i className="ri-alert-line text-xs"></i>
                          {warning}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSortedBenefits(ingredient).slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          userConcerns.some(c => benefit.toLowerCase().includes(c.toLowerCase()))
                            ? 'bg-primary/10 text-primary'
                            : 'bg-cream text-deep'
                        }`}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-blush">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`ri-star-fill text-sm ${
                              star <= Math.round(ingredient.rating) ? 'text-amber-400' : 'text-blush'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-warm-gray">({ingredient.reviews})</span>
                    </div>
                    <i className="ri-arrow-right-line text-xl text-primary group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedIngredients.length === 0 && (
          <div className="text-center py-16">
            <i className="ri-search-line text-6xl text-blush mb-4"></i>
            <p className="text-xl text-warm-gray">No ingredients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientLibrary;
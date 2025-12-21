import { useState, useEffect } from 'react';

interface IngredientLibraryProps {
  onSelectIngredient: (id: string) => void;
}

const IngredientLibrary = ({ onSelectIngredient }: IngredientLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile to get skin concerns
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_skin_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['dehydration', 'fine-lines', 'dullness'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['hyperpigmentation', 'large-pores', 'uneven-tone'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['wrinkles', 'fine-lines', 'texture'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['hyperpigmentation', 'dullness', 'sun-damage'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['dehydration', 'sensitivity', 'barrier-damage'],
      priority: 2,
      hasSimilarReviews: false,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['wrinkles', 'sagging', 'loss-of-firmness'],
      priority: 2,
      hasSimilarReviews: false,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['sensitivity', 'redness', 'irritation'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['acne', 'blackheads', 'large-pores'],
      priority: 1,
      hasSimilarReviews: true,
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      concerns: ['dullness', 'texture', 'hyperpigmentation'],
      priority: 2,
      hasSimilarReviews: false,
    },
  ];

  // Sort ingredients: priority ingredients for selected concern first
  const getSortedIngredients = (ingredientsList: typeof ingredients) => {
    if (!selectedConcern) return ingredientsList;

    return [...ingredientsList].sort((a, b) => {
      const aMatches = a.concerns.includes(selectedConcern);
      const bMatches = b.concerns.includes(selectedConcern);
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      
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
    : [];
  const otherIngredients = selectedConcern
    ? sortedIngredients.filter(ing => !ing.concerns.includes(selectedConcern))
    : sortedIngredients;

  // Get user's skin concerns for filter
  const userConcerns = userProfile?.concerns || [];

  return (
    <div className="min-h-screen py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-serif text-forest-900 mb-4">
            Ingredient Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive database of skincare ingredients with science-backed explanations, safety ratings, and community reviews.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <i className="ri-search-line absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400"></i>
            <input
              type="text"
              placeholder="Search ingredients by name or scientific name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-sage-600 transition-colors"
            />
          </div>
        </div>

        {/* Skin Concern Filter */}
        {userConcerns.length > 0 && (
          <div className="mb-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Filter by your skin concerns:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setSelectedConcern(null)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                    selectedConcern === null
                      ? 'bg-sage-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-600 hover:text-sage-600'
                  }`}
                >
                  All Ingredients
                </button>
                {userConcerns.map((concern: string) => (
                  <button
                    key={concern}
                    onClick={() => setSelectedConcern(concern)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                      selectedConcern === concern
                        ? 'bg-sage-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-600 hover:text-sage-600'
                    }`}
                  >
                    {concern.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === category.id
                  ? 'bg-sage-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-600 hover:text-sage-600'
              }`}
            >
              <i className={`${category.icon} text-lg`}></i>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing <strong>{sortedIngredients.length}</strong> ingredients
          </p>
        </div>

        {/* Recommended for You Section */}
        {selectedConcern && recommendedIngredients.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <i className="ri-star-fill text-sage-600 text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-sm text-gray-600">
                  Priority ingredients for {selectedConcern.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {recommendedIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-sage-600 ring-2 ring-sage-600/20 cursor-pointer group"
                >
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full">
                      <i className="ri-star-fill"></i>
                      Recommended for You
                    </span>
                    {ingredient.hasSimilarReviews && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
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

                  <h3 className="text-xl font-semibold text-forest-900 mb-1 group-hover:text-sage-600 transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{ingredient.scientificName}</p>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {ingredient.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {ingredient.benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cream-100 text-forest-800 text-xs font-medium rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`ri-star-fill text-sm ${
                              star <= Math.round(ingredient.rating) ? 'text-amber-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({ingredient.reviews})</span>
                    </div>
                    <i className="ri-arrow-right-line text-xl text-sage-600 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Ingredients / Other Ingredients Section */}
        {otherIngredients.length > 0 && (
          <div>
            {selectedConcern && recommendedIngredients.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">All Other Ingredients</h2>
                <p className="text-sm text-gray-600">
                  Browse our complete ingredient library
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  onClick={() => onSelectIngredient(ingredient.id)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
                >
                  {ingredient.hasSimilarReviews && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
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

                  <h3 className="text-xl font-semibold text-forest-900 mb-1 group-hover:text-sage-600 transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{ingredient.scientificName}</p>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {ingredient.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {ingredient.benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cream-100 text-forest-800 text-xs font-medium rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`ri-star-fill text-sm ${
                              star <= Math.round(ingredient.rating) ? 'text-amber-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({ingredient.reviews})</span>
                    </div>
                    <i className="ri-arrow-right-line text-xl text-sage-600 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedIngredients.length === 0 && (
          <div className="text-center py-16">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-600">No ingredients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientLibrary;

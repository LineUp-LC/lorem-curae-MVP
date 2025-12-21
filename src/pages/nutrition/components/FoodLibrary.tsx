import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Food {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  ethnicity: string;
  skin_benefits: string[];
  other_benefits: string[];
  nutrients: Record<string, number>;
  calories: number;
  allergens: string[];
  image_url: string;
  preparation_time: number;
  difficulty_level: string;
  recipe_instructions: string;
  created_by: string;
  usage_count: number;
  creator_name?: string;
}

interface FoodLibraryProps {
  onSelectFood: (food: Food) => void;
  onSaveFood: (foodId: string) => void;
}

const FoodLibrary = ({ onSelectFood, onSaveFood }: FoodLibraryProps) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFoodIds, setSavedFoodIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Foods', icon: 'ri-restaurant-line' },
    { id: 'Breakfast', name: 'Breakfast', icon: 'ri-sun-line' },
    { id: 'Main Dish', name: 'Main Dishes', icon: 'ri-bowl-line' },
    { id: 'Salad', name: 'Salads', icon: 'ri-leaf-line' },
    { id: 'Soup', name: 'Soups', icon: 'ri-cup-line' },
    { id: 'Beverage', name: 'Beverages', icon: 'ri-goblet-line' },
    { id: 'Dessert', name: 'Desserts', icon: 'ri-cake-3-line' },
  ];

  const subcategories: Record<string, string[]> = {
    'Breakfast': ['Oatmeal', 'Pancakes', 'Eggs', 'Yogurt Bowl', 'Toast', 'Smoothie Bowl', 'Waffles', 'French Toast'],
    'Main Dish': ['Pasta', 'Rice Bowl', 'Stir-Fry', 'Curry', 'Grilled', 'Roasted', 'Baked', 'Casserole'],
    'Salad': ['Green Salad', 'Grain Bowl', 'Protein Salad', 'Fruit Salad', 'Caesar', 'Mediterranean'],
    'Soup': ['Broth-Based', 'Cream Soup', 'Chowder', 'Stew', 'Bisque', 'Noodle Soup'],
    'Beverage': ['Smoothie', 'Juice', 'Tea', 'Coffee', 'Infused Water', 'Latte', 'Shake', 'Kombucha'],
    'Dessert': ['Cake', 'Ice Cream', 'Pastry', 'Cookies', 'Pudding', 'Pie', 'Tart', 'Mousse'],
  };

  useEffect(() => {
    loadFoods();
    loadSavedFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_foods')
        .select(`
          *,
          users_profiles!nutrition_foods_created_by_fkey(full_name)
        `)
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      const foodsWithCreator = data.map(food => ({
        ...food,
        creator_name: food.users_profiles?.full_name || 'Anonymous'
      }));

      setFoods(foodsWithCreator);
    } catch (error) {
      console.error('Error loading foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedFoods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_meals')
        .select('food_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedFoodIds(new Set(data.map(item => item.food_id)));
    } catch (error) {
      console.error('Error loading saved foods:', error);
    }
  };

  const handleSave = async (foodId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save meals');
        return;
      }

      if (savedFoodIds.has(foodId)) {
        // Unsave
        const { error } = await supabase
          .from('saved_meals')
          .delete()
          .eq('user_id', user.id)
          .eq('food_id', foodId);

        if (error) throw error;

        setSavedFoodIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(foodId);
          return newSet;
        });
      } else {
        // Save
        const { error } = await supabase
          .from('saved_meals')
          .insert({ user_id: user.id, food_id: foodId });

        if (error) throw error;

        setSavedFoodIds(prev => new Set(prev).add(foodId));
      }

      onSaveFood(foodId);
    } catch (error) {
      console.error('Error saving food:', error);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || food.subcategory === selectedSubcategory;
    const matchesSearch = searchQuery === '' ||
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.ethnicity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.skin_benefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Breakfast': 'bg-amber-100 text-amber-700',
      'Main Dish': 'bg-rose-100 text-rose-700',
      'Salad': 'bg-green-100 text-green-700',
      'Soup': 'bg-blue-100 text-blue-700',
      'Beverage': 'bg-purple-100 text-purple-700',
      'Dessert': 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 flex items-center justify-center border-4 border-sage-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
        <input
          type="text"
          placeholder="Search by name, ethnicity, or skin benefit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sage-600 focus:outline-none text-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setSelectedSubcategory(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === category.id
                ? 'bg-sage-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-300'
            }`}
          >
            <i className={`${category.icon} text-base`}></i>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Subcategory Filter */}
      {selectedCategory !== 'all' && subcategories[selectedCategory] && (
        <div className="bg-sage-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Filter by type:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedSubcategory === null
                  ? 'bg-sage-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-400'
              }`}
            >
              All {categories.find(c => c.id === selectedCategory)?.name}
            </button>
            {subcategories[selectedCategory].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-sage-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-sage-400'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        Showing <strong>{filteredFoods.length}</strong> meals
      </p>

      {/* Food Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map(food => (
          <div
            key={food.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group"
          >
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-sage-100 to-cream-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="ri-restaurant-2-line text-6xl text-sage-300"></i>
              </div>
              
              {/* Save Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(food.id);
                }}
                className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  savedFoodIds.has(food.id)
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-rose-500 hover:text-white'
                }`}
              >
                <i className={`${savedFoodIds.has(food.id) ? 'ri-heart-fill' : 'ri-heart-line'} text-lg`}></i>
              </button>

              {/* Category Badge */}
              <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(food.category)}`}>
                {food.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{food.name}</h3>
                <span className="text-sm font-medium text-sage-600 ml-2">{food.calories} cal</span>
              </div>

              {food.ethnicity && (
                <p className="text-xs text-gray-500 mb-3">{food.ethnicity} Cuisine</p>
              )}

              {/* Skin Benefits */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Skin Benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {food.skin_benefits.slice(0, 2).map((benefit, idx) => (
                    <span key={idx} className="px-2 py-1 bg-sage-50 text-sage-700 text-xs rounded-full">
                      {benefit}
                    </span>
                  ))}
                  {food.skin_benefits.length > 2 && (
                    <span className="px-2 py-1 bg-sage-50 text-sage-700 text-xs rounded-full">
                      +{food.skin_benefits.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <i className="ri-time-line mr-1"></i>
                    {food.preparation_time} min
                  </span>
                  <span className="flex items-center">
                    <i className="ri-bar-chart-line mr-1"></i>
                    {food.difficulty_level}
                  </span>
                </div>
                <span className="flex items-center">
                  <i className="ri-user-line mr-1"></i>
                  {food.usage_count} uses
                </span>
              </div>

              {/* Creator */}
              <p className="text-xs text-gray-500 mb-4">
                Created by <span className="font-medium text-gray-700">{food.creator_name}</span>
              </p>

              {/* View Details Button */}
              <button
                onClick={() => onSelectFood(food)}
                className="w-full px-4 py-2 bg-sage-600 text-white rounded-lg font-medium text-sm hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                View Recipe & Stores
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <div className="text-center py-16">
          <i className="ri-restaurant-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-xl text-gray-600">No meals found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default FoodLibrary;

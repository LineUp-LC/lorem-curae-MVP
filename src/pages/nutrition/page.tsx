
import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import FoodLibrary from './components/FoodLibrary';
import FoodDetailModal from './components/FoodDetailModal';
import MealPlanner from './components/MealPlanner';
import NutrientTracker from './components/NutrientTracker';
import { supabase } from '../../lib/supabase';

interface Food {
  id: string;
  name: string;
  category: string;
  ethnicity: string;
  skin_benefits: string[];
  other_benefits: string[];
  nutrients: Record<string, number>;
  calories: number;
  allergens: string[];
  preparation_time: number;
  difficulty_level: string;
  recipe_instructions: string;
  usage_count: number;
  creator_name?: string;
}

const NutritionPage = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [planningFood, setPlanningFood] = useState<Food | null>(null);

  const tabs = [
    { id: 'library', name: 'Food Library', icon: 'ri-book-open-line' },
    { id: 'planner', name: 'Meal Planner', icon: 'ri-calendar-line' },
    { id: 'tracker', name: 'Nutrient Tracker', icon: 'ri-bar-chart-line' },
  ];

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleAddToPlan = async (food: Food) => {
    setPlanningFood(food);
    setShowAddToPlanModal(true);
  };

  const handleSaveMealPlan = async (mealType: string, date: string, time: string, servings: number, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to add meals to your plan');
        return;
      }

      if (!planningFood) return;

      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          food_id: planningFood.id,
          meal_type: mealType,
          planned_date: date,
          planned_time: time,
          servings: servings,
          notes: notes
        });

      if (error) throw error;

      alert('Meal added to your plan!');
      setShowAddToPlanModal(false);
      setPlanningFood(null);
      setSelectedFood(null);
      setActiveTab('planner');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Failed to add meal to plan');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nutrition Management</h1>
          <p className="text-lg text-gray-600">
            Discover skin-beneficial foods, plan your meals, and track your nutrient intake
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'text-sage-600 border-b-2 border-sage-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={`${tab.icon} text-lg`}></i>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'library' && (
            <FoodLibrary
              onSelectFood={handleSelectFood}
              onSaveFood={() => {}}
            />
          )}

          {activeTab === 'planner' && (
            <MealPlanner />
          )}

          {activeTab === 'tracker' && (
            <NutrientTracker />
          )}
        </div>
      </main>

      <Footer />

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onAddToPlan={handleAddToPlan}
        />
      )}

      {/* Add to Plan Modal */}
      {showAddToPlanModal && planningFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Meal Plan</h3>
            <p className="text-gray-600 mb-6">{planningFood.name}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveMealPlan(
                  formData.get('mealType') as string,
                  formData.get('date') as string,
                  formData.get('time') as string,
                  parseInt(formData.get('servings') as string),
                  formData.get('notes') as string
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <select
                  name="mealType"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  required
                  defaultValue="12:00"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                <input
                  type="number"
                  name="servings"
                  required
                  min="1"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-sage-600 focus:outline-none resize-none"
                  placeholder="Any special instructions or modifications..."
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-sage-600 text-white rounded-xl font-semibold hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Add to Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddToPlanModal(false);
                    setPlanningFood(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPage;

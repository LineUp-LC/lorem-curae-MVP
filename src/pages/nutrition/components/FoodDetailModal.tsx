import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-browser';

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

interface Store {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  website_url: string;
  delivery_available: boolean;
  organic_options: boolean;
  price: number;
  in_stock: boolean;
}

interface FoodDetailModalProps {
  food: Food;
  onClose: () => void;
  onAddToPlan: (food: Food) => void;
}

const FoodDetailModal = ({ food, onClose, onAddToPlan }: FoodDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipe' | 'stores'>('overview');

  // Mock store data - where to buy this food/ingredient
  const stores = [
    {
      id: '1',
      name: 'Whole Foods Market',
      distance: '1.2 miles',
      price: '$12.99',
      availability: 'In Stock',
      address: '123 Main St, Los Angeles, CA',
      hours: 'Open until 9:00 PM',
      type: 'Grocery Store',
    },
    {
      id: '2',
      name: 'Trader Joe\'s',
      distance: '2.5 miles',
      price: '$9.99',
      availability: 'In Stock',
      address: '456 Oak Ave, Los Angeles, CA',
      hours: 'Open until 8:00 PM',
      type: 'Grocery Store',
    },
    {
      id: '3',
      name: 'Sprouts Farmers Market',
      distance: '3.1 miles',
      price: '$11.49',
      availability: 'Limited Stock',
      address: '789 Pine Rd, Los Angeles, CA',
      hours: 'Open until 10:00 PM',
      type: 'Organic Market',
    },
    {
      id: '4',
      name: 'Local Farmers Market',
      distance: '0.8 miles',
      price: '$8.50',
      availability: 'Weekends Only',
      address: 'City Park, Los Angeles, CA',
      hours: 'Sat-Sun 8:00 AM - 2:00 PM',
      type: 'Farmers Market',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{food.name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-2xl text-gray-600"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-sage-600 border-b-2 border-sage-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('recipe')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'recipe'
                ? 'text-sage-600 border-b-2 border-sage-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recipe
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'stores'
                ? 'text-sage-600 border-b-2 border-sage-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Where to Buy
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Existing overview content */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sage-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Calories</p>
                  <p className="text-2xl font-bold text-gray-900">{food.calories}</p>
                </div>
                <div className="bg-sage-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Prep Time</p>
                  <p className="text-2xl font-bold text-gray-900">{food.preparation_time} min</p>
                </div>
              </div>

              {/* Skin Benefits */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Skin Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {food.skin_benefits.map((benefit, idx) => (
                    <span key={idx} className="px-3 py-1 bg-sage-100 text-sage-700 text-sm rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrients */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Key Nutrients</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(food.nutrients).map(([nutrient, amount]) => (
                    <div key={nutrient} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{nutrient}</span>
                      <span className="text-sm font-semibold text-gray-900">{amount}mg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              {food.allergens && food.allergens.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Allergen Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {food.allergens.map((allergen, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recipe' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{food.recipe_instructions}</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-amber-600 text-xl"></i>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Difficulty Level</h4>
                    <p className="text-sm text-amber-800">{food.difficulty_level}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Available at {stores.length} locations near you</h3>
                <button className="text-sm text-sage-600 hover:text-sage-700 font-medium cursor-pointer">
                  <i className="ri-map-pin-line mr-1"></i>
                  Change Location
                </button>
              </div>

              {stores.map((store) => (
                <div key={store.id} className="border border-gray-200 rounded-xl p-4 hover:border-sage-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{store.name}</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {store.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{store.address}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-map-pin-line"></i>
                          {store.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          {store.hours}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 mb-1">{store.price}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        store.availability === 'In Stock'
                          ? 'bg-green-100 text-green-700'
                          : store.availability === 'Limited Stock'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {store.availability}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
                      <i className="ri-navigation-line mr-1"></i>
                      Get Directions
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
                      <i className="ri-phone-line mr-1"></i>
                      Call
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-6">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-blue-600 text-xl"></i>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Price & Availability</h4>
                    <p className="text-sm text-blue-800">
                      Prices and availability are estimates based on recent data. Please contact stores directly to confirm before visiting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={() => onAddToPlan(food)}
            className="w-full px-6 py-3 bg-sage-600 text-white rounded-xl font-semibold hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-calendar-line mr-2"></i>
            Add to Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;

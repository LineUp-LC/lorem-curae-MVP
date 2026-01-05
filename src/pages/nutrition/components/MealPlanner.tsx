import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-browser';

interface Food {
  id: string;
  name: string;
  calories: number;
  preparation_time: number;
}

interface MealPlan {
  id: string;
  food_id: string;
  meal_type: string;
  planned_date: string;
  planned_time: string;
  servings: number;
  notes: string;
  completed: boolean;
  nutrition_foods: Food;
}

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  useEffect(() => {
    loadMealPlans();
  }, [selectedDate, viewMode]);

  const loadMealPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = viewMode === 'week' 
        ? getWeekStart(selectedDate)
        : selectedDate;
      
      const endDate = viewMode === 'week'
        ? getWeekEnd(selectedDate)
        : selectedDate;

      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          nutrition_foods (id, name, calories, preparation_time)
        `)
        .eq('id', user.id)
        .gte('planned_date', startDate.toISOString().split('T')[0])
        .lte('planned_date', endDate.toISOString().split('T')[0])
        .order('planned_date')
        .order('planned_time');

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const getWeekDays = () => {
    const days = [];
    const start = getWeekStart(selectedDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMealsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(plan => plan.planned_date === dateStr);
  };

  const toggleComplete = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ completed: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      setMealPlans(prev =>
        prev.map(plan =>
          plan.id === planId ? { ...plan, completed: !currentStatus } : plan
        )
      );
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setMealPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const getMealTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Breakfast': 'ri-sun-line',
      'Lunch': 'ri-restaurant-line',
      'Dinner': 'ri-moon-line',
      'Snack': 'ri-apple-line'
    };
    return icons[type] || 'ri-restaurant-line';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 flex items-center justify-center border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-deep">Meal Planner</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'day'
                ? 'bg-primary text-white'
                : 'bg-cream text-warm-gray hover:bg-blush'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'week'
                ? 'bg-primary text-white'
                : 'bg-cream text-warm-gray hover:bg-blush'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 1));
            setSelectedDate(newDate);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl text-warm-gray"></i>
        </button>

        <div className="text-center">
          <h3 className="text-lg font-bold text-deep">
            {viewMode === 'week'
              ? `${getWeekStart(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekEnd(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 1));
            setSelectedDate(newDate);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
        >
          <i className="ri-arrow-right-line text-xl text-warm-gray"></i>
        </button>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-4">
          {getWeekDays().map((day, idx) => {
            const meals = getMealsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={idx}
                className={`bg-white rounded-xl p-4 ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="text-center mb-3">
                  <p className="text-xs font-semibold text-warm-gray/80 uppercase">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-bold ${isToday ? 'text-primary' : 'text-deep'}`}>
                    {day.getDate()}
                  </p>
                </div>

                <div className="space-y-2">
                  {meals.map(meal => (
                    <div
                      key={meal.id}
                      className={`p-2 rounded-lg border ${
                        meal.completed
                          ? 'bg-taupe-50 border-taupe-200'
                          : 'bg-cream border-blush'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <i className={`${getMealTypeIcon(meal.meal_type)} text-sm text-warm-gray`}></i>
                        <button
                          onClick={() => toggleComplete(meal.id, meal.completed)}
                          className="cursor-pointer"
                        >
                          <i className={`${meal.completed ? 'ri-checkbox-circle-fill text-taupe' : 'ri-checkbox-blank-circle-line text-warm-gray/60'} text-lg`}></i>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-deep line-clamp-2">
                        {meal.nutrition_foods.name}
                      </p>
                      <p className="text-xs text-warm-gray/80">{meal.nutrition_foods.calories} cal</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {mealTypes.map(mealType => {
            const meals = getMealsForDate(selectedDate).filter(
              m => m.meal_type === mealType
            );

            return (
              <div key={mealType} className="bg-white rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-light/30 text-primary rounded-lg">
                    <i className={`${getMealTypeIcon(mealType)} text-lg`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-deep">{mealType}</h3>
                </div>

                {meals.length === 0 ? (
                  <p className="text-sm text-warm-gray/80 italic">No meals planned</p>
                ) : (
                  <div className="space-y-3">
                    {meals.map(meal => (
                      <div
                        key={meal.id}
                        className={`border rounded-lg p-4 ${
                          meal.completed
                            ? 'bg-taupe-50 border-taupe-200'
                            : 'border-blush'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-deep mb-1">
                              {meal.nutrition_foods.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-warm-gray">
                              <span>{meal.nutrition_foods.calories} cal</span>
                              <span>{meal.nutrition_foods.preparation_time} min</span>
                              <span>{meal.servings} serving(s)</span>
                            </div>
                            {meal.notes && (
                              <p className="text-sm text-warm-gray mt-2">{meal.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleComplete(meal.id, meal.completed)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
                            >
                              <i className={`${meal.completed ? 'ri-checkbox-circle-fill text-taupe' : 'ri-checkbox-blank-circle-line text-warm-gray/60'} text-xl`}></i>
                            </button>
                            <button
                              onClick={() => deleteMealPlan(meal.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-xl text-red-600"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mealPlans.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl">
          <i className="ri-calendar-line text-6xl text-blush mb-4"></i>
          <p className="text-xl text-warm-gray mb-2">No meals planned yet</p>
          <p className="text-sm text-warm-gray/80">Browse the food library and add meals to your plan</p>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
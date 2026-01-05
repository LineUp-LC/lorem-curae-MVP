import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-browser';

interface NutrientGoal {
  id: string;
  nutrient_name: string;
  target_amount: number;
  unit: string;
}

interface DailyIntake {
  nutrient_name: string;
  total_amount: number;
}

const NutrientTracker = () => {
  const [goals, setGoals] = useState<NutrientGoal[]>([]);
  const [dailyIntake, setDailyIntake] = useState<DailyIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const defaultNutrients = [
    { name: 'Water', unit: 'glasses', icon: 'ri-drop-line', color: 'blue', defaultTarget: 8 },
    { name: 'Protein', unit: 'g', icon: 'ri-heart-pulse-line', color: 'red', defaultTarget: 50 },
    { name: 'Vitamin C', unit: 'mg', icon: 'ri-sun-line', color: 'amber', defaultTarget: 100 },
    { name: 'Omega-3', unit: 'mg', icon: 'ri-fish-line', color: 'teal', defaultTarget: 1000 },
    { name: 'Fiber', unit: 'g', icon: 'ri-leaf-line', color: 'green', defaultTarget: 25 },
    { name: 'Calcium', unit: 'mg', icon: 'ri-bone-line', color: 'indigo', defaultTarget: 1000 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async (isRecursive = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('nutrient_goals')
        .select('*')
        .eq('id', user.id);

      if (goalsError) throw goalsError;

      // If no goals exist, create default ones (but prevent infinite recursion)
      if (!goalsData || goalsData.length === 0) {
        if (isRecursive) {
          console.error('Failed to load goals after creating defaults');
          return;
        }
        await createDefaultGoals(user.id);
        await loadData(true);
        return;
      }

      setGoals(goalsData);

      // Load daily intake
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data: intakeData, error: intakeError } = await supabase
        .from('daily_nutrient_intake')
        .select('nutrients')
        .eq('id', user.id)
        .eq('date', dateStr);

      if (intakeError) throw intakeError;

      // Aggregate nutrients
      const aggregated: Record<string, number> = {};
      intakeData?.forEach(entry => {
        Object.entries(entry.nutrients || {}).forEach(([key, value]) => {
          aggregated[key] = (aggregated[key] || 0) + (value as number);
        });
      });

      const intakeArray = Object.entries(aggregated).map(([name, amount]) => ({
        nutrient_name: name,
        total_amount: amount
      }));

      setDailyIntake(intakeArray);
    } catch (error) {
      console.error('Error loading nutrient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultGoals = async (userId: string) => {
    try {
      const goalsToInsert = defaultNutrients.map(nutrient => ({
        user_id: userId,
        nutrient_name: nutrient.name,
        target_amount: nutrient.defaultTarget,
        unit: nutrient.unit
      }));

      const { error } = await supabase
        .from('nutrient_goals')
        .insert(goalsToInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default goals:', error);
      throw error; // Re-throw to handle in loadData
    }
  };

  const updateGoal = async (goalId: string, newTarget: number) => {
    // Validate input
    if (isNaN(newTarget) || newTarget <= 0) {
      console.error('Invalid target amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('nutrient_goals')
        .update({ target_amount: newTarget })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId ? { ...goal, target_amount: newTarget } : goal
        )
      );
    } catch (error) {
      console.error('Error updating goal:', error);
      // Optionally revert the value in UI on error
      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId ? goal : goal
        )
      );
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; progress: string }> = {
      blue: { bg: 'bg-light/30', text: 'text-primary', progress: 'bg-light/200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', progress: 'bg-red-500' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', progress: 'bg-amber-500' },
      teal: { bg: 'bg-light/30', text: 'text-primary', progress: 'bg-primary' },
      green: { bg: 'bg-taupe-100', text: 'text-taupe', progress: 'bg-taupe-500' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', progress: 'bg-indigo-600' },
    };
    return colors[color] || colors.blue;
  };

  const getCurrentAmount = (nutrientName: string) => {
    const intake = dailyIntake.find(i => i.nutrient_name.toLowerCase() === nutrientName.toLowerCase());
    return intake?.total_amount || 0;
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
        <h2 className="text-2xl font-bold text-deep">Daily Nutrient Tracker</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-4 py-2 border border-blush rounded-lg focus:border-primary focus:outline-none text-sm cursor-pointer"
        />
      </div>

      {/* Nutrient Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const nutrientInfo = defaultNutrients.find(
            n => n.name.toLowerCase() === goal.nutrient_name.toLowerCase()
          );
          const colors = getColorClasses(nutrientInfo?.color || 'blue');
          const current = getCurrentAmount(goal.nutrient_name);
          const percentage = goal.target_amount > 0 ? (current / goal.target_amount) * 100 : 0;

          return (
            <div key={goal.id} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 flex items-center justify-center ${colors.bg} ${colors.text} rounded-xl`}>
                    <i className={`${nutrientInfo?.icon || 'ri-heart-line'} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-deep">{goal.nutrient_name}</h3>
                    <p className="text-sm text-warm-gray">
                      {current.toFixed(1)}/{goal.target_amount} {goal.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blush rounded-full h-3 mb-4">
                <div
                  className={`${colors.progress} h-3 rounded-full transition-all`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              {/* Edit Goal */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-warm-gray">Daily Goal:</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={goal.target_amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      updateGoal(goal.id, value);
                    }
                  }}
                  className="flex-1 px-3 py-1 border border-blush rounded-lg focus:border-primary focus:outline-none text-sm"
                />
                <span className="text-xs text-warm-gray">{goal.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-primary to-dark rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">💡 Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {goals.map(goal => {
            const current = getCurrentAmount(goal.nutrient_name);
            const percentage = goal.target_amount > 0 ? (current / goal.target_amount) * 100 : 0;
            const status = percentage >= 100 ? '✅' : percentage >= 50 ? '⚡' : '📊';
            
            return (
              <div key={goal.id} className="text-sm">
                <span className="mr-2">{status}</span>
                <span className="font-medium">{goal.nutrient_name}:</span>
                <span className="ml-1">{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NutrientTracker;
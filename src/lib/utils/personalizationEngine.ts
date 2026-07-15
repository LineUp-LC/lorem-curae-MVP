// Personalization Engine - Rule-based logic for user research testing
// Adapts responses based on user inputs without hard-coded outcomes

import { sessionState } from './sessionState';

export interface UserProfile {
  skinType?: string;
  concerns: string[];
  goals: string[];
  sensitivities: string[];
  preferences: {
    texture?: string;
    finish?: string;
    crueltyFree?: boolean;
    vegan?: boolean;
  };
  routinePreferences?: {
    complexity?: string;
    timeOfDay?: string[];
  };
}

export interface DailyLog {
  date: string;
  skinCondition: number; // 1-5
  mood: string;
  notes: string;
  productsUsed: string[];
  concerns: string[];
}

// Generate personalized product recommendations
export const generateProductRecommendations = (profile: UserProfile, searchQuery?: string) => {
  const recommendations: any[] = [];
  const concerns = profile.concerns || [];
  const skinType = profile.skinType || 'normal';

  // Rule-based matching
  if (concerns.includes('Acne & Breakouts') || searchQuery?.toLowerCase().includes('acne')) {
    recommendations.push({
      name: 'Salicylic Acid Cleanser',
      reason: 'Targets acne-causing bacteria and unclogs pores',
      ingredients: ['Salicylic Acid 2%', 'Niacinamide', 'Tea Tree Oil'],
      match: 95,
    });
    recommendations.push({
      name: 'Benzoyl Peroxide Treatment',
      reason: 'Reduces active breakouts and prevents new ones',
      ingredients: ['Benzoyl Peroxide 5%', 'Aloe Vera', 'Panthenol'],
      match: 90,
    });
  }

  if (concerns.includes('Hyperpigmentation') || searchQuery?.toLowerCase().includes('dark spots')) {
    recommendations.push({
      name: 'Vitamin C Serum',
      reason: 'Brightens skin tone and fades dark spots',
      ingredients: ['Vitamin C 15%', 'Ferulic Acid', 'Vitamin E'],
      match: 93,
    });
    recommendations.push({
      name: 'Alpha Arbutin Treatment',
      reason: 'Targets hyperpigmentation without irritation',
      ingredients: ['Alpha Arbutin 2%', 'Kojic Acid', 'Licorice Root'],
      match: 88,
    });
  }

  if (concerns.includes('Fine Lines & Wrinkles') || searchQuery?.toLowerCase().includes('aging')) {
    recommendations.push({
      name: 'Retinol Night Serum',
      reason: 'Reduces fine lines and improves skin texture',
      ingredients: ['Retinol 0.5%', 'Peptides', 'Hyaluronic Acid'],
      match: 94,
    });
    recommendations.push({
      name: 'Peptide Complex Cream',
      reason: 'Boosts collagen production and firms skin',
      ingredients: ['Matrixyl 3000', 'Argireline', 'Ceramides'],
      match: 89,
    });
  }

  if (concerns.includes('Dryness & Dehydration') || skinType === 'dry') {
    recommendations.push({
      name: 'Hyaluronic Acid Serum',
      reason: 'Deeply hydrates and plumps skin',
      ingredients: ['Hyaluronic Acid', 'Glycerin', 'B5'],
      match: 92,
    });
    recommendations.push({
      name: 'Ceramide Barrier Cream',
      reason: 'Repairs moisture barrier and locks in hydration',
      ingredients: ['Ceramides', 'Squalane', 'Shea Butter'],
      match: 91,
    });
  }

  // Add universal essentials if no specific concerns
  if (recommendations.length === 0) {
    recommendations.push({
      name: 'Gentle Daily Cleanser',
      reason: 'Perfect for maintaining healthy skin',
      ingredients: ['Glycerin', 'Panthenol', 'Allantoin'],
      match: 85,
    });
  }

  return recommendations.sort((a, b) => b.match - a.match);
};

// Generate AI chat responses based on context
export const generateAIResponse = (
  query: string,
  profile: UserProfile,
  context?: any
): string => {
  const lowerQuery = query.toLowerCase();
  const concerns = profile.concerns || [];
  const skinType = profile.skinType || 'normal';

  // Product recommendations
  if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('product')) {
    const products = generateProductRecommendations(profile, query);
    if (products.length > 0) {
      return `Based on your ${skinType} skin and concerns about ${concerns.join(', ')}, I recommend:\n\n${products.slice(0, 3).map((p, i) => `${i + 1}. **${p.name}**\n   ${p.reason}\n   Key ingredients: ${p.ingredients.join(', ')}`).join('\n\n')}\n\nWould you like more details about any of these?`;
    }
  }

  // Routine building
  if (lowerQuery.includes('routine') || lowerQuery.includes('order') || lowerQuery.includes('layer')) {
    return `For your ${skinType} skin, here's the optimal routine order:\n\n**Morning:**\n1. Cleanser\n2. Toner (if using)\n3. Serum (Vitamin C for brightening)\n4. Moisturizer\n5. SPF 30+ (essential!)\n\n**Evening:**\n1. Cleanser (double cleanse if wearing makeup)\n2. Treatment (${concerns.includes('Acne & Breakouts') ? 'Salicylic Acid or Benzoyl Peroxide' : concerns.includes('Fine Lines & Wrinkles') ? 'Retinol' : 'Active ingredient'})\n3. Serum (Hydrating or targeted)\n4. Moisturizer\n5. Night cream (optional)\n\nWait 1-2 minutes between each step for better absorption!`;
  }

  // Ingredient questions
  if (lowerQuery.includes('ingredient') || lowerQuery.includes('what is')) {
    if (lowerQuery.includes('retinol')) {
      return `**Retinol** is a vitamin A derivative that's excellent for anti-aging:\n\n✨ **Benefits:**\n• Reduces fine lines and wrinkles\n• Improves skin texture\n• Fades hyperpigmentation\n• Boosts collagen production\n\n⚠️ **Tips for your ${skinType} skin:**\n• Start with 0.25% concentration\n• Use only at night\n• Always wear SPF during the day\n• Introduce slowly (2-3x per week)\n• May cause initial purging\n\nWould you like product recommendations with retinol?`;
    }
    if (lowerQuery.includes('niacinamide')) {
      return `**Niacinamide** (Vitamin B3) is a versatile ingredient perfect for ${skinType} skin:\n\n✨ **Benefits:**\n• Reduces inflammation and redness\n• Minimizes pores\n• Regulates oil production\n• Brightens skin tone\n• Strengthens skin barrier\n\n💡 **Why it's great for you:**\n${concerns.includes('Acne & Breakouts') ? '• Helps control breakouts and sebum' : ''}\n${concerns.includes('Hyperpigmentation') ? '• Fades dark spots effectively' : ''}\n• Safe for sensitive skin\n• Can be used morning and night\n• Pairs well with most ingredients\n\nConcentrations of 5-10% are most effective!`;
    }
  }

  // Concern-specific advice
  if (lowerQuery.includes('acne') || lowerQuery.includes('breakout')) {
    return `For acne-prone skin, here's my personalized advice:\n\n🎯 **Key Strategies:**\n• Use salicylic acid (BHA) to unclog pores\n• Benzoyl peroxide for active breakouts\n• Niacinamide to reduce inflammation\n• Don't over-exfoliate (2-3x per week max)\n\n⚠️ **Avoid:**\n• Heavy oils and comedogenic ingredients\n• Over-washing (strips natural oils)\n• Picking or popping (causes scarring)\n\n💡 **Pro tip:** Introduce one active ingredient at a time and give it 6-8 weeks to work. Consistency is key!\n\nWould you like specific product recommendations?`;
  }

  // Progress tracking
  if (lowerQuery.includes('progress') || lowerQuery.includes('working') || lowerQuery.includes('result')) {
    return `Great question! Here's how to track your progress effectively:\n\n📸 **Photo Documentation:**\n• Take photos in same lighting weekly\n• Same angle and distance\n• No makeup, clean skin\n\n📝 **What to Track:**\n• Skin texture changes\n• Reduction in ${concerns[0] || 'concerns'}\n• Product reactions\n• Mood and stress levels\n\n⏰ **Timeline Expectations:**\n• Hydration: 1-2 weeks\n• Acne treatments: 6-8 weeks\n• Anti-aging: 12+ weeks\n• Hyperpigmentation: 8-12 weeks\n\nRemember: Skincare is a marathon, not a sprint!`;
  }

  // Sensitivity concerns
  if (lowerQuery.includes('sensitive') || lowerQuery.includes('irritation') || lowerQuery.includes('reaction')) {
    return `For sensitive skin, let's be extra careful:\n\n✅ **Safe Ingredients:**\n• Centella Asiatica (Cica)\n• Ceramides\n• Hyaluronic Acid\n• Niacinamide (low %)\n• Colloidal Oatmeal\n\n❌ **Avoid:**\n• Fragrance and essential oils\n• High % acids (start low)\n• Alcohol denat.\n• Harsh physical scrubs\n\n💡 **Patch Test Protocol:**\n1. Apply small amount behind ear\n2. Wait 24-48 hours\n3. Check for redness/itching\n4. If clear, test on face\n\nAlways introduce one new product at a time!`;
  }

  // Default helpful response
  return `I'm here to help with your ${skinType} skin! I can assist with:\n\n• Product recommendations for ${concerns.length > 0 ? concerns.join(', ') : 'your concerns'}\n• Routine building and product layering\n• Ingredient education\n• Addressing specific skin concerns\n• Progress tracking tips\n\nWhat would you like to know more about?`;
};

// Analyze progress based on daily logs
export const analyzeProgress = (logs: DailyLog[], timeframe: string): any => {
  if (logs.length === 0) {
    return {
      trend: 'insufficient_data',
      message: 'Not enough data to analyze. Keep logging daily!',
      recommendations: ['Log your skin condition daily', 'Track products used', 'Note any reactions'],
    };
  }

  // Calculate averages
  const avgCondition = logs.reduce((sum, log) => sum + log.skinCondition, 0) / logs.length;
  const recentLogs = logs.slice(-7);
  const recentAvg = recentLogs.reduce((sum, log) => sum + log.skinCondition, 0) / recentLogs.length;
  
  // Determine trend
  let trend = 'stable';
  let trendMessage = '';
  
  if (recentAvg > avgCondition + 0.5) {
    trend = 'improving';
    trendMessage = '📈 Your skin is showing improvement!';
  } else if (recentAvg < avgCondition - 0.5) {
    trend = 'declining';
    trendMessage = '📉 Your skin needs attention.';
  } else {
    trend = 'stable';
    trendMessage = '➡️ Your skin condition is stable.';
  }

  // Analyze mood correlation
  const moodCounts: any = {};
  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  // Find most common concerns
  const concernCounts: any = {};
  logs.forEach(log => {
    log.concerns.forEach(concern => {
      concernCounts[concern] = (concernCounts[concern] || 0) + 1;
    });
  });

  const topConcerns = Object.entries(concernCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3)
    .map(([concern]) => concern);

  return {
    trend,
    trendMessage,
    avgCondition: avgCondition.toFixed(1),
    recentAvg: recentAvg.toFixed(1),
    totalLogs: logs.length,
    topConcerns,
    recommendations: generateProgressRecommendations(trend, topConcerns, avgCondition),
    insights: generateInsights(logs),
  };
};

const generateProgressRecommendations = (trend: string, concerns: string[], avgCondition: number): string[] => {
  const recommendations: string[] = [];

  if (trend === 'declining') {
    recommendations.push('Review recent product changes - something may not be working');
    recommendations.push('Consider simplifying your routine to identify irritants');
    recommendations.push('Ensure you\'re getting enough sleep and staying hydrated');
  } else if (trend === 'improving') {
    recommendations.push('Keep up your current routine - it\'s working!');
    recommendations.push('Document what\'s working for future reference');
    recommendations.push('Consider adding progress photos weekly');
  } else {
    recommendations.push('Maintain consistency with your current routine');
    recommendations.push('Consider introducing one new targeted treatment');
    recommendations.push('Track environmental factors (stress, diet, weather)');
  }

  if (concerns.length > 0) {
    recommendations.push(`Focus on treatments for: ${concerns.join(', ')}`);
  }

  return recommendations;
};

const generateInsights = (logs: DailyLog[]): string[] => {
  const insights: string[] = [];

  // Check consistency
  if (logs.length >= 7) {
    insights.push(`✅ Great job! You've logged ${logs.length} days of data`);
  }

  // Check for patterns
  const weekendLogs = logs.filter(log => {
    const date = new Date(log.date);
    const day = date.getDay();
    return day === 0 || day === 6;
  });

  if (weekendLogs.length > 0) {
    const weekendAvg = weekendLogs.reduce((sum, log) => sum + log.skinCondition, 0) / weekendLogs.length;
    const weekdayLogs = logs.filter(log => !weekendLogs.includes(log));
    const weekdayAvg = weekdayLogs.reduce((sum, log) => sum + log.skinCondition, 0) / weekdayLogs.length;

    if (Math.abs(weekendAvg - weekdayAvg) > 0.5) {
      insights.push(`📊 Your skin differs on weekends vs weekdays - lifestyle factors may be at play`);
    }
  }

  return insights;
};

// Generate routine suggestions based on profile
export const generateRoutineSuggestions = (profile: UserProfile, timeOfDay: 'morning' | 'evening'): any[] => {
  const routine: any[] = [];
  const concerns = profile.concerns || [];
  const skinType = profile.skinType || 'normal';

  // Step 1: Cleanser
  routine.push({
    step: 1,
    category: 'Cleanser',
    product: skinType === 'dry' ? 'Creamy Hydrating Cleanser' : skinType === 'oily' ? 'Foaming Gel Cleanser' : 'Gentle Daily Cleanser',
    reason: `Removes impurities without stripping ${skinType} skin`,
    timing: 'Apply to damp skin, massage for 60 seconds, rinse',
  });

  if (timeOfDay === 'morning') {
    // Morning routine
    if (concerns.includes('Hyperpigmentation')) {
      routine.push({
        step: 2,
        category: 'Serum',
        product: 'Vitamin C Brightening Serum',
        reason: 'Brightens and protects against environmental damage',
        timing: 'Apply 3-4 drops to face and neck',
      });
    }

    if (concerns.includes('Dryness & Dehydration') || skinType === 'dry') {
      routine.push({
        step: routine.length + 1,
        category: 'Hydrating Serum',
        product: 'Hyaluronic Acid Serum',
        reason: 'Locks in moisture throughout the day',
        timing: 'Apply to damp skin for best absorption',
      });
    }

    routine.push({
      step: routine.length + 1,
      category: 'Moisturizer',
      product: skinType === 'oily' ? 'Lightweight Gel Moisturizer' : 'Nourishing Day Cream',
      reason: 'Hydrates and protects skin barrier',
      timing: 'Apply evenly to face and neck',
    });

    routine.push({
      step: routine.length + 1,
      category: 'SPF',
      product: 'Broad Spectrum SPF 50',
      reason: 'Essential protection against UV damage',
      timing: 'Apply generously as final step, reapply every 2 hours',
      warning: 'Never skip this step!',
    });
  } else {
    // Evening routine
    if (concerns.includes('Acne & Breakouts')) {
      routine.push({
        step: 2,
        category: 'Treatment',
        product: 'Salicylic Acid Treatment',
        reason: 'Unclogs pores and prevents breakouts',
        timing: 'Apply to clean, dry skin, wait 5 minutes',
      });
    }

    if (concerns.includes('Fine Lines & Wrinkles')) {
      routine.push({
        step: 2,
        category: 'Treatment',
        product: 'Retinol Serum 0.5%',
        reason: 'Reduces fine lines and improves texture',
        timing: 'Start 2-3x per week, gradually increase',
        warning: 'Use sunscreen during the day',
      });
    }

    if (concerns.includes('Hyperpigmentation') && !concerns.includes('Fine Lines & Wrinkles')) {
      routine.push({
        step: 2,
        category: 'Treatment',
        product: 'Alpha Arbutin Serum',
        reason: 'Fades dark spots gently',
        timing: 'Apply after cleansing',
      });
    }

    routine.push({
      step: routine.length + 1,
      category: 'Serum',
      product: 'Niacinamide Serum',
      reason: 'Strengthens barrier and reduces inflammation',
      timing: 'Apply 3-4 drops',
    });

    routine.push({
      step: routine.length + 1,
      category: 'Moisturizer',
      product: skinType === 'dry' ? 'Rich Night Cream' : 'Balancing Night Moisturizer',
      reason: 'Repairs and nourishes overnight',
      timing: 'Apply as final step',
    });
  }

  return routine;
};

// Compare products based on user needs
export const compareProducts = (products: any[], profile: UserProfile): any => {
  const concerns = profile.concerns || [];
  const sensitivities = profile.sensitivities || [];

  return products.map(product => {
    let score = 0;
    const pros: string[] = [];
    const cons: string[] = [];

    // Check for beneficial ingredients
    concerns.forEach(concern => {
      if (concern === 'Acne & Breakouts') {
        if (product.ingredients?.some((i: string) => ['salicylic acid', 'benzoyl peroxide', 'niacinamide'].includes(i.toLowerCase()))) {
          score += 20;
          pros.push('Contains acne-fighting ingredients');
        }
      }
      if (concern === 'Hyperpigmentation') {
        if (product.ingredients?.some((i: string) => ['vitamin c', 'alpha arbutin', 'kojic acid'].includes(i.toLowerCase()))) {
          score += 20;
          pros.push('Effective for brightening and fading dark spots');
        }
      }
      if (concern === 'Fine Lines & Wrinkles') {
        if (product.ingredients?.some((i: string) => ['retinol', 'peptides', 'vitamin e'].includes(i.toLowerCase()))) {
          score += 20;
          pros.push('Anti-aging ingredients present');
        }
      }
    });

    // Check for sensitivities
    sensitivities.forEach(sensitivity => {
      if (product.ingredients?.some((i: string) => i.toLowerCase().includes(sensitivity.toLowerCase()))) {
        score -= 30;
        cons.push(`Contains ${sensitivity} (your sensitivity)`);
      }
    });

    // Check preferences
    if (profile.preferences?.crueltyFree && product.crueltyFree) {
      score += 10;
      pros.push('Cruelty-free certified');
    }
    if (profile.preferences?.vegan && product.vegan) {
      score += 10;
      pros.push('Vegan formula');
    }

    return {
      ...product,
      matchScore: Math.max(0, Math.min(100, score + 50)),
      pros,
      cons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

export function analyzeUserProgress(logs: any[]): any {
  const sessionContext = sessionState.getPersonalizationContext();
  
  // ... existing analysis code ...

  // Add session-aware insights
  const insights = {
    // ... existing insights ...
    engagementLevel: sessionContext.patterns.engagementLevel,
    recommendedActions: generateContextualActions(sessionContext),
  };

  return insights;
}

function generateContextualActions(context: any): string[] {
  const actions: string[] = [];
  const { patterns, preferences } = context;

  if (patterns.engagementLevel === 'low') {
    actions.push('Try our AI chat for personalized guidance');
    actions.push('Take the skin quiz to get better recommendations');
  } else if (patterns.engagementLevel === 'medium') {
    actions.push('Build a custom routine to track your progress');
    actions.push('Explore our ingredient library for deeper insights');
  } else {
    actions.push('Join our community to share your experience');
    actions.push('Consider premium features for advanced analysis');
  }

  if (!preferences.concerns || preferences.concerns.length === 0) {
    actions.push('Update your skin profile for better recommendations');
  }

  return actions.slice(0, 3);
}

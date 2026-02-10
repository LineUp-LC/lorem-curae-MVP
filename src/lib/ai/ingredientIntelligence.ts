/**
 * Ingredient Intelligence for Lorem Curae AI
 *
 * Provides deep ingredient-level understanding including:
 * - Ingredient explanations tailored to user profiles
 * - Compatibility and conflict detection
 * - Personalized ingredient recommendations
 * - Ingredient comparisons
 * - Safety and usage guidance
 */

import {
  INGREDIENT_ENCYCLOPEDIA,
  type IngredientKnowledge,
} from './knowledgeBase';
import { type RankedProduct } from './retrievalPipeline';

// ============================================================================
// Types
// ============================================================================

/**
 * User skin profile for ingredient personalization
 */
export interface IngredientUserProfile {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentProducts?: string[];
  avoidIngredients?: string[];
}

/**
 * User ingredient history
 */
export interface IngredientHistory {
  viewedIngredients?: string[];
  searchedIngredients?: string[];
  productsWithIngredient?: Array<{ ingredient: string; productName: string }>;
  frequentConcerns?: string[];
}

/**
 * Ingredient explanation result
 */
export interface IngredientExplanation {
  ingredient: string;
  summary: string;
  benefits: string[];
  howItWorks: string;
  bestFor: {
    skinTypes: string[];
    concerns: string[];
  };
  usage: {
    frequency: string;
    timing: 'AM' | 'PM' | 'both';
    application: string;
  };
  compatibility: {
    pairsWith: string[];
    avoidWith: string[];
    caution: string[];
  };
  safety: {
    notes: string[];
    pregnancySafe: boolean | 'consult-doctor';
    beginnerFriendly: boolean;
    photosensitizing: boolean;
  };
  concentration?: {
    range: string;
    optimal: string;
  };
  personalizedNote?: string;
  navigationUrl: string;
}

/**
 * Ingredient comparison result
 */
export interface IngredientComparison {
  ingredients: string[];
  summary: string;
  differences: Array<{
    aspect: string;
    details: Record<string, string>;
  }>;
  recommendation: string;
  bestFor: Record<string, string[]>;
}

/**
 * Ingredient compatibility result
 */
export interface CompatibilityResult {
  compatible: boolean;
  level: 'safe' | 'caution' | 'avoid';
  reason: string;
  resolution?: string;
}

/**
 * Personalized ingredient recommendation
 */
export interface IngredientRecommendation {
  ingredient: string;
  reason: string;
  matchScore: number;
  concerns: string[];
  products?: RankedProduct[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert ingredient name to URL-friendly slug
 */
export function toIngredientSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ============================================================================
// Ingredient Categories and Classifications
// ============================================================================

/**
 * Ingredient categories by function
 */
export const INGREDIENT_CATEGORIES: Record<string, string[]> = {
  'actives': ['retinol', 'vitamin c', 'niacinamide', 'azelaic acid', 'benzoyl peroxide'],
  'exfoliants': ['glycolic acid', 'lactic acid', 'salicylic acid', 'mandelic acid', 'pha'],
  'hydrators': ['hyaluronic acid', 'glycerin', 'squalane', 'ceramides', 'panthenol'],
  'antioxidants': ['vitamin c', 'vitamin e', 'ferulic acid', 'green tea', 'resveratrol'],
  'soothing': ['centella asiatica', 'aloe vera', 'allantoin', 'chamomile', 'oat extract'],
  'barrier-repair': ['ceramides', 'cholesterol', 'fatty acids', 'niacinamide', 'squalane'],
  'brightening': ['vitamin c', 'niacinamide', 'alpha arbutin', 'kojic acid', 'tranexamic acid'],
  'anti-aging': ['retinol', 'peptides', 'vitamin c', 'niacinamide', 'bakuchiol'],
  'acne-fighting': ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'azelaic acid', 'tea tree'],
};

/**
 * Photosensitizing ingredients (PM only)
 */
export const PHOTOSENSITIZING_INGREDIENTS = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene', 'tazarotene',
  'glycolic acid', 'lactic acid', 'mandelic acid', 'aha',
  'salicylic acid', 'bha',
  'benzoyl peroxide',
];

/**
 * Pregnancy-unsafe ingredients
 */
export const PREGNANCY_UNSAFE = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene', 'tazarotene',
  'salicylic acid', 'bha',
  'benzoyl peroxide',
  'hydroquinone',
];

/**
 * Beginner-friendly ingredients
 */
export const BEGINNER_SAFE = [
  'hyaluronic acid', 'niacinamide', 'ceramides', 'squalane',
  'centella asiatica', 'aloe vera', 'panthenol', 'allantoin',
  'glycerin', 'vitamin e',
];

/**
 * Advanced ingredients (require experience)
 */
export const ADVANCED_INGREDIENTS = [
  'retinol', 'tretinoin', 'glycolic acid', 'tca',
  'high-concentration vitamin c', 'benzoyl peroxide 10%',
];

/**
 * Purging vs irritation guide
 */
export const PURGING_INGREDIENTS = [
  'retinol', 'retinoid', 'tretinoin',
  'glycolic acid', 'lactic acid', 'salicylic acid',
  'benzoyl peroxide', 'azelaic acid',
];

// ============================================================================
// Compatibility Matrix
// ============================================================================

/**
 * Ingredient compatibility rules
 */
export const COMPATIBILITY_MATRIX: Array<{
  ingredient1: string[];
  ingredient2: string[];
  level: 'safe' | 'caution' | 'avoid';
  reason: string;
  resolution?: string;
}> = [
  // AVOID combinations
  {
    ingredient1: ['retinol', 'retinoid', 'tretinoin'],
    ingredient2: ['aha', 'glycolic acid', 'lactic acid'],
    level: 'avoid',
    reason: 'Both are potent exfoliants that can cause severe irritation when combined',
    resolution: 'Use AHAs and retinol on alternate nights',
  },
  {
    ingredient1: ['retinol', 'retinoid', 'tretinoin'],
    ingredient2: ['bha', 'salicylic acid'],
    level: 'avoid',
    reason: 'Over-exfoliation and barrier damage risk',
    resolution: 'Use BHA in the morning or on alternate nights',
  },
  {
    ingredient1: ['retinol', 'retinoid'],
    ingredient2: ['benzoyl peroxide'],
    level: 'avoid',
    reason: 'Benzoyl peroxide oxidizes and deactivates retinol',
    resolution: 'Use benzoyl peroxide in AM, retinol in PM',
  },
  {
    ingredient1: ['benzoyl peroxide'],
    ingredient2: ['vitamin c', 'ascorbic acid'],
    level: 'avoid',
    reason: 'Benzoyl peroxide oxidizes vitamin C, making it ineffective',
    resolution: 'Never use together; use in completely separate routines',
  },
  {
    ingredient1: ['aha', 'glycolic acid'],
    ingredient2: ['bha', 'salicylic acid'],
    level: 'avoid',
    reason: 'Over-exfoliation risk when layering multiple acids',
    resolution: 'Use on alternate nights or choose combination products',
  },

  // CAUTION combinations
  {
    ingredient1: ['vitamin c', 'ascorbic acid'],
    ingredient2: ['niacinamide'],
    level: 'caution',
    reason: 'May reduce efficacy of both (though recent research suggests this is minimal)',
    resolution: 'Use in separate routines (Vitamin C AM, Niacinamide PM) or wait 15-20 minutes between',
  },
  {
    ingredient1: ['vitamin c', 'ascorbic acid'],
    ingredient2: ['aha', 'glycolic acid', 'lactic acid'],
    level: 'caution',
    reason: 'pH conflicts can reduce Vitamin C stability',
    resolution: 'Use Vitamin C in AM, AHAs in PM',
  },
  {
    ingredient1: ['vitamin c', 'ascorbic acid'],
    ingredient2: ['retinol', 'retinoid'],
    level: 'caution',
    reason: 'Different optimal pH levels may reduce efficacy',
    resolution: 'Use Vitamin C in AM, Retinol in PM for best results',
  },
  {
    ingredient1: ['retinol', 'retinoid'],
    ingredient2: ['vitamin c'],
    level: 'caution',
    reason: 'Can be irritating for sensitive skin when combined',
    resolution: 'AM/PM split or alternate nights for sensitive skin',
  },

  // SAFE combinations
  {
    ingredient1: ['niacinamide'],
    ingredient2: ['hyaluronic acid', 'ceramides', 'peptides', 'squalane'],
    level: 'safe',
    reason: 'Niacinamide pairs well with hydrating and barrier-supporting ingredients',
  },
  {
    ingredient1: ['hyaluronic acid'],
    ingredient2: ['vitamin c', 'retinol', 'niacinamide', 'peptides', 'ceramides'],
    level: 'safe',
    reason: 'Hyaluronic acid is compatible with almost all actives',
  },
  {
    ingredient1: ['ceramides'],
    ingredient2: ['retinol', 'aha', 'bha', 'niacinamide', 'vitamin c'],
    level: 'safe',
    reason: 'Ceramides help buffer irritation from actives and support barrier function',
  },
  {
    ingredient1: ['peptides'],
    ingredient2: ['hyaluronic acid', 'niacinamide', 'ceramides', 'vitamin c'],
    level: 'safe',
    reason: 'Peptides are gentle and work well with most skincare ingredients',
  },
  {
    ingredient1: ['centella asiatica', 'cica'],
    ingredient2: ['niacinamide', 'hyaluronic acid', 'ceramides', 'retinol'],
    level: 'safe',
    reason: 'Centella soothes and pairs well with irritating actives',
  },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get ingredient knowledge from encyclopedia
 */
export function getIngredientKnowledge(ingredient: string): IngredientKnowledge | null {
  const key = ingredient.toLowerCase().replace(/\s+/g, '-');

  // Direct match
  if (INGREDIENT_ENCYCLOPEDIA[key]) {
    return INGREDIENT_ENCYCLOPEDIA[key];
  }

  // Search by name or alias
  for (const [k, v] of Object.entries(INGREDIENT_ENCYCLOPEDIA)) {
    if (v.name.toLowerCase() === ingredient.toLowerCase()) {
      return v;
    }
    if (v.aliases.some(a => a.toLowerCase() === ingredient.toLowerCase())) {
      return v;
    }
  }

  return null;
}

/**
 * Generate personalized ingredient explanation
 */
export function explainIngredient(
  ingredient: string,
  userProfile?: IngredientUserProfile,
  history?: IngredientHistory
): IngredientExplanation | null {
  const knowledge = getIngredientKnowledge(ingredient);

  if (!knowledge) {
    return null;
  }

  // Build personalized note
  let personalizedNote: string | undefined;

  if (userProfile) {
    const notes: string[] = [];

    // Skin type match
    if (userProfile.skinType && knowledge.skinTypes.includes(userProfile.skinType.toLowerCase())) {
      notes.push(`suits your ${userProfile.skinType} skin`);
    }

    // Concern match
    if (userProfile.concerns) {
      const matchedConcerns = userProfile.concerns.filter(c =>
        knowledge.concerns.some(kc => kc.toLowerCase().includes(c.toLowerCase()))
      );
      if (matchedConcerns.length > 0) {
        notes.push(`addresses your ${matchedConcerns.join(' and ')} concerns`);
      }
    }

    // Sensitivity warning
    if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
      if (ADVANCED_INGREDIENTS.some(a => ingredient.toLowerCase().includes(a))) {
        notes.push('start with lower concentration due to your sensitivities');
      }
    }

    // Experience level
    if (userProfile.experienceLevel === 'beginner') {
      if (BEGINNER_SAFE.some(b => ingredient.toLowerCase().includes(b))) {
        notes.push('great choice for beginners');
      } else if (ADVANCED_INGREDIENTS.some(a => ingredient.toLowerCase().includes(a))) {
        notes.push('start slowly and build tolerance');
      }
    }

    // History-based note
    if (history?.viewedIngredients && history.viewedIngredients.length > 0) {
      const relatedViewed = history.viewedIngredients.filter(v =>
        knowledge.compatibility.worksWellWith.some(w => w.toLowerCase().includes(v.toLowerCase()))
      );
      if (relatedViewed.length > 0) {
        notes.push(`pairs well with ${relatedViewed[0]} which you've explored`);
      }
    }

    if (notes.length > 0) {
      personalizedNote = `For your skin: ${notes.join('; ')}.`;
    }
  }

  // Determine timing
  const timing: 'AM' | 'PM' | 'both' = PHOTOSENSITIZING_INGREDIENTS.some(p =>
    ingredient.toLowerCase().includes(p)
  ) ? 'PM' : 'both';

  // Build explanation
  return {
    ingredient: knowledge.name,
    summary: `${knowledge.name} is a ${knowledge.category} ingredient known for ${knowledge.benefits.slice(0, 2).join(' and ').toLowerCase()}.`,
    benefits: knowledge.benefits,
    howItWorks: getHowItWorks(knowledge),
    bestFor: {
      skinTypes: knowledge.skinTypes,
      concerns: knowledge.concerns,
    },
    usage: {
      frequency: knowledge.usageGuidelines.includes('daily') ? 'Daily' :
                 knowledge.usageGuidelines.includes('2-3') ? '2-3 times per week' : 'As directed',
      timing,
      application: knowledge.usageGuidelines,
    },
    compatibility: {
      pairsWith: knowledge.compatibility.worksWellWith,
      avoidWith: knowledge.compatibility.avoidWith,
      caution: getCautionIngredients(ingredient),
    },
    safety: {
      notes: knowledge.safetyNotes,
      pregnancySafe: !PREGNANCY_UNSAFE.some(p => ingredient.toLowerCase().includes(p)),
      beginnerFriendly: BEGINNER_SAFE.some(b => ingredient.toLowerCase().includes(b)),
      photosensitizing: PHOTOSENSITIZING_INGREDIENTS.some(p => ingredient.toLowerCase().includes(p)),
    },
    concentration: knowledge.concentrationRange ? {
      range: `${knowledge.concentrationRange.min}-${knowledge.concentrationRange.max}${knowledge.concentrationRange.unit}`,
      optimal: knowledge.concentrationRange.optimal || `${knowledge.concentrationRange.min}-${knowledge.concentrationRange.max}${knowledge.concentrationRange.unit}`,
    } : undefined,
    personalizedNote,
    navigationUrl: `/ingredients/${toIngredientSlug(knowledge.name)}`,
  };
}

/**
 * Get how an ingredient works (mechanism)
 */
function getHowItWorks(knowledge: IngredientKnowledge): string {
  const mechanisms: Record<string, string> = {
    'active': 'Works at the cellular level to promote skin renewal and target specific concerns.',
    'hydrator': 'Attracts and binds water molecules to keep skin hydrated and plump.',
    'antioxidant': 'Neutralizes free radicals to protect skin from environmental damage.',
    'exfoliant': 'Dissolves bonds between dead skin cells to reveal fresher skin underneath.',
    'soothing': 'Calms inflammation and reduces redness by supporting skin\'s natural healing.',
    'barrier': 'Strengthens the skin barrier by replenishing essential lipids.',
    'sunscreen': 'Absorbs or reflects UV rays to prevent sun damage.',
  };

  return mechanisms[knowledge.category] || 'Supports overall skin health through targeted action.';
}

/**
 * Get caution ingredients for a given ingredient
 */
function getCautionIngredients(ingredient: string): string[] {
  const caution: string[] = [];
  const lower = ingredient.toLowerCase();

  for (const rule of COMPATIBILITY_MATRIX) {
    if (rule.level === 'caution') {
      const inFirst = rule.ingredient1.some(i => lower.includes(i) || i.includes(lower));
      const inSecond = rule.ingredient2.some(i => lower.includes(i) || i.includes(lower));

      if (inFirst) {
        caution.push(...rule.ingredient2);
      } else if (inSecond) {
        caution.push(...rule.ingredient1);
      }
    }
  }

  return [...new Set(caution)];
}

/**
 * Check compatibility between two ingredients
 */
export function checkCompatibility(
  ingredient1: string,
  ingredient2: string
): CompatibilityResult {
  const lower1 = ingredient1.toLowerCase();
  const lower2 = ingredient2.toLowerCase();

  for (const rule of COMPATIBILITY_MATRIX) {
    const match1in1 = rule.ingredient1.some(i => lower1.includes(i) || i.includes(lower1));
    const match2in2 = rule.ingredient2.some(i => lower2.includes(i) || i.includes(lower2));
    const match1in2 = rule.ingredient1.some(i => lower2.includes(i) || i.includes(lower2));
    const match2in1 = rule.ingredient2.some(i => lower1.includes(i) || i.includes(lower1));

    if ((match1in1 && match2in2) || (match1in2 && match2in1)) {
      return {
        compatible: rule.level !== 'avoid',
        level: rule.level,
        reason: rule.reason,
        resolution: rule.resolution,
      };
    }
  }

  // Default: assume safe if not in matrix
  return {
    compatible: true,
    level: 'safe',
    reason: 'No known conflicts between these ingredients.',
  };
}

/**
 * Check compatibility of multiple ingredients
 */
export function checkMultipleCompatibility(
  ingredients: string[]
): Array<{ pair: [string, string]; result: CompatibilityResult }> {
  const results: Array<{ pair: [string, string]; result: CompatibilityResult }> = [];

  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const result = checkCompatibility(ingredients[i], ingredients[j]);
      if (result.level !== 'safe') {
        results.push({
          pair: [ingredients[i], ingredients[j]],
          result,
        });
      }
    }
  }

  return results;
}

/**
 * Compare two or more ingredients
 */
export function compareIngredients(
  ingredients: string[],
  userProfile?: IngredientUserProfile
): IngredientComparison | null {
  const knowledgeList = ingredients
    .map(i => ({ name: i, knowledge: getIngredientKnowledge(i) }))
    .filter(k => k.knowledge !== null);

  if (knowledgeList.length < 2) {
    return null;
  }

  const differences: Array<{ aspect: string; details: Record<string, string> }> = [];

  // Compare strength/gentleness
  const strengthDetails: Record<string, string> = {};
  for (const { name, knowledge } of knowledgeList) {
    if (ADVANCED_INGREDIENTS.some(a => name.toLowerCase().includes(a))) {
      strengthDetails[name] = 'Strong/Potent';
    } else if (BEGINNER_SAFE.some(b => name.toLowerCase().includes(b))) {
      strengthDetails[name] = 'Gentle';
    } else {
      strengthDetails[name] = 'Moderate';
    }
  }
  differences.push({ aspect: 'Strength', details: strengthDetails });

  // Compare timing
  const timingDetails: Record<string, string> = {};
  for (const { name } of knowledgeList) {
    if (PHOTOSENSITIZING_INGREDIENTS.some(p => name.toLowerCase().includes(p))) {
      timingDetails[name] = 'PM only';
    } else {
      timingDetails[name] = 'AM or PM';
    }
  }
  differences.push({ aspect: 'Best Timing', details: timingDetails });

  // Compare primary benefit
  const benefitDetails: Record<string, string> = {};
  for (const { name, knowledge } of knowledgeList) {
    benefitDetails[name] = knowledge!.benefits[0];
  }
  differences.push({ aspect: 'Primary Benefit', details: benefitDetails });

  // Compare skin types
  const skinTypeDetails: Record<string, string> = {};
  for (const { name, knowledge } of knowledgeList) {
    skinTypeDetails[name] = knowledge!.skinTypes.join(', ');
  }
  differences.push({ aspect: 'Best For Skin Types', details: skinTypeDetails });

  // Build recommendation based on user profile
  let recommendation = 'Both ingredients have their merits.';
  if (userProfile) {
    const scores: Record<string, number> = {};
    for (const { name, knowledge } of knowledgeList) {
      let score = 0;

      // Skin type match
      if (userProfile.skinType && knowledge!.skinTypes.includes(userProfile.skinType.toLowerCase())) {
        score += 2;
      }

      // Concern match
      if (userProfile.concerns) {
        for (const concern of userProfile.concerns) {
          if (knowledge!.concerns.some(c => c.toLowerCase().includes(concern.toLowerCase()))) {
            score += 1;
          }
        }
      }

      // Experience level
      if (userProfile.experienceLevel === 'beginner') {
        if (BEGINNER_SAFE.some(b => name.toLowerCase().includes(b))) {
          score += 2;
        }
        if (ADVANCED_INGREDIENTS.some(a => name.toLowerCase().includes(a))) {
          score -= 2;
        }
      }

      // Sensitivity
      if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
        if (BEGINNER_SAFE.some(b => name.toLowerCase().includes(b))) {
          score += 1;
        }
      }

      scores[name] = score;
    }

    const sortedByScore = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sortedByScore[0][1] > sortedByScore[1][1]) {
      recommendation = `Based on your profile, ${sortedByScore[0][0]} may be a better fit for you.`;
    }
  }

  // Build bestFor
  const bestFor: Record<string, string[]> = {};
  for (const { name, knowledge } of knowledgeList) {
    bestFor[name] = knowledge!.concerns.slice(0, 3);
  }

  return {
    ingredients: ingredients,
    summary: `Comparing ${ingredients.join(' vs ')}: Both target skin concerns but differ in strength, timing, and suitability.`,
    differences,
    recommendation,
    bestFor,
  };
}

/**
 * Get personalized ingredient recommendations
 */
export function getIngredientRecommendations(
  userProfile: IngredientUserProfile,
  history?: IngredientHistory,
  limit: number = 5
): IngredientRecommendation[] {
  const recommendations: IngredientRecommendation[] = [];

  for (const [key, knowledge] of Object.entries(INGREDIENT_ENCYCLOPEDIA)) {
    let score = 0;
    const matchedConcerns: string[] = [];
    const reasons: string[] = [];

    // Skin type match
    if (userProfile.skinType && knowledge.skinTypes.includes(userProfile.skinType.toLowerCase())) {
      score += 20;
      reasons.push(`suits ${userProfile.skinType} skin`);
    }

    // Concern matches
    if (userProfile.concerns) {
      for (const concern of userProfile.concerns) {
        if (knowledge.concerns.some(c => c.toLowerCase().includes(concern.toLowerCase()))) {
          score += 15;
          matchedConcerns.push(concern);
        }
      }
      if (matchedConcerns.length > 0) {
        reasons.push(`targets ${matchedConcerns.join(', ')}`);
      }
    }

    // Goal matches
    if (userProfile.goals) {
      for (const goal of userProfile.goals) {
        if (knowledge.benefits.some(b => b.toLowerCase().includes(goal.toLowerCase()))) {
          score += 10;
        }
      }
    }

    // Experience level adjustment
    if (userProfile.experienceLevel === 'beginner') {
      if (BEGINNER_SAFE.some(b => key.includes(b))) {
        score += 15;
        reasons.push('beginner-friendly');
      }
      if (ADVANCED_INGREDIENTS.some(a => key.includes(a))) {
        score -= 20;
      }
    }

    // Sensitivity check
    if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
      // Avoid ingredients that might trigger sensitivities
      const hasSensitivity = userProfile.sensitivities.some(s =>
        knowledge.name.toLowerCase().includes(s.toLowerCase()) ||
        knowledge.aliases.some(a => a.toLowerCase().includes(s.toLowerCase()))
      );
      if (hasSensitivity) {
        score -= 50;
      }

      // Prefer gentle ingredients
      if (knowledge.category === 'soothing' || knowledge.category === 'barrier') {
        score += 10;
      }
    }

    // Avoid ingredients user wants to avoid
    if (userProfile.avoidIngredients) {
      if (userProfile.avoidIngredients.some(a =>
        knowledge.name.toLowerCase().includes(a.toLowerCase())
      )) {
        score -= 100;
      }
    }

    // History bonus
    if (history?.viewedIngredients) {
      // If they've viewed compatible ingredients, boost score
      const viewedCompatible = history.viewedIngredients.filter(v =>
        knowledge.compatibility.worksWellWith.some(w => w.toLowerCase().includes(v.toLowerCase()))
      );
      if (viewedCompatible.length > 0) {
        score += 5;
        reasons.push(`pairs with ${viewedCompatible[0]} you explored`);
      }
    }

    if (score > 0) {
      recommendations.push({
        ingredient: knowledge.name,
        reason: reasons.length > 0 ? reasons.join('; ') : 'May benefit your skin',
        matchScore: score,
        concerns: matchedConcerns,
      });
    }
  }

  // Sort by score and limit
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, limit);
}

/**
 * Explain purging vs irritation
 */
export function explainPurgingVsIrritation(ingredient: string): {
  canCausePurging: boolean;
  explanation: string;
  howToTell: string[];
  whenToStop: string[];
} {
  const canCausePurging = PURGING_INGREDIENTS.some(p =>
    ingredient.toLowerCase().includes(p)
  );

  if (canCausePurging) {
    return {
      canCausePurging: true,
      explanation: `${ingredient} can cause purging because it accelerates cell turnover, bringing existing clogs to the surface faster.`,
      howToTell: [
        'Purging occurs in areas where you typically break out',
        'Breakouts are small whiteheads or blackheads, not large cysts',
        'Purging improves within 4-6 weeks',
        'Skin texture improves between breakouts',
      ],
      whenToStop: [
        'Breakouts occur in new areas you don\'t normally break out',
        'Skin is persistently red, dry, or peeling',
        'Breakouts are large, painful, or cystic',
        'No improvement after 6-8 weeks',
        'Skin feels worse overall, not just breakouts',
      ],
    };
  }

  return {
    canCausePurging: false,
    explanation: `${ingredient} does not typically cause purging. Any breakouts may indicate irritation or sensitivity.`,
    howToTell: [
      'This ingredient does not speed up cell turnover',
      'Any new breakouts may be a reaction to the ingredient',
    ],
    whenToStop: [
      'Any unusual breakouts after starting this ingredient',
      'Redness, itching, or burning',
      'Dry, flaky patches',
    ],
  };
}

/**
 * Get ingredient safety summary
 */
export function getIngredientSafety(
  ingredient: string,
  userProfile?: IngredientUserProfile
): {
  overall: 'safe' | 'caution' | 'avoid';
  notes: string[];
  recommendations: string[];
} {
  const notes: string[] = [];
  const recommendations: string[] = [];
  let overall: 'safe' | 'caution' | 'avoid' = 'safe';

  const lower = ingredient.toLowerCase();

  // Check photosensitivity
  if (PHOTOSENSITIZING_INGREDIENTS.some(p => lower.includes(p))) {
    notes.push('Increases sun sensitivity - use PM only');
    recommendations.push('Apply SPF 30+ during the day');
  }

  // Check pregnancy safety
  if (PREGNANCY_UNSAFE.some(p => lower.includes(p))) {
    notes.push('Not recommended during pregnancy');
    recommendations.push('Consult healthcare provider if pregnant or planning');
    overall = 'caution';
  }

  // Check beginner suitability
  if (ADVANCED_INGREDIENTS.some(a => lower.includes(a))) {
    notes.push('Potent ingredient - start slowly');
    recommendations.push('Begin with low concentration, 2-3x/week');
    if (userProfile?.experienceLevel === 'beginner') {
      overall = 'caution';
    }
  }

  // Check user sensitivities
  if (userProfile?.sensitivities) {
    for (const sensitivity of userProfile.sensitivities) {
      if (lower.includes(sensitivity.toLowerCase())) {
        notes.push(`You have listed ${sensitivity} as a sensitivity`);
        recommendations.push('Patch test before use');
        overall = 'avoid';
      }
    }
  }

  if (notes.length === 0) {
    notes.push('Generally well-tolerated');
    recommendations.push('Patch test recommended for all new products');
  }

  return { overall, notes, recommendations };
}

/**
 * Format ingredient explanation for chat
 */
export function formatIngredientForChat(
  explanation: IngredientExplanation,
  includeProducts?: RankedProduct[]
): string {
  const lines: string[] = [];

  // Summary
  lines.push(`## ${explanation.ingredient}`);
  lines.push(`\n${explanation.summary}\n`);

  // Personalized note
  if (explanation.personalizedNote) {
    lines.push(`*${explanation.personalizedNote}*\n`);
  }

  // Benefits
  lines.push('### Benefits');
  explanation.benefits.forEach(b => lines.push(`- ${b}`));

  // How it works
  lines.push(`\n### How It Works`);
  lines.push(explanation.howItWorks);

  // Best for
  lines.push(`\n### Best For`);
  lines.push(`- **Skin Types:** ${explanation.bestFor.skinTypes.join(', ')}`);
  lines.push(`- **Concerns:** ${explanation.bestFor.concerns.join(', ')}`);

  // Usage
  lines.push(`\n### Usage`);
  lines.push(`- **Frequency:** ${explanation.usage.frequency}`);
  lines.push(`- **Timing:** ${explanation.usage.timing === 'both' ? 'AM or PM' : explanation.usage.timing + ' only'}`);
  lines.push(`- **Application:** ${explanation.usage.application}`);

  // Concentration if available
  if (explanation.concentration) {
    lines.push(`- **Effective Range:** ${explanation.concentration.range} (optimal: ${explanation.concentration.optimal})`);
  }

  // Compatibility
  lines.push(`\n### Pairs Well With`);
  lines.push(explanation.compatibility.pairsWith.slice(0, 5).join(', '));

  if (explanation.compatibility.avoidWith.length > 0) {
    lines.push(`\n### Avoid Combining With`);
    lines.push(explanation.compatibility.avoidWith.join(', '));
  }

  // Safety
  lines.push(`\n### Safety Notes`);
  explanation.safety.notes.slice(0, 3).forEach(n => lines.push(`- ${n}`));
  if (explanation.safety.photosensitizing) {
    lines.push(`- ⚠️ Increases sun sensitivity - always use SPF`);
  }
  if (!explanation.safety.pregnancySafe) {
    lines.push(`- ⚠️ Not recommended during pregnancy`);
  }

  // Products
  if (includeProducts && includeProducts.length > 0) {
    lines.push(`\n### Products Containing ${explanation.ingredient}`);
    includeProducts.slice(0, 3).forEach(p => {
      lines.push(`- **${p.brand} ${p.name}** ($${p.price.toFixed(2)}) - [View](${p.productUrl})`);
    });
  }

  // Navigation
  lines.push(`\n---`);
  lines.push(`Learn more: [${explanation.ingredient}](${explanation.navigationUrl})`);

  return lines.join('\n');
}

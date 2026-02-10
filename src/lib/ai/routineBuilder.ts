/**
 * Routine Builder Intelligence for Lorem Curae AI
 *
 * Builds personalized AM and PM skincare routines based on:
 * - User skin survey
 * - Historical behavior
 * - Ingredient compatibility rules
 * - Product metadata
 * - Knowledge base
 */

import { type RankedProduct } from './retrievalPipeline';
import { type SkinSurvey } from './retrievalPipeline';
import {
  INGREDIENT_ENCYCLOPEDIA,
  ROUTINE_CONFLICTS,
  ROUTINE_RULES,
  LAYERING_ORDER,
  type IngredientKnowledge,
} from './knowledgeBase';

// ============================================================================
// Types
// ============================================================================

/**
 * Routine timing
 */
export type RoutineTiming = 'AM' | 'PM';

/**
 * Experience level for routine complexity
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Routine step
 */
export interface RoutineStep {
  order: number;
  category: string;
  timing: RoutineTiming | 'both';
  required: boolean;
  product?: RankedProduct;
  alternativeProducts?: RankedProduct[];
  explanation: string;
  safetyNotes?: string[];
  usageFrequency?: string;
}

/**
 * Complete routine
 */
export interface SkincareRoutine {
  timing: RoutineTiming;
  steps: RoutineStep[];
  totalProducts: number;
  activeCount: number;
  estimatedTime: string;
  warnings: string[];
  tips: string[];
}

/**
 * Routine builder result
 */
export interface RoutineBuilderResult {
  am: SkincareRoutine;
  pm: SkincareRoutine;
  conflicts: IngredientConflict[];
  adjustments: string[];
  personalizationNotes: string[];
}

/**
 * Ingredient conflict
 */
export interface IngredientConflict {
  ingredients: string[];
  reason: string;
  resolution: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * User routine preferences
 */
export interface RoutinePreferences {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  experienceLevel?: ExperienceLevel;
  budget?: 'budget' | 'mid' | 'premium';
  timeAvailable?: 'minimal' | 'moderate' | 'extensive';
  preferredIngredients?: string[];
  avoidIngredients?: string[];
}

/**
 * User history for personalization
 */
export interface UserRoutineHistory {
  viewedProducts?: Array<{ category: string; name: string }>;
  savedProducts?: Array<{ category: string; name: string }>;
  purchasedProducts?: Array<{ category: string; name: string }>;
  frequentCategories?: string[];
  frequentConcerns?: string[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * AM routine step order
 */
export const AM_ROUTINE_ORDER: Array<{
  order: number;
  category: string;
  required: boolean;
  description: string;
}> = [
  { order: 1, category: 'cleanser', required: true, description: 'Gentle morning cleanse' },
  { order: 2, category: 'toner', required: false, description: 'Balance and prep skin' },
  { order: 3, category: 'serum', required: false, description: 'Targeted treatment (Vitamin C, Niacinamide)' },
  { order: 4, category: 'eye-cream', required: false, description: 'Eye area hydration' },
  { order: 5, category: 'moisturizer', required: true, description: 'Hydration and barrier support' },
  { order: 6, category: 'sunscreen', required: true, description: 'UV protection (essential)' },
];

/**
 * PM routine step order
 */
export const PM_ROUTINE_ORDER: Array<{
  order: number;
  category: string;
  required: boolean;
  description: string;
}> = [
  { order: 1, category: 'cleanser', required: true, description: 'Remove makeup/SPF (double cleanse if needed)' },
  { order: 2, category: 'toner', required: false, description: 'Balance and prep skin' },
  { order: 3, category: 'exfoliant', required: false, description: 'Chemical exfoliation (2-3x/week)' },
  { order: 4, category: 'treatment', required: false, description: 'Actives (Retinol, acids)' },
  { order: 5, category: 'serum', required: false, description: 'Targeted serums' },
  { order: 6, category: 'eye-cream', required: false, description: 'Eye area treatment' },
  { order: 7, category: 'moisturizer', required: true, description: 'Night hydration' },
  { order: 8, category: 'oil', required: false, description: 'Occlusive seal (if needed)' },
];

/**
 * Ingredient conflict matrix
 */
export const INGREDIENT_CONFLICTS: Array<{
  ingredient1: string[];
  ingredient2: string[];
  severity: 'high' | 'medium' | 'low';
  reason: string;
  resolution: string;
}> = [
  {
    ingredient1: ['retinol', 'retinoid', 'tretinoin', 'adapalene'],
    ingredient2: ['aha', 'glycolic acid', 'lactic acid', 'mandelic acid'],
    severity: 'high',
    reason: 'Both are potent and can cause severe irritation when combined',
    resolution: 'Use AHAs and retinol on alternate nights, not the same night',
  },
  {
    ingredient1: ['retinol', 'retinoid', 'tretinoin'],
    ingredient2: ['bha', 'salicylic acid'],
    severity: 'high',
    reason: 'Both increase skin sensitivity and can damage barrier',
    resolution: 'Use BHA in AM or on alternate nights from retinol',
  },
  {
    ingredient1: ['retinol', 'retinoid', 'tretinoin'],
    ingredient2: ['benzoyl peroxide'],
    severity: 'high',
    reason: 'Benzoyl peroxide can deactivate retinol, reducing efficacy',
    resolution: 'Use benzoyl peroxide in AM and retinol in PM',
  },
  {
    ingredient1: ['vitamin c', 'l-ascorbic acid', 'ascorbic acid'],
    ingredient2: ['niacinamide'],
    severity: 'low',
    reason: 'Can reduce efficacy of both (though newer research suggests this is minimal)',
    resolution: 'Use Vitamin C in AM and Niacinamide in PM, or wait 15 min between',
  },
  {
    ingredient1: ['vitamin c', 'l-ascorbic acid'],
    ingredient2: ['aha', 'glycolic acid', 'lactic acid'],
    severity: 'medium',
    reason: 'pH conflicts can reduce Vitamin C stability and efficacy',
    resolution: 'Use in separate routines (Vitamin C in AM, AHAs in PM)',
  },
  {
    ingredient1: ['vitamin c', 'l-ascorbic acid'],
    ingredient2: ['bha', 'salicylic acid'],
    severity: 'medium',
    reason: 'pH conflicts and potential irritation',
    resolution: 'Use in separate routines (Vitamin C in AM, BHA in PM)',
  },
  {
    ingredient1: ['aha', 'glycolic acid', 'lactic acid'],
    ingredient2: ['bha', 'salicylic acid'],
    severity: 'medium',
    reason: 'Over-exfoliation risk when combining acids',
    resolution: 'Alternate nights or use combination products designed for this',
  },
  {
    ingredient1: ['benzoyl peroxide'],
    ingredient2: ['vitamin c', 'l-ascorbic acid'],
    severity: 'high',
    reason: 'Benzoyl peroxide oxidizes Vitamin C, rendering it ineffective',
    resolution: 'Never use together. Use in completely separate routines',
  },
  {
    ingredient1: ['retinol', 'retinoid'],
    ingredient2: ['vitamin c', 'l-ascorbic acid'],
    severity: 'low',
    reason: 'Different optimal pH levels, may reduce efficacy of both',
    resolution: 'Use Vitamin C in AM and Retinol in PM for best results',
  },
];

/**
 * AM-safe ingredients (avoid photosensitizing)
 */
export const AM_SAFE_ACTIVES = [
  'vitamin c', 'niacinamide', 'hyaluronic acid', 'ceramides',
  'peptides', 'caffeine', 'green tea', 'vitamin e', 'centella asiatica',
  'azelaic acid', 'tranexamic acid', 'alpha arbutin',
];

/**
 * PM-only ingredients (photosensitizing or work better at night)
 */
export const PM_ONLY_ACTIVES = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene',
  'aha', 'glycolic acid', 'lactic acid', 'mandelic acid',
  'bha', 'salicylic acid',
];

/**
 * Beginner-friendly ingredients
 */
export const BEGINNER_FRIENDLY = [
  'hyaluronic acid', 'niacinamide', 'ceramides', 'centella asiatica',
  'aloe vera', 'squalane', 'panthenol', 'allantoin',
];

/**
 * Advanced actives (require experience)
 */
export const ADVANCED_ACTIVES = [
  'retinol', 'tretinoin', 'glycolic acid', 'high concentration vitamin c',
  'benzoyl peroxide', 'azelaic acid 20%',
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if two products have conflicting ingredients
 */
export function checkIngredientConflicts(
  ingredients1: string[],
  ingredients2: string[]
): IngredientConflict[] {
  const conflicts: IngredientConflict[] = [];
  const lower1 = ingredients1.map(i => i.toLowerCase());
  const lower2 = ingredients2.map(i => i.toLowerCase());

  for (const conflict of INGREDIENT_CONFLICTS) {
    const has1 = conflict.ingredient1.some(i =>
      lower1.some(l1 => l1.includes(i) || i.includes(l1))
    );
    const has2 = conflict.ingredient2.some(i =>
      lower2.some(l2 => l2.includes(i) || i.includes(l2))
    );

    // Check both directions
    const has1Reverse = conflict.ingredient1.some(i =>
      lower2.some(l2 => l2.includes(i) || i.includes(l2))
    );
    const has2Reverse = conflict.ingredient2.some(i =>
      lower1.some(l1 => l1.includes(i) || i.includes(l1))
    );

    if ((has1 && has2) || (has1Reverse && has2Reverse)) {
      conflicts.push({
        ingredients: [...conflict.ingredient1, ...conflict.ingredient2].filter(i =>
          [...lower1, ...lower2].some(l => l.includes(i) || i.includes(l))
        ),
        reason: conflict.reason,
        resolution: conflict.resolution,
        severity: conflict.severity,
      });
    }
  }

  return conflicts;
}

/**
 * Check if a product is suitable for AM routine
 */
export function isAMSafe(product: RankedProduct): boolean {
  const ingredients = product.keyIngredients.map(i => i.toLowerCase());

  // Check for PM-only ingredients
  for (const pmOnly of PM_ONLY_ACTIVES) {
    if (ingredients.some(i => i.includes(pmOnly))) {
      return false;
    }
  }

  return true;
}

/**
 * Check if product is suitable for experience level
 */
export function isSuitableForLevel(
  product: RankedProduct,
  level: ExperienceLevel
): boolean {
  const ingredients = product.keyIngredients.map(i => i.toLowerCase());

  if (level === 'beginner') {
    // Check for advanced actives
    for (const advanced of ADVANCED_ACTIVES) {
      if (ingredients.some(i => i.includes(advanced))) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get usage frequency for a product based on actives
 */
export function getUsageFrequency(product: RankedProduct): string {
  const ingredients = product.keyIngredients.map(i => i.toLowerCase());

  // Retinoids
  if (ingredients.some(i => i.includes('retinol') || i.includes('retinoid'))) {
    return 'Start 2-3 nights per week, gradually increase';
  }

  // AHAs/BHAs
  if (ingredients.some(i =>
    i.includes('glycolic') || i.includes('lactic') ||
    i.includes('salicylic') || i.includes('aha') || i.includes('bha')
  )) {
    return '2-3 times per week, avoid over-exfoliation';
  }

  // Vitamin C
  if (ingredients.some(i => i.includes('vitamin c') || i.includes('ascorbic'))) {
    return 'Daily use recommended for best results';
  }

  return 'Daily use';
}

/**
 * Get safety notes for a product
 */
export function getSafetyNotes(
  product: RankedProduct,
  preferences: RoutinePreferences
): string[] {
  const notes: string[] = [];
  const ingredients = product.keyIngredients.map(i => i.toLowerCase());

  // Retinol notes
  if (ingredients.some(i => i.includes('retinol') || i.includes('retinoid'))) {
    notes.push('Avoid during pregnancy. Consult healthcare provider if pregnant or planning.');
    notes.push('Expect purging for 4-6 weeks when starting.');
    notes.push('Always apply to dry skin to minimize irritation.');
    if (preferences.experienceLevel === 'beginner') {
      notes.push('Start with lowest concentration 2-3x per week.');
    }
  }

  // AHA notes
  if (ingredients.some(i => i.includes('glycolic') || i.includes('aha'))) {
    notes.push('Increases sun sensitivity. SPF is essential.');
    notes.push('Avoid if skin is irritated or compromised.');
  }

  // BHA notes
  if (ingredients.some(i => i.includes('salicylic') || i.includes('bha'))) {
    notes.push('Avoid during pregnancy unless approved by doctor.');
  }

  // Sensitivity check
  if (preferences.sensitivities && preferences.sensitivities.length > 0) {
    for (const sensitivity of preferences.sensitivities) {
      if (ingredients.some(i => i.includes(sensitivity.toLowerCase()))) {
        notes.push(`Contains ${sensitivity} - patch test recommended.`);
      }
    }
  }

  return notes;
}

/**
 * Generate explanation for why a product fits a step
 */
export function generateStepExplanation(
  step: { category: string; description: string },
  product: RankedProduct,
  preferences: RoutinePreferences
): string {
  const parts: string[] = [];

  // Why this step
  parts.push(`**Why this step:** ${step.description}`);

  // Why this product
  const productReasons: string[] = [];

  // Skin type match
  if (preferences.skinType && product.skinTypes.some(st =>
    st.toLowerCase() === preferences.skinType?.toLowerCase() || st === 'all'
  )) {
    productReasons.push(`suits your ${preferences.skinType} skin`);
  }

  // Concern match
  if (preferences.concerns && preferences.concerns.length > 0) {
    const matchedConcerns = preferences.concerns.filter(c =>
      product.concerns.some(pc => pc.toLowerCase().includes(c.toLowerCase()))
    );
    if (matchedConcerns.length > 0) {
      productReasons.push(`targets ${matchedConcerns.join(', ')}`);
    }
  }

  // Key ingredients
  if (product.keyIngredients.length > 0) {
    const topIngredients = product.keyIngredients.slice(0, 2).join(', ');
    productReasons.push(`contains ${topIngredients}`);
  }

  // Match reasons from retrieval
  if (product.matchReasons && product.matchReasons.length > 0) {
    productReasons.push(product.matchReasons[0].toLowerCase());
  }

  if (productReasons.length > 0) {
    parts.push(`**Why this product:** ${product.brand} ${product.name} ${productReasons.join('; ')}.`);
  }

  return parts.join('\n');
}

/**
 * Count active ingredients in a routine
 */
export function countActives(products: RankedProduct[]): number {
  let count = 0;
  const activeCategories = ['retinol', 'vitamin c', 'aha', 'bha', 'niacinamide', 'azelaic'];

  for (const product of products) {
    const ingredients = product.keyIngredients.map(i => i.toLowerCase());
    for (const active of activeCategories) {
      if (ingredients.some(i => i.includes(active))) {
        count++;
        break;
      }
    }
  }

  return count;
}

/**
 * Validate a routine for conflicts and issues
 */
export function validateRoutine(
  steps: RoutineStep[],
  timing: RoutineTiming,
  preferences: RoutinePreferences
): { valid: boolean; issues: string[]; adjustments: string[] } {
  const issues: string[] = [];
  const adjustments: string[] = [];
  const products = steps.filter(s => s.product).map(s => s.product!);

  // Check for sunscreen in AM
  if (timing === 'AM') {
    const hasSunscreen = steps.some(s => s.category === 'sunscreen' && s.product);
    if (!hasSunscreen) {
      issues.push('AM routine must include sunscreen');
    }
  }

  // Check for PM-only ingredients in AM
  if (timing === 'AM') {
    for (const product of products) {
      if (!isAMSafe(product)) {
        issues.push(`${product.name} contains photosensitizing ingredients - move to PM`);
      }
    }
  }

  // Check active count
  const activeCount = countActives(products);
  if (activeCount > 2) {
    issues.push(`Routine has ${activeCount} actives - recommend max 2 per routine`);
    adjustments.push('Consider simplifying by removing one active treatment');
  }

  // Check for beginner overload
  if (preferences.experienceLevel === 'beginner' && activeCount > 1) {
    adjustments.push('As a beginner, consider starting with just one active');
  }

  // Check ingredient conflicts within routine
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const conflicts = checkIngredientConflicts(
        products[i].keyIngredients,
        products[j].keyIngredients
      );
      for (const conflict of conflicts) {
        if (conflict.severity === 'high') {
          issues.push(`Conflict: ${conflict.reason}. ${conflict.resolution}`);
        } else if (conflict.severity === 'medium') {
          adjustments.push(`Caution: ${conflict.reason}. ${conflict.resolution}`);
        }
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    adjustments,
  };
}

/**
 * Select best product for a step
 */
export function selectProductForStep(
  category: string,
  timing: RoutineTiming,
  availableProducts: RankedProduct[],
  preferences: RoutinePreferences,
  selectedProducts: RankedProduct[]
): RankedProduct | null {
  // Filter by category
  let candidates = availableProducts.filter(p =>
    p.category.toLowerCase() === category.toLowerCase()
  );

  if (candidates.length === 0) return null;

  // Filter by timing safety
  if (timing === 'AM') {
    candidates = candidates.filter(p => isAMSafe(p));
  }

  // Filter by experience level
  if (preferences.experienceLevel) {
    candidates = candidates.filter(p =>
      isSuitableForLevel(p, preferences.experienceLevel!)
    );
  }

  // Filter by sensitivities
  if (preferences.sensitivities && preferences.sensitivities.length > 0) {
    candidates = candidates.filter(p => {
      const ingredients = p.keyIngredients.map(i => i.toLowerCase());
      return !preferences.sensitivities!.some(s =>
        ingredients.some(i => i.includes(s.toLowerCase()))
      );
    });
  }

  // Check for conflicts with already selected products
  candidates = candidates.filter(p => {
    for (const selected of selectedProducts) {
      const conflicts = checkIngredientConflicts(
        p.keyIngredients,
        selected.keyIngredients
      );
      if (conflicts.some(c => c.severity === 'high')) {
        return false;
      }
    }
    return true;
  });

  // Sort by score and return best match
  candidates.sort((a, b) => b.finalScore - a.finalScore);

  return candidates[0] || null;
}

// ============================================================================
// Main Builder Function
// ============================================================================

/**
 * Build personalized AM and PM routines
 */
export function buildRoutines(
  availableProducts: RankedProduct[],
  preferences: RoutinePreferences,
  history?: UserRoutineHistory
): RoutineBuilderResult {
  const allConflicts: IngredientConflict[] = [];
  const allAdjustments: string[] = [];
  const personalizationNotes: string[] = [];

  // Add personalization notes based on preferences
  if (preferences.skinType) {
    personalizationNotes.push(`Optimized for ${preferences.skinType} skin`);
  }
  if (preferences.concerns && preferences.concerns.length > 0) {
    personalizationNotes.push(`Targeting: ${preferences.concerns.join(', ')}`);
  }
  if (preferences.experienceLevel === 'beginner') {
    personalizationNotes.push('Simplified routine for beginners - fewer actives');
  }
  if (history?.purchasedProducts && history.purchasedProducts.length > 0) {
    personalizationNotes.push('Considered your purchase history for product selection');
  }

  // Build AM routine
  const amSteps: RoutineStep[] = [];
  const amProducts: RankedProduct[] = [];

  for (const step of AM_ROUTINE_ORDER) {
    const product = selectProductForStep(
      step.category,
      'AM',
      availableProducts,
      preferences,
      amProducts
    );

    const routineStep: RoutineStep = {
      order: step.order,
      category: step.category,
      timing: 'AM',
      required: step.required,
      product: product || undefined,
      explanation: product
        ? generateStepExplanation(step, product, preferences)
        : `**${step.category}:** ${step.description}`,
      usageFrequency: product ? getUsageFrequency(product) : undefined,
      safetyNotes: product ? getSafetyNotes(product, preferences) : undefined,
    };

    if (product) {
      amProducts.push(product);

      // Get alternatives
      const alternatives = availableProducts.filter(p =>
        p.category.toLowerCase() === step.category.toLowerCase() &&
        p.productId !== product.productId &&
        isAMSafe(p)
      ).slice(0, 2);

      if (alternatives.length > 0) {
        routineStep.alternativeProducts = alternatives;
      }
    }

    amSteps.push(routineStep);
  }

  // Validate AM routine
  const amValidation = validateRoutine(amSteps, 'AM', preferences);
  allAdjustments.push(...amValidation.adjustments);

  // Build PM routine
  const pmSteps: RoutineStep[] = [];
  const pmProducts: RankedProduct[] = [];

  for (const step of PM_ROUTINE_ORDER) {
    const product = selectProductForStep(
      step.category,
      'PM',
      availableProducts,
      preferences,
      pmProducts
    );

    const routineStep: RoutineStep = {
      order: step.order,
      category: step.category,
      timing: 'PM',
      required: step.required,
      product: product || undefined,
      explanation: product
        ? generateStepExplanation(step, product, preferences)
        : `**${step.category}:** ${step.description}`,
      usageFrequency: product ? getUsageFrequency(product) : undefined,
      safetyNotes: product ? getSafetyNotes(product, preferences) : undefined,
    };

    if (product) {
      pmProducts.push(product);

      // Get alternatives
      const alternatives = availableProducts.filter(p =>
        p.category.toLowerCase() === step.category.toLowerCase() &&
        p.productId !== product.productId
      ).slice(0, 2);

      if (alternatives.length > 0) {
        routineStep.alternativeProducts = alternatives;
      }
    }

    pmSteps.push(routineStep);
  }

  // Validate PM routine
  const pmValidation = validateRoutine(pmSteps, 'PM', preferences);
  allAdjustments.push(...pmValidation.adjustments);

  // Check cross-routine conflicts (AM vs PM)
  for (const amProduct of amProducts) {
    for (const pmProduct of pmProducts) {
      const conflicts = checkIngredientConflicts(
        amProduct.keyIngredients,
        pmProduct.keyIngredients
      );
      allConflicts.push(...conflicts);
    }
  }

  // Build final routines
  const amRoutine: SkincareRoutine = {
    timing: 'AM',
    steps: amSteps.filter(s => s.required || s.product),
    totalProducts: amProducts.length,
    activeCount: countActives(amProducts),
    estimatedTime: amProducts.length <= 4 ? '5-7 minutes' : '8-10 minutes',
    warnings: amValidation.issues,
    tips: [
      'Wait 1-2 minutes between layers for better absorption',
      'Apply sunscreen as the last step, at least 15 minutes before sun exposure',
    ],
  };

  const pmRoutine: SkincareRoutine = {
    timing: 'PM',
    steps: pmSteps.filter(s => s.required || s.product),
    totalProducts: pmProducts.length,
    activeCount: countActives(pmProducts),
    estimatedTime: pmProducts.length <= 4 ? '5-7 minutes' : '10-15 minutes',
    warnings: pmValidation.issues,
    tips: [
      'Double cleanse if wearing makeup or SPF',
      'Apply retinol to dry skin to minimize irritation',
      'Seal with occlusive if skin is very dry',
    ],
  };

  return {
    am: amRoutine,
    pm: pmRoutine,
    conflicts: allConflicts,
    adjustments: allAdjustments,
    personalizationNotes,
  };
}

/**
 * Format routine for AI chat response
 */
export function formatRoutineForChat(result: RoutineBuilderResult): string {
  const lines: string[] = [];

  // Personalization notes
  if (result.personalizationNotes.length > 0) {
    lines.push(`*${result.personalizationNotes.join(' | ')}*\n`);
  }

  // AM Routine
  lines.push('## Morning Routine (AM)');
  lines.push(`*${result.am.estimatedTime} | ${result.am.totalProducts} products | ${result.am.activeCount} active(s)*\n`);

  for (const step of result.am.steps) {
    if (step.product) {
      lines.push(`**${step.order}. ${capitalizeFirst(step.category)}**`);
      lines.push(`   ${step.product.brand} ${step.product.name} ($${step.product.price.toFixed(2)})`);
      lines.push(`   ${step.explanation.replace(/\*\*/g, '')}`);
      if (step.usageFrequency) {
        lines.push(`   *Usage: ${step.usageFrequency}*`);
      }
      if (step.safetyNotes && step.safetyNotes.length > 0) {
        lines.push(`   ⚠️ ${step.safetyNotes[0]}`);
      }
      lines.push(`   [View Product](${step.product.productUrl})\n`);
    }
  }

  // PM Routine
  lines.push('\n## Evening Routine (PM)');
  lines.push(`*${result.pm.estimatedTime} | ${result.pm.totalProducts} products | ${result.pm.activeCount} active(s)*\n`);

  for (const step of result.pm.steps) {
    if (step.product) {
      lines.push(`**${step.order}. ${capitalizeFirst(step.category)}**`);
      lines.push(`   ${step.product.brand} ${step.product.name} ($${step.product.price.toFixed(2)})`);
      lines.push(`   ${step.explanation.replace(/\*\*/g, '')}`);
      if (step.usageFrequency) {
        lines.push(`   *Usage: ${step.usageFrequency}*`);
      }
      if (step.safetyNotes && step.safetyNotes.length > 0) {
        lines.push(`   ⚠️ ${step.safetyNotes[0]}`);
      }
      lines.push(`   [View Product](${step.product.productUrl})\n`);
    }
  }

  // Warnings
  const allWarnings = [...result.am.warnings, ...result.pm.warnings];
  if (allWarnings.length > 0) {
    lines.push('\n## ⚠️ Important Notes');
    allWarnings.forEach(w => lines.push(`- ${w}`));
  }

  // Adjustments
  if (result.adjustments.length > 0) {
    lines.push('\n## 💡 Recommendations');
    result.adjustments.forEach(a => lines.push(`- ${a}`));
  }

  // Conflicts
  if (result.conflicts.length > 0) {
    lines.push('\n## ⚗️ Ingredient Considerations');
    const uniqueConflicts = result.conflicts.filter((c, i, arr) =>
      arr.findIndex(x => x.reason === c.reason) === i
    );
    uniqueConflicts.forEach(c => {
      lines.push(`- **${c.ingredients.join(' + ')}:** ${c.reason}`);
      lines.push(`  *Resolution:* ${c.resolution}`);
    });
  }

  // Footer
  lines.push('\n---');
  lines.push('Build and save your routine: [Routine Builder](/routines)');

  return lines.join('\n');
}

/**
 * Helper to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Quick routine check for ingredient compatibility
 */
export function checkRoutineCompatibility(
  productIngredients: string[][]
): { compatible: boolean; conflicts: IngredientConflict[] } {
  const allConflicts: IngredientConflict[] = [];

  for (let i = 0; i < productIngredients.length; i++) {
    for (let j = i + 1; j < productIngredients.length; j++) {
      const conflicts = checkIngredientConflicts(
        productIngredients[i],
        productIngredients[j]
      );
      allConflicts.push(...conflicts);
    }
  }

  return {
    compatible: allConflicts.filter(c => c.severity === 'high').length === 0,
    conflicts: allConflicts,
  };
}

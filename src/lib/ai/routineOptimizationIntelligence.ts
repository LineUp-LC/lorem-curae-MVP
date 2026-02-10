/**
 * Routine Optimization & Adjustment Intelligence for Lorem Curae AI
 *
 * Evaluates existing routines, identifies issues, optimizes sequencing,
 * adjusts frequency, and resolves conflicts for safe, effective routines.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Routine timing
 */
export type RoutineTiming = 'am' | 'pm';

/**
 * Product in a routine
 */
export interface RoutineProduct {
  id?: number;
  name: string;
  brand?: string;
  category: string;
  keyIngredients?: string[];
  step?: number;
  frequency?: string;
  source?: 'marketplace' | 'discovery';
}

/**
 * User routine to evaluate
 */
export interface UserRoutine {
  timing: RoutineTiming;
  products: RoutineProduct[];
  concerns?: string[];
}

/**
 * Issue found in a routine
 */
export interface RoutineIssue {
  type: 'missing_step' | 'incorrect_order' | 'unsafe_combination' | 'overuse' | 'redundancy' | 'timing_issue' | 'strength_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedProducts?: string[];
  suggestion: string;
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  originalRoutine: UserRoutine;
  optimizedRoutine: UserRoutine;
  issues: RoutineIssue[];
  changes: RoutineChange[];
  summary: string;
}

/**
 * Change made during optimization
 */
export interface RoutineChange {
  type: 'reorder' | 'remove' | 'add' | 'replace' | 'adjust_frequency' | 'move_timing';
  description: string;
  reason: string;
}

/**
 * Frequency recommendation
 */
export interface FrequencyRecommendation {
  ingredient: string;
  recommendedFrequency: string;
  reason: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Correct step order for AM routine
 */
export const AM_STEP_ORDER = [
  'cleanser',
  'toner',
  'essence',
  'serum',
  'eye_cream',
  'moisturizer',
  'sunscreen',
];

/**
 * Correct step order for PM routine
 */
export const PM_STEP_ORDER = [
  'oil_cleanser',
  'cleanser',
  'toner',
  'essence',
  'exfoliant',
  'treatment',
  'serum',
  'eye_cream',
  'moisturizer',
  'face_oil',
  'occlusive',
];

/**
 * Category mappings for flexible matching
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  cleanser: ['cleanser', 'face wash', 'cleansing', 'gel cleanser', 'cream cleanser', 'foam cleanser'],
  toner: ['toner', 'tonic', 'essence', 'prep'],
  serum: ['serum', 'treatment serum', 'active serum', 'concentrate'],
  moisturizer: ['moisturizer', 'moisturiser', 'cream', 'lotion', 'hydrator', 'face cream'],
  sunscreen: ['sunscreen', 'spf', 'sun protection', 'sunblock', 'uv protection'],
  exfoliant: ['exfoliant', 'exfoliator', 'peel', 'aha', 'bha', 'acid toner'],
  treatment: ['treatment', 'spot treatment', 'acne treatment', 'retinol', 'retinoid'],
  eye_cream: ['eye cream', 'eye treatment', 'under eye'],
  face_oil: ['face oil', 'facial oil', 'oil', 'dry oil'],
  mask: ['mask', 'face mask', 'sheet mask'],
};

/**
 * Ingredient conflicts (never combine)
 */
const HARD_CONFLICTS: Array<[string[], string[], string]> = [
  [['retinol', 'retinoid', 'tretinoin', 'adapalene'], ['aha', 'glycolic acid', 'lactic acid', 'mandelic acid'], 'Retinoids and AHAs cause irritation when combined'],
  [['retinol', 'retinoid', 'tretinoin', 'adapalene'], ['bha', 'salicylic acid'], 'Retinoids and BHAs can over-exfoliate together'],
  [['retinol', 'retinoid', 'tretinoin'], ['benzoyl peroxide'], 'Benzoyl peroxide deactivates retinoids'],
  [['vitamin c', 'ascorbic acid', 'l-ascorbic acid'], ['benzoyl peroxide'], 'Benzoyl peroxide oxidizes Vitamin C'],
  [['aha', 'glycolic acid', 'lactic acid'], ['bha', 'salicylic acid'], 'Multiple exfoliants together risk over-exfoliation'],
];

/**
 * PM-only ingredients (photosensitizing)
 */
const PM_ONLY_INGREDIENTS = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene', 'tazarotene',
  'aha', 'glycolic acid', 'lactic acid', 'mandelic acid',
  'bha', 'salicylic acid',
];

/**
 * Strong actives requiring caution
 */
const STRONG_ACTIVES = [
  'retinol', 'tretinoin', 'glycolic acid', 'tca',
  'benzoyl peroxide', 'hydroquinone',
];

/**
 * Pregnancy-unsafe ingredients
 */
const PREGNANCY_UNSAFE = [
  'retinol', 'retinoid', 'tretinoin', 'adapalene', 'tazarotene',
  'salicylic acid', 'hydroquinone',
];

/**
 * Concern-to-ingredient mapping
 */
const CONCERN_INGREDIENTS: Record<string, string[]> = {
  acne: ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'retinol', 'azelaic acid'],
  hyperpigmentation: ['vitamin c', 'niacinamide', 'azelaic acid', 'alpha arbutin', 'retinol', 'kojic acid'],
  aging: ['retinol', 'peptides', 'vitamin c', 'hyaluronic acid', 'niacinamide'],
  dryness: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin', 'panthenol'],
  redness: ['centella asiatica', 'niacinamide', 'azelaic acid', 'green tea', 'aloe'],
  sensitivity: ['centella asiatica', 'ceramides', 'panthenol', 'oat extract', 'allantoin'],
  texture: ['aha', 'glycolic acid', 'lactic acid', 'retinol', 'niacinamide'],
  pores: ['niacinamide', 'salicylic acid', 'retinol', 'clay'],
};

// ============================================================================
// CATEGORY NORMALIZATION
// ============================================================================

/**
 * Normalize category to standard form
 */
export function normalizeCategory(category: string): string {
  const lower = category.toLowerCase();
  for (const [standard, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) {
      return standard;
    }
  }
  return lower;
}

/**
 * Get step index for a category in routine order
 */
export function getStepIndex(category: string, timing: RoutineTiming): number {
  const normalized = normalizeCategory(category);
  const order = timing === 'am' ? AM_STEP_ORDER : PM_STEP_ORDER;
  const index = order.indexOf(normalized);
  return index === -1 ? order.length : index;
}

// ============================================================================
// ROUTINE EVALUATION
// ============================================================================

/**
 * Evaluate a routine for issues
 */
export function evaluateRoutine(
  routine: UserRoutine,
  userContext?: {
    skinType?: string;
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    pregnancySafe?: boolean;
    concerns?: string[];
  }
): RoutineIssue[] {
  const issues: RoutineIssue[] = [];

  // Check for missing essential steps
  issues.push(...checkMissingSteps(routine));

  // Check step order
  issues.push(...checkStepOrder(routine));

  // Check ingredient conflicts
  issues.push(...checkIngredientConflicts(routine));

  // Check AM/PM timing
  issues.push(...checkTimingIssues(routine));

  // Check for overuse of actives
  issues.push(...checkActiveOveruse(routine, userContext?.experienceLevel));

  // Check for redundancy
  issues.push(...checkRedundancy(routine));

  // Check experience-appropriate strength
  if (userContext?.experienceLevel === 'beginner') {
    issues.push(...checkBeginnerSafety(routine));
  }

  // Check pregnancy safety
  if (userContext?.pregnancySafe) {
    issues.push(...checkPregnancySafety(routine));
  }

  // Check sensitivity concerns
  if (userContext?.sensitivities && userContext.sensitivities.length > 0) {
    issues.push(...checkSensitivityIssues(routine, userContext.sensitivities));
  }

  return issues;
}

/**
 * Check for missing essential steps
 */
function checkMissingSteps(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const categories = routine.products.map(p => normalizeCategory(p.category));

  // AM must have sunscreen
  if (routine.timing === 'am' && !categories.includes('sunscreen')) {
    issues.push({
      type: 'missing_step',
      severity: 'high',
      description: 'AM routine is missing sunscreen',
      suggestion: 'Add SPF as the final step of your morning routine for essential sun protection.',
    });
  }

  // Both need cleanser
  if (!categories.includes('cleanser')) {
    issues.push({
      type: 'missing_step',
      severity: 'medium',
      description: 'Routine is missing a cleanser',
      suggestion: 'Add a cleanser as your first step to remove dirt and prepare skin.',
    });
  }

  // Both need moisturizer
  if (!categories.includes('moisturizer')) {
    issues.push({
      type: 'missing_step',
      severity: 'medium',
      description: 'Routine is missing a moisturizer',
      suggestion: 'Add a moisturizer to lock in hydration and protect your skin barrier.',
    });
  }

  return issues;
}

/**
 * Check for incorrect step order
 */
function checkStepOrder(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const products = routine.products;

  for (let i = 0; i < products.length - 1; i++) {
    const currentIndex = getStepIndex(products[i].category, routine.timing);
    const nextIndex = getStepIndex(products[i + 1].category, routine.timing);

    if (currentIndex > nextIndex) {
      issues.push({
        type: 'incorrect_order',
        severity: 'medium',
        description: `${products[i].name} should come after ${products[i + 1].name}`,
        affectedProducts: [products[i].name, products[i + 1].name],
        suggestion: `Reorder: ${products[i + 1].name} before ${products[i].name} for better absorption.`,
      });
    }
  }

  return issues;
}

/**
 * Check for ingredient conflicts
 */
function checkIngredientConflicts(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const allIngredients = routine.products
    .flatMap(p => p.keyIngredients || [])
    .map(i => i.toLowerCase());

  for (const [group1, group2, reason] of HARD_CONFLICTS) {
    const hasGroup1 = group1.some(ing => allIngredients.some(ai => ai.includes(ing)));
    const hasGroup2 = group2.some(ing => allIngredients.some(ai => ai.includes(ing)));

    if (hasGroup1 && hasGroup2) {
      issues.push({
        type: 'unsafe_combination',
        severity: 'critical',
        description: reason,
        suggestion: 'Use these ingredients on different days or at different times (AM/PM).',
      });
    }
  }

  return issues;
}

/**
 * Check for AM/PM timing issues
 */
function checkTimingIssues(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];

  if (routine.timing === 'am') {
    for (const product of routine.products) {
      const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());
      const hasPMOnly = PM_ONLY_INGREDIENTS.some(ing =>
        ingredients.some(pi => pi.includes(ing))
      );

      if (hasPMOnly) {
        issues.push({
          type: 'timing_issue',
          severity: 'high',
          description: `${product.name} contains photosensitizing ingredients and should only be used at night`,
          affectedProducts: [product.name],
          suggestion: 'Move this product to your PM routine and ensure you use SPF during the day.',
        });
      }
    }
  }

  return issues;
}

/**
 * Check for active overuse
 */
function checkActiveOveruse(
  routine: UserRoutine,
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const allIngredients = routine.products
    .flatMap(p => p.keyIngredients || [])
    .map(i => i.toLowerCase());

  // Count strong actives
  const strongActiveCount = STRONG_ACTIVES.filter(active =>
    allIngredients.some(ing => ing.includes(active))
  ).length;

  const maxActives = experienceLevel === 'beginner' ? 1 :
                     experienceLevel === 'intermediate' ? 2 : 3;

  if (strongActiveCount > maxActives) {
    issues.push({
      type: 'overuse',
      severity: experienceLevel === 'beginner' ? 'critical' : 'high',
      description: `Too many strong actives (${strongActiveCount}) for ${experienceLevel || 'your'} level`,
      suggestion: `Reduce to ${maxActives} active(s) maximum per routine to avoid irritation.`,
    });
  }

  // Check for multiple exfoliants
  const exfoliantCount = ['aha', 'bha', 'glycolic', 'lactic', 'salicylic'].filter(ex =>
    allIngredients.some(ing => ing.includes(ex))
  ).length;

  if (exfoliantCount > 1) {
    issues.push({
      type: 'overuse',
      severity: 'high',
      description: 'Multiple exfoliants in the same routine',
      suggestion: 'Use only one exfoliant per routine to prevent over-exfoliation.',
    });
  }

  return issues;
}

/**
 * Check for redundancy
 */
function checkRedundancy(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const categories = routine.products.map(p => normalizeCategory(p.category));

  // Check for duplicate categories
  const categoryCount: Record<string, number> = {};
  categories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  for (const [category, count] of Object.entries(categoryCount)) {
    if (count > 1 && !['serum', 'treatment'].includes(category)) {
      issues.push({
        type: 'redundancy',
        severity: 'low',
        description: `Multiple ${category}s in routine`,
        suggestion: `Consider consolidating to one ${category} unless targeting different concerns.`,
      });
    }
  }

  return issues;
}

/**
 * Check beginner safety
 */
function checkBeginnerSafety(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const allIngredients = routine.products
    .flatMap(p => p.keyIngredients || [])
    .map(i => i.toLowerCase());

  for (const active of STRONG_ACTIVES) {
    if (allIngredients.some(ing => ing.includes(active))) {
      const product = routine.products.find(p =>
        p.keyIngredients?.some(i => i.toLowerCase().includes(active))
      );
      issues.push({
        type: 'strength_issue',
        severity: 'medium',
        description: `${active} may be too strong for beginners`,
        affectedProducts: product ? [product.name] : [],
        suggestion: `Start with a gentler alternative or use ${active} only 1-2x per week.`,
      });
    }
  }

  return issues;
}

/**
 * Check pregnancy safety
 */
function checkPregnancySafety(routine: UserRoutine): RoutineIssue[] {
  const issues: RoutineIssue[] = [];

  for (const product of routine.products) {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());
    const unsafeIngredient = PREGNANCY_UNSAFE.find(unsafe =>
      ingredients.some(ing => ing.includes(unsafe))
    );

    if (unsafeIngredient) {
      issues.push({
        type: 'unsafe_combination',
        severity: 'critical',
        description: `${product.name} contains ${unsafeIngredient}, which is not pregnancy-safe`,
        affectedProducts: [product.name],
        suggestion: 'Replace with a pregnancy-safe alternative like azelaic acid or vitamin C.',
      });
    }
  }

  return issues;
}

/**
 * Check sensitivity issues
 */
function checkSensitivityIssues(routine: UserRoutine, sensitivities: string[]): RoutineIssue[] {
  const issues: RoutineIssue[] = [];

  for (const product of routine.products) {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());
    const triggering = sensitivities.find(sens =>
      ingredients.some(ing => ing.toLowerCase().includes(sens.toLowerCase()))
    );

    if (triggering) {
      issues.push({
        type: 'unsafe_combination',
        severity: 'high',
        description: `${product.name} contains ${triggering}, which you're sensitive to`,
        affectedProducts: [product.name],
        suggestion: `Replace with a product without ${triggering}.`,
      });
    }
  }

  return issues;
}

// ============================================================================
// ROUTINE OPTIMIZATION
// ============================================================================

/**
 * Optimize a routine
 */
export function optimizeRoutine(
  routine: UserRoutine,
  userContext?: {
    skinType?: string;
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    pregnancySafe?: boolean;
    concerns?: string[];
  }
): OptimizationResult {
  const issues = evaluateRoutine(routine, userContext);
  const changes: RoutineChange[] = [];
  let optimizedProducts = [...routine.products];

  // Fix step order
  optimizedProducts = fixStepOrder(optimizedProducts, routine.timing, changes);

  // Remove unsafe products
  optimizedProducts = removeUnsafeProducts(optimizedProducts, issues, changes, userContext);

  // Fix timing issues (move PM-only products)
  if (routine.timing === 'am') {
    optimizedProducts = fixTimingIssues(optimizedProducts, changes);
  }

  // Add missing essentials
  optimizedProducts = addMissingEssentials(optimizedProducts, routine.timing, issues, changes);

  // Adjust for overuse
  optimizedProducts = adjustForOveruse(optimizedProducts, changes, userContext?.experienceLevel);

  const optimizedRoutine: UserRoutine = {
    ...routine,
    products: optimizedProducts,
  };

  return {
    originalRoutine: routine,
    optimizedRoutine,
    issues,
    changes,
    summary: generateOptimizationSummary(issues, changes),
  };
}

/**
 * Fix step order
 */
function fixStepOrder(
  products: RoutineProduct[],
  timing: RoutineTiming,
  changes: RoutineChange[]
): RoutineProduct[] {
  const sorted = [...products].sort((a, b) => {
    const aIndex = getStepIndex(a.category, timing);
    const bIndex = getStepIndex(b.category, timing);
    return aIndex - bIndex;
  });

  // Check if order changed
  const orderChanged = products.some((p, i) => p.name !== sorted[i].name);
  if (orderChanged) {
    changes.push({
      type: 'reorder',
      description: 'Reordered products for optimal absorption',
      reason: 'Products should be applied from thinnest to thickest consistency.',
    });
  }

  return sorted.map((p, i) => ({ ...p, step: i + 1 }));
}

/**
 * Remove unsafe products
 */
function removeUnsafeProducts(
  products: RoutineProduct[],
  issues: RoutineIssue[],
  changes: RoutineChange[],
  userContext?: { pregnancySafe?: boolean; sensitivities?: string[] }
): RoutineProduct[] {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  let filtered = [...products];

  for (const issue of criticalIssues) {
    if (issue.affectedProducts) {
      for (const productName of issue.affectedProducts) {
        const index = filtered.findIndex(p => p.name === productName);
        if (index !== -1) {
          changes.push({
            type: 'remove',
            description: `Removed ${productName}`,
            reason: issue.description,
          });
          filtered.splice(index, 1);
        }
      }
    }
  }

  return filtered;
}

/**
 * Fix timing issues
 */
function fixTimingIssues(
  products: RoutineProduct[],
  changes: RoutineChange[]
): RoutineProduct[] {
  return products.filter(product => {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());
    const hasPMOnly = PM_ONLY_INGREDIENTS.some(ing =>
      ingredients.some(pi => pi.includes(ing))
    );

    if (hasPMOnly) {
      changes.push({
        type: 'move_timing',
        description: `Move ${product.name} to PM routine`,
        reason: 'Contains photosensitizing ingredients that should only be used at night.',
      });
      return false;
    }
    return true;
  });
}

/**
 * Add missing essentials
 */
function addMissingEssentials(
  products: RoutineProduct[],
  timing: RoutineTiming,
  issues: RoutineIssue[],
  changes: RoutineChange[]
): RoutineProduct[] {
  const result = [...products];
  const categories = result.map(p => normalizeCategory(p.category));
  const missingIssues = issues.filter(i => i.type === 'missing_step');

  for (const issue of missingIssues) {
    if (issue.description.includes('sunscreen') && timing === 'am' && !categories.includes('sunscreen')) {
      changes.push({
        type: 'add',
        description: 'Add sunscreen as final AM step',
        reason: 'SPF is essential for daytime protection.',
      });
      // Note: We add a placeholder - the actual product recommendation comes from shopping intelligence
    }
  }

  return result;
}

/**
 * Adjust for active overuse
 */
function adjustForOveruse(
  products: RoutineProduct[],
  changes: RoutineChange[],
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
): RoutineProduct[] {
  const maxActives = experienceLevel === 'beginner' ? 1 :
                     experienceLevel === 'intermediate' ? 2 : 3;

  let activeCount = 0;
  return products.filter(product => {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());
    const hasStrongActive = STRONG_ACTIVES.some(active =>
      ingredients.some(ing => ing.includes(active))
    );

    if (hasStrongActive) {
      activeCount++;
      if (activeCount > maxActives) {
        changes.push({
          type: 'remove',
          description: `Removed ${product.name} (too many actives)`,
          reason: `Limit to ${maxActives} active(s) for your experience level.`,
        });
        return false;
      }
    }
    return true;
  });
}

/**
 * Generate optimization summary
 */
function generateOptimizationSummary(issues: RoutineIssue[], changes: RoutineChange[]): string {
  if (issues.length === 0) {
    return 'Your routine looks well-structured. No major issues found.';
  }

  const critical = issues.filter(i => i.severity === 'critical').length;
  const high = issues.filter(i => i.severity === 'high').length;

  let summary = '';

  if (critical > 0) {
    summary += `Found ${critical} critical issue(s) that needed fixing. `;
  }
  if (high > 0) {
    summary += `Addressed ${high} important improvement(s). `;
  }
  if (changes.length > 0) {
    summary += `Made ${changes.length} change(s) to optimize your routine.`;
  }

  return summary || 'Minor adjustments made for better results.';
}

// ============================================================================
// FREQUENCY RECOMMENDATIONS
// ============================================================================

/**
 * Get frequency recommendations for a routine
 */
export function getFrequencyRecommendations(
  routine: UserRoutine,
  userContext?: {
    skinType?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
): FrequencyRecommendation[] {
  const recommendations: FrequencyRecommendation[] = [];

  for (const product of routine.products) {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());

    // Retinol frequency
    if (ingredients.some(i => i.includes('retinol') || i.includes('retinoid'))) {
      const freq = userContext?.experienceLevel === 'beginner'
        ? '1-2 nights per week'
        : userContext?.experienceLevel === 'intermediate'
        ? '2-3 nights per week'
        : 'every other night to nightly';

      recommendations.push({
        ingredient: 'Retinol',
        recommendedFrequency: freq,
        reason: 'Start slow to allow skin to build tolerance.',
      });
    }

    // AHA frequency
    if (ingredients.some(i => i.includes('glycolic') || i.includes('lactic') || i.includes('aha'))) {
      const freq = userContext?.skinType === 'sensitive'
        ? 'once per week'
        : userContext?.experienceLevel === 'beginner'
        ? '1-2 times per week'
        : '2-3 times per week';

      recommendations.push({
        ingredient: 'AHA',
        recommendedFrequency: freq,
        reason: 'Over-exfoliation can damage skin barrier.',
      });
    }

    // BHA frequency
    if (ingredients.some(i => i.includes('salicylic') || i.includes('bha'))) {
      const freq = userContext?.skinType === 'sensitive'
        ? '1-2 times per week'
        : '2-3 times per week or daily for acne-prone skin';

      recommendations.push({
        ingredient: 'BHA/Salicylic Acid',
        recommendedFrequency: freq,
        reason: 'Adjust based on how your skin responds.',
      });
    }

    // Vitamin C
    if (ingredients.some(i => i.includes('vitamin c') || i.includes('ascorbic'))) {
      recommendations.push({
        ingredient: 'Vitamin C',
        recommendedFrequency: 'daily (AM)',
        reason: 'Best used in the morning for antioxidant protection.',
      });
    }
  }

  return recommendations;
}

// ============================================================================
// ROUTINE SIMPLIFICATION
// ============================================================================

/**
 * Simplify a routine to essentials
 */
export function simplifyRoutine(
  routine: UserRoutine,
  targetSteps: number = 3
): { simplified: UserRoutine; removed: RoutineProduct[] } {
  const essential = ['cleanser', 'moisturizer'];
  if (routine.timing === 'am') essential.push('sunscreen');

  const removed: RoutineProduct[] = [];
  const kept: RoutineProduct[] = [];

  // Keep essentials
  for (const category of essential) {
    const product = routine.products.find(p =>
      normalizeCategory(p.category) === category
    );
    if (product) kept.push(product);
  }

  // Add one treatment/serum if we have room
  if (kept.length < targetSteps) {
    const treatment = routine.products.find(p =>
      ['serum', 'treatment'].includes(normalizeCategory(p.category)) &&
      !kept.includes(p)
    );
    if (treatment) kept.push(treatment);
  }

  // Track removed products
  for (const product of routine.products) {
    if (!kept.includes(product)) {
      removed.push(product);
    }
  }

  // Sort by step order
  kept.sort((a, b) => getStepIndex(a.category, routine.timing) - getStepIndex(b.category, routine.timing));

  return {
    simplified: { ...routine, products: kept },
    removed,
  };
}

// ============================================================================
// ROUTINE EXPANSION
// ============================================================================

/**
 * Suggest additions for routine expansion
 */
export function suggestExpansions(
  routine: UserRoutine,
  userContext?: {
    concerns?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
): Array<{ category: string; reason: string; suggestedIngredients: string[] }> {
  const suggestions: Array<{ category: string; reason: string; suggestedIngredients: string[] }> = [];
  const categories = routine.products.map(p => normalizeCategory(p.category));

  // Suggest toner if missing
  if (!categories.includes('toner')) {
    suggestions.push({
      category: 'toner',
      reason: 'Prep skin and boost hydration before treatments',
      suggestedIngredients: ['hyaluronic acid', 'niacinamide'],
    });
  }

  // Suggest serum based on concerns
  if (!categories.includes('serum') && userContext?.concerns) {
    const concernIngredients = userContext.concerns.flatMap(c =>
      CONCERN_INGREDIENTS[c.toLowerCase()] || []
    ).slice(0, 3);

    if (concernIngredients.length > 0) {
      suggestions.push({
        category: 'serum',
        reason: `Target your ${userContext.concerns.join(', ')} concerns`,
        suggestedIngredients: [...new Set(concernIngredients)],
      });
    }
  }

  // Suggest eye cream for aging concerns
  if (!categories.includes('eye_cream') && userContext?.concerns?.includes('aging')) {
    suggestions.push({
      category: 'eye_cream',
      reason: 'Address fine lines and dark circles around eyes',
      suggestedIngredients: ['retinol', 'peptides', 'caffeine'],
    });
  }

  // Suggest exfoliant if intermediate/advanced
  if (
    !categories.includes('exfoliant') &&
    routine.timing === 'pm' &&
    userContext?.experienceLevel !== 'beginner'
  ) {
    suggestions.push({
      category: 'exfoliant',
      reason: 'Improve texture and enhance product absorption',
      suggestedIngredients: ['glycolic acid', 'lactic acid', 'salicylic acid'],
    });
  }

  return suggestions;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Routine optimization principles
 */
export const OPTIMIZATION_PRINCIPLES = {
  order: [
    'Thinnest to thickest consistency',
    'Water-based before oil-based',
    'Actives before moisturizer',
    'Sunscreen always last (AM)',
  ],
  safety: [
    'No retinoids with AHAs/BHAs in same routine',
    'No benzoyl peroxide with retinoids or vitamin C',
    'Photosensitizing ingredients PM only',
    'Max 1-2 actives for beginners',
  ],
  frequency: [
    'Start actives 1-2x per week',
    'Increase gradually over weeks',
    'Reduce if irritation occurs',
    'Daily use only after tolerance built',
  ],
  concerns: [
    'Prioritize concern-targeting actives',
    'One active per concern initially',
    'Layer compatible actives only',
    'Balance treatment with hydration',
  ],
} as const;

// ============================================================================
// ADDITIONAL CONSTANTS
// ============================================================================

/**
 * Standard category order for AM/PM routines
 */
export const CATEGORY_ORDER = {
  am: ['cleanser', 'toner', 'essence', 'serum', 'eye_cream', 'moisturizer', 'sunscreen'],
  pm: ['oil_cleanser', 'cleanser', 'toner', 'essence', 'exfoliant', 'treatment', 'serum', 'eye_cream', 'moisturizer', 'face_oil', 'occlusive'],
} as const;

/**
 * Active frequency limits by experience level
 */
export const ACTIVE_FREQUENCY_LIMITS = {
  beginner: {
    retinol: '1-2x per week',
    aha: '1x per week',
    bha: '2x per week',
    vitaminC: 'daily',
    niacinamide: 'daily',
    maxActivesPerRoutine: 1,
  },
  intermediate: {
    retinol: '2-3x per week',
    aha: '2x per week',
    bha: '3x per week',
    vitaminC: 'daily',
    niacinamide: 'daily',
    maxActivesPerRoutine: 2,
  },
  advanced: {
    retinol: 'every other night to nightly',
    aha: '3x per week',
    bha: 'daily',
    vitaminC: 'daily',
    niacinamide: '2x daily',
    maxActivesPerRoutine: 3,
  },
} as const;

// ============================================================================
// PUBLIC DETECTION FUNCTIONS (wrap private check functions)
// ============================================================================

/**
 * Detect ingredient conflicts in a routine
 */
export function detectConflicts(routine: UserRoutine): RoutineIssue[] {
  return checkIngredientConflicts(routine);
}

/**
 * Detect ordering issues in a routine
 */
export function detectOrderingIssues(routine: UserRoutine): RoutineIssue[] {
  return checkStepOrder(routine);
}

/**
 * Detect active overuse in a routine
 */
export function detectOveruse(
  routine: UserRoutine,
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
): RoutineIssue[] {
  return checkActiveOveruse(routine, experienceLevel);
}

/**
 * Detect missing essential steps in a routine
 */
export function detectMissingSteps(routine: UserRoutine): RoutineIssue[] {
  return checkMissingSteps(routine);
}

/**
 * Detect redundant products in a routine
 */
export function detectRedundancy(routine: UserRoutine): RoutineIssue[] {
  return checkRedundancy(routine);
}

/**
 * Detect AM/PM timing issues in a routine
 */
export function detectTimingIssues(routine: UserRoutine): RoutineIssue[] {
  return checkTimingIssues(routine);
}

/**
 * Detect frequency issues based on experience level
 */
export function detectFrequencyIssues(
  routine: UserRoutine,
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const limits = ACTIVE_FREQUENCY_LIMITS[experienceLevel || 'intermediate'];

  for (const product of routine.products) {
    const ingredients = (product.keyIngredients || []).map(i => i.toLowerCase());

    // Check retinol frequency
    if (ingredients.some(i => i.includes('retinol') || i.includes('retinoid'))) {
      if (product.frequency === 'daily' && experienceLevel === 'beginner') {
        issues.push({
          type: 'timing_issue',
          severity: 'high',
          description: `Daily retinol use is too frequent for beginners`,
          affectedProducts: [product.name],
          suggestion: `Use retinol ${limits.retinol} to start.`,
        });
      }
    }

    // Check exfoliant frequency
    if (ingredients.some(i => i.includes('glycolic') || i.includes('aha'))) {
      if (product.frequency === 'daily' && experienceLevel !== 'advanced') {
        issues.push({
          type: 'timing_issue',
          severity: 'medium',
          description: `Daily AHA use may be too frequent`,
          affectedProducts: [product.name],
          suggestion: `Use AHAs ${limits.aha} to avoid over-exfoliation.`,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect experience level mismatches
 */
export function detectExperienceMismatch(
  routine: UserRoutine,
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): RoutineIssue[] {
  if (experienceLevel !== 'beginner') {
    return [];
  }
  return checkBeginnerSafety(routine);
}

/**
 * Detect sensitivity issues
 */
export function detectSensitivityIssues(
  routine: UserRoutine,
  sensitivities: string[]
): RoutineIssue[] {
  return checkSensitivityIssues(routine, sensitivities);
}

// ============================================================================
// REORDERING & CONFLICT RESOLUTION
// ============================================================================

/**
 * Reorder products to correct sequence
 */
export function reorderProducts(
  products: RoutineProduct[],
  timing: RoutineTiming
): { reordered: RoutineProduct[]; changes: string[] } {
  const changes: string[] = [];

  const sorted = [...products].sort((a, b) => {
    const aIndex = getStepIndex(a.category, timing);
    const bIndex = getStepIndex(b.category, timing);
    return aIndex - bIndex;
  });

  // Track changes
  for (let i = 0; i < products.length; i++) {
    if (products[i].name !== sorted[i]?.name) {
      changes.push(`Moved ${sorted[i]?.name} to step ${i + 1}`);
    }
  }

  const reordered = sorted.map((p, i) => ({ ...p, step: i + 1 }));
  return { reordered, changes };
}

/**
 * Resolve ingredient conflicts by suggesting AM/PM split or alternation
 */
export function resolveConflicts(
  routine: UserRoutine,
  conflicts: RoutineIssue[]
): { resolution: string; alternateSchedule?: Record<string, string[]> } {
  if (conflicts.length === 0) {
    return { resolution: 'No conflicts to resolve.' };
  }

  const resolutions: string[] = [];
  const alternateSchedule: Record<string, string[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  for (const conflict of conflicts) {
    if (conflict.affectedProducts && conflict.affectedProducts.length >= 2) {
      const [product1, product2] = conflict.affectedProducts;

      // Suggest alternation
      if (conflict.description.includes('Retinoid') || conflict.description.includes('AHA') || conflict.description.includes('BHA')) {
        resolutions.push(`Alternate ${product1} and ${product2} on different nights.`);
        alternateSchedule.monday.push(product1);
        alternateSchedule.tuesday.push(product2);
        alternateSchedule.wednesday.push(product1);
        alternateSchedule.thursday.push(product2);
        alternateSchedule.friday.push(product1);
        alternateSchedule.saturday.push(product2);
        alternateSchedule.sunday.push('Rest day - no actives');
      }
    }
  }

  return {
    resolution: resolutions.length > 0 ? resolutions.join(' ') : conflicts[0]?.suggestion || 'Review ingredient combinations.',
    alternateSchedule: alternateSchedule.monday.length > 0 ? alternateSchedule : undefined,
  };
}

/**
 * Adjust frequency recommendations for beginners
 */
export function adjustFrequencyForBeginner(
  recommendations: FrequencyRecommendation[]
): FrequencyRecommendation[] {
  return recommendations.map(rec => {
    const adjusted = { ...rec };

    if (rec.ingredient.toLowerCase().includes('retinol')) {
      adjusted.recommendedFrequency = '1-2 nights per week';
      adjusted.reason = 'Start slow to let skin build tolerance. Increase gradually after 4-6 weeks.';
    } else if (rec.ingredient.toLowerCase().includes('aha') || rec.ingredient.toLowerCase().includes('glycolic')) {
      adjusted.recommendedFrequency = 'once per week';
      adjusted.reason = 'Begin with weekly use to assess skin tolerance before increasing.';
    } else if (rec.ingredient.toLowerCase().includes('bha') || rec.ingredient.toLowerCase().includes('salicylic')) {
      adjusted.recommendedFrequency = '1-2 times per week';
      adjusted.reason = 'BHA can be drying. Start slowly and increase based on how your skin responds.';
    }

    return adjusted;
  });
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format routine issues for chat display
 */
export function formatRoutineIssuesForChat(issues: RoutineIssue[]): string {
  if (issues.length === 0) {
    return 'Your routine looks well-structured. No issues found.';
  }

  const lines: string[] = [];

  const critical = issues.filter(i => i.severity === 'critical');
  const high = issues.filter(i => i.severity === 'high');
  const medium = issues.filter(i => i.severity === 'medium');
  const low = issues.filter(i => i.severity === 'low');

  if (critical.length > 0) {
    lines.push('**Critical Issues (must fix):**');
    critical.forEach(i => lines.push(`- ${i.description}. ${i.suggestion}`));
    lines.push('');
  }

  if (high.length > 0) {
    lines.push('**Important Issues:**');
    high.forEach(i => lines.push(`- ${i.description}. ${i.suggestion}`));
    lines.push('');
  }

  if (medium.length > 0) {
    lines.push('**Suggestions:**');
    medium.forEach(i => lines.push(`- ${i.description}. ${i.suggestion}`));
    lines.push('');
  }

  if (low.length > 0) {
    lines.push('**Minor Notes:**');
    low.forEach(i => lines.push(`- ${i.description}`));
  }

  return lines.join('\n');
}

/**
 * Format optimization result for chat display
 */
export function formatOptimizationForChat(result: OptimizationResult): string {
  const lines: string[] = [];

  lines.push('## Optimized Routine\n');
  lines.push(result.summary);
  lines.push('');

  if (result.changes.length > 0) {
    lines.push('**Changes Made:**');
    result.changes.forEach(change => {
      lines.push(`- ${change.description} — ${change.reason}`);
    });
    lines.push('');
  }

  lines.push('**Updated Routine Order:**');
  result.optimizedRoutine.products.forEach((product, index) => {
    lines.push(`${index + 1}. ${product.name} (${product.category})`);
  });

  if (result.issues.length > 0) {
    lines.push('\n**Remaining Considerations:**');
    result.issues
      .filter(i => i.severity !== 'critical')
      .slice(0, 3)
      .forEach(issue => lines.push(`- ${issue.suggestion}`));
  }

  return lines.join('\n');
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build complete routine optimization context for AI
 */
export function buildRoutineOptimizationContext(
  amRoutine?: UserRoutine,
  pmRoutine?: UserRoutine,
  userContext?: {
    skinType?: string;
    sensitivities?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    pregnancySafe?: boolean;
    concerns?: string[];
  }
): {
  issues: RoutineIssue[];
  frequencyRecommendations: FrequencyRecommendation[];
  expansionSuggestions: ReturnType<typeof suggestExpansions>;
  summary: string;
} {
  const allIssues: RoutineIssue[] = [];
  const allFrequencyRecs: FrequencyRecommendation[] = [];
  let allExpansionSuggestions: ReturnType<typeof suggestExpansions> = [];

  // Evaluate AM routine
  if (amRoutine) {
    const amIssues = evaluateRoutine(amRoutine, userContext);
    allIssues.push(...amIssues);

    const amFrequency = getFrequencyRecommendations(amRoutine, userContext);
    allFrequencyRecs.push(...amFrequency);

    const amExpansions = suggestExpansions(amRoutine, userContext);
    allExpansionSuggestions.push(...amExpansions);
  }

  // Evaluate PM routine
  if (pmRoutine) {
    const pmIssues = evaluateRoutine(pmRoutine, userContext);
    allIssues.push(...pmIssues);

    const pmFrequency = getFrequencyRecommendations(pmRoutine, userContext);
    allFrequencyRecs.push(...pmFrequency);

    const pmExpansions = suggestExpansions(pmRoutine, userContext);
    allExpansionSuggestions.push(...pmExpansions);
  }

  // Adjust for beginners
  const adjustedFrequency = userContext?.experienceLevel === 'beginner'
    ? adjustFrequencyForBeginner(allFrequencyRecs)
    : allFrequencyRecs;

  // Generate summary
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const highCount = allIssues.filter(i => i.severity === 'high').length;

  let summary = '';
  if (allIssues.length === 0) {
    summary = 'Your routines look well-balanced. No major issues detected.';
  } else if (criticalCount > 0) {
    summary = `Found ${criticalCount} critical issue(s) that need attention.`;
  } else if (highCount > 0) {
    summary = `Found ${highCount} important recommendation(s) for your routine.`;
  } else {
    summary = 'Minor suggestions available to optimize your routine.';
  }

  return {
    issues: allIssues,
    frequencyRecommendations: adjustedFrequency,
    expansionSuggestions: allExpansionSuggestions,
    summary,
  };
}

/**
 * Guided Assistant — Context Builders + Follow-Up Question Generator
 *
 * Orchestrates deterministic scoring for the 3 guided assistant modes,
 * then assembles AISurfaceContext objects for AI narration.
 *
 * Data flow: deterministic scoring → AISurfaceContext → requestAIInsight()
 */

import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type { ConversationMessage } from './types';
import type { AISurfaceContext, PageDataInput } from './surfaceContext';
import { buildAIContext, computeConcernAlignment } from './surfaceContext';
import { getProductsByIds } from '../data/products';
import {
  checkIngredientConflicts,
  AM_ROUTINE_ORDER,
  PM_ROUTINE_ORDER,
  buildRoutines,
  type RoutineBuilderResult,
  type IngredientConflict,
  type RoutinePreferences,
} from './routineBuilder';
import { isSkinTypeMatch } from '../utils/productMetadata';
import type {
  GuidedAssistantMode,
  GuidedConversationState,
  ConversationTurn,
  GuidedAccumulatedContext,
} from './conversationState';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ComparisonAttribute {
  label: string;
  values: Record<number, string>;
  winner?: number;
}

export interface DeterministicComparison {
  products: Product[];
  attributes: ComparisonAttribute[];
  recommendation: { productId: number; reasons: string[] } | null;
  skinTypeScores: Record<number, number>;
  concernScores: Record<number, number>;
}

export interface RoutineStepAnalysis {
  step: number;
  product: Product;
  role: string;
  keyBenefit: string;
  layeringNote?: string;
  conflictNote?: string;
}

// ---------------------------------------------------------------------------
// "Help Me Choose" — product comparison
// ---------------------------------------------------------------------------

export interface HelpMeChooseInput {
  productIds: number[];
  userConcerns: string[];
  userSkinType: string | undefined;
  userPreferences: Record<string, boolean>;
  environment?: EnvironmentContext | null;
  conversationTurns?: ConversationTurn[];
  accumulatedContext?: GuidedAccumulatedContext;
}

export interface HelpMeChooseResult {
  products: Product[];
  comparison: DeterministicComparison;
  context: AISurfaceContext;
}

export function buildHelpMeChooseContext(input: HelpMeChooseInput): HelpMeChooseResult {
  const products = getProductsByIds(input.productIds);
  const skinType = input.accumulatedContext?.skinType ?? input.userSkinType;
  const concerns = input.accumulatedContext?.concerns ?? input.userConcerns;

  // Score each product against the user profile
  const skinTypeScores: Record<number, number> = {};
  const concernScores: Record<number, number> = {};

  for (const p of products) {
    // Skin type match
    skinTypeScores[p.id] = skinType && isSkinTypeMatch(p.skinTypes, skinType) ? 25 : 0;

    // Concern alignment
    const alignment = computeConcernAlignment(concerns, p.concerns ?? []);
    concernScores[p.id] = alignment.matched.length * 15;
  }

  // Build comparison attributes
  const attributes: ComparisonAttribute[] = [
    {
      label: 'Category',
      values: Object.fromEntries(products.map(p => [p.id, p.category])),
    },
    {
      label: 'Price',
      values: Object.fromEntries(products.map(p => [p.id, `$${p.price.toFixed(2)}`])),
      winner: products.reduce((a, b) => a.price <= b.price ? a : b).id,
    },
    {
      label: 'Rating',
      values: Object.fromEntries(products.map(p => [p.id, `${p.rating} (${p.reviewCount})`])),
      winner: products.reduce((a, b) => a.rating >= b.rating ? a : b).id,
    },
    {
      label: 'Key Ingredients',
      values: Object.fromEntries(products.map(p => [p.id, (p.keyIngredients ?? []).slice(0, 3).join(', ')])),
    },
    {
      label: 'Skin Type Match',
      values: Object.fromEntries(products.map(p => [p.id, skinTypeScores[p.id] > 0 ? 'Yes' : 'Partial'])),
    },
    {
      label: 'Concern Match',
      values: Object.fromEntries(products.map(p => [p.id, `${concernScores[p.id] / 15} of ${concerns.length}`])),
    },
  ];

  // Determine recommendation
  let recommendation: DeterministicComparison['recommendation'] = null;
  if (products.length > 0) {
    const totalScores = products.map(p => ({
      id: p.id,
      score: (skinTypeScores[p.id] ?? 0) + (concernScores[p.id] ?? 0) + (p.rating * 5),
    }));
    totalScores.sort((a, b) => b.score - a.score);
    const best = totalScores[0];
    const bestProduct = products.find(p => p.id === best.id);
    if (bestProduct) {
      const reasons: string[] = [];
      if (skinTypeScores[best.id] > 0 && skinType) reasons.push(`Matches ${skinType} skin type`);
      const alignment = computeConcernAlignment(concerns, bestProduct.concerns ?? []);
      if (alignment.matched.length > 0) reasons.push(`Addresses ${alignment.matched.join(', ')}`);
      if (bestProduct.rating >= 4.5) reasons.push(`Highly rated (${bestProduct.rating})`);
      recommendation = { productId: best.id, reasons };
    }
  }

  const comparison: DeterministicComparison = {
    products,
    attributes,
    recommendation,
    skinTypeScores,
    concernScores,
  };

  // Convert turns to ConversationMessage for the context
  const conversationTurns: ConversationMessage[] = (input.conversationTurns ?? []).map(t => ({
    role: t.role,
    content: t.content,
  }));

  const pageData: PageDataInput = {
    page: { mode: 'guided_comparison', products, conversationTurns },
    environment: input.environment,
    evidence: {
      concernAlignment: computeConcernAlignment(
        concerns,
        [...new Set(products.flatMap(p => p.concerns ?? []))],
      ),
    },
  };

  const context = buildAIContext('guided_comparison', pageData);

  return { products, comparison, context };
}

// ---------------------------------------------------------------------------
// "Build Me a Routine"
// ---------------------------------------------------------------------------

export interface BuildRoutineInput {
  timing: 'am' | 'pm' | 'both';
  style: 'minimalist' | 'moderate' | 'advanced';
  userConcerns: string[];
  userSkinType: string | undefined;
  userPreferences: Record<string, boolean>;
  budget?: 'budget' | 'mid' | 'premium';
  environment?: EnvironmentContext | null;
  conversationTurns?: ConversationTurn[];
  accumulatedContext?: GuidedAccumulatedContext;
}

export interface BuildRoutineResult {
  routineResult: RoutineBuilderResult;
  conflicts: IngredientConflict[];
  context: AISurfaceContext;
}

export function buildRoutineAssistantContext(input: BuildRoutineInput): BuildRoutineResult {
  const skinType = input.accumulatedContext?.skinType ?? input.userSkinType;
  const concerns = input.accumulatedContext?.concerns ?? input.userConcerns;
  const budget = input.accumulatedContext?.budget ?? input.budget;
  const timing = input.accumulatedContext?.routineTiming ?? input.timing;
  const style = input.accumulatedContext?.routineStyle ?? input.style;

  // Map style to experience level
  const experienceLevel = style === 'minimalist' ? 'beginner'
    : style === 'advanced' ? 'advanced'
    : 'intermediate';

  const prefs: RoutinePreferences = {
    skinType: skinType ?? undefined,
    concerns,
    sensitivities: [],
    goals: concerns,
    experienceLevel,
    budget,
  };

  // Build routines using the deterministic builder
  const routineResult = buildRoutines(prefs);
  const conflicts = routineResult.conflicts;

  // Build step summary for the context
  const activeRoutine = timing === 'pm' ? routineResult.pm : routineResult.am;
  const routineSteps = activeRoutine.steps
    .filter(s => s.product)
    .map(s => ({
      category: s.category,
      product: s.product ? {
        id: s.product.productId,
        name: s.product.name,
        brand: s.product.brand,
        category: s.product.category,
      } as unknown as Product : undefined,
    }));

  const conversationTurns: ConversationMessage[] = (input.conversationTurns ?? []).map(t => ({
    role: t.role,
    content: t.content,
  }));

  const pageData: PageDataInput = {
    page: { mode: 'guided_routine_build', routineSteps, timing, conversationTurns },
    environment: input.environment,
    evidence: {},
  };

  const context = buildAIContext('guided_routine_build', pageData);

  return { routineResult, conflicts, context };
}

// ---------------------------------------------------------------------------
// "Explain My Routine"
// ---------------------------------------------------------------------------

export interface ExplainRoutineInput {
  products: Product[];
  timing: 'am' | 'pm';
  toneLevel: 'simple' | 'detailed' | 'science';
  userSkinType: string | undefined;
  userConcerns: string[];
  environment?: EnvironmentContext | null;
  conversationTurns?: ConversationTurn[];
}

export interface ExplainRoutineResult {
  stepAnalysis: RoutineStepAnalysis[];
  conflicts: IngredientConflict[];
  context: AISurfaceContext;
}

export function buildExplainRoutineContext(input: ExplainRoutineInput): ExplainRoutineResult {
  const routineOrder = input.timing === 'pm' ? PM_ROUTINE_ORDER : AM_ROUTINE_ORDER;

  // Map each product to its routine position
  const stepAnalysis: RoutineStepAnalysis[] = [];
  const productsByCategory = new Map<string, Product>();
  for (const p of input.products) {
    productsByCategory.set(p.category.toLowerCase(), p);
  }

  let stepNum = 1;
  for (const orderEntry of routineOrder) {
    const product = productsByCategory.get(orderEntry.category);
    if (product) {
      const keyIngredients = (product.keyIngredients ?? []).slice(0, 2);
      stepAnalysis.push({
        step: stepNum++,
        product,
        role: orderEntry.label ?? orderEntry.category,
        keyBenefit: keyIngredients.length > 0
          ? `Contains ${keyIngredients.join(', ')}`
          : product.description?.slice(0, 80) ?? product.category,
      });
      productsByCategory.delete(orderEntry.category);
    }
  }

  // Add any products not in the standard order at the end
  for (const [, product] of productsByCategory) {
    stepAnalysis.push({
      step: stepNum++,
      product,
      role: product.category,
      keyBenefit: (product.keyIngredients ?? []).slice(0, 2).join(', ') || product.category,
      layeringNote: 'Not in standard routine order — consider repositioning',
    });
  }

  // Check for conflicts between all product pairs
  // checkIngredientConflicts expects RankedProduct[], so we build minimal wrappers
  const conflicts = checkIngredientConflictsFromProducts(input.products);

  // Annotate conflicts on steps
  for (const conflict of conflicts) {
    for (const step of stepAnalysis) {
      const productIngredients = (step.product.keyIngredients ?? []).map(i => i.toLowerCase());
      const isInvolved = conflict.ingredients.some(ci =>
        productIngredients.some(pi => pi.includes(ci.toLowerCase())),
      );
      if (isInvolved && !step.conflictNote) {
        step.conflictNote = conflict.reason;
      }
    }
  }

  const conversationTurns: ConversationMessage[] = (input.conversationTurns ?? []).map(t => ({
    role: t.role,
    content: t.content,
  }));

  const pageData: PageDataInput = {
    page: {
      mode: 'guided_routine_explain',
      products: input.products,
      timing: input.timing,
      toneLevel: input.toneLevel,
      conversationTurns,
    },
    environment: input.environment,
    evidence: {
      concernAlignment: computeConcernAlignment(
        input.userConcerns,
        [...new Set(input.products.flatMap(p => p.concerns ?? []))],
      ),
    },
  };

  const context = buildAIContext('guided_routine_explain', pageData);

  return { stepAnalysis, conflicts, context };
}

// ---------------------------------------------------------------------------
// Follow-up question generator
// ---------------------------------------------------------------------------

/**
 * Generate one follow-up question based on what data is still missing.
 * Returns null when all required fields are populated.
 */
export function generateFollowUpQuestion(
  mode: GuidedAssistantMode,
  state: GuidedConversationState,
): { question: string; options?: string[] } | null {
  const ctx = state.accumulatedContext;

  if (mode === 'help_me_choose') {
    if (!ctx.skinType) {
      return {
        question: 'What is your skin type?',
        options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
      };
    }
    if (!ctx.concerns || ctx.concerns.length === 0) {
      return {
        question: 'What are your main skin concerns?',
        options: ['Acne', 'Hydration', 'Anti-aging', 'Dark spots', 'Sensitivity'],
      };
    }
    return null;
  }

  if (mode === 'build_routine') {
    if (!ctx.routineTiming) {
      return {
        question: 'What routine would you like to build?',
        options: ['Morning', 'Evening', 'Both'],
      };
    }
    if (!ctx.routineStyle) {
      return {
        question: 'How many steps do you prefer?',
        options: ['Minimalist (3-4)', 'Moderate (5-6)', 'Advanced (7+)'],
      };
    }
    return null;
  }

  if (mode === 'explain_routine') {
    if (!ctx.routineTiming) {
      return {
        question: 'Which routine would you like explained?',
        options: ['Morning', 'Evening'],
      };
    }
    if (!ctx.tonePreference) {
      return {
        question: 'How detailed would you like the explanation?',
        options: ['Simple', 'Detailed', 'Science-level'],
      };
    }
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract ingredient conflicts from Product[] without requiring RankedProduct[].
 * Uses the conflict constant directly for simple pattern matching.
 */
function checkIngredientConflictsFromProducts(products: Product[]): IngredientConflict[] {
  const conflicts: IngredientConflict[] = [];
  const allIngredients = products.flatMap(p => (p.keyIngredients ?? []).map(i => i.toLowerCase()));

  // Check known conflict pairs
  const KNOWN_CONFLICTS: Array<{ pair: [string, string]; reason: string; resolution: string }> = [
    { pair: ['retinol', 'aha'], reason: 'Retinol and AHAs can cause irritation when combined', resolution: 'Use in separate routines (AM/PM)' },
    { pair: ['retinol', 'bha'], reason: 'Retinol and BHAs can over-exfoliate', resolution: 'Use in separate routines (AM/PM)' },
    { pair: ['retinol', 'benzoyl peroxide'], reason: 'Benzoyl peroxide can deactivate retinol', resolution: 'Use in separate routines (AM/PM)' },
    { pair: ['vitamin c', 'niacinamide'], reason: 'May reduce efficacy when applied together', resolution: 'Apply at different times or wait 10 minutes between' },
    { pair: ['aha', 'bha'], reason: 'Using both can over-exfoliate', resolution: 'Alternate days or use in separate routines' },
    { pair: ['benzoyl peroxide', 'vitamin c'], reason: 'Benzoyl peroxide can oxidize vitamin C', resolution: 'Use in separate routines (AM/PM)' },
  ];

  for (const conflict of KNOWN_CONFLICTS) {
    const hasFirst = allIngredients.some(i => i.includes(conflict.pair[0]));
    const hasSecond = allIngredients.some(i => i.includes(conflict.pair[1]));
    if (hasFirst && hasSecond) {
      conflicts.push({
        ingredients: [conflict.pair[0], conflict.pair[1]],
        reason: conflict.reason,
        resolution: conflict.resolution,
        severity: 'medium',
      });
    }
  }

  return conflicts;
}

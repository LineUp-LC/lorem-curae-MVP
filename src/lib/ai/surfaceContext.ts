/**
 * Unified AI Context Builder
 *
 * Single entry point for all surfaces to build AI context.
 * Assembles: user profile + page data + pre-computed evidence + interaction history.
 *
 * Each surface calls buildAIContext(mode, pageData) and receives a fully
 * populated AISurfaceContext ready for prompt construction and API calls.
 */

import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type {
  ReviewerEnvironmentInsight,
  ScoredReviewEntry,
  EnvironmentFitExplanation,
} from '../utils/environmentFit';
import type { SafetyResult } from '../utils/productSafety';
import type { IngredientKnowledge } from './knowledgeBase';
import type { ConversationMessage, ConversationMemory, ExplanationLevel } from './types';
import type { SavedProduct } from '../utils/favoritesState';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveComplexion,
  getEffectiveSensitivity,
  getEffectiveLifestyle,
  getEffectivePreferences,
  sessionState,
} from '../utils/sessionState';

// ============================================================================
// AI MODES
// ============================================================================

/**
 * Each mode defines what data the AI receives and what reasoning it performs.
 */
export type AIMode =
  | 'product_detail'
  | 'ingredient_detail'
  | 'routine_builder'
  | 'search'
  | 'comparison'
  | 'marketplace'
  | 'nutrition'
  | 'chat'
  | 'survey_results'
  | 'explain_product'
  | 'find_alternatives'
  | 'review_summary'
  | 'natural_discovery'
  | 'rewrite_explanation'
  | 'guided_comparison'
  | 'guided_routine_build'
  | 'guided_routine_explain'
  | 'curated_recommendation'
  | 'curated_review_summary'
  | 'is_it_for_me';

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Unified user profile assembled from sessionState getters.
 * All fields are nullable — surfaces degrade gracefully when missing.
 */
export interface AIUserProfile {
  skinType: string | null;
  concerns: string[];
  complexion: string;
  sensitivity: string;
  lifestyle: string[];
  preferences: Record<string, boolean>;
  experienceLevel?: string;
  age?: number;
}

// ============================================================================
// PAGE CONTEXT (discriminated union per mode)
// ============================================================================

export interface RoutineStep {
  title: string;
  product?: { name: string; keyIngredients?: string[] };
}

export type PageContext =
  | { mode: 'product_detail'; product: Product; retailers?: Retailer[] }
  | { mode: 'ingredient_detail'; ingredient: IngredientKnowledge; relatedProducts: Product[] }
  | { mode: 'routine_builder'; steps: RoutineStep[]; timeOfDay: 'morning' | 'evening' }
  | { mode: 'search'; query: string; results: Product[] }
  | { mode: 'comparison'; products: Product[] }
  | { mode: 'marketplace'; products: Product[]; retailers: Retailer[] }
  | { mode: 'nutrition'; foods: NutritionFood[]; userConcerns: string[] }
  | { mode: 'chat'; conversationHistory: ConversationMessage[] }
  | { mode: 'survey_results'; surveyAnswers: Record<string, unknown>; generatedProfile: AIUserProfile }
  | { mode: 'explain_product'; product: Product; question?: string }
  | { mode: 'find_alternatives'; sourceProduct: Product; alternatives: Product[]; overlapIngredients: string[] }
  | { mode: 'review_summary'; product: Product; reviews: ReviewForSummary[] }
  | { mode: 'natural_discovery'; query: string; scoredResults: { product: Product; score: number; topReasons: string[] }[] }
  | { mode: 'rewrite_explanation'; originalText: string; targetLevel: ExplanationLevel; product?: Product }
  | { mode: 'guided_comparison'; products: Product[]; conversationTurns: ConversationMessage[] }
  | { mode: 'guided_routine_build'; routineSteps: { category: string; product?: Product }[]; timing: 'am' | 'pm' | 'both'; conversationTurns: ConversationMessage[] }
  | { mode: 'guided_routine_explain'; products: Product[]; timing: 'am' | 'pm'; toneLevel: 'simple' | 'detailed' | 'science'; conversationTurns: ConversationMessage[] }
  | { mode: 'curated_recommendation'; scannedProduct: { name: string; brand: string; category: string; ingredients: string[] }; compatibleProducts: { id: number; name: string; brand: string; category: string; keyIngredients: string[]; matchReasons: string[] }[] }
  | { mode: 'curated_review_summary'; product: Product; reviews: ReviewForSummary[]; matchStats: { totalMatching: number; avgRating: number; positivePercent: number } }
  | { mode: 'is_it_for_me'; product: Product; scannedIngredients?: { name: string; safetyTier: string; category?: string }[]; shelfProducts: { name: string; brand: string; category: string; keyIngredients: string[] }[]; routineProducts: { name: string; category: string; timeOfDay: string }[]; reviewStats?: { totalMatching: number; avgRating: number; positivePercent: number; commonPros: string[]; commonCons: string[] } };

/**
 * Lightweight retailer shape for AI context serialization.
 * Intentionally slim — full Retailer type lives in src/types/retailer.ts.
 */
export interface Retailer {
  id: number | string;
  name: string;
  price?: number;
  trustScore?: number;
  deliveryDays?: number;
  inStock?: boolean;
}

/**
 * Food item for nutrition mode.
 */
export interface NutritionFood {
  name: string;
  nutrients: string[];
  skinBenefits?: string[];
}

/**
 * Lightweight review shape for review summary mode.
 */
export interface ReviewForSummary {
  rating: number;
  skinType: string;
  concerns: string[];
  content: string;
  pros?: string[];
  cons?: string[];
  usageDurationWeeks: number;
}

// ============================================================================
// EVIDENCE BUNDLE
// ============================================================================

export interface IngredientConflict {
  ingredients: [string, string];
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

/**
 * Pre-computed evidence attached to every AI request.
 * Each field is optional — the prompt builder includes only what is present.
 */
export interface EvidenceBundle {
  reviewerEvidence?: ReviewerEnvironmentInsight;
  environmentFit?: EnvironmentFitExplanation;
  ingredientConflicts?: IngredientConflict[];
  concernAlignment?: { matched: string[]; unmatched: string[] };
  safetyAssessment?: SafetyResult;
  reviewSummaryEvidence?: ReviewSummaryEvidence;
  alternativesEvidence?: AlternativesEvidence;
}

/**
 * Pre-computed review summary statistics for the review_summary mode.
 */
export interface ReviewSummaryEvidence {
  totalReviews: number;
  averageRating: number;
  sentimentBreakdown: { positive: number; mixed: number; negative: number };
  topPros: string[];
  topCons: string[];
  averageUsageWeeks: number;
  skinTypeDistribution: Record<string, number>;
}

/**
 * Pre-computed alternatives evidence for the find_alternatives mode.
 */
export interface AlternativesEvidence {
  sourceProductName: string;
  sharedIngredients: string[];
  sharedConcerns: string[];
  categoryMatch: boolean;
}

// ============================================================================
// INTERACTION HISTORY
// ============================================================================

export interface InteractionHistory {
  savedProducts: SavedProduct[];
  recentlyViewed: { id: number; name?: string; viewedAt?: string }[];
  frequentCategories: string[];
  recentSearches: string[];
}

// ============================================================================
// UNIFIED AI SURFACE CONTEXT
// ============================================================================

/**
 * The single context shape consumed by the system prompt builder
 * and the AI request layer. Every surface assembles this via buildAIContext().
 */
export interface AISurfaceContext {
  mode: AIMode;
  user: AIUserProfile;
  environment: EnvironmentContext | null;
  page: PageContext;
  evidence: EvidenceBundle;
  history: InteractionHistory;
  memory: ConversationMemory | null;
}

// ============================================================================
// PAGE DATA INPUT (what each surface passes in)
// ============================================================================

/**
 * Input shape surfaces provide to buildAIContext().
 * The context builder reads the user profile and history automatically —
 * callers only provide mode-specific page data + optional pre-computed evidence.
 */
export interface PageDataInput {
  page: PageContext;
  environment?: EnvironmentContext | null;
  evidence?: Partial<EvidenceBundle>;
  memory?: ConversationMemory | null;
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

/**
 * Build a user profile from sessionState getters.
 * Returns nullable fields — never fabricates data.
 */
function buildUserProfile(): AIUserProfile {
  return {
    skinType: getEffectiveSkinType() ?? null,
    concerns: getEffectiveConcerns(),
    complexion: getEffectiveComplexion(),
    sensitivity: getEffectiveSensitivity(),
    lifestyle: getEffectiveLifestyle(),
    preferences: getEffectivePreferences(),
  };
}

/**
 * Build interaction history from session context.
 */
function buildInteractionHistory(): InteractionHistory {
  const ctx = sessionState.getState().context;

  // Convert viewed product IDs to objects
  const recentlyViewed = (ctx.viewedProducts ?? []).map(idStr => ({
    id: Number(idStr),
  }));

  // Derive frequent categories from visited pages
  const categoryMap: Record<string, number> = {};
  (ctx.visitedPages ?? []).forEach(page => {
    const segment = page.split('/')[1];
    if (segment) {
      categoryMap[segment] = (categoryMap[segment] || 0) + 1;
    }
  });
  const frequentCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key]) => key);

  return {
    savedProducts: [],       // Caller can enrich via favoritesState if needed
    recentlyViewed,
    frequentCategories,
    recentSearches: ctx.searchHistory ?? [],
  };
}

/**
 * Compute concern alignment between user concerns and a product's concerns.
 */
export function computeConcernAlignment(
  userConcerns: string[],
  productConcerns: string[],
): { matched: string[]; unmatched: string[] } {
  if (userConcerns.length === 0) {
    return { matched: [], unmatched: [] };
  }

  const normalise = (s: string) => s.toLowerCase().trim();
  const productNorm = productConcerns.map(normalise);

  const matched: string[] = [];
  const unmatched: string[] = [];

  userConcerns.forEach(concern => {
    const norm = normalise(concern);
    if (productNorm.some(pc => pc.includes(norm) || norm.includes(pc))) {
      matched.push(concern);
    } else {
      unmatched.push(concern);
    }
  });

  return { matched, unmatched };
}

/**
 * Build the unified AI surface context.
 *
 * This is the single entry point for all surfaces. It:
 * 1. Reads user profile from sessionState (getEffectiveSkinType, etc.)
 * 2. Reads interaction history from session context
 * 3. Accepts mode-specific page data from the calling surface
 * 4. Accepts pre-computed evidence (reviewerEvidence, environmentFit, etc.)
 * 5. Returns the unified AISurfaceContext for prompt construction
 *
 * Evidence pre-computation happens at the call site — this builder does NOT
 * call the heavy utilities (aggregateReviewerEvidence, generateEnvironmentFitExplanation)
 * directly, because those require product/environment data that the surface
 * already has in scope. This keeps the builder lightweight and testable.
 */
export function buildAIContext(
  mode: AIMode,
  pageData: PageDataInput,
): AISurfaceContext {
  const user = buildUserProfile();
  const history = buildInteractionHistory();

  // Auto-compute concern alignment for product-aware modes
  let evidence: EvidenceBundle = { ...pageData.evidence };

  if (!evidence.concernAlignment) {
    const page = pageData.page;
    if (page.mode === 'product_detail' && user.concerns.length > 0) {
      evidence.concernAlignment = computeConcernAlignment(
        user.concerns,
        page.product.concerns ?? [],
      );
    } else if (page.mode === 'ingredient_detail' && user.concerns.length > 0) {
      evidence.concernAlignment = computeConcernAlignment(
        user.concerns,
        page.ingredient.concerns ?? [],
      );
    } else if (page.mode === 'comparison' && user.concerns.length > 0) {
      // For comparison, align against combined concerns of all products
      const allConcerns = page.products.flatMap(p => p.concerns ?? []);
      const unique = [...new Set(allConcerns)];
      evidence.concernAlignment = computeConcernAlignment(user.concerns, unique);
    } else if (page.mode === 'explain_product' && user.concerns.length > 0) {
      evidence.concernAlignment = computeConcernAlignment(
        user.concerns,
        page.product.concerns ?? [],
      );
    } else if (page.mode === 'is_it_for_me' && user.concerns.length > 0) {
      evidence.concernAlignment = computeConcernAlignment(
        user.concerns,
        page.product.concerns ?? [],
      );
    } else if (page.mode === 'find_alternatives' && user.concerns.length > 0) {
      const allConcerns = [
        ...(page.sourceProduct.concerns ?? []),
        ...page.alternatives.flatMap(p => p.concerns ?? []),
      ];
      const unique = [...new Set(allConcerns)];
      evidence.concernAlignment = computeConcernAlignment(user.concerns, unique);
    }
  }

  return {
    mode,
    user,
    environment: pageData.environment ?? null,
    page: pageData.page,
    evidence,
    history,
    memory: pageData.memory ?? null,
  };
}

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

/**
 * Generate a cache key for the current context.
 * Used for localStorage response caching (24h TTL).
 */
export function generateContextCacheKey(ctx: AISurfaceContext): string {
  const profileHash = [
    ctx.user.skinType ?? 'none',
    ctx.user.concerns.join(','),
    ctx.user.sensitivity,
  ].join('|');

  const envHash = ctx.environment
    ? [ctx.environment.climate ?? '', ctx.environment.uvBand ?? '', ctx.environment.season ?? ''].join('|')
    : 'no-env';

  // Mode-specific identifier
  let pageId = ctx.mode;
  const page = ctx.page;
  if (page.mode === 'product_detail') pageId += `:${page.product.id}`;
  else if (page.mode === 'ingredient_detail') pageId += `:${page.ingredient.name}`;
  else if (page.mode === 'comparison') pageId += `:${page.products.map(p => p.id).sort().join(',')}`;
  else if (page.mode === 'search') pageId += `:${page.query}`;
  else if (page.mode === 'explain_product') pageId += `:${page.product.id}:${page.question ?? 'default'}`;
  else if (page.mode === 'find_alternatives') pageId += `:${page.sourceProduct.id}`;
  else if (page.mode === 'review_summary') pageId += `:${page.product.id}`;
  else if (page.mode === 'natural_discovery') pageId += `:${page.query}`;
  else if (page.mode === 'rewrite_explanation') pageId += `:${page.targetLevel}`;
  else if (page.mode === 'guided_comparison') pageId += `:${page.products.map(p => p.id).sort().join(',')}`;
  else if (page.mode === 'guided_routine_build') pageId += `:${page.timing}:${page.routineSteps.length}`;
  else if (page.mode === 'guided_routine_explain') pageId += `:${page.products.map(p => p.id).sort().join(',')}:${page.toneLevel}`;
  else if (page.mode === 'curated_recommendation') pageId += `:${page.scannedProduct.name}:${page.compatibleProducts.map(p => p.id).sort().join(',')}`;
  else if (page.mode === 'curated_review_summary') pageId += `:${page.product.id}:${page.matchStats.totalMatching}`;
  else if (page.mode === 'is_it_for_me') pageId += `:${page.product.id}:${page.shelfProducts.length}`;

  return `ai-insight:${pageId}:${profileHash}:${envHash}`;
}

/**
 * Serialize the context for API transport (strips non-essential data).
 */
export function serializeContextForAPI(ctx: AISurfaceContext): Record<string, unknown> {
  return {
    mode: ctx.mode,
    user: ctx.user,
    environment: ctx.environment,
    page: ctx.page,
    evidence: ctx.evidence,
    history: {
      savedProducts: ctx.history.savedProducts.map(p => ({ id: p.id, name: p.name, category: p.category })),
      recentlyViewed: ctx.history.recentlyViewed.slice(0, 10),
      frequentCategories: ctx.history.frequentCategories,
      recentSearches: ctx.history.recentSearches.slice(0, 5),
    },
  };
}

// Re-export evidence types for consumer convenience
export type { ReviewerEnvironmentInsight, ScoredReviewEntry, EnvironmentFitExplanation };
export type { SafetyResult };
export type { ExplanationLevel };

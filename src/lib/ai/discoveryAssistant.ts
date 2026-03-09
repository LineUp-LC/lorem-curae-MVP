/**
 * Discovery Assistant — AI-Assisted Discovery & Explanation Orchestration
 *
 * Thin orchestration layer that assembles deterministic scoring data,
 * product similarity data, and review data into AISurfaceContext objects
 * for each Phase 5 AI capability.
 *
 * This file does NOT call the AI — it only prepares context objects
 * that are then passed to requestAIInsight() by discoveryClient.ts.
 */

import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../environment/context';
import type { MockReview } from '../../mocks/reviews';
import type { ExplanationLevel } from './types';
import type { ScoredProduct } from '../utils/productSimilarity';
import type {
  AISurfaceContext,
  EvidenceBundle,
  ReviewSummaryEvidence,
  AlternativesEvidence,
} from './surfaceContext';
import { buildAIContext } from './surfaceContext';
import { scoreSimilarProducts } from '../utils/productSimilarity';
import { rankProducts } from '../discovery/scoringEngine';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectivePreferences,
} from '../utils/sessionState';

// ============================================================================
// Input Types
// ============================================================================

export interface ExplainProductInput {
  product: Product;
  question?: string;
  environment?: EnvironmentContext | null;
  evidence?: Partial<EvidenceBundle>;
}

export interface FindAlternativesInput {
  sourceProduct: Product;
  userConcerns: string[];
  userSkinType: string | undefined;
  userPreferences: Record<string, boolean>;
  limit?: number;
}

export interface FindAlternativesResult {
  alternatives: ScoredProduct[];
  context: AISurfaceContext;
}

export interface ReviewSummaryInput {
  product: Product;
  reviews: MockReview[];
  environment?: EnvironmentContext | null;
}

export interface NaturalDiscoveryInput {
  query: string;
  products: Product[];
  filters?: Record<string, string>;
}

export interface RewriteExplanationInput {
  originalText: string;
  targetLevel: ExplanationLevel;
  product?: Product;
}

// ============================================================================
// Context Builders
// ============================================================================

/**
 * Build context for "Explain this product for me."
 * Assembles product data + user profile + environment + evidence into AISurfaceContext.
 */
export function buildExplainProductContext(input: ExplainProductInput): AISurfaceContext {
  return buildAIContext('explain_product', {
    page: {
      mode: 'explain_product',
      product: input.product,
      question: input.question,
    },
    environment: input.environment,
    evidence: input.evidence,
  });
}

/**
 * Build context for "Find alternatives."
 *
 * 1. Calls scoreSimilarProducts() for deterministic alternatives
 * 2. Computes ingredient overlap between source and each alternative
 * 3. Computes shared concerns
 * 4. Returns both the alternatives array and the context for rendering + AI
 */
export function buildFindAlternativesContext(input: FindAlternativesInput): FindAlternativesResult {
  const { sourceProduct, userConcerns, userSkinType, userPreferences, limit = 4 } = input;

  // Deterministic: score similar products
  const alternatives = scoreSimilarProducts(
    sourceProduct,
    userConcerns,
    userSkinType,
    userPreferences,
    limit,
  );

  // Compute ingredient overlap across all alternatives
  const sourceIngredients = new Set(
    sourceProduct.keyIngredients.map(i => i.toLowerCase()),
  );
  const sharedIngredientsSet = new Set<string>();
  alternatives.forEach(alt => {
    alt.keyIngredients.forEach(ing => {
      if (sourceIngredients.has(ing.toLowerCase())) {
        sharedIngredientsSet.add(ing);
      }
    });
  });
  const overlapIngredients = [...sharedIngredientsSet];

  // Compute shared concerns
  const sourceConcerns = new Set(
    (sourceProduct.concerns ?? []).map(c => c.toLowerCase()),
  );
  const sharedConcernsSet = new Set<string>();
  alternatives.forEach(alt => {
    (alt.concerns ?? []).forEach(c => {
      if (sourceConcerns.has(c.toLowerCase())) {
        sharedConcernsSet.add(c);
      }
    });
  });

  const alternativesEvidence: AlternativesEvidence = {
    sourceProductName: sourceProduct.name,
    sharedIngredients: overlapIngredients,
    sharedConcerns: [...sharedConcernsSet],
    categoryMatch: alternatives.some(a => a.category === sourceProduct.category),
  };

  const context = buildAIContext('find_alternatives', {
    page: {
      mode: 'find_alternatives',
      sourceProduct,
      alternatives,
      overlapIngredients,
    },
    evidence: { alternativesEvidence },
  });

  return { alternatives, context };
}

/**
 * Deterministically pre-compute review summary evidence.
 * Pure function — no AI involved.
 */
export function computeReviewSummaryEvidence(reviews: MockReview[]): ReviewSummaryEvidence {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      sentimentBreakdown: { positive: 0, mixed: 0, negative: 0 },
      topPros: [],
      topCons: [],
      averageUsageWeeks: 0,
      skinTypeDistribution: {},
    };
  }

  // Sentiment breakdown
  let positive = 0;
  let mixed = 0;
  let negative = 0;
  let totalRating = 0;
  let totalWeeks = 0;

  const prosCounts: Record<string, number> = {};
  const consCounts: Record<string, number> = {};
  const skinTypeCounts: Record<string, number> = {};

  reviews.forEach(r => {
    totalRating += r.rating;
    totalWeeks += r.usageDurationWeeks;

    if (r.rating >= 4) positive++;
    else if (r.rating === 3) mixed++;
    else negative++;

    // Count skin types
    if (r.skinType) {
      skinTypeCounts[r.skinType] = (skinTypeCounts[r.skinType] || 0) + 1;
    }

    // Count pros
    if (r.pros) {
      r.pros.forEach(pro => {
        const key = pro.toLowerCase();
        prosCounts[key] = (prosCounts[key] || 0) + 1;
      });
    }

    // Count cons
    if (r.cons) {
      r.cons.forEach(con => {
        const key = con.toLowerCase();
        consCounts[key] = (consCounts[key] || 0) + 1;
      });
    }
  });

  // Top 3 by frequency
  const topPros = Object.entries(prosCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => k);

  const topCons = Object.entries(consCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => k);

  return {
    totalReviews: reviews.length,
    averageRating: totalRating / reviews.length,
    sentimentBreakdown: { positive, mixed, negative },
    topPros,
    topCons,
    averageUsageWeeks: Math.round(totalWeeks / reviews.length),
    skinTypeDistribution: skinTypeCounts,
  };
}

/**
 * Build context for "Summarize reviews."
 * 1. Calls computeReviewSummaryEvidence() for deterministic aggregation
 * 2. Builds AISurfaceContext with review evidence
 */
export function buildReviewSummaryContext(input: ReviewSummaryInput): AISurfaceContext {
  const evidence = computeReviewSummaryEvidence(input.reviews);

  const reviewsForContext = input.reviews.map(r => ({
    rating: r.rating,
    skinType: r.skinType,
    concerns: r.skinConcerns ?? [],
    content: r.content,
    pros: r.pros,
    cons: r.cons,
    usageDurationWeeks: r.usageDurationWeeks,
  }));

  return buildAIContext('review_summary', {
    page: {
      mode: 'review_summary',
      product: input.product,
      reviews: reviewsForContext,
    },
    environment: input.environment,
    evidence: { reviewSummaryEvidence: evidence },
  });
}

/**
 * Build context for AI-assisted natural language discovery.
 * 1. Reads user profile from sessionState
 * 2. Calls rankProducts() from scoringEngine for deterministic scoring
 * 3. Takes top 10 results for the context
 */
export function buildNaturalDiscoveryContext(input: NaturalDiscoveryInput): AISurfaceContext {
  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const preferences = getEffectivePreferences();

  const profile = { skinType, concerns, preferences };

  const scored = rankProducts(input.products, profile);
  const top10 = scored.slice(0, 10);

  const scoredResults = top10.map(sp => ({
    product: sp.product,
    score: sp.score.total,
    topReasons: sp.score.topReasons,
  }));

  return buildAIContext('natural_discovery', {
    page: {
      mode: 'natural_discovery',
      query: input.query,
      scoredResults,
    },
  });
}

/**
 * Build context for "Rewrite explanation at different level."
 */
export function buildRewriteContext(input: RewriteExplanationInput): AISurfaceContext {
  return buildAIContext('rewrite_explanation', {
    page: {
      mode: 'rewrite_explanation',
      originalText: input.originalText,
      targetLevel: input.targetLevel,
      product: input.product,
    },
  });
}

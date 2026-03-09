/**
 * Discovery Client — Thin API Wrappers for Phase 5 AI Capabilities
 *
 * Each function builds context via discoveryAssistant.ts, then calls
 * requestAIInsight() from surfaceClient.ts. UI components import these
 * instead of orchestrating context building + API calling themselves.
 */

import { requestAIInsight } from './surfaceClient';
import type { AIInsightResult } from './surfaceClient';
import type { ScoredProduct } from '../utils/productSimilarity';
import type { ReviewSummaryEvidence } from './surfaceContext';
import type { ScoredDiscoveryProduct } from '../discovery/types';
import {
  buildExplainProductContext,
  buildFindAlternativesContext,
  computeReviewSummaryEvidence,
  buildReviewSummaryContext,
  buildNaturalDiscoveryContext,
  buildRewriteContext,
} from './discoveryAssistant';
import type {
  ExplainProductInput,
  FindAlternativesInput,
  ReviewSummaryInput,
  NaturalDiscoveryInput,
  RewriteExplanationInput,
} from './discoveryAssistant';
import { rankProducts } from '../discovery/scoringEngine';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectivePreferences,
} from '../utils/sessionState';

// ============================================================================
// API Wrappers
// ============================================================================

/**
 * "Explain this product for me" — full end-to-end.
 * Builds context + calls AI. Returns AIInsightResult.
 * Guest users receive deterministic fallback via buildFallbackInsight().
 */
export async function explainProductForUser(
  input: ExplainProductInput,
  options?: { skipCache?: boolean },
): Promise<AIInsightResult> {
  const ctx = buildExplainProductContext(input);
  return requestAIInsight(ctx, {
    skipCache: options?.skipCache,
    question: input.question,
  });
}

/**
 * "Find alternatives" — returns deterministic alternatives + AI explanation.
 * The alternatives array is always returned (even without AI).
 * The AI insight is optional (guest fallback returns evidence-based text).
 */
export async function findAlternativesForUser(
  input: FindAlternativesInput,
  options?: { skipCache?: boolean },
): Promise<{ alternatives: ScoredProduct[]; insight: AIInsightResult }> {
  const { alternatives, context } = buildFindAlternativesContext(input);
  const insight = await requestAIInsight(context, {
    skipCache: options?.skipCache,
  });
  return { alternatives, insight };
}

/**
 * "Summarize reviews" — builds review evidence + calls AI.
 * Returns both the deterministic evidence and the AI summary.
 */
export async function summarizeReviewsForUser(
  input: ReviewSummaryInput,
  options?: { skipCache?: boolean },
): Promise<{ evidence: ReviewSummaryEvidence; insight: AIInsightResult }> {
  const evidence = computeReviewSummaryEvidence(input.reviews);
  const context = buildReviewSummaryContext(input);
  const insight = await requestAIInsight(context, {
    skipCache: options?.skipCache,
  });
  return { evidence, insight };
}

/**
 * "Natural discovery" — scores + ranks products, then asks AI to explain results.
 * Returns scored products array + AI insight.
 */
export async function discoverWithAI(
  input: NaturalDiscoveryInput,
  options?: { skipCache?: boolean },
): Promise<{ scoredProducts: ScoredDiscoveryProduct[]; insight: AIInsightResult }> {
  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const preferences = getEffectivePreferences();
  const profile = { skinType, concerns, preferences };

  const scoredProducts = rankProducts(input.products, profile);
  const context = buildNaturalDiscoveryContext(input);
  const insight = await requestAIInsight(context, {
    skipCache: options?.skipCache,
  });
  return { scoredProducts, insight };
}

/**
 * "Rewrite explanation" — rewrites text at a different complexity level.
 * Always calls AI (no deterministic fallback for rewriting).
 */
export async function rewriteExplanation(
  input: RewriteExplanationInput,
  options?: { skipCache?: boolean },
): Promise<AIInsightResult> {
  const ctx = buildRewriteContext(input);
  return requestAIInsight(ctx, {
    skipCache: options?.skipCache,
  });
}

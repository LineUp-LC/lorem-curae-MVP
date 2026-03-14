/**
 * AI Surface Client
 *
 * Client-side caller for the ai-insight Edge Function.
 * Handles: context → prompt → API call → response + caching + fallback.
 *
 * Usage:
 *   const result = await requestAIInsight(context);
 *   if (result.success) render(result.insight);
 */

import { supabase } from '../supabase-browser';
import { buildSystemPrompt, getMaxTokensForMode, validateAIResponse } from './systemPrompt';
import { generateContextCacheKey, serializeContextForAPI } from './surfaceContext';
import type { AISurfaceContext, AIMode } from './surfaceContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIInsightSuccess {
  success: true;
  insight: string;
  mode: AIMode;
  cached: boolean;
  meta: {
    authenticated: boolean;
    hasProfile: boolean;
    tokensUsed?: number;
    timestamp: string;
  };
}

export interface AIInsightError {
  success: false;
  error: string;
  fallbackInsight?: string;
}

export type AIInsightResult = AIInsightSuccess | AIInsightError;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const AI_INSIGHT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insight`;

/** Cache TTL: 24 hours in milliseconds */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * In-flight request deduplication map.
 * Prevents duplicate parallel API calls for the same context key.
 */
const pendingRequests = new Map<string, Promise<AIInsightResult>>();

// ---------------------------------------------------------------------------
// Cache layer (localStorage)
// ---------------------------------------------------------------------------

interface CachedInsight {
  insight: string;
  mode: string;
  timestamp: number;
}

function getCachedInsight(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached: CachedInsight = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.insight;
  } catch {
    return null;
  }
}

function setCachedInsight(key: string, insight: string, mode: string): void {
  try {
    const entry: CachedInsight = {
      insight,
      mode,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded — silently skip
  }
}

// ---------------------------------------------------------------------------
// Fallback builder
// ---------------------------------------------------------------------------

/**
 * Build a rule-based fallback insight from pre-computed evidence.
 * Used when Claude API is unavailable or for guest users.
 */
function buildFallbackInsight(ctx: AISurfaceContext): string | undefined {
  const parts: string[] = [];
  const { evidence } = ctx;

  // Ingredient-specific fallback: assemble from structured ingredient data
  if (ctx.mode === 'ingredient_detail' && ctx.page.mode === 'ingredient_detail') {
    const ing = ctx.page.ingredient;
    if (ing.benefits && ing.benefits.length > 0) {
      const b = ing.benefits[0];
      const bLower = b.toLowerCase();
      // If benefit is a verb phrase ("Helps reduce..."), use directly
      // If benefit is a noun/label ("Brightening", "Deep Hydration"), use "is known for"
      const isVerbPhrase = bLower.startsWith('help') || bLower.startsWith('reduc') || bLower.startsWith('support') || bLower.startsWith('protect');
      if (isVerbPhrase) {
        parts.push(`${ing.name} ${b.charAt(0).toLowerCase()}${b.slice(1)}${b.endsWith('.') ? '' : '.'}`);
      } else {
        parts.push(`${ing.name} is known for ${bLower}${b.endsWith('.') ? '' : '.'}`);
      }
    }
    if (evidence.concernAlignment) {
      const { matched } = evidence.concernAlignment;
      if (matched.length > 0) {
        parts.push(`This ingredient is commonly used for ${matched.join(' and ')}, which aligns with your skin concerns.`);
      }
    }
    if (ing.safetyNotes && ing.safetyNotes.length > 0 && ing.safetyNotes[0]) {
      parts.push(ing.safetyNotes[0]);
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Routine-builder-specific fallback: conflict summary + step analysis
  if (ctx.mode === 'routine_builder' && ctx.page.mode === 'routine_builder') {
    const steps = ctx.page.steps;
    const filledSteps = steps.filter(s => s.product);
    const { timeOfDay } = ctx.page;

    if (filledSteps.length === 0) return undefined;

    const skinType = ctx.user.skinType;
    if (skinType) {
      parts.push(`Your ${timeOfDay} routine has ${filledSteps.length} product${filledSteps.length > 1 ? 's' : ''} selected for ${skinType} skin.`);
    } else {
      parts.push(`Your ${timeOfDay} routine has ${filledSteps.length} product${filledSteps.length > 1 ? 's' : ''} selected.`);
    }

    if (evidence.ingredientConflicts && evidence.ingredientConflicts.length > 0) {
      const first = evidence.ingredientConflicts[0];
      parts.push(`Heads up: ${first.ingredients.join(' and ')} may not work well together — ${first.message.charAt(0).toLowerCase()}${first.message.slice(1)}`);
    }

    if (filledSteps.length < steps.length) {
      parts.push(`${steps.length - filledSteps.length} step${steps.length - filledSteps.length > 1 ? 's' : ''} still need${steps.length - filledSteps.length === 1 ? 's' : ''} a product — filling these can help you get the most from your routine.`);
    }

    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Explain-product fallback: assemble from product data + evidence
  if (ctx.mode === 'explain_product' && ctx.page.mode === 'explain_product') {
    const p = ctx.page.product;
    const skinType = ctx.user.skinType;
    parts.push(`${p.brand} ${p.name} is a ${p.category} featuring ${p.keyIngredients.slice(0, 3).join(', ')}.`);
    if (skinType && p.skinTypes.some(st => st.toLowerCase() === skinType.toLowerCase() || st.toLowerCase() === 'all')) {
      parts.push(`It is suitable for ${skinType} skin.`);
    }
    if (evidence.concernAlignment) {
      const { matched } = evidence.concernAlignment;
      if (matched.length > 0) {
        parts.push(`This product addresses ${matched.join(' and ')}, which aligns with your skin concerns.`);
      }
    }
    if (evidence.safetyAssessment && evidence.safetyAssessment.warnings.length > 0) {
      parts.push(`${evidence.safetyAssessment.warnings[0].label}: ${evidence.safetyAssessment.warnings[0].detail}`);
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Find-alternatives fallback: list shared ingredients/concerns
  if (ctx.mode === 'find_alternatives' && ctx.page.mode === 'find_alternatives') {
    const ae = evidence.alternativesEvidence;
    if (ae) {
      parts.push(`Looking at alternatives to ${ae.sourceProductName}.`);
      if (ae.sharedIngredients.length > 0) {
        parts.push(`These alternatives share key ingredients: ${ae.sharedIngredients.join(', ')}.`);
      }
      if (ae.sharedConcerns.length > 0) {
        parts.push(`They also target ${ae.sharedConcerns.join(' and ')}.`);
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Review-summary fallback: format review evidence as text
  if (ctx.mode === 'review_summary' && ctx.page.mode === 'review_summary') {
    const rse = evidence.reviewSummaryEvidence;
    if (rse && rse.totalReviews > 0) {
      parts.push(`Based on ${rse.totalReviews} reviews, this product has an average rating of ${rse.averageRating.toFixed(1)} out of 5.`);
      if (rse.sentimentBreakdown.positive > 0) {
        parts.push(`${rse.sentimentBreakdown.positive} reviewers rated it positively.`);
      }
      if (rse.topPros.length > 0) {
        parts.push(`Commonly noted positives: ${rse.topPros.join(', ')}.`);
      }
      if (rse.topCons.length > 0) {
        parts.push(`Some reviewers noted: ${rse.topCons.join(', ')}.`);
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Natural-discovery fallback: format top scoring factors
  if (ctx.mode === 'natural_discovery' && ctx.page.mode === 'natural_discovery') {
    const results = ctx.page.scoredResults;
    if (results.length > 0) {
      const top = results[0];
      parts.push(`Top result: ${top.product.name} by ${top.product.brand}.`);
      if (top.topReasons.length > 0) {
        parts.push(`Ranked highly because: ${top.topReasons.join(', ')}.`);
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Guided comparison fallback: summarise deterministic recommendation
  if (ctx.mode === 'guided_comparison' && ctx.page.mode === 'guided_comparison') {
    const products = ctx.page.products;
    if (products.length > 0) {
      parts.push(`Comparing ${products.map(p => p.name).join(' and ')}.`);
      if (evidence.concernAlignment) {
        const { matched } = evidence.concernAlignment;
        if (matched.length > 0) {
          parts.push(`These products address ${matched.join(' and ')}, which aligns with your skin concerns.`);
        }
      }
      const skinType = ctx.user.skinType;
      if (skinType) {
        parts.push(`Results are tailored for ${skinType} skin.`);
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Guided routine build fallback: summarise selected steps
  if (ctx.mode === 'guided_routine_build' && ctx.page.mode === 'guided_routine_build') {
    const steps = ctx.page.routineSteps;
    const filledSteps = steps.filter(s => s.product);
    const timing = ctx.page.timing === 'both' ? 'morning and evening' : ctx.page.timing === 'am' ? 'morning' : 'evening';
    if (filledSteps.length > 0) {
      parts.push(`Your ${timing} routine includes ${filledSteps.length} product${filledSteps.length > 1 ? 's' : ''}.`);
      const productNames = filledSteps.slice(0, 3).map(s => s.product!.name).join(', ');
      parts.push(`Key products: ${productNames}.`);
    } else {
      parts.push(`Building a ${timing} routine based on your profile.`);
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Guided routine explain fallback: list steps with roles
  if (ctx.mode === 'guided_routine_explain' && ctx.page.mode === 'guided_routine_explain') {
    const products = ctx.page.products;
    const timing = ctx.page.timing === 'am' ? 'morning' : 'evening';
    if (products.length > 0) {
      parts.push(`Your ${timing} routine has ${products.length} step${products.length > 1 ? 's' : ''}.`);
      const productNames = products.slice(0, 3).map(p => p.name).join(', ');
      parts.push(`Products: ${productNames}.`);
      if (evidence.concernAlignment) {
        const { matched } = evidence.concernAlignment;
        if (matched.length > 0) {
          parts.push(`This routine addresses ${matched.join(' and ')}.`);
        }
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  // Rewrite-explanation has no fallback — requires AI
  if (ctx.mode === 'rewrite_explanation') {
    return undefined;
  }

  if (evidence.environmentFit?.explanation) {
    let explanation = evidence.environmentFit.explanation;
    // For product_detail, strip reviewer sentence — review cards shown separately
    if (ctx.mode === 'product_detail') {
      explanation = explanation.replace(/\s*(?:Reviewers|People) with (?:similar|a similar skin) profile[s]?(?:[^.]|\.\d)*\./i, '').trim();
    }
    if (explanation) parts.push(explanation);
  }

  if (evidence.reviewerEvidence) {
    const re = evidence.reviewerEvidence;
    // Skip if already mentioned in environment fit or if product_detail (cards shown separately)
    const alreadyCovered = ctx.mode === 'product_detail'
      || parts.some(p => p.toLowerCase().includes('similar skin profile') || p.toLowerCase().includes('reviewers with similar profiles'));
    if (re.detail && !alreadyCovered) {
      parts.push(`${re.count} people with a similar skin profile ${re.detail}.`);
    }
  }

  if (evidence.concernAlignment) {
    const { matched, unmatched } = evidence.concernAlignment;
    if (matched.length > 0 && unmatched.length > 0) {
      parts.push(
        `This product targets ${matched.join(' and ')}, which matches what your skin needs right now, but does not specifically address ${unmatched.join(' or ')}.`,
      );
    } else if (matched.length > 0) {
      parts.push(`This product helps with ${matched.join(' and ')}, which is what your skin is looking for.`);
    }
  }

  if (evidence.safetyAssessment && evidence.safetyAssessment.warnings.length > 0) {
    const topWarning = evidence.safetyAssessment.warnings[0];
    parts.push(`${topWarning.label}: ${topWarning.detail}`);
  }

  return parts.length > 0 ? parts.join(' ') : undefined;
}

// ---------------------------------------------------------------------------
// Main API caller
// ---------------------------------------------------------------------------

/**
 * Request an AI insight for a given surface context.
 *
 * Flow:
 * 1. Check localStorage cache
 * 2. Build system prompt from context
 * 3. Call ai-insight Edge Function
 * 4. Validate response
 * 5. Cache and return
 *
 * Falls back to pre-computed evidence when the API is unavailable.
 * Guest users (no auth session) receive the fallback directly without an API call.
 */
export async function requestAIInsight(
  ctx: AISurfaceContext,
  options?: { skipCache?: boolean; question?: string },
): Promise<AIInsightResult> {
  const cacheKey = generateContextCacheKey(ctx);

  // 1. Check cache (unless explicitly skipped)
  if (!options?.skipCache) {
    const cached = getCachedInsight(cacheKey);
    if (cached) {
      return {
        success: true,
        insight: cached,
        mode: ctx.mode,
        cached: true,
        meta: {
          authenticated: true,
          hasProfile: !!ctx.user.skinType,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // 2. Deduplicate in-flight requests for the same context
  const inFlight = pendingRequests.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = executeAIRequest(ctx, options, cacheKey);
  pendingRequests.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Internal: execute the actual AI request (auth check → prompt → API call).
 * Separated from requestAIInsight to allow deduplication wrapping.
 */
async function executeAIRequest(
  ctx: AISurfaceContext,
  options: { skipCache?: boolean; question?: string } | undefined,
  cacheKey: string,
): Promise<AIInsightResult> {
  // 1. Check auth — guest users get fallback only (no API call)
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const fallback = buildFallbackInsight(ctx);
    if (fallback) {
      return {
        success: true,
        insight: fallback,
        mode: ctx.mode,
        cached: false,
        meta: {
          authenticated: false,
          hasProfile: !!ctx.user.skinType,
          timestamp: new Date().toISOString(),
        },
      };
    }
    return { success: false, error: 'Sign in for personalised AI insights' };
  }

  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(ctx);

  // 3. Build user message
  const userMessage =
    options?.question ||
    `Analyze this ${ctx.mode.replace(/_/g, ' ')} context and provide a concise insight.`;

  // 4. Call Edge Function
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };

    const response = await fetch(AI_INSIGHT_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mode: ctx.mode,
        systemPrompt,
        message: userMessage,
        context: serializeContextForAPI(ctx),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const fallback = buildFallbackInsight(ctx);
      return {
        success: false,
        error: data.error || 'AI service unavailable',
        fallbackInsight: fallback,
      };
    }

    // 5. Validate response
    const issues = validateAIResponse(data.insight, ctx.mode);
    if (issues.length > 0) {
      console.warn('[SurfaceClient] Response validation issues:', issues);
      const fallback = buildFallbackInsight(ctx);
      if (fallback) {
        return {
          success: true,
          insight: fallback,
          mode: ctx.mode,
          cached: false,
          meta: data.meta,
        };
      }
    }

    // 6. Cache the response
    setCachedInsight(cacheKey, data.insight, ctx.mode);

    return {
      success: true,
      insight: data.insight,
      mode: ctx.mode,
      cached: false,
      meta: data.meta,
    };
  } catch (error) {
    console.error('[SurfaceClient] Error calling AI insight API:', error);
    const fallback = buildFallbackInsight(ctx);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      fallbackInsight: fallback,
    };
  }
}

/**
 * Clear all cached AI insights.
 */
export function clearInsightCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ai-insight:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

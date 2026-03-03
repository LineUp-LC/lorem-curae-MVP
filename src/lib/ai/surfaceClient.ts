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

  if (evidence.environmentFit?.explanation) {
    parts.push(evidence.environmentFit.explanation);
  }

  if (evidence.reviewerEvidence) {
    const re = evidence.reviewerEvidence;
    if (re.detail) {
      parts.push(`${re.count} reviewers with similar profiles ${re.detail}.`);
    }
  }

  if (evidence.concernAlignment) {
    const { matched, unmatched } = evidence.concernAlignment;
    if (matched.length > 0 && unmatched.length > 0) {
      parts.push(
        `This product addresses your ${matched.join(' and ')} concerns but does not specifically target ${unmatched.join(' or ')}.`,
      );
    } else if (matched.length > 0) {
      parts.push(`This product aligns with your ${matched.join(' and ')} concerns.`);
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

  // 2. Check auth — guest users get fallback only (no API call)
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

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(ctx);

  // 4. Build user message
  const userMessage =
    options?.question ||
    `Analyze this ${ctx.mode.replace(/_/g, ' ')} context and provide a concise insight.`;

  // 5. Call Edge Function
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
      // API error — fall back to evidence
      const fallback = buildFallbackInsight(ctx);
      return {
        success: false,
        error: data.error || 'AI service unavailable',
        fallbackInsight: fallback,
      };
    }

    // 6. Validate response
    const issues = validateAIResponse(data.insight, ctx.mode);
    if (issues.length > 0) {
      console.warn('[SurfaceClient] Response validation issues:', issues);
      // Use fallback instead of invalid response
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

    // 7. Cache the response
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

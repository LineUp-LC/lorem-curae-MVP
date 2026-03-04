/**
 * AIInsightBlock Component
 *
 * Compact, branded component for rendering AI-generated insights on any surface.
 * Handles loading, error, and empty states. Degrades gracefully — renders
 * nothing when there is no insight to display.
 */

import { useState, useEffect, useCallback } from 'react';
import { requestAIInsight } from '../../lib/ai/surfaceClient';
import type { AISurfaceContext, AIMode } from '../../lib/ai/surfaceContext';
import type { AIInsightResult } from '../../lib/ai/surfaceClient';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIInsightBlockProps {
  /** Pre-built AI surface context */
  context: AISurfaceContext;
  /** Optional custom question to ask the AI */
  question?: string;
  /** Compact variant for inline/sidebar use */
  compact?: boolean;
  /** Skip localStorage cache */
  skipCache?: boolean;
  /** Environment badges (non-product_detail modes) */
  environmentBadges?: {
    uv?: string;
    climate?: string;
    season?: string;
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className={`bg-cream/30 border border-blush/40 rounded-xl ${compact ? 'p-3' : 'p-4'} animate-pulse`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-blush/30 rounded-full" />
        <div className={`h-3 bg-blush/20 rounded ${compact ? 'w-24' : 'w-32'}`} />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-blush/15 rounded w-full" />
        <div className="h-3 bg-blush/15 rounded w-4/5" />
        {!compact && <div className="h-3 bg-blush/15 rounded w-3/5" />}
      </div>
    </div>
  );
}

function EnvironmentBadges({ badges }: { badges: { uv?: string; climate?: string; season?: string } }) {
  const items = [
    badges.uv && { icon: 'ri-sun-line', label: badges.uv },
    badges.climate && { icon: 'ri-water-flash-line', label: badges.climate },
    badges.season && { icon: 'ri-leaf-line', label: badges.season },
  ].filter(Boolean) as { icon: string; label: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-cream/60 text-warm-gray text-[10px] font-medium rounded-full border border-blush/30"
        >
          <i className={`${item.icon} text-[10px]`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AIInsightBlock({
  context,
  question,
  compact = false,
  skipCache = false,
  environmentBadges,
}: AIInsightBlockProps) {
  const [result, setResult] = useState<AIInsightResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestAIInsight(context, { skipCache, question });
      setResult(res);
    } catch {
      setResult({ success: false, error: 'Failed to load insight' });
    } finally {
      setLoading(false);
    }
  }, [context, skipCache, question]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  // Loading state
  if (loading) {
    return <LoadingSkeleton compact={compact} />;
  }

  // Determine the insight text to display
  let insightText: string | undefined;
  if (result?.success) {
    insightText = result.insight;
  } else if (result && !result.success && result.fallbackInsight) {
    insightText = result.fallbackInsight;
  }

  // Graceful degradation — render nothing if no insight available
  if (!insightText) {
    return null;
  }

  const isCached = result?.success && result.cached;
  const isProductDetail = context.mode === 'product_detail';
  const isPersonalized = !!context.user.skinType;

  // Product detail mode: bullet points, color highlighting, no extras
  if (isProductDetail && !compact) {
    const bullets = insightText
      .split(/(?<=\.)\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return (
      <div
        className={`rounded-xl p-4 ${
          isPersonalized
            ? 'bg-light/20 border border-primary/20'
            : 'bg-cream/30 border border-blush/40'
        }`}
        role="complementary"
        aria-label="Why this product fits"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
            <i className="ri-sparkling-line text-xs text-primary" />
          </div>
          <span className="text-xs font-semibold text-deep">
            Why this product fits
          </span>
          {isCached && (
            <span className="text-[9px] text-warm-gray/50 ml-auto">cached</span>
          )}
        </div>
        <ul className="space-y-1.5">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2">
              <i className={`ri-checkbox-circle-fill text-xs mt-0.5 flex-shrink-0 ${
                isPersonalized ? 'text-primary' : 'text-warm-gray/40'
              }`} />
              <span className={`text-sm leading-relaxed ${
                isPersonalized ? 'text-deep' : 'text-warm-gray'
              }`}>
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={`bg-cream/30 border border-blush/40 rounded-xl ${compact ? 'p-3' : 'p-4'}`}
      role="complementary"
      aria-label="AI-powered insight"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} bg-blush/30 rounded-full flex items-center justify-center`}>
          <i className={`ri-sparkling-line ${compact ? 'text-[10px]' : 'text-xs'} text-primary`} />
        </div>
        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-warm-gray`}>
          {getModeLabel(context.mode)}
        </span>
        {isCached && (
          <span className="text-[9px] text-warm-gray/50 ml-auto">cached</span>
        )}
      </div>

      {/* Insight text */}
      <p className={`${compact ? 'text-xs' : 'text-sm'} text-deep leading-relaxed`}>
        {insightText}
      </p>

      {/* Environment badges */}
      {environmentBadges && <EnvironmentBadges badges={environmentBadges} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModeLabel(mode: AIMode): string {
  switch (mode) {
    case 'product_detail': return 'Personalized for you';
    case 'ingredient_detail': return 'Ingredient insight';
    case 'routine_builder': return 'Routine analysis';
    case 'search': return 'Search insight';
    case 'comparison': return 'Comparison insight';
    case 'marketplace': return 'Marketplace insight';
    case 'nutrition': return 'Nutrition insight';
    case 'chat': return 'AI response';
    case 'survey_results': return 'Your personalized roadmap';
    default: return 'AI insight';
  }
}


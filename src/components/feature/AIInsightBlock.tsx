/**
 * AIInsightBlock Component
 *
 * Compact, branded component for rendering AI-generated insights on any surface.
 * Handles loading, error, and empty states. Degrades gracefully — renders
 * nothing when there is no insight to display.
 */

import { useState, useEffect, useCallback } from 'react';
import { requestAIInsight } from '../../lib/ai/surfaceClient';
import type { AISurfaceContext, AIMode, ScoredReviewEntry } from '../../lib/ai/surfaceContext';
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
  /** Pre-computed scored reviews for mini cards (product_detail mode) */
  scoredReviews?: ScoredReviewEntry[];
  /** Environment badges (product_detail mode) */
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

function MiniReviewCard({ entry }: { entry: ScoredReviewEntry }) {
  return (
    <div className="bg-white border border-blush/40 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <img
          src={entry.review.userAvatar}
          alt={entry.review.userName}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/24?text=U'; }}
        />
        <span className="text-xs font-medium text-deep truncate">{entry.review.userName}</span>
        {entry.review.verified && (
          <i className="ri-shield-check-fill text-[10px] text-warm-gray" title="Verified buyer" />
        )}
        <div className="flex items-center ml-auto">
          {Array.from({ length: 5 }, (_, i) => (
            <i
              key={i}
              className={`text-[9px] ${
                i < entry.review.rating ? 'ri-star-fill text-amber-500' : 'ri-star-line text-amber-300'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] text-warm-gray leading-relaxed line-clamp-2">
        {entry.review.content}
      </p>
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
  scoredReviews,
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

      {/* Mini review cards (product_detail mode) */}
      {scoredReviews && scoredReviews.length > 0 && !compact && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">
            Similar profiles
          </p>
          {scoredReviews.slice(0, 3).map((entry) => (
            <MiniReviewCard key={entry.review.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {!compact && shouldShowDisclaimer(context.mode) && (
        <p className="mt-2 text-[10px] text-warm-gray/60 italic">
          This is not medical advice.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModeLabel(mode: AIMode): string {
  switch (mode) {
    case 'product_detail': return 'Personalised for you';
    case 'ingredient_detail': return 'Ingredient insight';
    case 'routine_builder': return 'Routine analysis';
    case 'search': return 'Search insight';
    case 'comparison': return 'Comparison insight';
    case 'marketplace': return 'Marketplace insight';
    case 'nutrition': return 'Nutrition insight';
    case 'chat': return 'AI response';
    case 'survey_results': return 'Your personalised roadmap';
    default: return 'AI insight';
  }
}

function shouldShowDisclaimer(mode: AIMode): boolean {
  return ['product_detail', 'ingredient_detail', 'survey_results', 'nutrition'].includes(mode);
}

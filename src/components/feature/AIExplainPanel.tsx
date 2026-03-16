/**
 * AIExplainPanel — "Why This Works for You"
 *
 * Expandable panel with AI-generated product explanation.
 * Auto-opens and auto-fetches for profiled users.
 * Guest users see a CTA to complete skin quiz.
 * Uses explainProductForUser() for the explanation.
 */

import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import type { EnvironmentContext } from '../../lib/environment/context';
import type { EvidenceBundle } from '../../lib/ai/surfaceContext';
import type { AIInsightResult } from '../../lib/ai/surfaceClient';
import { explainProductForUser } from '../../lib/ai/discoveryClient';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';
import { getEffectiveSkinType, getEffectiveConcerns, getEffectiveSensitivity } from '../../lib/utils/sessionState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIExplainPanelProps {
  product: Product;
  environment?: EnvironmentContext | null;
  evidence?: Partial<EvidenceBundle>;
  initialOpen?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIExplainPanel({
  product,
  environment,
  evidence,
  initialOpen,
}: AIExplainPanelProps) {
  const skinType = getEffectiveSkinType();
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();
  const hasProfile = !!(skinType || concerns.length > 0);

  // Auto-open for profiled users; collapsed for guests
  const defaultOpen = initialOpen ?? hasProfile;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIInsightResult | null>(null);

  const fetchExplanation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await explainProductForUser({ product, environment, evidence });
      setResult(res);
    } catch {
      setResult({ success: false, error: 'Failed to load explanation' });
    } finally {
      setLoading(false);
    }
  }, [product, environment, evidence]);

  // Auto-fetch on mount for profiled users
  useEffect(() => {
    if (defaultOpen && !result) {
      fetchExplanation();
    }
  }, []);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !result) {
      fetchExplanation();
    }
  };

  // Determine insight text
  let insightText: string | undefined;
  if (result?.success) {
    insightText = result.insight;
  } else if (result && !result.success) {
    const errResult = result as import('../../lib/ai/surfaceClient').AIInsightError;
    if (errResult.fallbackInsight) insightText = errResult.fallbackInsight;
  }

  // Build highlight profile from session state
  const hlProfile = {
    skinType,
    concerns,
    sensitivity,
    ingredients: product.keyIngredients,
    excludeNames: [product.name, product.brand],
  };

  // Profile indicator text
  const profileLabel = hasProfile
    ? [
        skinType ? `${skinType}` : '',
        concerns.length > 0 ? concerns.slice(0, 2).join(', ') : '',
      ].filter(Boolean).join(' skin with ')
    : null;

  return (
    <div
      className="bg-cream/30 border border-blush/40 rounded-xl"
      role="complementary"
      aria-label="Personalized product explanation"
    >
      {/* Header — always visible, toggles open/close */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-cream/50 rounded-xl"
      >
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <NeuralBloomIcon size={12} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-deep">
            {hasProfile ? 'Why This Works for You' : 'Explain this product for me'}
          </span>
          {hasProfile && profileLabel && !isOpen && (
            <span className="block text-[11px] text-warm-gray truncate">
              Based on your {profileLabel}
            </span>
          )}
        </div>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-warm-gray ml-auto transition-transform duration-300`} />
      </button>

      {/* Animated content area */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-4 pb-4">
          {/* Profile indicator (when open) */}
          {hasProfile && profileLabel && (
            <p className="text-[11px] text-warm-gray mb-2">
              <i className="ri-user-heart-line mr-1 text-primary/60"></i>
              Based on your {profileLabel}
              {concerns.length > 2 && ` + ${concerns.length - 2} more`}
            </p>
          )}

          {/* Guest CTA */}
          {!hasProfile && (
            <div className="flex items-center gap-2 mb-3 p-2.5 bg-cream/50 rounded-lg border border-blush/30">
              <i className="ri-sparkling-line text-primary/60 flex-shrink-0"></i>
              <p className="text-xs text-warm-gray">
                <Link to="/skin-survey" className="text-primary hover:text-dark font-medium transition-colors">
                  Complete your skin quiz
                </Link>
                {' '}to see personalized insights
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-blush/15 rounded w-full" />
              <div className="h-3 bg-blush/15 rounded w-4/5" />
              <div className="h-3 bg-blush/15 rounded w-3/5" />
            </div>
          )}

          {/* Insight text */}
          {!loading && insightText && (
            <ul className="space-y-1.5">
              {insightText
                .split(/(?<=\.)\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-xs mt-0.5 flex-shrink-0 text-primary/60" />
                    <span className="text-sm leading-relaxed text-deep">{highlightRelevantKeywords(bullet, hlProfile)}</span>
                  </li>
                ))}
            </ul>
          )}

          {/* Error state */}
          {!loading && !insightText && result && !result.success && (
            <p className="text-xs text-warm-gray">
              {(result as import('../../lib/ai/surfaceClient').AIInsightError).error || 'Unable to generate explanation right now.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

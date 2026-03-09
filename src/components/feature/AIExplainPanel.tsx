/**
 * AIExplainPanel — "Explain this product for me"
 *
 * Expandable panel with AI-generated product explanation.
 * Always beginner-friendly. Smooth open/close animation.
 * Uses explainProductForUser() for the explanation.
 * Guest users receive deterministic fallback.
 */

import { useState, useCallback } from 'react';
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
  initialOpen = false,
}: AIExplainPanelProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
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
  } else if (result && !result.success && result.fallbackInsight) {
    insightText = result.fallbackInsight;
  }

  // Build highlight profile from session state
  const hlProfile = {
    skinType: getEffectiveSkinType(),
    concerns: getEffectiveConcerns(),
    sensitivity: getEffectiveSensitivity(),
    ingredients: product.keyIngredients,
    excludeNames: [product.name, product.brand],
  };

  return (
    <div
      className="bg-cream/30 border border-blush/40 rounded-xl"
      role="complementary"
      aria-label="Product explanation"
    >
      {/* Header — always visible, toggles open/close */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-cream/50 rounded-xl"
      >
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <NeuralBloomIcon size={12} className="text-primary" />
        </div>
        <span className="text-sm font-medium text-deep">
          {isOpen ? 'Product explanation' : 'Explain this product for me'}
        </span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-warm-gray ml-auto transition-transform duration-300`} />
      </button>

      {/* Animated content area */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-4 pb-4">
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
              {result.error || 'Unable to generate explanation right now.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

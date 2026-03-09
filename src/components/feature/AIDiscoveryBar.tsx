/**
 * AIDiscoveryBar — Natural language search with AI-interpreted results
 *
 * Replaces the inline search AI context in ProductCatalog.
 * Standard text search runs immediately via onSearchChange callback.
 * On Enter, calls discoverWithAI() and displays a compact AI insight.
 * Guest users see standard search only (AI call is handled by surfaceClient).
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { Product } from '../../types/product';
import type { AIInsightResult } from '../../lib/ai/surfaceClient';
import { discoverWithAI } from '../../lib/ai/discoveryClient';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';
import { getEffectiveSkinType, getEffectiveSensitivity } from '../../lib/utils/sessionState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIDiscoveryBarProps {
  /** Callback to update search query for standard text filtering */
  onSearchChange: (query: string) => void;
  /** Full product catalog for AI scoring */
  products: Product[];
  /** Current search query (controlled input) */
  searchQuery: string;
  /** User's skin concerns — keywords are highlighted in AI insight text */
  userConcerns?: string[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIDiscoveryBar({
  onSearchChange,
  products,
  searchQuery,
  userConcerns = [],
  className = '',
}: AIDiscoveryBarProps) {
  const [aiResult, setAiResult] = useState<AIInsightResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchAIInsight = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setAiLoading(true);
    try {
      const res = await discoverWithAI({ query, products });
      setAiResult(res.insight);
    } catch {
      setAiResult({ success: false, error: 'Failed to load AI insight' });
    } finally {
      setAiLoading(false);
    }
  }, [products]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      fetchAIInsight(searchQuery);
    }
  };

  const handleChange = (value: string) => {
    onSearchChange(value);
    // Clear AI insight when input is emptied
    if (!value.trim()) {
      setAiResult(null);
    }
  };

  const handleClear = () => {
    onSearchChange('');
    setAiResult(null);
    inputRef.current?.focus();
  };

  // Determine insight text
  let insightText: string | undefined;
  if (aiResult?.success) {
    insightText = aiResult.insight;
  } else if (aiResult && !aiResult.success && aiResult.fallbackInsight) {
    insightText = aiResult.fallbackInsight;
  }

  // Build full highlight profile — excludes all product names/brands from highlighting
  const hlProfile = useMemo(() => ({
    skinType: getEffectiveSkinType(),
    concerns: userConcerns,
    sensitivity: getEffectiveSensitivity(),
    excludeNames: products.flatMap(p => [p.name, p.brand]),
  }), [userConcerns, products]);

  return (
    <div className={className}>
      {/* Search input */}
      <div className="relative max-w-2xl mx-auto">
        <label htmlFor="ai-discovery-search" className="sr-only">
          Search products
        </label>
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-warm-gray/60" />
        <input
          ref={inputRef}
          id="ai-discovery-search"
          name="search"
          type="text"
          placeholder="Search products, brands, or ingredients..."
          value={searchQuery}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full pl-12 pr-10 py-3 sm:py-4 rounded-full border-2 border-blush focus:border-primary focus:outline-none text-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray/60 hover:text-warm-gray transition-colors"
            aria-label="Clear search"
          >
            <i className="ri-close-circle-line text-lg" />
          </button>
        )}
      </div>

      {/* Hint text */}
      {searchQuery.trim() && !aiResult && !aiLoading && (
        <p className="text-center text-[10px] text-warm-gray/60 mt-1.5">
          Press Enter for AI-powered insights
        </p>
      )}

      {/* AI insight area */}
      {(aiLoading || insightText) && (
        <div className="max-w-2xl mx-auto mt-3">
          {aiLoading ? (
            <div className="bg-cream/30 border border-blush/40 rounded-xl p-3 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blush/30 rounded-full" />
                <div className="h-2.5 bg-blush/20 rounded w-24" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 bg-blush/15 rounded w-full" />
                <div className="h-2.5 bg-blush/15 rounded w-4/5" />
              </div>
            </div>
          ) : insightText ? (
            <div className="bg-cream/30 border border-blush/40 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 bg-blush/30 rounded-full flex items-center justify-center">
                  <NeuralBloomIcon size={10} className="text-primary" />
                </div>
                <span className="text-[10px] font-medium text-warm-gray">Search insight</span>
              </div>
              <p className="text-xs text-deep leading-relaxed">
                {highlightRelevantKeywords(insightText, hlProfile)}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Error state */}
      {!aiLoading && aiResult && !aiResult.success && !insightText && (
        <div className="max-w-2xl mx-auto mt-2">
          <p className="text-center text-[10px] text-warm-gray">
            {aiResult.error || 'Unable to generate insight right now.'}
          </p>
        </div>
      )}
    </div>
  );
}

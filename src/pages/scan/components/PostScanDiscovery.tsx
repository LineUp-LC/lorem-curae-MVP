/**
 * PostScanDiscovery — compatible product discovery after scanning.
 *
 * Shows category-filtered compatible products with AI WHY explanations.
 * Each product card can expand to show profile-filtered reviews + AI summary.
 *
 * Two data sources:
 * 1. Local catalog — ingredient-compatibility scored via productSimilarity.ts
 * 2. Web results — real Google Shopping products via Serper.dev API
 * Local catalog results show first, web results appended below with "Web result" badge.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ScanResult } from '../../../types/scan';
import type { Product } from '../../../types/product';
import type { CompatibleProduct } from '../../../lib/utils/productSimilarity';
import type { WebProduct } from '../../../types/webSearch';
import { findCompatibleProducts } from '../../../lib/utils/productSimilarity';
import { searchCompatibleProducts } from '../../../lib/api/productSearch';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../../../lib/utils/sessionState';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { useAuth } from '../../../lib/auth/AuthContext';
import RoutinePickerModal from '../../../components/feature/RoutinePickerModal';
import ScanReviewPanel from './ScanReviewPanel';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostScanDiscoveryProps {
  scanResult: ScanResult;
  matchedProduct?: Product;
}

type CategoryFilter = 'all' | 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'mask';

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'sunscreen', label: 'SPF' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'mask', label: 'Mask' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PostScanDiscovery({ scanResult, matchedProduct }: PostScanDiscoveryProps) {
  console.log('[PostScanDiscovery] Rendering, scanResult:', !!scanResult);
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [whyTexts, setWhyTexts] = useState<Record<number, string>>({});
  const [whyLoading, setWhyLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [expandedWhyIds, setExpandedWhyIds] = useState<Set<number>>(new Set());
  const [routineProduct, setRoutineProduct] = useState<CompatibleProduct | null>(null);
  const [webProducts, setWebProducts] = useState<WebProduct[]>([]);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState(false);
  /** Cache web results per category filter to avoid re-fetching on tab switch */
  const [webCache, setWebCache] = useState<Record<string, WebProduct[]>>({});

  const skinType = getEffectiveSkinType() ?? undefined;
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();

  // Build a pseudo-Product from scan data for compatibility checking
  const scanSourceProduct = useMemo((): Product => {
    if (matchedProduct) {
      // For matched products, augment with scanned ingredients if richer
      const scannedIngredientNames = (scanResult.ingredients || []).map(i => i.name);
      const keyIngredients = scannedIngredientNames.length > matchedProduct.keyIngredients.length
        ? scannedIngredientNames
        : matchedProduct.keyIngredients;
      return { ...matchedProduct, keyIngredients };
    }

    return {
      id: -1,
      name: scanResult.detectedProduct || 'Scanned Product',
      brand: scanResult.detectedBrand || 'Unknown',
      category: (scanResult.detectedCategory || 'treatment') as Product['category'],
      price: 0,
      rating: 0,
      reviewCount: 0,
      image: '',
      description: '',
      skinTypes: [],
      concerns: [],
      keyIngredients: (scanResult.ingredients || []).map(i => i.name),
      inStock: false,
    };
  }, [scanResult, matchedProduct]);

  // Find compatible products
  const allCompatible = useMemo(() => {
    if (scanSourceProduct.keyIngredients.length === 0) return [];
    return findCompatibleProducts(scanSourceProduct, concerns, skinType, 12);
  }, [scanSourceProduct, concerns, skinType]);

  // Filter by selected category
  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return allCompatible;
    return allCompatible.filter(p => p.category === categoryFilter);
  }, [allCompatible, categoryFilter]);

  // Fetch web products from Serper when category changes
  useEffect(() => {
    if (!user) return;

    const cacheKey = categoryFilter;
    if (webCache[cacheKey]) {
      setWebProducts(webCache[cacheKey]);
      return;
    }

    let cancelled = false;
    setWebLoading(true);
    setWebError(false);
    console.log('[WebSearch] Fetching compatible products, user:', !!user, 'category:', categoryFilter);

    searchCompatibleProducts(
      {
        name: scanSourceProduct.name,
        brand: scanSourceProduct.brand,
        category: scanSourceProduct.category,
        ingredients: scanSourceProduct.keyIngredients.slice(0, 10),
      },
      { skinType: skinType || undefined, concerns, sensitivity: sensitivity || undefined },
      categoryFilter !== 'all' ? categoryFilter : undefined,
    ).then(results => {
      if (cancelled) return;
      if (results) {
        setWebProducts(results);
        setWebCache(prev => ({ ...prev, [cacheKey]: results }));
      } else {
        setWebError(true);
        setWebProducts([]);
      }
    }).finally(() => {
      if (!cancelled) setWebLoading(false);
    });

    return () => { cancelled = true; };
  }, [categoryFilter, user, scanSourceProduct, skinType, concerns, sensitivity]);

  // Fetch AI WHY explanations (one batch call)
  const fetchWhyExplanations = useCallback(async () => {
    if (filteredProducts.length === 0 || !user) return;

    // Skip if we already have explanations for these products
    const needsFetch = filteredProducts.some(p => !whyTexts[p.id]);
    if (!needsFetch) return;

    setWhyLoading(true);

    try {
      const scannedIngredients = (scanResult.ingredients || []).map(i => i.name);
      const ctx = buildAIContext('curated_recommendation', {
        page: {
          mode: 'curated_recommendation',
          scannedProduct: {
            name: scanSourceProduct.name,
            brand: scanSourceProduct.brand,
            category: scanSourceProduct.category,
            ingredients: scannedIngredients.slice(0, 10),
          },
          compatibleProducts: filteredProducts.slice(0, 6).map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            keyIngredients: p.keyIngredients,
            matchReasons: p.compatibilityReasons,
          })),
        },
      });

      const result = await requestAIInsight(ctx);

      if (result.success) {
        // Parse per-product WHY from response: [id] explanation
        const parsed: Record<number, string> = { ...whyTexts };
        const lines = result.insight.split('\n').filter(Boolean);
        for (const line of lines) {
          const match = line.match(/^\[(\d+)\]\s*(.+)$/);
          if (match) {
            parsed[parseInt(match[1])] = match[2].trim();
          }
        }
        setWhyTexts(parsed);
      }
    } catch {
      // Silent fail — WHY tags are supplementary
    } finally {
      setWhyLoading(false);
    }
  }, [filteredProducts, user, scanResult, scanSourceProduct, whyTexts]);

  useEffect(() => {
    fetchWhyExplanations();
  }, [fetchWhyExplanations]);

  // Show section if we have local results OR web results (or web is still loading)
  if (allCompatible.length === 0 && webProducts.length === 0 && !webLoading) return null;

  const toggleWhy = (productId: number) => {
    setExpandedWhyIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId); else next.add(productId);
      return next;
    });
  };

  const compatibilityBadge = (level: CompatibleProduct['compatibilityLevel'], productId: number, hasWhy: boolean) => {
    const badgeClasses = level === 'fully-compatible'
      ? 'bg-sage/15 text-sage'
      : 'bg-cream text-warm-gray border border-blush';
    const icon = level === 'fully-compatible' ? 'ri-check-double-line' : 'ri-alert-line';
    const label = level === 'fully-compatible' ? 'Compatible' : 'Use with care';

    return (
      <div className="flex items-center gap-1">
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClasses}`}>
          <i className={`${icon} text-[10px]`} />
          {label}
        </span>
        {hasWhy && (
          <button
            onClick={(e) => { e.preventDefault(); toggleWhy(productId); }}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="relative group">
              <NeuralBloomIcon className="w-3.5 h-3.5 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] text-white bg-deep rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                AI Personalized Insight
              </span>
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <i className="ri-compass-discover-line text-primary" />
        <h3 className="text-base font-serif font-semibold text-deep">
          Find Compatible Products
        </h3>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_OPTIONS.map(opt => {
          const count = opt.value === 'all'
            ? allCompatible.length
            : allCompatible.filter(p => p.category === opt.value).length;
          if (count === 0 && opt.value !== 'all') return null;
          return (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-cream text-warm-gray border border-blush hover:bg-blush/30'
              }`}
            >
              {opt.label}
              {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Product cards */}
      <div className="space-y-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl border border-blush shadow-sm overflow-hidden">
            {/* Product row */}
            <div className="flex gap-3 p-4">
              <Link to={`/product-detail/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.image || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                      {product.brand}
                    </p>
                    <Link to={`/product-detail/${product.id}`}>
                      <h4 className="text-sm font-semibold text-deep line-clamp-1 hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                  </div>
                  {compatibilityBadge(product.compatibilityLevel, product.id, !!(whyTexts[product.id] || whyLoading))}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-warm-gray capitalize">{product.category}</span>
                  <span className="text-warm-gray/30">·</span>
                  <div className="flex items-center gap-0.5">
                    <i className="ri-star-fill text-amber-500 text-[10px]" />
                    <span className="text-[11px] text-warm-gray">{product.rating}</span>
                  </div>
                  <span className="text-warm-gray/30">·</span>
                  <span className="text-[11px] font-medium text-deep">${product.price}</span>
                </div>

                {/* Match score bar */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex-1 h-1 bg-blush/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all"
                      style={{ width: `${Math.min(product.compatibilityScore, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-warm-gray">
                    {Math.round(Math.min(product.compatibilityScore, 100))}% match
                  </span>
                </div>
              </div>
            </div>

            {/* AI WHY tag — collapsible */}
            {expandedWhyIds.has(product.id) && whyTexts[product.id] && (
              <div className="mx-4 mb-3 bg-cream/70 border border-blush/30 rounded-lg px-3 py-2">
                <p className="text-[11px] text-warm-gray leading-relaxed flex items-start gap-1.5">
                  <NeuralBloomIcon className="w-3.5 h-3.5 text-primary/50 mt-0.5 flex-shrink-0" />
                  {whyTexts[product.id]}
                </p>
              </div>
            )}
            {expandedWhyIds.has(product.id) && whyLoading && !whyTexts[product.id] && (
              <div className="mx-4 mb-3 bg-cream/30 rounded-lg px-3 py-2">
                <div className="h-3 bg-blush/40 rounded animate-pulse w-3/4" />
              </div>
            )}

            {/* Action row */}
            <div className="border-t border-blush/50 px-4 py-2 flex items-center gap-2">
              <button
                onClick={() => setExpandedProductId(
                  expandedProductId === product.id ? null : product.id
                )}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-warm-gray hover:text-primary transition-colors"
              >
                <i className={`ri-chat-smile-2-line ${expandedProductId === product.id ? 'text-primary' : ''}`} />
                {expandedProductId === product.id ? 'Hide Reviews' : 'Reviews'}
              </button>
              <div className="w-px h-4 bg-blush/50" />
              <button
                onClick={() => setRoutineProduct(product)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-warm-gray hover:text-primary transition-colors"
              >
                <i className="ri-add-circle-line" />
                Add to Routine
              </button>
            </div>

            {/* Expanded review panel */}
            {expandedProductId === product.id && (
              <ScanReviewPanel product={product} />
            )}
          </div>
        ))}
      </div>

      {/* Web results section */}
      {webProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mt-2">
            <i className="ri-global-line text-warm-gray text-sm" />
            <p className="text-xs font-medium text-warm-gray">From across the web</p>
          </div>
          {webProducts.map((wp, idx) => (
            <div key={`web-${idx}`} className="bg-white rounded-2xl border border-blush shadow-sm overflow-hidden">
              <div className="flex gap-3 p-4">
                <a href={wp.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img
                    src={wp.image || '/placeholder-product.svg'}
                    alt={wp.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                        {wp.brand}
                      </p>
                      <a href={wp.externalUrl} target="_blank" rel="noopener noreferrer">
                        <h4 className="text-sm font-semibold text-deep line-clamp-1 hover:text-primary transition-colors">
                          {wp.name}
                        </h4>
                      </a>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cream text-warm-gray border border-blush flex-shrink-0">
                      <i className="ri-global-line text-[10px]" />
                      Web result
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-warm-gray capitalize">{wp.category}</span>
                    {wp.rating > 0 && (
                      <>
                        <span className="text-warm-gray/30">·</span>
                        <div className="flex items-center gap-0.5">
                          <i className="ri-star-fill text-amber-500 text-[10px]" />
                          <span className="text-[11px] text-warm-gray">{wp.rating}</span>
                          {wp.reviewCount > 0 && (
                            <span className="text-[10px] text-warm-gray/60">({wp.reviewCount.toLocaleString()})</span>
                          )}
                        </div>
                      </>
                    )}
                    {wp.price > 0 && (
                      <>
                        <span className="text-warm-gray/30">·</span>
                        <span className="text-[11px] font-medium text-deep">${wp.price.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  {/* Merchant badge */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-warm-gray/70">
                      via {wp.merchant}
                    </span>
                    <span className="text-[10px] text-warm-gray/40">· Verify ingredients before use</span>
                  </div>
                </div>
              </div>

              {/* External link CTA */}
              <div className="border-t border-blush/50 px-4 py-2">
                <a
                  href={wp.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-primary hover:text-dark transition-colors"
                >
                  <i className="ri-external-link-line" />
                  View on {wp.merchant}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Web loading state */}
      {webLoading && (
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2">
            <i className="ri-global-line text-warm-gray text-sm animate-pulse" />
            <p className="text-xs text-warm-gray">Searching the web for compatible products...</p>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-blush shadow-sm p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-blush/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-blush/40 rounded w-1/4" />
                  <div className="h-4 bg-blush/40 rounded w-3/4" />
                  <div className="h-3 bg-blush/40 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Web error — subtle, non-blocking */}
      {webError && !webLoading && (
        <p className="text-xs text-warm-gray/60 text-center mt-2">
          Web search unavailable — showing results from our catalog
        </p>
      )}

      {filteredProducts.length === 0 && webProducts.length === 0 && !webLoading && (
        <div className="text-center py-6">
          <p className="text-sm text-warm-gray">
            No compatible products found in this category
          </p>
        </div>
      )}

      {/* Routine picker modal */}
      {routineProduct && (
        <RoutinePickerModal
          isOpen={!!routineProduct}
          onClose={() => setRoutineProduct(null)}
          product={{
            id: routineProduct.id,
            name: routineProduct.name,
            brand: routineProduct.brand,
            image: routineProduct.image,
            category: routineProduct.category,
          }}
        />
      )}
    </div>
  );
}

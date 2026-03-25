/**
 * ScanResultView — tabbed result display after product scan.
 *
 * Shows:
 * 1. Product identification card (always)
 * 2. "Is It For Me?" collapsible AI block
 * 3. Three lazy-loaded tabs: Breakdown, Compatible, Similar
 *
 * All tab content is fetched on first tap and cached in component state.
 */

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import type { ScanResult, ParsedIngredient } from '../../../types/scan';
import type { Product } from '../../../types/product';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../../../lib/utils/sessionState';
import { savedProductsState } from '../../../lib/utils/favoritesState';
import { getLocalRoutines } from '../../../lib/utils/routineState';
import { onAction } from '../../../lib/utils/gamificationTriggers';
import { useAuth } from '../../../lib/auth/AuthContext';
import { scanProductFull } from '../../../lib/ai/scanClient';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { searchSimilarProducts, searchCompatibleProducts, searchProductReviews } from '../../../lib/api/productSearch';
import { fetchReviewsForProduct } from '../../../lib/data/reviews';
import { getReviewsForProduct } from '../../../mocks/reviews';
import { calculateSimilarityWeight } from '../../../lib/utils/reviewSimilarity';
import { useEnvironmentContext } from '../../../lib/environment/useEnvironmentContext';
import type { WebProduct } from '../../../types/webSearch';
import RoutinePickerModal from '../../../components/feature/RoutinePickerModal';
import WhereToBuySheet from '../../../components/feature/WhereToBuySheet';
import PersonalizingLoader from '../../../components/feature/PersonalizingLoader';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

// Lazy-loaded tab content
const PostScanDiscovery = lazy(() => import('./PostScanDiscovery'));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanResultViewProps {
  result: ScanResult;
  previewUrl: string;
  matchedProduct?: Product;
  imageBase64?: string;
  /** Pre-cached full scan result from scan history */
  initialFullScanResult?: ScanResult;
  onScanAnother: () => void;
  /** Called after a full scan completes so parent can cache it in history */
  onFullScanComplete?: (result: ScanResult) => void;
}

type TabId = 'breakdown' | 'compatible' | 'similar';

// ---------------------------------------------------------------------------
// Safety badge
// ---------------------------------------------------------------------------

function SafetyBadge({ tier }: { tier: ParsedIngredient['safetyTier'] }) {
  const config = {
    safe: { label: 'Safe', classes: 'bg-sage/15 text-sage', icon: 'ri-shield-check-line' },
    caution: { label: 'Caution', classes: 'bg-cream text-warm-gray border border-blush', icon: 'ri-alert-line' },
    avoid: { label: 'Avoid', classes: 'bg-cream text-deep border border-primary/30', icon: 'ri-close-circle-line' },
  }[tier];

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.classes}`}>
      <i className={`${config.icon} text-[10px]`} />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Ingredient card
// ---------------------------------------------------------------------------

function IngredientCard({
  ing,
  globalIdx,
  expandedCautions,
  toggleCaution,
}: {
  ing: ParsedIngredient;
  globalIdx: number;
  expandedCautions: Set<number>;
  toggleCaution: (idx: number) => void;
}) {
  const hasCaution = !!(ing.cautionReason && (ing.safetyTier === 'caution' || ing.safetyTier === 'avoid'));
  const isCautionOpen = expandedCautions.has(globalIdx);

  return (
    <div className="bg-cream/50 border border-blush/30 rounded-lg px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-deep leading-tight">
          {ing.name}
        </span>
        <div className="flex items-center gap-1">
          {hasCaution && (
            <button
              onClick={() => toggleCaution(globalIdx)}
              className="inline-flex items-center gap-0.5 text-primary/50 hover:text-primary transition-colors"
            >
              <span className="relative group">
                <NeuralBloomIcon className="w-3.5 h-3.5 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] text-white bg-deep rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  AI Safety Analysis
                </span>
              </span>
              <i className={`ri-arrow-${isCautionOpen ? 'up' : 'down'}-s-line text-[9px]`} />
            </button>
          )}
          <SafetyBadge tier={ing.safetyTier} />
        </div>
      </div>
      <p className="text-[11px] text-warm-gray mt-0.5 leading-relaxed">
        {ing.function}
      </p>
      {ing.relevance && (
        <p className="text-[11px] text-primary/80 mt-0.5 flex items-start gap-1">
          <i className="ri-user-heart-line text-[10px] mt-0.5 flex-shrink-0" />
          {ing.relevance}
        </p>
      )}
      {hasCaution && isCautionOpen && (
        <div className={`mt-1.5 px-2 py-1.5 rounded-lg border ${
          ing.safetyTier === 'avoid'
            ? 'bg-cream border-primary/30'
            : 'bg-cream border-blush'
        }`}>
          <p className={`text-[11px] leading-relaxed flex items-start gap-1 ${
            ing.safetyTier === 'avoid' ? 'text-deep' : 'text-warm-gray'
          }`}>
            <i className={`${ing.safetyTier === 'avoid' ? 'ri-close-circle-line text-primary' : 'ri-alert-line text-primary/60'} text-[11px] mt-0.5 flex-shrink-0`} />
            <span>{ing.cautionReason}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ingredient breakdown
// ---------------------------------------------------------------------------

function IngredientBreakdown({ ingredients, truncated }: { ingredients: ParsedIngredient[]; truncated?: boolean }) {
  const [viewState, setViewState] = useState<'collapsed' | 'preview' | 'expanded'>('preview');
  const [expandedCautions, setExpandedCautions] = useState<Set<number>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, { ing: ParsedIngredient; globalIdx: number }[]>();
    ingredients.forEach((ing, i) => {
      const cat = ing.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ ing, globalIdx: i });
    });
    return Array.from(map.entries());
  }, [ingredients]);

  if (ingredients.length === 0) return null;

  const PREVIEW_CATEGORY_COUNT = 3;
  const hasMoreCategories = grouped.length > PREVIEW_CATEGORY_COUNT;

  const visibleGroups =
    viewState === 'collapsed' ? [] :
    viewState === 'preview' ? grouped.slice(0, PREVIEW_CATEGORY_COUNT) :
    grouped;

  const toggleCaution = (idx: number) => {
    setExpandedCautions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setViewState(prev => prev === 'collapsed' ? 'preview' : 'collapsed')}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-sm font-serif font-semibold text-deep flex items-center gap-1.5">
          <i className="ri-flask-line text-primary/60" />
          Ingredient Breakdown ({ingredients.length})
        </span>
        <i className={`ri-arrow-${viewState !== 'collapsed' ? 'up' : 'down'}-s-line text-warm-gray`} />
      </button>

      {viewState !== 'collapsed' && (
        <>
          <div className="space-y-3">
            {visibleGroups.map(([category, items]) => {
              const isCatCollapsed = collapsedCategories.has(category);
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full mb-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {category}
                      </span>
                      <span className="text-[10px] text-warm-gray/60">
                        ({items.length})
                      </span>
                    </span>
                    <i className={`ri-arrow-${isCatCollapsed ? 'down' : 'up'}-s-line text-warm-gray/40 text-xs`} />
                  </button>
                  {!isCatCollapsed && (
                    <div className="space-y-1.5">
                      {items.map(({ ing, globalIdx }) => (
                        <IngredientCard
                          key={globalIdx}
                          ing={ing}
                          globalIdx={globalIdx}
                          expandedCautions={expandedCautions}
                          toggleCaution={toggleCaution}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMoreCategories && viewState === 'preview' && (
            <>
              <div className="mt-2 flex flex-wrap gap-1">
                {grouped.slice(PREVIEW_CATEGORY_COUNT).map(([cat, items]) => (
                  <span key={cat} className="px-2 py-0.5 rounded-full bg-blush/40 text-[10px] text-warm-gray">
                    {cat} ({items.length})
                  </span>
                ))}
              </div>
              <button
                onClick={() => setViewState('expanded')}
                className="mt-2 text-xs text-primary hover:text-dark transition-colors w-full text-center"
              >
                Show all {ingredients.length} ingredients
              </button>
            </>
          )}
          {hasMoreCategories && viewState === 'expanded' && (
            <button
              onClick={() => setViewState('preview')}
              className="mt-2 text-xs text-primary hover:text-dark transition-colors w-full text-center"
            >
              Show less
            </button>
          )}

          {truncated && (
            <p className="text-[11px] text-warm-gray/60 mt-2 flex items-center gap-1">
              <i className="ri-information-line" />
              Some ingredients may not be shown — try scanning the ingredient list more closely
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Similar product card (web results only)
// ---------------------------------------------------------------------------

function SimilarProductCard({ product, onWhereToBuy }: { product: WebProduct; onWhereToBuy: (p: WebProduct) => void }) {
  return (
    <div className="bg-cream/50 border border-blush/30 rounded-xl hover:border-blush transition-colors overflow-hidden">
      <a
        href={product.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 p-3"
      >
        <img
          src={product.image || '/placeholder-product.svg'}
          alt={product.name}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
            {product.brand}
          </p>
          <p className="text-xs font-medium text-deep line-clamp-1 mt-0.5">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <i className="ri-star-fill text-amber-500 text-[10px]" />
                <span className="text-[10px] text-warm-gray">{product.rating}</span>
              </div>
            )}
            {product.price > 0 && (
              <span className="text-[10px] font-medium text-deep">${product.price.toFixed(2)}</span>
            )}
            <span className="text-[10px] text-warm-gray/60">via {product.merchant}</span>
          </div>
        </div>
        <i className="ri-external-link-line text-warm-gray/40 text-sm self-center flex-shrink-0" />
      </a>
      <div className="border-t border-blush/20 px-3 py-1.5 flex justify-end">
        <button
          onClick={() => onWhereToBuy(product)}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <i className="ri-shopping-bag-line" />
          Where to Buy
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Is It For Me?" verdict renderer
// ---------------------------------------------------------------------------

type VerdictLevel = 'great' | 'good' | 'not';

function parseVerdict(text: string): { level: VerdictLevel; headline: string; bullets: string[]; tip: string | null } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { level: 'good', headline: text, bullets: [], tip: null };

  const firstLine = lines[0].toLowerCase();
  let level: VerdictLevel = 'good';
  if (firstLine.includes('great fit')) level = 'great';
  else if (firstLine.includes('not the best') || firstLine.includes('not recommended')) level = 'not';
  else if (firstLine.includes('good fit') || firstLine.includes('maybe') || firstLine.includes('precaution')) level = 'good';

  const headline = lines[0];
  const bullets: string[] = [];
  let tip: string | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      bullets.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (i === lines.length - 1 && (line.toLowerCase().startsWith('start') || line.toLowerCase().startsWith('apply') || line.toLowerCase().startsWith('use') || line.toLowerCase().startsWith('tip'))) {
      tip = line;
    } else {
      bullets.push(line);
    }
  }

  return { level, headline, bullets, tip };
}

const VERDICT_CONFIG: Record<VerdictLevel, { icon: string; iconColor: string; bgColor: string; borderColor: string }> = {
  great: { icon: 'ri-check-line', iconColor: 'text-sage', bgColor: 'bg-sage/10', borderColor: 'border-sage/30' },
  good: { icon: 'ri-alert-line', iconColor: 'text-primary', bgColor: 'bg-primary/5', borderColor: 'border-primary/20' },
  not: { icon: 'ri-close-circle-line', iconColor: 'text-warm-gray', bgColor: 'bg-warm-gray/5', borderColor: 'border-warm-gray/20' },
};

function IsItForMeVerdict({ text }: { text: string }) {
  const { level, headline, bullets, tip } = parseVerdict(text);
  const config = VERDICT_CONFIG[level];

  return (
    <div className="space-y-3">
      {/* Verdict header */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <i className={`${config.icon} text-base ${config.iconColor}`} />
        <span className="text-sm font-serif font-semibold text-deep">{headline}</span>
      </div>

      {/* Evidence bullets */}
      {bullets.length > 0 && (
        <ul className="space-y-1.5 px-1">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-warm-gray leading-relaxed">
              <span className="text-primary/40 mt-0.5 flex-shrink-0">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Practical tip */}
      {tip && (
        <div className="flex items-start gap-1.5 px-1 pt-1 border-t border-blush/20">
          <i className="ri-lightbulb-line text-primary/50 text-xs mt-0.5 flex-shrink-0" />
          <span className="text-[11px] text-primary/70 leading-relaxed">{tip}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ScanResultView({
  result,
  previewUrl,
  matchedProduct,
  imageBase64,
  initialFullScanResult,
  onScanAnother,
  onFullScanComplete,
}: ScanResultViewProps) {
  const { user } = useAuth();
  const skinType = getEffectiveSkinType();
  const { env: environmentCtx } = useEnvironmentContext();
  const [savedToShelf, setSavedToShelf] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);

  // "Is It For Me?" state
  const [isItForMeOpen, setIsItForMeOpen] = useState(false);
  const [isItForMeText, setIsItForMeText] = useState<string | null>(null);
  const [isItForMeLoading, setIsItForMeLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  // Tab 1 (Breakdown) cache — pre-populated from history if available
  const [fullScanResult, setFullScanResult] = useState<ScanResult | null>(initialFullScanResult ?? null);
  const [fullScanLoading, setFullScanLoading] = useState(false);
  const [fullScanError, setFullScanError] = useState<string | null>(null);

  // Tab 3 (Similar) cache
  const [similarProducts, setSimilarProducts] = useState<WebProduct[] | null>(null);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState(false);

  // Where to Buy sheet
  const [wtbProduct, setWtbProduct] = useState<WebProduct | null>(null);

  // Pre-fetch: warm session cache for compatible + similar products on result render
  const preFetchedRef = useRef(false);
  useEffect(() => {
    if (preFetchedRef.current || !user) return;
    preFetchedRef.current = true;

    const sourceProduct = matchedProduct || (result.detectedProduct ? {
      name: result.detectedProduct,
      brand: result.detectedBrand || 'Unknown',
      category: (result.detectedCategory || 'treatment') as string,
    } : null);
    if (!sourceProduct) return;

    const skinType = getEffectiveSkinType();
    const concerns = getEffectiveConcerns();
    const sensitivity = getEffectiveSensitivity();

    // Fire-and-forget: populates productSearch session cache
    searchCompatibleProducts(
      { name: sourceProduct.name, brand: sourceProduct.brand, category: sourceProduct.category },
      { skinType: skinType || undefined, concerns, sensitivity: sensitivity || undefined },
    ).catch(() => {});

    searchSimilarProducts(
      { name: sourceProduct.name, brand: sourceProduct.brand, category: sourceProduct.category },
    ).catch(() => {});
  }, [user, result, matchedProduct]);

  // Build product-like object for shelf/routine
  const shelfProduct = matchedProduct
    ? {
        id: matchedProduct.id,
        name: matchedProduct.name,
        brand: matchedProduct.brand,
        image: matchedProduct.image || previewUrl,
        category: matchedProduct.category,
        skinTypes: matchedProduct.skinTypes,
      }
    : result.detectedProduct
      ? {
          id: -(Date.now() % 1_000_000),
          name: result.detectedProduct,
          brand: result.detectedBrand || 'Unknown',
          image: previewUrl,
          category: result.detectedCategory,
        }
      : null;

  const handleAddToShelf = () => {
    if (!shelfProduct || savedToShelf) return;
    savedProductsState.addSavedProduct(shelfProduct);
    onAction(user?.id, 'PRODUCT_SAVED').catch(() => {});
    setSavedToShelf(true);
  };

  // "Is It For Me?" handler — gathers full user context + review data
  const handleIsItForMe = async () => {
    setIsItForMeOpen(prev => !prev);
    if (isItForMeText !== null) return; // already fetched

    const product = matchedProduct || buildTempProduct();
    if (!product) return;

    setIsItForMeLoading(true);
    try {
      // Gather shelf products
      const shelfProducts = savedProductsState.getSavedProducts().map(sp => ({
        name: sp.name,
        brand: sp.brand,
        category: sp.category || 'unknown',
        keyIngredients: [] as string[],
      }));

      // Gather routine products
      const routines = getLocalRoutines();
      const routineProducts = routines.flatMap(r =>
        r.steps.filter(s => s.product).map(s => ({
          name: s.product!.name,
          category: s.product!.category || 'unknown',
          timeOfDay: s.timeOfDay || r.timeOfDay,
        }))
      );

      // Gather scanned ingredients (from full scan or initial result)
      const scannedIngredients = (fullScanResult?.ingredients || result.ingredients || []).map(i => ({
        name: i.name,
        safetyTier: i.safetyTier,
        category: i.category,
      }));

      // Fetch review data for catalog matches
      let reviewStats: { totalMatching: number; avgRating: number; positivePercent: number; commonPros: string[]; commonCons: string[] } | undefined;
      if (matchedProduct) {
        const userSkinType = skinType || '';
        const userConcerns = getEffectiveConcerns();
        const userSensitivity = getEffectiveSensitivity();

        const [supaReviews, mockReviews] = await Promise.all([
          fetchReviewsForProduct(matchedProduct.id).catch(() => []),
          Promise.resolve(getReviewsForProduct(matchedProduct.id)),
        ]);

        // Merge and dedupe reviews
        const allReviews = [...supaReviews];
        const existingIds = new Set(allReviews.map(r => r.id));
        for (const mr of mockReviews) {
          if (!existingIds.has(mr.id)) allReviews.push(mr as any);
        }

        if (allReviews.length > 0 && userSkinType) {
          // Score by similarity and collect stats
          const scored = allReviews
            .map(r => ({
              review: r,
              sim: calculateSimilarityWeight(
                { skinType: (r as any).skin_type || (r as any).skinType || '', skinConcerns: (r as any).skin_concerns || (r as any).skinConcerns || [], age: (r as any).age || 30 },
                { skinType: userSkinType, primaryConcerns: userConcerns, sensitivity: userSensitivity, complexion: '', lifestyle: [], age: 0 },
              ),
            }))
            .filter(s => s.sim.score >= 30);

          if (scored.length > 0) {
            const ratings = scored.map(s => (s.review as any).rating ?? 0);
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            const positiveCount = ratings.filter(r => r >= 4).length;

            // Collect pros/cons
            const prosMap: Record<string, number> = {};
            const consMap: Record<string, number> = {};
            scored.forEach(s => {
              ((s.review as any).pros || []).forEach((p: string) => { prosMap[p] = (prosMap[p] || 0) + 1; });
              ((s.review as any).cons || []).forEach((c: string) => { consMap[c] = (consMap[c] || 0) + 1; });
            });

            reviewStats = {
              totalMatching: scored.length,
              avgRating,
              positivePercent: Math.round((positiveCount / scored.length) * 100),
              commonPros: Object.entries(prosMap).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k),
              commonCons: Object.entries(consMap).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k),
            };
          }
        }
      }

      // Fetch web reviews for additional evidence (non-blocking — use whatever arrives)
      let webReviewData: { totalResults: number; avgRating?: number; topSnippets: string[]; sourceDomains: string[] } | undefined;
      try {
        const webReviews = await searchProductReviews(
          product.name,
          product.brand,
          { skinType: skinType || undefined, concerns: getEffectiveConcerns(), sensitivity: getEffectiveSensitivity() || undefined },
        );
        if (webReviews && webReviews.length > 0) {
          const ratings = webReviews.filter(r => r.extractedRating).map(r => r.extractedRating!);
          webReviewData = {
            totalResults: webReviews.length,
            avgRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined,
            topSnippets: webReviews.slice(0, 3).map(r => r.content),
            sourceDomains: [...new Set(webReviews.map(r => r.sourceDomain))],
          };
        }
      } catch {
        // Web reviews are supplementary — don't block the verdict
      }

      const ctx = buildAIContext('is_it_for_me', {
        page: {
          mode: 'is_it_for_me',
          product,
          scannedIngredients,
          shelfProducts,
          routineProducts,
          reviewStats,
          webReviewData,
        },
        environment: environmentCtx,
      });

      const minDisplay = new Promise(r => setTimeout(r, 800));
      const [res] = await Promise.all([requestAIInsight(ctx), minDisplay]);
      if (res.success) {
        setIsItForMeText(res.insight);
      } else {
        setIsItForMeText('fallbackInsight' in res && res.fallbackInsight ? res.fallbackInsight : 'Unable to analyze right now. Try again later.');
      }
    } catch {
      setIsItForMeText('Unable to analyze right now. Try again later.');
    } finally {
      setIsItForMeLoading(false);
    }
  };

  // Build a temporary Product for AI context when no catalog match
  const buildTempProduct = (): Product | null => {
    if (!result.detectedProduct) return null;
    return {
      id: -(Date.now() % 1_000_000),
      name: result.detectedProduct,
      brand: result.detectedBrand || 'Unknown',
      description: '',
      category: (result.detectedCategory || 'treatment') as Product['category'],
      image: previewUrl,
      rating: 0,
      reviewCount: 0,
      price: 0,
      inStock: true,
      skinTypes: [],
      concerns: [],
      keyIngredients: (result.ingredients || []).map(i => i.name),
      timeOfDay: [],
    } as Product;
  };

  // Tab handler
  const handleTabTap = async (tab: TabId) => {
    // Toggle off if already active
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    setActiveTab(tab);

    // Tab 1 & 2 both need full scan data — fetch on first tap of either
    if ((tab === 'breakdown' || tab === 'compatible') && !fullScanResult && !fullScanLoading) {
      if (!imageBase64) {
        setFullScanError('no_image');
        return;
      }
      setFullScanLoading(true);
      setFullScanError(null);
      const minDisplay = new Promise(r => setTimeout(r, 800));
      const [res] = await Promise.all([scanProductFull(imageBase64), minDisplay]);
      if (res.success) {
        setFullScanResult(res.result);
        onFullScanComplete?.(res.result);
      } else if (!res.success) {
        setFullScanError((res as { error: string }).error);
      }
      setFullScanLoading(false);
    }

    // Tab 3: Similar — web search only
    if (tab === 'similar' && !similarProducts && !similarError) {
      const sourceProduct = matchedProduct || buildTempProduct();
      if (sourceProduct && user) {
        setSimilarLoading(true);
        const minDisplay = new Promise(r => setTimeout(r, 800));
        Promise.all([
          searchSimilarProducts({
            name: sourceProduct.name,
            brand: sourceProduct.brand,
            category: sourceProduct.category,
          }),
          minDisplay,
        ]).then(([results]) => {
          if (results) {
            setSimilarProducts(results);
          } else {
            setSimilarError(true);
          }
        }).catch(() => {
          setSimilarError(true);
        }).finally(() => setSimilarLoading(false));
      } else {
        setSimilarProducts([]);
      }
    }
  };

  // Determine if product was identified
  const isIdentified = !!(result.detectedProduct || result.detectedBrand);
  const isLowConfidenceBlank = result.confidence === 'low' && !result.detectedProduct && !result.detectedBrand;

  // Non-identified products get early return — no tabs
  if (!isIdentified) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center">
          <i className="ri-search-eye-line text-2xl text-warm-gray" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-serif font-semibold text-deep">
            {result.upc ? 'UPC Not Recognized' : 'Could Not Identify'}
          </h2>
          <p className="text-sm text-warm-gray">
            {result.upc
              ? `UPC: ${result.upc}`
              : 'Try a clearer photo of the product label'}
          </p>
        </div>

        {isLowConfidenceBlank && (
          <div className="bg-cream/50 border border-blush/30 rounded-xl p-4 max-w-xs">
            <p className="text-xs font-medium text-deep mb-2">Tips for a better scan</p>
            <ul className="space-y-1">
              {[
                'Hold the camera closer to the product label',
                'Use good lighting — avoid shadows on the text',
                'Make sure the brand name is visible',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-warm-gray">
                  <i className="ri-lightbulb-line text-primary/50 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onScanAnother}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors"
        >
          <i className="ri-camera-line" />
          Scan another product
        </button>
      </div>
    );
  }

  // Merge data for Tab 2: use fullScanResult if available, otherwise fall back to initial result
  const effectiveResult = fullScanResult
    ? { ...result, ingredients: fullScanResult.ingredients, ingredientCount: fullScanResult.ingredientCount, ingredientsTruncated: fullScanResult.ingredientsTruncated }
    : result;

  // ---------------------------------------------------------------------------
  // Identified product — unified layout
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Success header */}
      <div className="w-14 h-14 bg-sage/15 rounded-full flex items-center justify-center">
        <i className="ri-check-line text-2xl text-sage" />
      </div>

      <div className="text-center">
        <h2 className="text-lg font-serif font-semibold text-deep">
          Product Identified
        </h2>
      </div>

      {/* Product card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-blush shadow-md overflow-hidden">
        <div className="flex gap-4 p-4">
          {matchedProduct ? (
            <img
              src={matchedProduct.image || '/placeholder-product.svg'}
              alt={matchedProduct.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
            />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Scanned product"
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
              <i className={`${result.upc ? 'ri-barcode-line' : 'ri-camera-line'} text-2xl text-primary/40`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              {matchedProduct?.brand || result.detectedBrand}
            </p>
            <h3 className="text-sm font-semibold text-deep line-clamp-2 mt-0.5">
              {matchedProduct?.name || result.detectedProduct}
            </h3>
            <p className="text-xs text-warm-gray mt-1 capitalize">
              {matchedProduct?.category || result.detectedCategory}
            </p>
            {matchedProduct && (
              <div className="flex items-center gap-1 mt-1">
                <i className="ri-star-fill text-amber-500 text-xs" />
                <span className="text-xs font-medium text-warm-gray">{matchedProduct.rating}</span>
                <span className="text-xs text-warm-gray/70">({matchedProduct.reviewCount})</span>
              </div>
            )}
            {result.upc && (
              <p className="text-[10px] text-warm-gray/60 font-mono mt-1">
                UPC: {result.upc}
              </p>
            )}
          </div>
        </div>

        {/* Personalization note */}
        {skinType && matchedProduct?.skinTypes?.some(
          st => st.toLowerCase() === skinType.toLowerCase() || st.toLowerCase() === 'all'
        ) && (
          <div className="px-4 pb-3">
            <p className="text-[11px] text-primary/70 flex items-center gap-1">
              <i className="ri-check-line" />
              Suitable for {skinType} skin
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="border-t border-blush px-4 py-3 space-y-2">
          {matchedProduct && (
            <Link
              to={`/product-detail/${matchedProduct.id}`}
              className="block w-full text-center py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
            >
              View Product Details
            </Link>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddToShelf}
              disabled={savedToShelf}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
                savedToShelf
                  ? 'bg-sage/10 text-sage border-sage/30'
                  : 'bg-cream text-warm-gray border-blush hover:bg-blush/30'
              }`}
            >
              <i className={savedToShelf ? 'ri-check-line' : 'ri-bookmark-line'} />
              {savedToShelf ? 'Saved' : 'Add to Shelf'}
            </button>
            <button
              onClick={() => setRoutineModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl border border-blush bg-cream text-warm-gray hover:bg-blush/30 transition-colors"
            >
              <i className="ri-add-circle-line" />
              Add to Routine
            </button>
          </div>
        </div>
      </div>

      {/* "Is It For Me?" block */}
      <div className="w-full max-w-sm">
        <button
          onClick={handleIsItForMe}
          className="flex items-center justify-between w-full px-4 py-3 bg-cream/80 border border-blush/50 rounded-xl hover:bg-cream transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-deep">
            <NeuralBloomIcon className="w-4 h-4 text-primary" />
            Is It For Me?
          </span>
          <i className={`ri-arrow-${isItForMeOpen ? 'up' : 'down'}-s-line text-warm-gray`} />
        </button>
        {isItForMeOpen && (
          <div className="mt-2 px-4 py-3 bg-cream/50 border border-blush/30 rounded-xl">
            {isItForMeLoading ? (
              <PersonalizingLoader
                steps={['Analyzing for your skin profile...', 'Checking ingredient compatibility...', 'Personalizing recommendation...']}
              />
            ) : isItForMeText ? (
              <IsItForMeVerdict text={isItForMeText} />
            ) : (
              <p className="text-xs text-warm-gray/60">Sign in and complete your skin profile for personalized analysis.</p>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="w-full max-w-sm flex gap-1.5">
        {([
          { id: 'breakdown' as TabId, label: 'Breakdown', icon: 'ri-flask-line' },
          { id: 'compatible' as TabId, label: 'Compatible', icon: 'ri-links-line' },
          { id: 'similar' as TabId, label: 'Similar', icon: 'ri-group-line' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabTap(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium rounded-xl border transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white border-primary'
                : 'bg-cream text-warm-gray border-blush hover:bg-blush/30'
            }`}
          >
            <i className={`${tab.icon} text-sm`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab && (
        <div className="w-full max-w-sm">
          {/* Tab 1: Breakdown */}
          {activeTab === 'breakdown' && (
            <>
              {fullScanLoading && (
                <PersonalizingLoader
                  steps={['Scanning full ingredient list...', 'Categorizing ingredients...', 'Scoring safety for your skin...']}
                />
              )}
              {fullScanError && !fullScanLoading && fullScanError !== 'no_image' && (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">{fullScanError}</p>
                </div>
              )}
              {fullScanError === 'no_image' && !fullScanLoading && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center mx-auto">
                    <i className="ri-camera-line text-lg text-warm-gray" />
                  </div>
                  <p className="text-xs text-warm-gray">
                    Scan this product again for full analysis
                  </p>
                  <button
                    onClick={onScanAnother}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <i className="ri-camera-line" />
                    Rescan product
                  </button>
                </div>
              )}
              {fullScanResult && !fullScanLoading && (
                <>
                  {fullScanResult.ingredients && fullScanResult.ingredients.length > 0 ? (
                    <IngredientBreakdown
                      ingredients={fullScanResult.ingredients}
                      truncated={fullScanResult.ingredientsTruncated}
                    />
                  ) : (
                    <p className="text-xs text-warm-gray text-center py-4">
                      No ingredients detected in this scan.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* Tab 2: Compatible */}
          {activeTab === 'compatible' && (
            <>
              {fullScanLoading && (
                <PersonalizingLoader
                  steps={['Scanning full ingredient list...', 'Finding compatible products...']}
                />
              )}
              {fullScanError && !fullScanLoading && fullScanError !== 'no_image' && (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">{fullScanError}</p>
                </div>
              )}
              {fullScanResult && !fullScanLoading && (
                <Suspense fallback={
                  <PersonalizingLoader
                    steps={['Loading compatible products...']}
                    icon="search"
                  />
                }>
                  <PostScanDiscovery
                    scanResult={effectiveResult}
                    matchedProduct={matchedProduct}
                  />
                </Suspense>
              )}
              {!fullScanResult && !fullScanLoading && (fullScanError === 'no_image' || !imageBase64) && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center mx-auto">
                    <i className="ri-camera-line text-lg text-warm-gray" />
                  </div>
                  <p className="text-xs text-warm-gray">
                    Scan this product again for full analysis
                  </p>
                  <button
                    onClick={onScanAnother}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <i className="ri-camera-line" />
                    Rescan product
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tab 3: Similar */}
          {activeTab === 'similar' && (
            <>
              {similarLoading ? (
                <PersonalizingLoader
                  steps={['Searching for alternatives...', 'Comparing formulations...']}
                  icon="search"
                />
              ) : similarError ? (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">Web search unavailable. Try again later.</p>
                  <button
                    onClick={() => { setSimilarError(false); setSimilarProducts(null); handleTabTap('similar'); }}
                    className="mt-2 text-xs text-primary hover:text-dark transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : similarProducts === null ? (
                <PersonalizingLoader
                  steps={['Searching for alternatives...', 'Comparing formulations...']}
                  icon="search"
                />
              ) : similarProducts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">No similar products found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {similarProducts.map((p, idx) => (
                    <SimilarProductCard key={`sim-${idx}`} product={p} onWhereToBuy={setWtbProduct} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Scan another */}
      <button
        onClick={onScanAnother}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors"
      >
        <i className="ri-camera-line" />
        Scan another product
      </button>

      {/* Routine picker modal */}
      {shelfProduct && (
        <RoutinePickerModal
          isOpen={routineModalOpen}
          onClose={() => setRoutineModalOpen(false)}
          product={shelfProduct}
        />
      )}

      {/* Where to Buy sheet */}
      {wtbProduct && (
        <WhereToBuySheet
          isOpen={!!wtbProduct}
          onClose={() => setWtbProduct(null)}
          targetProduct={wtbProduct}
          allWebProducts={similarProducts || []}
          productName={wtbProduct.name}
          productBrand={wtbProduct.brand}
          wasScanned
        />
      )}
    </div>
  );
}

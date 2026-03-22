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

import { useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import type { ScanResult, ParsedIngredient } from '../../../types/scan';
import type { Product } from '../../../types/product';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectivePreferences,
} from '../../../lib/utils/sessionState';
import { savedProductsState } from '../../../lib/utils/favoritesState';
import { onAction } from '../../../lib/utils/gamificationTriggers';
import { useAuth } from '../../../lib/auth/AuthContext';
import { scanProductFull } from '../../../lib/ai/scanClient';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { scoreSimilarProducts } from '../../../lib/utils/productSimilarity';
import type { ScoredProduct } from '../../../lib/utils/productSimilarity';
import RoutinePickerModal from '../../../components/feature/RoutinePickerModal';
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
  onScanAnother: () => void;
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
// Similar product card (inline — no separate file needed)
// ---------------------------------------------------------------------------

function SimilarProductCard({ product }: { product: ScoredProduct }) {
  return (
    <Link
      to={`/product-detail/${product.id}`}
      className="flex gap-3 p-3 bg-cream/50 border border-blush/30 rounded-xl hover:border-blush transition-colors"
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
        <div className="flex items-center gap-1 mt-1">
          <i className="ri-star-fill text-amber-500 text-[10px]" />
          <span className="text-[10px] text-warm-gray">{product.rating}</span>
        </div>
        {product.matchReasons.length > 0 && (
          <p className="text-[10px] text-warm-gray/70 mt-0.5 line-clamp-1">
            {product.matchReasons[0]}
          </p>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Tab spinner
// ---------------------------------------------------------------------------

function TabSpinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
  onScanAnother,
}: ScanResultViewProps) {
  const { user } = useAuth();
  const skinType = getEffectiveSkinType();
  const [savedToShelf, setSavedToShelf] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);

  // "Is It For Me?" state
  const [isItForMeOpen, setIsItForMeOpen] = useState(false);
  const [isItForMeText, setIsItForMeText] = useState<string | null>(null);
  const [isItForMeLoading, setIsItForMeLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  // Tab 1 (Breakdown) cache
  const [fullScanResult, setFullScanResult] = useState<ScanResult | null>(null);
  const [fullScanLoading, setFullScanLoading] = useState(false);
  const [fullScanError, setFullScanError] = useState<string | null>(null);

  // Tab 3 (Similar) cache
  const [similarProducts, setSimilarProducts] = useState<ScoredProduct[] | null>(null);

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

  // "Is It For Me?" handler
  const handleIsItForMe = async () => {
    setIsItForMeOpen(prev => !prev);
    if (isItForMeText !== null) return; // already fetched

    const product = matchedProduct || buildTempProduct();
    if (!product) return;

    setIsItForMeLoading(true);
    try {
      const ctx = buildAIContext('explain_product', {
        page: { mode: 'explain_product', product, question: 'Is this product right for my skin?' },
      });
      const res = await requestAIInsight(ctx);
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
        setFullScanError('Full ingredient analysis requires a photo scan.');
        return;
      }
      setFullScanLoading(true);
      setFullScanError(null);
      const res = await scanProductFull(imageBase64);
      if (res.success) {
        setFullScanResult(res.result);
      } else if (!res.success) {
        setFullScanError((res as { error: string }).error);
      }
      setFullScanLoading(false);
    }

    // Tab 3: Similar — synchronous scoring, no API call
    if (tab === 'similar' && !similarProducts) {
      const concerns = getEffectiveConcerns();
      const preferences = getEffectivePreferences() ?? {};
      const sourceProduct = matchedProduct || buildTempProduct();
      if (sourceProduct) {
        const scored = scoreSimilarProducts(sourceProduct, concerns, skinType ?? undefined, preferences, 6);
        setSimilarProducts(scored);
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
              <div className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-warm-gray">Analyzing for your skin profile...</span>
              </div>
            ) : isItForMeText ? (
              <p className="text-xs text-warm-gray leading-relaxed whitespace-pre-line">
                {isItForMeText}
              </p>
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
              {fullScanLoading && <TabSpinner />}
              {fullScanError && !fullScanLoading && (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">{fullScanError}</p>
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
              {fullScanLoading && <TabSpinner />}
              {fullScanError && !fullScanLoading && (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">{fullScanError}</p>
                </div>
              )}
              {fullScanResult && !fullScanLoading && (
                <Suspense fallback={<TabSpinner />}>
                  <PostScanDiscovery
                    scanResult={effectiveResult}
                    matchedProduct={matchedProduct}
                  />
                </Suspense>
              )}
              {!fullScanResult && !fullScanLoading && !fullScanError && !imageBase64 && (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">Full ingredient analysis requires a photo scan.</p>
                </div>
              )}
            </>
          )}

          {/* Tab 3: Similar */}
          {activeTab === 'similar' && (
            <>
              {similarProducts === null ? (
                <TabSpinner />
              ) : similarProducts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-warm-gray">No similar products found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {similarProducts.map(p => (
                    <SimilarProductCard key={p.id} product={p} />
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
    </div>
  );
}

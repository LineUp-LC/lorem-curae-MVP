/**
 * ScanResultView — displays the result of a product scan.
 *
 * Three sections:
 * 1. Product identification (match card or no-match info)
 * 2. Ingredient breakdown with safety badges
 * 3. Shelf + routine integration buttons
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ScanResult, ParsedIngredient } from '../../../types/scan';
import type { Product } from '../../../types/product';
import { getEffectiveSkinType } from '../../../lib/utils/sessionState';
import { savedProductsState } from '../../../lib/utils/favoritesState';
import { onAction } from '../../../lib/utils/gamificationTriggers';
import { useAuth } from '../../../lib/auth/AuthContext';
import RoutinePickerModal from '../../../components/feature/RoutinePickerModal';

interface ScanResultViewProps {
  result: ScanResult;
  previewUrl: string;
  matchedProduct?: Product;
  onScanAnother: () => void;
}

// ---------------------------------------------------------------------------
// Safety badge component
// ---------------------------------------------------------------------------

function SafetyBadge({ tier }: { tier: ParsedIngredient['safetyTier'] }) {
  const config = {
    safe: { label: 'Safe', classes: 'bg-sage/15 text-sage', icon: 'ri-shield-check-line' },
    caution: { label: 'Caution', classes: 'bg-yellow-500/15 text-yellow-700', icon: 'ri-alert-line' },
    avoid: { label: 'Avoid', classes: 'bg-red-500/15 text-red-700', icon: 'ri-close-circle-line' },
  }[tier];

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.classes}`}>
      <i className={`${config.icon} text-[10px]`} />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Ingredient breakdown section
// ---------------------------------------------------------------------------

function IngredientBreakdown({ ingredients }: { ingredients: ParsedIngredient[] }) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = expanded ? ingredients.length : 5;
  const visible = ingredients.slice(0, displayCount);

  if (ingredients.length === 0) return null;

  return (
    <div className="w-full max-w-sm mt-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-sm font-serif font-semibold text-deep flex items-center gap-1.5">
          <i className="ri-flask-line text-primary/60" />
          Ingredient Breakdown ({ingredients.length})
        </span>
        <i className={`ri-arrow-${expanded ? 'up' : 'down'}-s-line text-warm-gray`} />
      </button>

      <div className="space-y-2">
        {visible.map((ing, i) => (
          <div
            key={i}
            className="bg-cream/50 border border-blush/30 rounded-lg px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-deep leading-tight">
                {ing.name}
              </span>
              <SafetyBadge tier={ing.safetyTier} />
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
          </div>
        ))}
      </div>

      {ingredients.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-primary hover:text-dark transition-colors w-full text-center"
        >
          {expanded ? 'Show less' : `Show all ${ingredients.length} ingredients`}
        </button>
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
  onScanAnother,
}: ScanResultViewProps) {
  const { user } = useAuth();
  const skinType = getEffectiveSkinType();
  const [savedToShelf, setSavedToShelf] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);

  // Build product-like object for shelf/routine (works for both match and no-match)
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

  // Match found
  if (result.match && matchedProduct) {
    return (
      <div className="flex flex-col items-center gap-5">
        {/* Success header */}
        <div className="w-14 h-14 bg-sage/15 rounded-full flex items-center justify-center">
          <i className="ri-check-line text-2xl text-sage" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-serif font-semibold text-deep">
            Product Identified
          </h2>
          <p className="text-xs text-warm-gray capitalize">
            {result.confidence} confidence match
          </p>
        </div>

        {/* Product card */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-blush shadow-md overflow-hidden">
          <div className="flex gap-4 p-4">
            <img
              src={matchedProduct.image || '/placeholder-product.svg'}
              alt={matchedProduct.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                {matchedProduct.brand}
              </p>
              <h3 className="text-sm font-semibold text-deep line-clamp-2 mt-0.5">
                {matchedProduct.name}
              </h3>
              <p className="text-xs text-warm-gray mt-1 capitalize">
                {matchedProduct.category}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <i className="ri-star-fill text-amber-500 text-xs" />
                <span className="text-xs font-medium text-warm-gray">{matchedProduct.rating}</span>
                <span className="text-xs text-warm-gray/70">({matchedProduct.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Personalization note */}
          {skinType && matchedProduct.skinTypes.some(
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
            <Link
              to={`/product-detail/${matchedProduct.id}`}
              className="block w-full text-center py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
            >
              View Product Details
            </Link>
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

        {/* Ingredient breakdown */}
        {result.ingredients && result.ingredients.length > 0 && (
          <IngredientBreakdown ingredients={result.ingredients} />
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

  // No catalog match — product may still be fully identified
  const isIdentified = !!(result.detectedProduct || result.detectedBrand);
  const isLowConfidenceBlank = result.confidence === 'low' && !result.detectedProduct && !result.detectedBrand;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Header — success when identified, guidance when not */}
      {isIdentified ? (
        <>
          <div className="w-14 h-14 bg-sage/15 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-2xl text-sage" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-serif font-semibold text-deep">
              Product Identified
            </h2>
            <p className="text-xs text-warm-gray capitalize">
              {result.confidence} confidence
            </p>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      {/* Product card — same rich layout as catalog matches */}
      {isIdentified && (
        <div className="w-full max-w-sm bg-white rounded-2xl border border-blush shadow-md overflow-hidden">
          <div className="flex gap-4 p-4">
            {previewUrl ? (
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
              {result.detectedBrand && (
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {result.detectedBrand}
                </p>
              )}
              {result.detectedProduct && (
                <h3 className="text-sm font-semibold text-deep line-clamp-2 mt-0.5">
                  {result.detectedProduct}
                </h3>
              )}
              {result.detectedCategory && (
                <p className="text-xs text-warm-gray mt-1 capitalize">
                  {result.detectedCategory}
                </p>
              )}
              {result.upc && (
                <p className="text-[10px] text-warm-gray/60 font-mono mt-1">
                  UPC: {result.upc}
                </p>
              )}
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  result.confidence === 'high' ? 'bg-sage/15 text-sage' :
                  result.confidence === 'medium' ? 'bg-yellow-500/15 text-yellow-700' :
                  'bg-warm-gray/10 text-warm-gray'
                }`}>
                  <i className={`text-[10px] ${result.confidence === 'high' ? 'ri-shield-check-line' : 'ri-information-line'}`} />
                  {result.confidence} confidence
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="border-t border-blush px-4 py-3 space-y-2">
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
                {savedToShelf ? 'Saved to Shelf' : 'Add to Shelf'}
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
      )}

      {/* Ingredient breakdown — renders for ANY scan with ingredients */}
      {result.ingredients && result.ingredients.length > 0 && (
        <IngredientBreakdown ingredients={result.ingredients} />
      )}

      {/* Low-confidence retry hint */}
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

      {/* Find compatible products */}
      <Link
        to={`/discover${result.detectedCategory ? `?category=${result.detectedCategory}` : ''}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
      >
        <i className="ri-compass-3-line" />
        Find Compatible Products
      </Link>

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

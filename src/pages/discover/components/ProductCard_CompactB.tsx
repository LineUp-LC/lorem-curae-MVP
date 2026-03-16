/**
 * Variant B — Two-Row Compact Card
 *
 * - Image: h-56 (224px)
 * - No description line
 * - No section labels
 * - Row 1: Concerns pills
 * - Row 2: Ingredients + Skin Types combined
 * - Preferences as icon-only pills
 * - Tighter padding (p-3 xs:p-4) and margins (mb-2)
 */
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import { normalizeSkinTypes, isSkinTypeMatch, isAllMetadata, getMetadataDisplayLabel } from '../../../lib/utils/productMetadata';
import { getEffectiveSkinType, getEffectivePreferences } from '../../../lib/utils/sessionState';
import { assessProductSafety, getUserProfile } from '../../../lib/utils/productSafety';
import SafetyBadge from '../../../components/feature/SafetyBadge';
import type { ProductCardProps } from './ProductCardProps';

const prefIcons: Record<string, string> = {
  chemicalFree: 'ri-flask-line',
  vegan: 'ri-leaf-line',
  plantBased: 'ri-plant-line',
  fragranceFree: 'ri-drop-line',
  glutenFree: 'ri-seedling-line',
  alcoholFree: 'ri-goblet-line',
  siliconeFree: 'ri-shield-check-line',
  crueltyFree: 'ri-heart-line',
};

const prefLabels: Record<string, string> = {
  chemicalFree: 'Chemical-Free',
  vegan: 'Vegan',
  plantBased: 'Plant-Based',
  fragranceFree: 'Fragrance-Free',
  glutenFree: 'Gluten-Free',
  alcoholFree: 'Alcohol-Free',
  siliconeFree: 'Silicone-Free',
  crueltyFree: 'Cruelty-Free',
};

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={`full-${i}`} className="ri-star-fill text-amber-500"></i>);
  }
  if (hasHalfStar) {
    stars.push(<i key="half" className="ri-star-half-fill text-amber-500"></i>);
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<i key={`empty-${i}`} className="ri-star-line text-amber-500"></i>);
  }
  return stars;
}

export default function ProductCard_CompactB({
  product,
  highlightCompare = false,
  isRecommended,
  isSelected,
  isProductSaved,
  compareCount,
  safeUserConcerns,
  onProductClick,
  onToggleSave,
  onAddToCompare,
  matchTier,
  matchReasons,
}: ProductCardProps) {
  const isMaxReached = compareCount >= 3 && !isSelected;
  const userSkinType = getEffectiveSkinType();
  const userPrefs = getEffectivePreferences();

  // Determine highlight state: only from tier badge (no generic isRecommended fallback)
  const isHighlighted = matchTier === 'excellent' || matchTier === 'great';

  // Tier badge config (only show for excellent/great/good — skip fair)
  const tierBadge = matchTier && matchTier !== 'fair'
    ? {
        label: matchTier === 'excellent' ? 'Excellent Match'
          : matchTier === 'great' ? 'Great Match'
          : 'Good Match',
        bg: matchTier === 'excellent' ? 'bg-primary'
          : matchTier === 'great' ? 'bg-sage'
          : 'bg-warm-gray',
      }
    : null;

  return (
    <div
      onClick={() => onProductClick(product.id)}
      className={`
        bg-white rounded-2xl overflow-hidden transition-[transform,box-shadow] duration-300 group cursor-pointer relative hover:-translate-y-1 transform-gpu
        ${
          isHighlighted
            ? 'ring-2 ring-primary ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)]'
            : 'shadow-md hover:shadow-xl border border-blush'
        }
      `}
    >
      {tierBadge ? (
        <div className="absolute top-3 left-3 z-10 group/badge">
          <span className={`${tierBadge.bg} text-white text-xs px-2 py-1 rounded-full shadow inline-block`}>
            {tierBadge.label}
          </span>
          {matchReasons && matchReasons.length > 0 && (
            <div className="hidden group-hover/badge:block absolute top-full left-0 mt-1.5 bg-deep text-white text-xs rounded-lg px-3 py-2 shadow-lg z-20 min-w-[180px] max-w-[220px]">
              <p className="font-medium mb-1">Why this product?</p>
              <ul className="space-y-0.5">
                {matchReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <i className="ri-check-line flex-shrink-0 mt-0.5"></i>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <div className="absolute -top-1.5 left-4 w-2.5 h-2.5 bg-deep rotate-45"></div>
            </div>
          )}
        </div>
      ) : null}

      {/* Inline top match reason (visible without hover) */}
      {matchReasons && matchReasons.length > 0 && tierBadge && (
        <div className="absolute top-12 left-3 z-10">
          <span className="text-[11px] italic text-white/90 drop-shadow-sm line-clamp-1 max-w-[calc(100%-24px)]">
            {matchReasons[0]}
          </span>
        </div>
      )}

      {/* Compare Highlight Tooltip */}
      {highlightCompare && (
        <div className="absolute top-3 right-3 z-10">
          <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-deep text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-20">
            Tap to compare products
            <div className="absolute -top-1 right-4 w-2 h-2 bg-deep rotate-45"></div>
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-56 overflow-hidden bg-cream">
        <img
          src={product.image || '/placeholder-product.svg'}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 transform-gpu"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-white text-deep font-semibold rounded-full text-sm">Out of Stock</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 text-xs font-medium bg-white/90 text-deep-900 rounded-full capitalize shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 xs:p-4">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
          {product.brand}
        </p>

        <h3 className="text-sm xs:text-base font-semibold text-deep mb-1.5 line-clamp-2">{product.name}</h3>

        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
          <span className="text-xs font-medium text-warm-gray">{product.rating}</span>
          <span className="text-xs text-warm-gray/80">({product.reviewCount})</span>
        </div>

        {/* Row 1: Concerns */}
        {(() => {
          const displayConcerns = product.concerns.some(isAllMetadata)
            ? product.concerns.filter(isAllMetadata)
            : product.concerns;
          return (
            <div className="flex flex-wrap gap-1 mb-2">
              {displayConcerns.slice(0, 3).map((concern, idx) => {
                const isMatch = productMatchesUserConcerns([concern], safeUserConcerns);
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 text-xs rounded-full border capitalize ${
                      isMatch
                        ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                        : 'bg-cream text-warm-gray border-blush'
                    }`}
                  >
                    {isMatch && <i className="ri-check-line mr-0.5"></i>}
                    {getMetadataDisplayLabel(concern, 'concern')}
                  </span>
                );
              })}
            </div>
          );
        })()}

        {/* Row 2: Ingredients + Skin Types combined */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.keyIngredients && product.keyIngredients.slice(0, 2).map((ingredient, idx) => {
            const isMatch = matchesIngredient(ingredient, safeUserConcerns);
            return (
              <span
                key={`ing-${idx}`}
                className={`px-2 py-0.5 text-xs rounded-full border ${
                  isMatch
                    ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                    : 'bg-cream text-warm-gray border-blush'
                }`}
              >
                {isMatch && <i className="ri-check-line mr-0.5"></i>}
                {ingredient}
              </span>
            );
          })}
          {(() => {
            const normalized = normalizeSkinTypes(product.skinTypes);
            const displayTypes = normalized.some(isAllMetadata)
              ? normalized.filter(isAllMetadata)
              : normalized;
            return displayTypes.slice(0, 1).map((type, idx) => {
              const isMatch = isSkinTypeMatch(type, userSkinType);
              return (
                <span
                  key={`st-${idx}`}
                  className={`px-2 py-0.5 text-xs rounded-full capitalize border ${
                    isMatch
                      ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                      : 'bg-cream text-warm-gray border-blush'
                  }`}
                >
                  {isMatch && <i className="ri-check-line mr-0.5"></i>}
                  {getMetadataDisplayLabel(type, 'skinType')}
                </span>
              );
            });
          })()}
        </div>

        {/* Safety Warning */}
        {(() => {
          const safety = assessProductSafety(product.keyIngredients || [], getUserProfile());
          return safety.level !== 'safe' ? <SafetyBadge result={safety} compact /> : null;
        })()}

        {/* Preferences — icon-only */}
        {product.preferences && Object.values(product.preferences).some(v => v === true) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(product.preferences)
              .filter(([_, value]) => value === true)
              .slice(0, 4)
              .map(([key]) => {
                const isPrefMatch = userPrefs[key] === true;
                return (
                  <span
                    key={key}
                    className={`w-6 h-6 flex items-center justify-center text-xs rounded-full border ${
                      isPrefMatch
                        ? 'bg-light/30 text-primary-700 border-primary-300'
                        : 'bg-cream text-warm-gray border-blush'
                    }`}
                    title={prefLabels[key] || key}
                    aria-label={prefLabels[key] || key}
                  >
                    <i className={prefIcons[key] || 'ri-checkbox-blank-circle-line'}></i>
                  </span>
                );
              })}
          </div>
        )}

        {/* Price + Save + Compare */}
        <div className="flex items-center justify-between pt-2 border-t border-blush">
          <div>
            <span className="text-base xs:text-lg font-bold text-deep">
              ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(e); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                isProductSaved
                  ? 'bg-primary text-white cursor-pointer'
                  : 'bg-cream text-warm-gray hover:bg-light/30 hover:text-primary cursor-pointer'
              }`}
              title={isProductSaved ? 'Remove from saved' : 'Save product'}
              aria-label={isProductSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
              aria-pressed={isProductSaved}
            >
              <i className={`${isProductSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-base`}></i>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (!isMaxReached) onAddToCompare(e); }}
              disabled={isMaxReached}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                isSelected
                  ? 'bg-primary text-white cursor-pointer'
                  : isMaxReached
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-cream text-warm-gray hover:bg-light/30 hover:text-primary cursor-pointer'
              }`}
              title={isSelected ? 'Remove from comparison' : isMaxReached ? 'Maximum 3 products' : 'Add to comparison'}
              aria-label={isSelected ? `Remove ${product.name} from comparison` : isMaxReached ? 'Maximum 3 products reached' : `Add ${product.name} to comparison`}
              aria-pressed={isSelected}
            >
              {isSelected ? <i className="ri-check-line text-base"></i> : <i className="ri-scales-line text-base"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

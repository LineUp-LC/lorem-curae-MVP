/**
 * Variant C — Hover-Reveal Metadata Card
 *
 * - Image: h-52 (208px)
 * - Default shows: brand, name, rating, price, concern pills
 * - Ingredients, preferences, skin types revealed on hover (desktop)
 *   or tap (mobile) via max-height transition
 * - No description line, no section labels
 * - Tightest padding (p-3)
 */
import { useState } from 'react';
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import { normalizeSkinTypes, isSkinTypeMatch, isAllMetadata, getMetadataDisplayLabel } from '../../../lib/utils/productMetadata';
import { getEffectiveSkinType, getEffectivePreferences } from '../../../lib/utils/sessionState';
import { assessProductSafety, getUserProfile } from '../../../lib/utils/productSafety';
import SafetyBadge from '../../../components/feature/SafetyBadge';
import type { ProductCardProps } from './ProductCardProps';

const preferenceLabels: Record<string, string> = {
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

export default function ProductCard_CompactC({
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
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isMaxReached = compareCount >= 3 && !isSelected;
  const userSkinType = getEffectiveSkinType();
  const userPrefs = getEffectivePreferences();

  const hasHiddenContent =
    (product.keyIngredients && product.keyIngredients.length > 0) ||
    (product.preferences && Object.values(product.preferences).some(v => v === true)) ||
    product.skinTypes.length > 0;

  return (
    <div
      onClick={() => onProductClick(product.id)}
      className={`
        bg-white rounded-2xl overflow-hidden transition-[transform,box-shadow] duration-300 group cursor-pointer relative hover:-translate-y-1 transform-gpu
        ${
          isRecommended
            ? 'ring-2 ring-primary ring-offset-2 shadow-[0_0_12px_2px_rgba(142,163,153,0.25)]'
            : 'shadow-md hover:shadow-xl border border-blush'
        }
      `}
    >
      {isRecommended && (
        <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full shadow z-10">
          Best Match
        </span>
      )}

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex flex-row items-center gap-2 z-10">
        <button
          onClick={onToggleSave}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isProductSaved
              ? 'bg-primary text-white'
              : 'bg-white text-warm-gray hover:bg-light/30 hover:text-primary'
          }`}
          title={isProductSaved ? 'Remove from saved' : 'Save product'}
          aria-label={isProductSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          aria-pressed={isProductSaved}
        >
          <i className={`${isProductSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl`}></i>
        </button>

        <div className="relative">
          <button
            onClick={(e) => !isMaxReached && onAddToCompare(e)}
            disabled={isMaxReached}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              highlightCompare ? 'ring-4 ring-primary/50 animate-pulse ' : ''
            }${
              isSelected
                ? 'bg-primary text-white cursor-pointer'
                : isMaxReached
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-warm-gray hover:bg-light/30 cursor-pointer'
            }`}
            title={isSelected ? 'Remove from comparison' : isMaxReached ? 'Maximum 3 products' : 'Add to comparison'}
            aria-label={isSelected ? `Remove ${product.name} from comparison` : isMaxReached ? 'Maximum 3 products reached' : `Add ${product.name} to comparison`}
            aria-pressed={isSelected}
          >
            {isSelected ? <i className="ri-check-line text-xl"></i> : <i className="ri-scales-line text-xl"></i>}
          </button>
          {highlightCompare && (
            <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-deep text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-20">
              Tap to compare products
              <div className="absolute -top-1 right-4 w-2 h-2 bg-deep rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Product Image */}
      <div className="relative w-full h-52 overflow-hidden bg-cream">
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
      <div className="p-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{product.brand}</p>

        <h3 className="text-sm xs:text-base font-semibold text-deep mb-1.5 line-clamp-2">{product.name}</h3>

        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
          <span className="text-xs font-medium text-warm-gray">{product.rating}</span>
          <span className="text-xs text-warm-gray/80">({product.reviewCount})</span>
        </div>

        {/* Concerns — always visible */}
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

        {/* Expandable section — hover on desktop, tap on mobile */}
        {hasHiddenContent && (
          <>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expanded ? 'max-h-60' : 'max-h-0 group-hover:max-h-60'
              }`}
              aria-expanded={expanded}
            >
              {/* Key Ingredients */}
              {product.keyIngredients && product.keyIngredients.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {product.keyIngredients.slice(0, 3).map((ingredient, idx) => {
                      const isMatch = matchesIngredient(ingredient, safeUserConcerns);
                      return (
                        <span
                          key={idx}
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
                  </div>
                  {(() => {
                    const safety = assessProductSafety(product.keyIngredients || [], getUserProfile());
                    return safety.level !== 'safe' ? <SafetyBadge result={safety} compact /> : null;
                  })()}
                </div>
              )}

              {/* Preferences */}
              {product.preferences && Object.values(product.preferences).some(v => v === true) && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {Object.entries(product.preferences)
                    .filter(([_, value]) => value === true)
                    .slice(0, 3)
                    .map(([key]) => {
                      const isPrefMatch = userPrefs[key] === true;
                      return (
                        <span
                          key={key}
                          className={`px-2 py-0.5 text-xs rounded-full border ${
                            isPrefMatch
                              ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                              : 'bg-cream text-warm-gray border-blush'
                          }`}
                        >
                          {isPrefMatch && <i className="ri-check-line mr-0.5"></i>}
                          {preferenceLabels[key] || key}
                        </span>
                      );
                    })}
                </div>
              )}

              {/* Skin Types */}
              {(() => {
                const normalized = normalizeSkinTypes(product.skinTypes);
                const displayTypes = normalized.some(isAllMetadata)
                  ? normalized.filter(isAllMetadata)
                  : normalized;
                return displayTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {displayTypes.slice(0, 3).map((type, idx) => {
                      const isMatch = isSkinTypeMatch(type, userSkinType);
                      return (
                        <span
                          key={idx}
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
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Mobile expand toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              className="w-full flex items-center justify-center py-1 text-warm-gray/60 hover:text-warm-gray transition-colors md:hidden"
              aria-label={expanded ? 'Show less details' : 'Show more details'}
            >
              <i className={`${expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-lg`}></i>
            </button>
          </>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-blush">
          <div>
            <span className="text-base xs:text-lg font-bold text-deep">
              ${(product.price * 0.9).toFixed(2)} - ${(product.price * 1.1).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

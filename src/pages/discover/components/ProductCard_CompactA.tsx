/**
 * Variant A — Minimal Height Card
 *
 * - Image: h-48 (192px)
 * - No description line
 * - No section labels
 * - Only Concerns + Ingredients pills (Preferences & Skin Types removed)
 * - Tighter padding (p-3) and margins (mb-2 / mb-1.5)
 * - Brand + rating inlined on one row
 */
import { productMatchesUserConcerns, matchesIngredient } from '../../../lib/utils/matching';
import { isAllMetadata, getMetadataDisplayLabel } from '../../../lib/utils/productMetadata';
import { assessProductSafety, getUserProfile } from '../../../lib/utils/productSafety';
import SafetyBadge from '../../../components/feature/SafetyBadge';
import type { ProductCardProps } from './ProductCardProps';

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

export default function ProductCard_CompactA({
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
  const isMaxReached = compareCount >= 3 && !isSelected;

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

      {/* Product Image — compact */}
      <div className="relative w-full h-48 overflow-hidden bg-cream">
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

      {/* Product Info — compact */}
      <div className="p-3">
        {/* Brand + Rating inline */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">{product.brand}</p>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">{renderStars(product.rating)}</div>
            <span className="text-xs font-medium text-warm-gray">{product.rating}</span>
          </div>
        </div>

        <h3 className="text-sm xs:text-base font-semibold text-deep mb-2 line-clamp-2">{product.name}</h3>

        {/* Concerns — no label */}
        {(() => {
          const displayConcerns = product.concerns.some(isAllMetadata)
            ? product.concerns.filter(isAllMetadata)
            : product.concerns;
          return (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
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
            </div>
          );
        })()}

        {/* Key Ingredients — no label */}
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

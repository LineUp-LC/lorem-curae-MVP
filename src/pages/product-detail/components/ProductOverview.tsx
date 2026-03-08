import { productData } from '../../../mocks/products';
import { getEffectiveConcerns } from '../../../lib/utils/sessionState';
import { matchesIngredient } from '../../../lib/utils/matching';
import IngredientLink from '../../../components/feature/IngredientLink';

interface ProductOverviewProps {
  productId: number;
}

export default function ProductOverview({ productId }: ProductOverviewProps) {
  const productFromData = productData.find(p => p.id === productId);
  const userConcerns = getEffectiveConcerns();

  // Calculate price per mL
  const sizeInMl = productFromData?.size?.unit === 'ml' ? productFromData.size.value :
                   productFromData?.size?.unit === 'g' ? productFromData.size.value : 30;
  const pricePerMl = productFromData?.price ? (productFromData.price / sizeInMl).toFixed(2) : null;

  // Product metadata (can be extended per product)
  const productMeta = {
    size: productFromData?.size ? `${productFromData.size.value}${productFromData.size.unit}` : '30ml',
    texture: 'Lightweight, water-based gel',
    scent: productFromData?.preferences?.fragranceFree ? 'Fragrance-free' : 'Light natural scent',
    finish: 'Dewy, non-greasy',
    absorptionTime: '30-60 seconds',
    shelfLife: '12 months after opening',
  };

  if (!productFromData) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-warm-gray leading-relaxed">{productFromData.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-deep mb-3">Key Ingredients</h3>
        <div className="flex flex-wrap gap-2">
          {productFromData.keyIngredients.map((ing) => {
            const isMatch = matchesIngredient(ing, userConcerns);
            return (
              <span key={ing} className={`px-3 py-1.5 text-sm rounded-full border ${
                isMatch
                  ? 'bg-light/30 text-primary-700 border-primary-300 font-medium'
                  : 'bg-cream text-warm-gray border-transparent'
              }`}>
                {isMatch && <i className="ri-check-line mr-1"></i>}
                <IngredientLink name={ing} className={isMatch ? 'text-primary-700' : 'text-warm-gray'} />
              </span>
            );
          })}
        </div>
      </div>

      {/* Product Details Grid */}
      <div>
        <h3 className="text-sm font-semibold text-deep mb-3">Product Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Size</p>
            <p className="text-sm text-deep font-medium">{productMeta.size}</p>
            {pricePerMl && (
              <p className="text-xs text-warm-gray mt-1">${pricePerMl} per mL</p>
            )}
          </div>
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Texture</p>
            <p className="text-sm text-deep font-medium">{productMeta.texture}</p>
          </div>
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Scent</p>
            <p className="text-sm text-deep font-medium">{productMeta.scent}</p>
          </div>
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Finish</p>
            <p className="text-sm text-deep font-medium">{productMeta.finish}</p>
          </div>
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Absorption</p>
            <p className="text-sm text-deep font-medium">{productMeta.absorptionTime}</p>
          </div>
          <div className="bg-cream/50 rounded-lg p-3">
            <p className="text-xs text-warm-gray/70 uppercase tracking-wide mb-1">Shelf Life</p>
            <p className="text-sm text-deep font-medium">{productMeta.shelfLife}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { productData } from '../../../mocks/products';
import { useNavigate } from 'react-router-dom';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
} from '../../../lib/utils/sessionState';

interface ProductComparisonProps {
  productIds: number[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

const ProductComparison = ({
  productIds,
  onClose,
  onRemove,
}: ProductComparisonProps) => {
  const navigate = useNavigate();
  const products = productData.filter((p) => productIds.includes(p.id));

  // Get user profile from sessionState (unified source of truth)
  const userProfile = {
    skinType: getEffectiveSkinType() || 'combination',
    concerns:
      getEffectiveConcerns().length > 0
        ? getEffectiveConcerns()
        : ['hydration', 'texture'],
    budget: 50,
  };

  const handleNavigate = (id: number) => {
    navigate(`/product/${id}`);
    onClose();
  };

  return (
    <div className="comparison-modal">
      <div className="comparison-header">
        <h2 className="text-xl font-semibold">Compare Products</h2>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>

      <div className="comparison-grid">
        {products.map((product) => (
          <div key={product.id} className="comparison-card">
            <button
              className="remove-btn"
              onClick={() => onRemove(product.id)}
            >
              Remove
            </button>

            <img
              src={product.image}
              alt={product.name}
              className="comparison-image"
              onClick={() => handleNavigate(product.id)}
            />

            <h3 className="font-semibold mt-2">{product.name}</h3>

            <p className="text-sm text-gray-600">{product.brand}</p>

            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700">
                Skin Type Match:
              </p>
              <p className="text-sm">
                {product.skinTypes?.includes(userProfile.skinType)
                  ? '✔ Good match'
                  : '⚠ Not ideal'}
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700">
                Concern Match:
              </p>
              <ul className="text-sm list-disc ml-4">
                {userProfile.concerns.map((concern) => (
                  <li
                    key={concern}
                    className={
                      product.concerns?.includes(concern)
                        ? 'text-taupe'
                        : 'text-gray-500'
                    }
                  >
                    {concern}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700">
                Key Ingredients:
              </p>
              <ul className="text-sm list-disc ml-4">
                {product.keyIngredients?.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>

            <button
              className="view-btn mt-4"
              onClick={() => handleNavigate(product.id)}
            >
              View Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductComparison;
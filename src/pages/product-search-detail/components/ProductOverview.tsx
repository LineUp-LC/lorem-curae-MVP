import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productData } from '../../../mocks/products';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
} from '../../../utils/sessionState';

interface ProductOverviewProps {
  productId: number;
  onAddToComparison: (id: number) => void;
  isInComparison: boolean;
}

const ProductOverview = ({
  productId,
  onAddToComparison,
  isInComparison,
}: ProductOverviewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const product = productData.find((p) => p.id === productId);

  if (!product) return null;

  // Get user profile from sessionState (unified source of truth)
  const userProfile = {
    skinType: getEffectiveSkinType() || 'combination',
    concerns:
      getEffectiveConcerns().length > 0
        ? getEffectiveConcerns()
        : ['hydration', 'texture'],
    location: 'New York, NY',
    climate: 'Humid Continental',
    uvIndex: 'Moderate (5-6)',
  };

  return (
    <div className="product-overview">
      <div className="image-gallery">
        <img
          src={product.images[selectedImage]}
          alt={product.name}
          className="main-image"
        />

        <div className="thumbnail-row">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              className={`thumbnail ${
                selectedImage === index ? 'active' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>

      <div className="product-info">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-gray-600">{product.brand}</p>

        <div className="mt-2">
          <span className="text-xl font-bold">${product.price}</span>
          <span className="ml-2 text-yellow-500">
            ★ {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        <p className="mt-4 text-gray-700">{product.description}</p>

        <div className="mt-4">
          <h3 className="font-semibold">Key Ingredients</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {product.key_ingredients?.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Skin Type Match</h3>
          <p>
            {product.skin_types?.includes(userProfile.skinType)
              ? '✔ Good match'
              : '⚠ Not ideal for your skin type'}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Concern Match</h3>
          <ul className="list-disc ml-5">
            {userProfile.concerns.map((concern) => (
              <li
                key={concern}
                className={
                  product.concerns?.includes(concern)
                    ? 'text-green-600'
                    : 'text-gray-500'
                }
              >
                {concern}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold">Your Environment</h3>
          <p className="text-sm text-gray-700">
            Location: {userProfile.location}
          </p>
          <p className="text-sm text-gray-700">
            Climate: {userProfile.climate}
          </p>
          <p className="text-sm text-gray-700">
            UV Index: {userProfile.uvIndex}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onAddToComparison(product.id)}
            className={`px-4 py-2 rounded ${
              isInComparison
                ? 'bg-gray-400 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {isInComparison ? 'In Comparison' : 'Add to Comparison'}
          </button>

          <Link
            to={`/product-search-detail/${product.id}/reviews`}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            View Reviews
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductOverview;
import { useState } from 'react';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
} from '../../../lib/utils/sessionState';

export default function ProductOverview() {
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: 1,
    name: 'Hydrating Glow Serum',
    brand: 'GlowLab',
    price: 29.99,
    rating: 4.5,
    reviews: 128,
    images: [
      '/images/products/serum-1.png',
      '/images/products/serum-2.png',
      '/images/products/serum-3.png',
    ],
    description:
      'A lightweight serum designed to hydrate, brighten, and improve overall skin texture.',
    keyIngredients: ['Hyaluronic Acid', 'Vitamin C', 'Niacinamide'],
    skinTypes: ['dry', 'normal', 'combination'],
    concerns: ['hydration', 'texture', 'brightening'],
  };

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
            {product.keyIngredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Skin Type Match</h3>
          <p>
            {product.skinTypes.includes(userProfile.skinType)
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
                  product.concerns.includes(concern)
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
      </div>
    </div>
  );
}
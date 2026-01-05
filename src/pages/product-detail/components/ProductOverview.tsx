import {
  getEffectiveSkinType,
  getEffectiveConcerns,
} from '../../../lib/utils/sessionState';

export default function ProductOverview() {
  const product = {
    id: 1,
    name: 'Hydrating Glow Serum',
    brand: 'GlowLab',
    price: 29.99,
    rating: 4.5,
    reviews: 128,
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
      <div className="product-info">
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
                    ? 'text-taupe'
                    : 'text-gray-500'
                }
              >
                {concern}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 p-4 bg-cream-100 rounded-md">
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
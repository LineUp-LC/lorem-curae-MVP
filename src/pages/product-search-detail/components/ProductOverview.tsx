import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductById } from '../../../lib/data/products';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
} from '../../../lib/utils/sessionState';
import { useEnvironmentContext } from '../../../lib/environment/useEnvironmentContext';
import { useAuth } from '../../../lib/auth/AuthContext';

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
  const { user } = useAuth();
  const { env } = useEnvironmentContext();

  const product = getProductById(productId);

  if (!product) return null;

  // Get user profile from sessionState (unified source of truth)
  const userProfile = {
    skinType: getEffectiveSkinType() || 'combination',
    concerns:
      getEffectiveConcerns().length > 0
        ? getEffectiveConcerns()
        : ['hydration', 'texture'],
  };

  // The canonical Product carries a single `image` (not an `images` array); render it as a
  // one-item gallery so the thumbnail/selected-image UI works without reading an undefined field.
  const images = product.image ? [product.image] : [];

  return (
    <div className="product-overview">
      <div className="image-gallery">
        <img
          src={images[selectedImage]}
          alt={product.name}
          className="main-image"
        />

        <div className="thumbnail-row">
          {images.map((img, index) => (
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
            ★ {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>

        <p className="mt-4 text-gray-700">{product.description}</p>

        <div className="mt-4">
          <h3 className="font-semibold">Key Ingredients</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {product.keyIngredients?.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Skin Type Match</h3>
          <p>
            {product.skinTypes?.includes(userProfile.skinType)
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
                    ? 'text-taupe'
                    : 'text-gray-500'
                }
              >
                {concern}
              </li>
            ))}
          </ul>
        </div>

        {/* Environment Fit */}
        <div className="mt-4">
          <h3 className="font-semibold">Environment Fit</h3>
          {env && env.source !== 'mock' ? (
            <>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {env.location?.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-light/30 text-primary-700 border border-primary-300">
                    <i className="ri-map-pin-line"></i>
                    {[env.location.city, env.location.region].filter(Boolean).join(', ')}
                  </span>
                )}
                {env.climate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-light/30 text-primary-700 border border-primary-300">
                    <i className="ri-cloud-line"></i>
                    {env.climate.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
                {env.uvBand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-light/30 text-primary-700 border border-primary-300">
                    <i className="ri-sun-line"></i>
                    UV {env.uvBand.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}{env.uvIndex != null ? ` (${env.uvIndex})` : ''}
                  </span>
                )}
                {env.season && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-light/30 text-primary-700 border border-primary-300">
                    <i className="ri-leaf-line"></i>
                    {env.season.charAt(0).toUpperCase() + env.season.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-gray italic mt-2">
                {env.source === 'live'
                  ? 'Personalized for your local conditions'
                  : 'Partially personalized based on your saved location'}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-cream text-warm-gray border border-transparent">
                <i className="ri-map-pin-line"></i>
                No location set
              </span>
              <span className="text-xs text-warm-gray italic">Add your location for personalized environmental insights</span>
              {user ? (
                <Link
                  to="/settings?tab=location"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-dark font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                >
                  <i className="ri-settings-3-line"></i>
                  Update in Settings
                </Link>
              ) : (
                <Link
                  to="/auth/signup"
                  onClick={() => localStorage.setItem('postAuthRedirect', '/settings?tab=location')}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-dark font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                >
                  <i className="ri-user-add-line"></i>
                  Sign Up
                </Link>
              )}
            </div>
          )}
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
/**
 * ScanResultView — displays the result of a product scan.
 *
 * Two states:
 * - Match found: product card preview + "View Product" CTA
 * - No match: detected info + "Not in our catalog yet" message
 */

import { Link } from 'react-router-dom';
import type { ScanResult } from '../../../types/scan';
import type { Product } from '../../../types/product';
import { getEffectiveSkinType } from '../../../lib/utils/sessionState';

interface ScanResultViewProps {
  result: ScanResult;
  previewUrl: string;
  matchedProduct?: Product;
  onScanAnother: () => void;
}

export default function ScanResultView({
  result,
  previewUrl,
  matchedProduct,
  onScanAnother,
}: ScanResultViewProps) {
  const skinType = getEffectiveSkinType();

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

          {/* CTA */}
          <div className="border-t border-blush px-4 py-3">
            <Link
              to={`/product-detail/${matchedProduct.id}`}
              className="block w-full text-center py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
            >
              View Product Details
            </Link>
          </div>
        </div>

        {/* Scan another */}
        <button
          onClick={onScanAnother}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors"
        >
          <i className="ri-camera-line" />
          Scan another product
        </button>
      </div>
    );
  }

  // No match
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Info header */}
      <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center">
        <i className="ri-search-eye-line text-2xl text-warm-gray" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-lg font-serif font-semibold text-deep">
          Not in Our Catalog
        </h2>
        <p className="text-sm text-warm-gray">
          We couldn't find this product in our database
        </p>
      </div>

      {/* Detected info card */}
      {(result.detectedProduct || result.detectedBrand) && (
        <div className="w-full max-w-sm bg-cream/50 border border-blush/30 rounded-xl p-4">
          <p className="text-xs font-medium text-deep mb-2">We detected</p>
          <div className="flex gap-3">
            <img
              src={previewUrl}
              alt="Scanned product"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="space-y-1">
              {result.detectedBrand && (
                <p className="text-xs text-warm-gray">
                  <span className="font-medium text-deep">{result.detectedBrand}</span>
                </p>
              )}
              {result.detectedProduct && (
                <p className="text-sm font-medium text-deep">{result.detectedProduct}</p>
              )}
              {result.detectedCategory && (
                <p className="text-xs text-warm-gray capitalize">{result.detectedCategory}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Browse similar */}
      <Link
        to={`/discover${result.detectedCategory ? `?category=${result.detectedCategory}` : ''}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
      >
        <i className="ri-compass-3-line" />
        Browse Similar Products
      </Link>

      {/* Scan another */}
      <button
        onClick={onScanAnother}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors"
      >
        <i className="ri-camera-line" />
        Scan another product
      </button>
    </div>
  );
}

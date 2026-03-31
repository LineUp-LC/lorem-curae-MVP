// src/components/feature/WebProductCard.tsx
// Shared product card for web search results (compatible + similar products).

import { useMemo } from 'react';
import type { WebProduct } from '../../types/webSearch';
import { extractBrandSlug } from '../../lib/data/retailerDirectory';

interface WebProductCardProps {
  product: WebProduct;
  /** All sibling products from the same search — used to find brand-site URL */
  allProducts: WebProduct[];
  onWhereToBuy: (product: WebProduct) => void;
}

/**
 * Find a real product page URL on the brand's official site by scanning sibling
 * Serper results. Compares extractBrandSlug(brand) against the domain of each
 * product's externalUrl. Returns the first matching URL, or null.
 */
function findBrandProductUrl(brand: string, allProducts: WebProduct[]): string | null {
  if (!brand || brand.trim().length < 2) return null;
  const brandSlug = extractBrandSlug(brand);
  if (!brandSlug || brandSlug.length < 3) return null;

  for (const p of allProducts) {
    try {
      const domain = new URL(p.externalUrl).hostname.replace(/^www\./, '');
      if (extractBrandSlug(domain) === brandSlug) return p.externalUrl;
    } catch { /* skip invalid URLs */ }
  }
  return null;
}

export default function WebProductCard({ product, allProducts, onWhereToBuy }: WebProductCardProps) {
  const brandUrl = useMemo(
    () => findBrandProductUrl(product.brand, allProducts),
    [product.brand, allProducts],
  );

  return (
    <div className="bg-white rounded-2xl border border-blush shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4">
        <a href={product.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <img
            src={product.image || '/placeholder-product.svg'}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
          />
        </a>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
            {product.brand}
          </p>
          <a href={product.externalUrl} target="_blank" rel="noopener noreferrer">
            <h4 className="text-sm font-semibold text-deep line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h4>
          </a>

          <div className="flex items-center gap-2 mt-1">
            {product.category && (
              <span className="text-xs text-warm-gray capitalize">{product.category}</span>
            )}
            {product.rating > 0 && (
              <>
                <span className="text-warm-gray/30">·</span>
                <div className="flex items-center gap-0.5">
                  <i className="ri-star-fill text-amber-500 text-[10px]" />
                  <span className="text-[11px] text-warm-gray">{product.rating}</span>
                  {product.reviewCount > 0 && (
                    <span className="text-[10px] text-warm-gray/60">({product.reviewCount.toLocaleString()})</span>
                  )}
                </div>
              </>
            )}
            {product.price > 0 && (
              <>
                <span className="text-warm-gray/30">·</span>
                <span className="text-[11px] font-medium text-deep">${product.price.toFixed(2)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[10px] text-warm-gray/70">via {product.merchant}</span>
            <span className="text-[10px] text-warm-gray/40">· Verify ingredients before use</span>
          </div>
        </div>
      </div>

      <div className="border-t border-blush/50 px-4 py-2 flex items-center gap-2">
        {brandUrl && (
          <a
            href={brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-primary hover:text-dark transition-colors"
          >
            <i className="ri-global-line" />
            View on {product.brand}
          </a>
        )}
        <a
          href={product.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-warm-gray hover:text-deep transition-colors ${brandUrl ? '' : 'flex-1'}`}
        >
          <i className="ri-external-link-line" />
          View on {product.merchant}
        </a>
        <button
          onClick={() => onWhereToBuy(product)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <i className="ri-shopping-bag-line" />
          Where to Buy
        </button>
      </div>
    </div>
  );
}

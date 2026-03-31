// src/components/feature/WebProductCard.tsx
// Shared product card for web search results (compatible + similar products).

import type { WebProduct } from '../../types/webSearch';

interface WebProductCardProps {
  product: WebProduct;
  onWhereToBuy: (product: WebProduct) => void;
}

export default function WebProductCard({ product, onWhereToBuy }: WebProductCardProps) {
  const isBrandDirect = product.isBrandDirect === true;

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
            <span className="text-[10px] text-warm-gray/70">
              via {isBrandDirect ? product.brand : product.merchant}
            </span>
            <span className="text-[10px] text-warm-gray/40">· Verify ingredients before use</span>
          </div>
        </div>
      </div>

      <div className="border-t border-blush/50 px-4 py-2 flex items-center gap-2">
        <a
          href={product.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-primary hover:text-dark transition-colors"
        >
          <i className={isBrandDirect ? 'ri-global-line' : 'ri-external-link-line'} />
          {isBrandDirect ? `View on ${product.brand}` : `View on ${product.merchant}`}
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

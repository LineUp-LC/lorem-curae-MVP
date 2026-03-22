/**
 * PostScanDiscovery — compatible product discovery after scanning.
 *
 * Shows category-filtered compatible products from web search (Serper.dev).
 * Each product card links externally to the merchant.
 */

import { useState, useEffect, useMemo } from 'react';
import type { ScanResult } from '../../../types/scan';
import type { Product } from '../../../types/product';
import type { WebProduct } from '../../../types/webSearch';
import { searchCompatibleProducts } from '../../../lib/api/productSearch';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectiveSensitivity,
} from '../../../lib/utils/sessionState';
import { useAuth } from '../../../lib/auth/AuthContext';
import PersonalizingLoader from '../../../components/feature/PersonalizingLoader';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostScanDiscoveryProps {
  scanResult: ScanResult;
  matchedProduct?: Product;
}

type CategoryFilter = 'all' | 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'mask';

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'toner', label: 'Toner' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'sunscreen', label: 'SPF' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'mask', label: 'Mask' },
];

// Number of web results that match each category (for pill counts)
function countByCategory(products: WebProduct[], category: CategoryFilter): number {
  if (category === 'all') return products.length;
  return products.filter(p => p.category?.toLowerCase() === category).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PostScanDiscovery({ scanResult, matchedProduct }: PostScanDiscoveryProps) {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [webProducts, setWebProducts] = useState<WebProduct[]>([]);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState(false);
  const [webCache, setWebCache] = useState<Record<string, WebProduct[]>>({});

  const skinType = getEffectiveSkinType() ?? undefined;
  const concerns = getEffectiveConcerns();
  const sensitivity = getEffectiveSensitivity();

  // Build source product info for search query
  const scanSourceProduct = useMemo(() => {
    const ingredients = (scanResult.ingredients || []).map(i => i.name);
    if (matchedProduct) {
      const keyIngredients = ingredients.length > matchedProduct.keyIngredients.length
        ? ingredients
        : matchedProduct.keyIngredients;
      return {
        name: matchedProduct.name,
        brand: matchedProduct.brand,
        category: matchedProduct.category,
        ingredients: keyIngredients,
      };
    }
    return {
      name: scanResult.detectedProduct || 'Scanned Product',
      brand: scanResult.detectedBrand || 'Unknown',
      category: (scanResult.detectedCategory || 'treatment') as Product['category'],
      ingredients,
    };
  }, [scanResult, matchedProduct]);

  // Filter web results by selected category (client-side)
  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return webProducts;
    return webProducts.filter(p => p.category?.toLowerCase() === categoryFilter);
  }, [webProducts, categoryFilter]);

  // Fetch web products from Serper when category changes
  useEffect(() => {
    if (!user) return;

    const cacheKey = categoryFilter;
    if (webCache[cacheKey]) {
      setWebProducts(webCache[cacheKey]);
      return;
    }

    let cancelled = false;
    setWebLoading(true);
    setWebError(false);

    const minDisplay = new Promise(r => setTimeout(r, 800));
    Promise.all([
      searchCompatibleProducts(
        {
          name: scanSourceProduct.name,
          brand: scanSourceProduct.brand,
          category: scanSourceProduct.category,
          ingredients: scanSourceProduct.ingredients.slice(0, 10),
        },
        { skinType: skinType || undefined, concerns, sensitivity: sensitivity || undefined },
        categoryFilter !== 'all' ? categoryFilter : undefined,
      ),
      minDisplay,
    ]).then(([results]) => {
      if (cancelled) return;
      if (results) {
        setWebProducts(results);
        setWebCache(prev => ({ ...prev, [cacheKey]: results }));
      } else {
        setWebError(true);
        setWebProducts([]);
      }
    }).finally(() => {
      if (!cancelled) setWebLoading(false);
    });

    return () => { cancelled = true; };
  }, [categoryFilter, user, scanSourceProduct, skinType, concerns, sensitivity]);

  return (
    <div className="mt-6 space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <i className="ri-compass-discover-line text-primary" />
        <h3 className="text-base font-serif font-semibold text-deep">
          Find Compatible Products
        </h3>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_OPTIONS.map(opt => {
          const count = countByCategory(webProducts, opt.value);
          if (count === 0 && opt.value !== 'all' && !webLoading) return null;
          return (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-cream text-warm-gray border border-blush hover:bg-blush/30'
              }`}
            >
              {opt.label}
              {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {webLoading && (
        <PersonalizingLoader
          steps={['Searching for compatible products...', 'Filtering by your skin profile...', 'Ranking results...']}
          icon="search"
        />
      )}

      {/* Product cards */}
      {!webLoading && filteredProducts.length > 0 && (
        <div className="space-y-3">
          {filteredProducts.map((wp, idx) => (
            <div key={`compat-${idx}`} className="bg-white rounded-2xl border border-blush shadow-sm overflow-hidden">
              <div className="flex gap-3 p-4">
                <a href={wp.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img
                    src={wp.image || '/placeholder-product.svg'}
                    alt={wp.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                    {wp.brand}
                  </p>
                  <a href={wp.externalUrl} target="_blank" rel="noopener noreferrer">
                    <h4 className="text-sm font-semibold text-deep line-clamp-1 hover:text-primary transition-colors">
                      {wp.name}
                    </h4>
                  </a>

                  <div className="flex items-center gap-2 mt-1">
                    {wp.category && (
                      <span className="text-xs text-warm-gray capitalize">{wp.category}</span>
                    )}
                    {wp.rating > 0 && (
                      <>
                        <span className="text-warm-gray/30">·</span>
                        <div className="flex items-center gap-0.5">
                          <i className="ri-star-fill text-amber-500 text-[10px]" />
                          <span className="text-[11px] text-warm-gray">{wp.rating}</span>
                          {wp.reviewCount > 0 && (
                            <span className="text-[10px] text-warm-gray/60">({wp.reviewCount.toLocaleString()})</span>
                          )}
                        </div>
                      </>
                    )}
                    {wp.price > 0 && (
                      <>
                        <span className="text-warm-gray/30">·</span>
                        <span className="text-[11px] font-medium text-deep">${wp.price.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-warm-gray/70">via {wp.merchant}</span>
                    <span className="text-[10px] text-warm-gray/40">· Verify ingredients before use</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-blush/50 px-4 py-2">
                <a
                  href={wp.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-primary hover:text-dark transition-colors"
                >
                  <i className="ri-external-link-line" />
                  View on {wp.merchant}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {webError && !webLoading && (
        <div className="text-center py-6">
          <p className="text-sm text-warm-gray">
            Web search unavailable. Try again later.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!webLoading && !webError && filteredProducts.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-warm-gray">
            No compatible products found. Try a different category filter.
          </p>
        </div>
      )}
    </div>
  );
}

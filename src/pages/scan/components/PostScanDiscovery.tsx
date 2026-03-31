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
import WhereToBuySheet from '../../../components/feature/WhereToBuySheet';
import WebProductCard from '../../../components/feature/WebProductCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostScanDiscoveryProps {
  scanResult: ScanResult;
  matchedProduct?: Product;
}

type CategoryFilter = 'all' | 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'mask' | 'eye cream';

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'serum', label: 'Serum' },
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'sunscreen', label: 'SPF' },
  { value: 'toner', label: 'Toner' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'eye cream', label: 'Eye Care' },
  { value: 'mask', label: 'Mask' },
];

// Infer category from product name — mirrors Edge Function logic, used for pill counts
function inferCategoryFromName(name: string): CategoryFilter {
  const t = name.toLowerCase();
  if (t.includes('eye cream') || t.includes('eye gel') || t.includes('eye serum') || t.includes('eye care') || t.includes('under eye')) return 'eye cream';
  if (t.includes('sunscreen') || t.includes('sun screen') || /\bspf\s*\d/.test(t) || t.includes('sun protection') || t.includes('uv protect')) return 'sunscreen';
  if (t.includes('mask') || t.includes('masque') || t.includes('sheet mask') || t.includes('clay mask')) return 'mask';
  if (t.includes('cleanser') || t.includes('face wash') || t.includes('cleansing foam') || t.includes('cleansing gel') || t.includes('facial wash') || t.includes('micellar')) return 'cleanser';
  if (t.includes('toner') || t.includes('toning water') || t.includes('facial mist')) return 'toner';
  if (t.includes('serum') || t.includes('ampoule')) return 'serum';
  if (t.includes('moisturizer') || t.includes('moisturiser') || t.includes('face cream') || t.includes('day cream') || t.includes('night cream') || t.includes('hydrating cream') || t.includes('face lotion')) return 'moisturizer';
  return 'treatment';
}

// Number of web results that match each category (inferred from title, independent of cached stamps)
function countByCategory(products: WebProduct[], category: CategoryFilter): number {
  if (category === 'all') return products.length;
  return products.filter(p => inferCategoryFromName(p.name) === category).length;
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
  const [wtbProduct, setWtbProduct] = useState<WebProduct | null>(null);

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

  // Filter client-side using the same inference as countByCategory — counts always match display
  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return webProducts;
    return webProducts.filter(p => inferCategoryFromName(p.name) === categoryFilter);
  }, [webProducts, categoryFilter]);

  // Fetch once on mount — all filtering is client-side so no re-fetch per category
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setWebLoading(true);
    setWebError(false);

    searchCompatibleProducts(
      {
        name: scanSourceProduct.name,
        brand: scanSourceProduct.brand,
        category: scanSourceProduct.category,
        ingredients: scanSourceProduct.ingredients.slice(0, 10),
      },
      { skinType: skinType || undefined, concerns, sensitivity: sensitivity || undefined },
    ).then((results) => {
      if (cancelled) return;
      if (results) {
        setWebProducts(results);
      } else {
        setWebError(true);
        setWebProducts([]);
      }
    }).finally(() => {
      if (!cancelled) setWebLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, scanSourceProduct, skinType, concerns, sensitivity]);

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
            <WebProductCard key={`compat-${idx}`} product={wp} allProducts={webProducts} onWhereToBuy={setWtbProduct} />
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

      {/* Where to Buy sheet */}
      {wtbProduct && (
        <WhereToBuySheet
          isOpen={!!wtbProduct}
          onClose={() => setWtbProduct(null)}
          targetProduct={wtbProduct}
          allWebProducts={webProducts}
          productName={wtbProduct.name}
          productBrand={wtbProduct.brand}
          wasScanned
        />
      )}
    </div>
  );
}

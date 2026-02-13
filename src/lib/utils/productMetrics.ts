import type { Product, ActiveIngredient, ProductSize } from '../../types/product';

// ============================================
// UNIT CONVERSION
// ============================================

const ML_PER_OZ = 29.5735;
const ML_PER_FL_OZ = 29.5735;

/**
 * Convert any size unit to milliliters
 */
export function convertToMl(size: ProductSize): number | null {
  if (!size || size.value <= 0) return null;

  switch (size.unit) {
    case 'ml':
      return size.value;
    case 'oz':
    case 'fl oz':
      return size.value * ML_PER_OZ;
    case 'g':
      // Approximate: 1g ≈ 1ml for most skincare products
      return size.value;
    default:
      return null;
  }
}

/**
 * Format size for display (e.g., "30 ml" or "1 oz")
 */
export function formatSize(size?: ProductSize): string | null {
  if (!size || size.value <= 0) return null;
  return `${size.value} ${size.unit}`;
}

// ============================================
// PRICE PER ML (PPML) CALCULATIONS
// ============================================

/**
 * Calculate Price Per Milliliter
 * Returns null if data is invalid or missing
 */
export function calculatePPML(product: Product): number | null {
  // Validate price
  if (typeof product.price !== 'number' || product.price <= 0) {
    return null;
  }

  // Validate size
  if (!product.size) {
    return null;
  }

  const mlValue = convertToMl(product.size);
  if (!mlValue || mlValue <= 0) {
    return null;
  }

  return product.price / mlValue;
}

/**
 * Format PPML for display
 */
export function formatPPML(ppml: number | null): string | null {
  if (ppml === null || !isFinite(ppml)) return null;
  return `$${ppml.toFixed(2)}/ml`;
}

/**
 * Check if a product has valid PPML data
 */
export function hasPPMLData(product: Product): boolean {
  return calculatePPML(product) !== null;
}

// ============================================
// CONCENTRATION HELPERS
// ============================================

/**
 * Format concentration for display
 * Returns "Present" if concentration is unknown
 */
export function formatConcentration(ingredient: ActiveIngredient): string {
  if (typeof ingredient.concentration !== 'number') {
    return 'Present';
  }

  const unit = ingredient.concentrationUnit || '%';
  return `${ingredient.concentration}${unit}`;
}

/**
 * Get the primary/key active ingredient from a product
 */
export function getPrimaryActiveIngredient(product: Product): ActiveIngredient | null {
  if (!product.activeIngredients || product.activeIngredients.length === 0) {
    return null;
  }

  // Find ingredient marked as key active
  const keyActive = product.activeIngredients.find(i => i.isKeyActive);
  if (keyActive) return keyActive;

  // Fall back to first ingredient with concentration
  const withConcentration = product.activeIngredients.find(
    i => typeof i.concentration === 'number'
  );
  if (withConcentration) return withConcentration;

  // Fall back to first ingredient
  return product.activeIngredients[0];
}

/**
 * Check if a product has any concentration data
 */
export function hasConcentrationData(product: Product): boolean {
  if (!product.activeIngredients || product.activeIngredients.length === 0) {
    return false;
  }
  return product.activeIngredients.some(i => typeof i.concentration === 'number');
}

/**
 * Check if a product has any active ingredients listed
 */
export function hasActiveIngredients(product: Product): boolean {
  return !!product.activeIngredients && product.activeIngredients.length > 0;
}

// ============================================
// COMPARISON METRICS
// ============================================

export interface ComparisonMetrics {
  /** Product ID with lowest PPML (best value) */
  bestValueProductId: number | null;
  /** Lowest PPML value */
  bestPPML: number | null;
  /** Product ID with highest PPML (worst value) */
  worstValueProductId: number | null;
  /** Highest PPML value */
  worstPPML: number | null;
  /** Map of ingredient name -> { productId, concentration, count } for highest concentration */
  highestConcentrations: Map<string, { productId: number; concentration: number; count: number }>;
  /** Number of products with valid PPML data */
  productsWithPPML: number;
  /** Number of products with concentration data */
  productsWithConcentration: number;
}

/**
 * Calculate comparison metrics across multiple products
 */
export function calculateComparisonMetrics(products: Product[]): ComparisonMetrics {
  const metrics: ComparisonMetrics = {
    bestValueProductId: null,
    bestPPML: null,
    worstValueProductId: null,
    worstPPML: null,
    highestConcentrations: new Map(),
    productsWithPPML: 0,
    productsWithConcentration: 0,
  };

  if (products.length === 0) return metrics;

  // Calculate PPML metrics
  const ppmlData: { productId: number; ppml: number }[] = [];
  
  for (const product of products) {
    const ppml = calculatePPML(product);
    if (ppml !== null) {
      ppmlData.push({ productId: product.id, ppml });
    }
    
    if (hasConcentrationData(product)) {
      metrics.productsWithConcentration++;
    }
  }

  metrics.productsWithPPML = ppmlData.length;

  // Only calculate best/worst if we have at least 2 products with PPML
  if (ppmlData.length >= 2) {
    const sorted = [...ppmlData].sort((a, b) => a.ppml - b.ppml);
    metrics.bestValueProductId = sorted[0].productId;
    metrics.bestPPML = sorted[0].ppml;
    metrics.worstValueProductId = sorted[sorted.length - 1].productId;
    metrics.worstPPML = sorted[sorted.length - 1].ppml;
  }

  // Calculate highest concentrations per ingredient
  // First pass: count products per ingredient
  const ingredientCounts = new Map<string, number>();
  for (const product of products) {
    if (!product.activeIngredients) continue;
    for (const ingredient of product.activeIngredients) {
      if (typeof ingredient.concentration !== 'number') continue;
      const normalizedName = ingredient.name.toLowerCase().trim();
      ingredientCounts.set(normalizedName, (ingredientCounts.get(normalizedName) || 0) + 1);
    }
  }

  // Second pass: find highest concentration per ingredient
  for (const product of products) {
    if (!product.activeIngredients) continue;

    for (const ingredient of product.activeIngredients) {
      if (typeof ingredient.concentration !== 'number') continue;

      // Normalize ingredient name for comparison (case-insensitive)
      const normalizedName = ingredient.name.toLowerCase().trim();
      const existing = metrics.highestConcentrations.get(normalizedName);
      const count = ingredientCounts.get(normalizedName) || 1;

      if (!existing || ingredient.concentration > existing.concentration) {
        metrics.highestConcentrations.set(normalizedName, {
          productId: product.id,
          concentration: ingredient.concentration,
          count: count,
        });
      }
    }
  }

  return metrics;
}

/**
 * Check if a product has the highest concentration for a given ingredient
 * Only returns true if there are at least 2 products with this ingredient to compare
 */
export function hasHighestConcentration(
  productId: number,
  ingredientName: string,
  metrics: ComparisonMetrics
): boolean {
  const normalizedName = ingredientName.toLowerCase().trim();
  const highest = metrics.highestConcentrations.get(normalizedName);
  // Only show trophy if this product has highest AND at least 2 products have this ingredient
  return highest?.productId === productId && highest?.count >= 2;
}

/**
 * Check if a product is the best value (lowest PPML)
 */
export function isBestValue(productId: number, metrics: ComparisonMetrics): boolean {
  return metrics.bestValueProductId === productId && metrics.productsWithPPML >= 2;
}

/**
 * Check if a product is the worst value (highest PPML)
 */
export function isWorstValue(productId: number, metrics: ComparisonMetrics): boolean {
  return metrics.worstValueProductId === productId && metrics.productsWithPPML >= 2;
}

// ============================================
// DATA VALIDATION HELPERS
// ============================================

/**
 * Validate if price is available and valid
 */
export function hasValidPrice(product: Product): boolean {
  return typeof product.price === 'number' && product.price > 0;
}

/**
 * Validate if size is available and valid
 */
export function hasValidSize(product: Product): boolean {
  return !!product.size && product.size.value > 0;
}

/**
 * Get display text for missing data scenarios
 */
export function getMissingDataText(field: 'price' | 'size' | 'rating' | 'brand' | 'ingredients'): string {
  const messages: Record<string, string> = {
    price: 'Price unavailable',
    size: 'Size not available',
    rating: 'No reviews yet',
    brand: '',
    ingredients: 'Ingredients not provided',
  };
  return messages[field] || '';
}
import type { Product } from '../../types/product';
import type { InferredTexture } from './productKnowledge';
import type { ProductCategory } from '../utils/categoryRegistry';

// ---------------------------------------------------------------------------
// Name-keyword patterns — highest priority
// ---------------------------------------------------------------------------

const NAME_KEYWORDS: [RegExp, InferredTexture][] = [
  [/\bgel\b/i, 'gel'],
  [/\bbalm\b/i, 'balm'],
  [/\bfoam(ing)?\b/i, 'foam'],
  [/\bmist\b/i, 'mist-texture'],
  [/\bpaste\b/i, 'paste'],
  [/\bemulsion\b/i, 'emulsion'],
  [/\blotion\b/i, 'lotion'],
  [/\bcream\b/i, 'cream'],
  [/\bserum\b/i, 'serum-texture'],
  [/\boil\b/i, 'oil-texture'],
  [/\bliquid\b/i, 'liquid'],
  [/\btoner\b/i, 'liquid'],
];

// ---------------------------------------------------------------------------
// Category defaults — second priority
// ---------------------------------------------------------------------------

const CATEGORY_DEFAULTS: Partial<Record<ProductCategory, InferredTexture>> = {
  cleanser: 'gel',
  toner: 'liquid',
  serum: 'serum-texture',
  essence: 'liquid',
  moisturizer: 'cream',
  sunscreen: 'lotion',
  treatment: 'serum-texture',
  mask: 'paste',
  exfoliator: 'liquid',
  oil: 'oil-texture',
  mist: 'mist-texture',
  'eye-care': 'cream',
  'lip-care': 'balm',
};

// ---------------------------------------------------------------------------
// Ingredient heuristic — lowest priority fallback
// ---------------------------------------------------------------------------

const OCCLUSIVE_INGREDIENTS = [
  'shea butter', 'beeswax', 'lanolin', 'petrolatum',
  'cocoa butter', 'candelilla wax',
];

const LIGHT_HUMECTANT_INGREDIENTS = [
  'hyaluronic acid', 'niacinamide', 'glycerin', 'aloe vera',
  'sodium hyaluronate', 'beta-glucan',
];

function inferFromIngredients(ingredients: string[]): InferredTexture | null {
  const lower = ingredients.map(i => i.toLowerCase());
  const occlusiveCount = lower.filter(i =>
    OCCLUSIVE_INGREDIENTS.some(o => i.includes(o)),
  ).length;
  const humectantCount = lower.filter(i =>
    LIGHT_HUMECTANT_INGREDIENTS.some(h => i.includes(h)),
  ).length;

  if (occlusiveCount >= 2) return 'balm';
  if (humectantCount >= 2) return 'gel';
  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Infers canonical texture from product metadata using a 3-layer priority:
 * 1. Name keywords (regex scan)
 * 2. Category defaults
 * 3. Ingredient heuristic
 *
 * If the product has an explicit `texture` field, that value is mapped directly.
 */
export function inferTexture(product: Product): InferredTexture {
  // If product has explicit texture (future enrichment)
  const explicit = (product as unknown as Record<string, unknown>).texture;
  if (typeof explicit === 'string') {
    const mapped = mapExplicitTexture(explicit);
    if (mapped) return mapped;
  }

  // Layer 1: name keywords
  for (const [pattern, texture] of NAME_KEYWORDS) {
    if (pattern.test(product.name)) return texture;
  }

  // Layer 2: category default
  const catDefault = CATEGORY_DEFAULTS[product.category];
  if (catDefault) return catDefault;

  // Layer 3: ingredient heuristic
  const ingredients = product.keyIngredients || [];
  const fromIngredients = inferFromIngredients(ingredients);
  if (fromIngredients) return fromIngredients;

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Map explicit texture string to InferredTexture
// ---------------------------------------------------------------------------

function mapExplicitTexture(raw: string): InferredTexture | null {
  const map: Record<string, InferredTexture> = {
    gel: 'gel',
    cream: 'cream',
    lotion: 'lotion',
    balm: 'balm',
    oil: 'oil-texture',
    liquid: 'liquid',
    foam: 'foam',
    paste: 'paste',
    emulsion: 'emulsion',
    mist: 'mist-texture',
    serum: 'serum-texture',
  };
  return map[raw.toLowerCase()] ?? null;
}

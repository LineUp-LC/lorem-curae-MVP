/**
 * Product Time-of-Day Classification
 *
 * Automatically determines whether a product belongs in an AM routine,
 * PM routine, or both, based on skincare science rules applied to the
 * product's name, description, category, and ingredients.
 *
 * Priority order:
 *   1. Keyword scan (name + description)
 *   2. Ingredient scan (keyIngredients + activeIngredients)
 *   3. Category default
 *   4. Fallback → ['am', 'pm']
 */

import type { Product } from '../../types/product';

type TimeSlot = 'am' | 'pm';

// ---------------------------------------------------------------------------
// Signal dictionaries (exported for reuse by other surfaces)
// ---------------------------------------------------------------------------

/** Ingredients that are photosensitive or best used with UV protection */
export const AM_INGREDIENTS = [
  'vitamin c',
  'ascorbic acid',
  'l-ascorbic acid',
  'ferulic acid',
  'zinc oxide',
  'titanium dioxide',
  'avobenzone',
  'octinoxate',
  'homosalate',
];

/** Ingredients that are photosensitising, exfoliating, or best used at night */
export const PM_INGREDIENTS = [
  'retinol',
  'retinal',
  'retinoid',
  'tretinoin',
  'adapalene',
  'tazarotene',
  'glycolic acid',
  'lactic acid',
  'mandelic acid',
  'salicylic acid',
  'benzoyl peroxide',
  'azelaic acid',
  'aha',
  'bha',
  'pha',
];

/** Keywords in name / description that signal AM use */
export const AM_KEYWORDS = [
  'day cream',
  'day moistur',
  'morning',
  'brightening',
  'antioxidant',
  'sunscreen',
  'sun protection',
  'spf',
  'uv ',
  'uv-',
];

/** Keywords in name / description that signal PM use */
export const PM_KEYWORDS = [
  'night',
  'overnight',
  'peel',
  'exfoliat',
  'resurfac',
  'retinol',
  'retinal',
];

/** Category → default time slot when no ingredient / keyword signals exist */
const CATEGORY_DEFAULTS: Record<string, TimeSlot[]> = {
  sunscreen: ['am'],
  mask: ['pm'],
  exfoliator: ['pm'],
  cleanser: ['am', 'pm'],
  moisturizer: ['am', 'pm'],
  toner: ['am', 'pm'],
  essence: ['am', 'pm'],
  mist: ['am', 'pm'],
  oil: ['am', 'pm'],
  'lip-care': ['am', 'pm'],
  'eye-care': ['am', 'pm'],
  tool: ['am', 'pm'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(s: string): string {
  return s.toLowerCase().trim();
}

function textContainsAny(text: string, keywords: string[]): boolean {
  const lower = normalise(text);
  return keywords.some((kw) => lower.includes(kw));
}

function collectIngredientNames(product: Product): string[] {
  const names: string[] = [];
  if (product.keyIngredients) {
    names.push(...product.keyIngredients);
  }
  if (product.activeIngredients) {
    names.push(...product.activeIngredients.map((a) => a.name));
  }
  return names;
}

// ---------------------------------------------------------------------------
// Core classifier
// ---------------------------------------------------------------------------

/**
 * Classify a product's recommended time of day.
 *
 * Returns `['am']`, `['pm']`, or `['am', 'pm']`.
 */
export function classifyTimeOfDay(product: Product): TimeSlot[] {
  let hasAM = false;
  let hasPM = false;

  // Combined text for keyword scanning
  const searchText = `${product.name} ${product.description}`;

  // Layer 1 — keyword scan (name + description)
  if (textContainsAny(searchText, AM_KEYWORDS)) hasAM = true;
  if (textContainsAny(searchText, PM_KEYWORDS)) hasPM = true;

  // Layer 2 — ingredient scan
  const ingredients = collectIngredientNames(product);
  for (const ing of ingredients) {
    if (textContainsAny(ing, AM_INGREDIENTS)) hasAM = true;
    if (textContainsAny(ing, PM_INGREDIENTS)) hasPM = true;
  }

  // If we found at least one signal, return the result
  if (hasAM || hasPM) {
    if (hasAM && hasPM) return ['am', 'pm'];
    return hasAM ? ['am'] : ['pm'];
  }

  // Layer 3 — category default
  const categoryDefault = CATEGORY_DEFAULTS[normalise(product.category)];
  if (categoryDefault) return categoryDefault;

  // Layer 4 — fallback
  return ['am', 'pm'];
}

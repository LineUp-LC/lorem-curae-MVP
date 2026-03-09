/**
 * Ingredient Slug Resolution (Node-safe)
 *
 * Pure slug ↔ name resolution with zero browser dependencies.
 * Safe for use in Node scripts (seed, migration) and browser code alike.
 *
 * The canonical slug registry lives here. ingredientProducts.ts uses the
 * same map — keep them in sync when adding new ingredients.
 */

/**
 * Canonical ingredient slug-to-name map.
 * Maps normalized slugs to display name variations used in product
 * keyIngredients / activeIngredients arrays.
 */
export const SLUG_TO_NAME: Record<string, string[]> = {
  'hyaluronic-acid': ['hyaluronic acid'],
  'niacinamide': ['niacinamide'],
  'retinol': ['retinol'],
  'vitamin-c': ['vitamin c', 'ascorbic acid', 'l-ascorbic acid'],
  'ceramides': ['ceramides', 'ceramide'],
  'peptides': ['peptides', 'peptide'],
  'centella-asiatica': ['centella asiatica', 'centella', 'cica'],
  'salicylic-acid': ['salicylic acid'],
  'glycolic-acid': ['glycolic acid'],
};

/**
 * Resolve a display ingredient name (INCI or common) to a canonical slug.
 * Strips parenthetical text, lowercases, and fuzzy-matches against SLUG_TO_NAME.
 * Returns the slug string or null if no match exists.
 */
export function getIngredientSlug(name: string): string | null {
  const normalized = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
  if (!normalized) return null;

  for (const [slug, variations] of Object.entries(SLUG_TO_NAME)) {
    if (variations.some(v => normalized.includes(v) || v.includes(normalized))) {
      return slug;
    }
  }
  return null;
}

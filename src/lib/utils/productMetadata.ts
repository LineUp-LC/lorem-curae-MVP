/**
 * Product Metadata Validation Utilities
 *
 * Enforces common-sense rules before metadata is rendered:
 * - Skin Types: "all" absorbs specific types (no contradictions)
 * - Skin Type matching: "All Skin Types" always matches the user
 */

/**
 * Normalize a product's skinTypes array (Ruleset A).
 *
 * 1. If the array contains 'all' → return ['All Skin Types']
 * 2. Otherwise return deduplicated, capitalized types
 * 3. Empty/undefined → return []
 */
export function normalizeSkinTypes(types: string[] | undefined): string[] {
  if (!types || types.length === 0) return [];

  const hasAll = types.some((t) => t.toLowerCase() === 'all');
  if (hasAll) return ['All Skin Types'];

  // Deduplicate (case-insensitive) and capitalize first letter
  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of types) {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(t);
    }
  }
  return result;
}

/**
 * Check if a single (already-normalized) skin type matches the user's type.
 *
 * - 'All Skin Types' or 'all' → always matches
 * - Otherwise case-insensitive comparison
 */
export function isSkinTypeMatch(
  type: string,
  userSkinType: string | undefined,
): boolean {
  if (!userSkinType) return false;
  const lower = type.toLowerCase();
  if (lower === 'all skin types' || lower === 'all') return true;
  return lower === userSkinType.toLowerCase();
}

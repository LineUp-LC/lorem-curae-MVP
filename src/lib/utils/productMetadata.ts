/**
 * Product metadata normalization utilities.
 *
 * Provides skin-type normalization and matching used across
 * product catalog, comparison, and ingredient surfaces.
 */

/**
 * Normalize an array of skin-type strings.
 * Lowercases, trims whitespace, and filters out empty values.
 */
export function normalizeSkinTypes(skinTypes: string[]): string[] {
  if (!skinTypes) return [];
  return skinTypes
    .map((st) => st.trim().toLowerCase())
    .filter((st) => st.length > 0);
}

/**
 * Check whether a single product skin-type token matches the user's skin type.
 *
 * Returns `true` when:
 * - the product token is "all" (suits every skin type — always matches), OR
 * - the token equals the user's skin type (case-insensitive).
 *
 * Returns `false` when `userSkinType` is undefined or empty,
 * UNLESS the product token is "all" (which always returns true).
 */
export function isSkinTypeMatch(
  type: string,
  userSkinType: string | undefined,
): boolean {
  const normalizedType = type.trim().toLowerCase();
  if (normalizedType === 'all') return !!userSkinType;
  if (!userSkinType) return false;
  const normalizedUser = userSkinType.trim().toLowerCase();
  return normalizedType === normalizedUser;
}

/**
 * Check whether a metadata value is the universal "all" override.
 * Case-insensitive, trimmed.
 */
export function isAllMetadata(value: string): boolean {
  return value.trim().toLowerCase() === 'all';
}

const ALL_DISPLAY_LABELS: Record<string, string> = {
  skinType: 'All Skin Types',
  concern: 'All Concerns',
  timeOfDay: 'All Day',
  category: 'All Products',
};

/**
 * Return a user-friendly display label for an "all" metadata value.
 * Falls back to "All" if the category is not recognized.
 */
export function getMetadataDisplayLabel(value: string, category: string): string {
  if (!isAllMetadata(value)) return value;
  return ALL_DISPLAY_LABELS[category] ?? 'All';
}

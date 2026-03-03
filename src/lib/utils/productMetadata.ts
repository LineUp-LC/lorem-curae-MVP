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
 * - the product token is "all" (suits every skin type), OR
 * - the token equals the user's skin type (case-insensitive).
 *
 * Returns `false` when `userSkinType` is undefined or empty.
 */
export function isSkinTypeMatch(
  type: string,
  userSkinType: string | undefined,
): boolean {
  if (!userSkinType) return false;
  const normalizedType = type.trim().toLowerCase();
  const normalizedUser = userSkinType.trim().toLowerCase();
  return normalizedType === 'all' || normalizedType === normalizedUser;
}

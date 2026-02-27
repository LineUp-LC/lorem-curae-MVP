/**
 * Converts any string to a URL-safe slug.
 * "Hyaluronic Acid" → "hyaluronic-acid"
 * "Vitamin C" → "vitamin-c"
 * "AHA/BHA Toner" → "aha-bha-toner"
 */
export function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

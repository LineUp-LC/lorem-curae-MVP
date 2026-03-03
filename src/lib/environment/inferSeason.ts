import type { EnvironmentContext } from './context';

/**
 * Infer the current season from the hemisphere. Deterministic — uses the
 * current date and the user's hemisphere to return one of the four seasons.
 *
 * If hemisphere is unknown or null, defaults to northern hemisphere.
 */
export function inferSeason(
  hemisphere?: string | null,
): NonNullable<EnvironmentContext['season']> {
  const month = new Date().getMonth(); // 0-indexed: 0 = Jan, 11 = Dec

  const isNorthern = hemisphere !== 'southern';

  // Northern hemisphere mapping
  // Mar(2)–May(4)  → spring
  // Jun(5)–Aug(7)  → summer
  // Sep(8)–Nov(10) → autumn
  // Dec(11), Jan(0), Feb(1) → winter
  if (month >= 2 && month <= 4) return isNorthern ? 'spring' : 'autumn';
  if (month >= 5 && month <= 7) return isNorthern ? 'summer' : 'winter';
  if (month >= 8 && month <= 10) return isNorthern ? 'autumn' : 'spring';
  return isNorthern ? 'winter' : 'summer';
}

/**
 * Infer hemisphere from latitude. Returns 'northern' for lat >= 0,
 * 'southern' for lat < 0.
 */
export function inferHemisphere(lat: number): 'northern' | 'southern' {
  return lat >= 0 ? 'northern' : 'southern';
}

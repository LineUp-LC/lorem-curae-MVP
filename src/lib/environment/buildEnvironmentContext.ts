import { locationState } from '../utils/locationState';
import type { EnvironmentContext } from './context';
import { inferClimate } from './inferClimate';
import { inferSeason, inferHemisphere } from './inferSeason';
import { getUvIndex } from './uvProvider';

/**
 * Build an EnvironmentContext from the user's stored location.
 *
 * - No lat/lon → source = 'mock' with default values
 * - lat/lon present → source = 'live' with real UV, inferred climate/season
 * - City but no lat/lon → source = 'partial' with inferred season only
 */
export async function buildEnvironmentContext(): Promise<EnvironmentContext> {
  const location = locationState.getLocation();

  // No location at all → mock
  if (!location) {
    return mockContext();
  }

  const hasCoords = typeof location.lat === 'number' && typeof location.lon === 'number';

  if (hasCoords) {
    const lat = location.lat!;
    const lon = location.lon!;
    const hemisphere = location.hemisphere ?? inferHemisphere(lat);

    const [uv, climate, season] = await Promise.all([
      getUvIndex(lat, lon),
      Promise.resolve(inferClimate(lat, lon)),
      Promise.resolve(inferSeason(hemisphere)),
    ]);

    return {
      location: {
        city: location.city || undefined,
        region: location.region || location.state || undefined,
        country: location.country || undefined,
        lat,
        lon,
      },
      uvIndex: uv.uvIndex,
      uvBand: uv.uvBand,
      climate,
      season,
      source: 'live',
    };
  }

  // City/state/zip exist but no coordinates → partial
  const hasTextLocation = !!(location.city || location.state || location.zip);
  if (hasTextLocation) {
    const hemisphere = location.hemisphere ?? 'northern';
    const season = inferSeason(hemisphere);

    return {
      location: {
        city: location.city || undefined,
        region: location.region || location.state || undefined,
        country: location.country || undefined,
      },
      season,
      source: 'partial',
    };
  }

  return mockContext();
}

function mockContext(): EnvironmentContext {
  return {
    location: {},
    source: 'mock',
    uvBand: 'moderate',
    uvIndex: 5.5,
    climate: 'humid_continental',
    season: 'spring',
  };
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Server-side geocoding wrapper. Converts city/region/postalCode/country
 * into lat/lon coordinates. All geocoding requests must go through this
 * function — no component may call external geocoding APIs directly.
 *
 * Expects: POST { city?, region?, postalCode?, country? }
 * Returns: { lat, lon, normalizedCity, normalizedRegion, normalizedCountry } | { error }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, region, postalCode, country } = await req.json();

    if (!city && !postalCode) {
      throw new Error('At least city or postalCode is required');
    }

    const apiKey = Deno.env.get('GEOCODING_API_KEY');

    // Build a search query from available fields
    const queryParts = [city, region, postalCode, country].filter(Boolean);
    const query = queryParts.join(', ');

    if (apiKey) {
      // Real API call (OpenCage-compatible endpoint)
      const encoded = encodeURIComponent(query);
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encoded}&key=${apiKey}&limit=1&no_annotations=1`,
      );

      if (!res.ok) {
        console.error('Geocoding API error:', res.status, await res.text());
        throw new Error('Geocoding service unavailable');
      }

      const data = await res.json();
      const result = data.results?.[0];

      if (!result) {
        throw new Error('No results found for the given location');
      }

      const components = result.components || {};

      return new Response(
        JSON.stringify({
          lat: result.geometry.lat,
          lon: result.geometry.lng,
          normalizedCity: components.city || components.town || components.village || city || null,
          normalizedRegion: components.state || components.county || region || null,
          normalizedCountry: components.country || country || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // No API key configured — return a fallback for known locations
    const fallback = getFallbackCoordinates(city, region, country);

    if (fallback) {
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Cannot geocode without API key and no fallback match
    return new Response(
      JSON.stringify({ error: 'Geocoding service not configured. Enter coordinates manually or use browser location.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

/**
 * Fallback coordinates for common US cities when no geocoding API is configured.
 * This allows basic functionality during development without an API key.
 */
function getFallbackCoordinates(
  city?: string,
  region?: string,
  _country?: string,
): { lat: number; lon: number; normalizedCity: string; normalizedRegion: string; normalizedCountry: string } | null {
  const lookup: Record<string, { lat: number; lon: number; region: string; country: string }> = {
    'new york': { lat: 40.7128, lon: -74.006, region: 'New York', country: 'US' },
    'los angeles': { lat: 34.0522, lon: -118.2437, region: 'California', country: 'US' },
    'chicago': { lat: 41.8781, lon: -87.6298, region: 'Illinois', country: 'US' },
    'houston': { lat: 29.7604, lon: -95.3698, region: 'Texas', country: 'US' },
    'phoenix': { lat: 33.4484, lon: -112.074, region: 'Arizona', country: 'US' },
    'miami': { lat: 25.7617, lon: -80.1918, region: 'Florida', country: 'US' },
    'seattle': { lat: 47.6062, lon: -122.3321, region: 'Washington', country: 'US' },
    'denver': { lat: 39.7392, lon: -104.9903, region: 'Colorado', country: 'US' },
    'san francisco': { lat: 37.7749, lon: -122.4194, region: 'California', country: 'US' },
    'boston': { lat: 42.3601, lon: -71.0589, region: 'Massachusetts', country: 'US' },
    'london': { lat: 51.5074, lon: -0.1278, region: 'England', country: 'GB' },
    'paris': { lat: 48.8566, lon: 2.3522, region: 'Île-de-France', country: 'FR' },
    'tokyo': { lat: 35.6762, lon: 139.6503, region: 'Kantō', country: 'JP' },
    'sydney': { lat: -33.8688, lon: 151.2093, region: 'New South Wales', country: 'AU' },
  };

  const key = city?.toLowerCase().trim();
  if (!key || !lookup[key]) return null;

  const match = lookup[key];
  return {
    lat: match.lat,
    lon: match.lon,
    normalizedCity: city!,
    normalizedRegion: region || match.region,
    normalizedCountry: _country || match.country,
  };
}

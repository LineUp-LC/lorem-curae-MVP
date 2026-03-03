import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Server-side UV index wrapper. This is the ONLY place external UV APIs
 * are called. All frontend UV requests must go through this function.
 *
 * Expects: POST { lat: number, lon: number }
 * Returns: { uvIndex: number, uvBand: string }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('lat and lon are required numeric fields');
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('lat must be -90..90, lon must be -180..180');
    }

    const apiKey = Deno.env.get('UV_API_KEY');

    let uvIndex: number;

    if (apiKey) {
      // Real API call (OpenUV-compatible endpoint)
      const res = await fetch(
        `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`,
        { headers: { 'x-access-token': apiKey } },
      );

      if (!res.ok) {
        console.error('UV API error:', res.status, await res.text());
        // Fall back to estimation
        uvIndex = estimateUvFromLatitude(lat);
      } else {
        const data = await res.json();
        uvIndex = data.result?.uv ?? estimateUvFromLatitude(lat);
      }
    } else {
      // No API key configured — use latitude-based estimation
      uvIndex = estimateUvFromLatitude(lat);
    }

    const uvBand = classifyUvBand(uvIndex);

    return new Response(
      JSON.stringify({ uvIndex: Math.round(uvIndex * 10) / 10, uvBand }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
 * Estimate UV index from latitude when no API key is configured.
 * Uses a simple model: UV is highest at equator, lowest at poles,
 * with seasonal adjustment based on hemisphere.
 */
function estimateUvFromLatitude(lat: number): number {
  const absLat = Math.abs(lat);
  const month = new Date().getMonth(); // 0-indexed

  // Base UV decreases with latitude
  const baseUv = Math.max(1, 12 - (absLat / 90) * 11);

  // Seasonal modifier: higher in summer, lower in winter
  const isNorthernSummer = lat >= 0 && month >= 4 && month <= 8;
  const isSouthernSummer = lat < 0 && (month >= 10 || month <= 2);
  const isSummer = isNorthernSummer || isSouthernSummer;
  const seasonalModifier = isSummer ? 1.3 : 0.7;

  return Math.round(baseUv * seasonalModifier * 10) / 10;
}

function classifyUvBand(uv: number): string {
  if (uv < 3) return 'low';
  if (uv < 6) return 'moderate';
  if (uv < 8) return 'high';
  if (uv < 11) return 'very_high';
  return 'extreme';
}

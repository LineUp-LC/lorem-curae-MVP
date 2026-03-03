import { supabase } from '../supabase-browser';
import type { EnvironmentContext } from './context';

/**
 * Fetch UV index from the server-side wrapper. This is the ONLY client-side
 * function that should call the UV Edge Function. No component may call
 * external UV APIs directly.
 */
export async function getUvIndex(
  lat: number,
  lon: number,
): Promise<{ uvIndex: number; uvBand: NonNullable<EnvironmentContext['uvBand']> }> {
  try {
    const { data, error } = await supabase.functions.invoke('get-uv-index', {
      body: { lat, lon },
    });

    if (error || !data) {
      console.error('UV index fetch failed:', error);
      return fallbackUv();
    }

    return {
      uvIndex: data.uvIndex ?? 5,
      uvBand: data.uvBand ?? 'moderate',
    };
  } catch (e) {
    console.error('UV index fetch error:', e);
    return fallbackUv();
  }
}

function fallbackUv(): { uvIndex: number; uvBand: NonNullable<EnvironmentContext['uvBand']> } {
  return { uvIndex: 5, uvBand: 'moderate' };
}

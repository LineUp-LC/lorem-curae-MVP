import type { EnvironmentContext } from './context';

/**
 * Infer climate classification from latitude and longitude using a coarse
 * Köppen-like mapping. Deterministic — no API calls.
 */
export function inferClimate(lat: number, lon: number): NonNullable<EnvironmentContext['climate']> {
  const absLat = Math.abs(lat);

  // Polar regions
  if (absLat > 66.5) return 'polar';

  // Tropical belt
  if (absLat < 23.5) return 'tropical';

  // Subtropical / lower-mid latitude (23.5–35)
  if (absLat < 35) {
    // Arid belts: Sahara / Middle East, Arabian Peninsula, SW North America,
    // central Australia, southern Africa interior
    if (isAridRegion(lat, lon)) return 'arid';

    // Mediterranean: coastal western edges of continents at these latitudes
    if (isMediterraneanRegion(lat, lon)) return 'mediterranean';

    // Default subtropical → tropical-leaning
    return 'tropical';
  }

  // Mid-latitude (35–66.5)
  if (isMediterraneanRegion(lat, lon)) return 'mediterranean';
  if (isAridRegion(lat, lon)) return 'arid';

  return 'humid_continental';
}

/**
 * Coarse check for arid regions based on known desert belts.
 */
function isAridRegion(lat: number, lon: number): boolean {
  const absLat = Math.abs(lat);

  // Sahara & Middle East (northern Africa + Arabian Peninsula)
  if (absLat >= 15 && absLat <= 35 && lon >= -17 && lon <= 60) return true;

  // Central Asia (Gobi, Taklamakan)
  if (absLat >= 35 && absLat <= 50 && lon >= 55 && lon <= 110) return true;

  // SW North America (Sonoran, Mojave, Chihuahuan)
  if (lat >= 23 && lat <= 40 && lon >= -120 && lon <= -100) return true;

  // Central Australia
  if (lat <= -20 && lat >= -35 && lon >= 120 && lon <= 150) return true;

  // Southern Africa (Kalahari, Namib)
  if (lat <= -18 && lat >= -35 && lon >= 12 && lon <= 30) return true;

  return false;
}

/**
 * Coarse check for Mediterranean-type climates (Csa/Csb). Typically found
 * on western coasts of continents between ~30–45° latitude.
 */
function isMediterraneanRegion(lat: number, lon: number): boolean {
  const absLat = Math.abs(lat);
  if (absLat < 30 || absLat > 45) return false;

  // Mediterranean basin (Southern Europe, North Africa coast, Levant)
  if (lat >= 30 && lat <= 45 && lon >= -10 && lon <= 40) return true;

  // California
  if (lat >= 32 && lat <= 42 && lon >= -125 && lon <= -115) return true;

  // Central Chile
  if (lat <= -30 && lat >= -40 && lon >= -75 && lon <= -70) return true;

  // SW Australia
  if (lat <= -30 && lat >= -38 && lon >= 114 && lon <= 120) return true;

  // South Africa (Western Cape)
  if (lat <= -32 && lat >= -36 && lon >= 17 && lon <= 20) return true;

  return false;
}

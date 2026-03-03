export type EnvironmentContext = {
  location: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  uvIndex?: number;
  uvBand?: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  climate?: 'humid_continental' | 'mediterranean' | 'tropical' | 'arid' | 'polar' | 'unknown';
  season?: 'winter' | 'spring' | 'summer' | 'autumn';
  source: 'mock' | 'live' | 'partial';
};

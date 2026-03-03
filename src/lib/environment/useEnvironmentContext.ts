import { useState, useEffect, useCallback } from 'react';
import { locationState } from '../utils/locationState';
import type { EnvironmentContext } from './context';
import { buildEnvironmentContext } from './buildEnvironmentContext';

/**
 * React hook that provides the current EnvironmentContext. Fetches on mount,
 * re-fetches when the user's stored location changes, and exposes a manual
 * refresh function.
 *
 * All UI surfaces that need UV, climate, or season data must use this hook.
 * No component may compute these values manually.
 */
export function useEnvironmentContext(): {
  env: EnvironmentContext | null;
  loading: boolean;
  refresh: () => void;
} {
  const [env, setEnv] = useState<EnvironmentContext | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContext = useCallback(async () => {
    setLoading(true);
    try {
      const ctx = await buildEnvironmentContext();
      setEnv(ctx);
    } catch (e) {
      console.error('Failed to build environment context:', e);
      // Fallback to mock on error
      setEnv({
        location: {},
        source: 'mock',
        uvBand: 'moderate',
        uvIndex: 5.5,
        climate: 'humid_continental',
        season: 'spring',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // Re-fetch when location changes
  useEffect(() => {
    return locationState.subscribe(() => {
      fetchContext();
    });
  }, [fetchContext]);

  return { env, loading, refresh: fetchContext };
}

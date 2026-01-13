import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorageState
 *
 * A hook that syncs React state with localStorage for client-side persistence.
 * Follows existing observable patterns in the codebase.
 *
 * @param key - The localStorage key
 * @param initialValue - Default value if nothing is stored
 * @param options - Optional configuration
 */
interface UseLocalStorageStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageStateOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  // Initialize state from localStorage or use initial value
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return deserialize(stored);
      }
    } catch (e) {
      console.warn(`Failed to load localStorage key "${key}":`, e);
    }
    return initialValue;
  });

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(state));
    } catch (e) {
      console.warn(`Failed to save localStorage key "${key}":`, e);
    }
  }, [key, state, serialize]);

  // Wrapper to update state
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  // Clear this key from localStorage and reset to initial
  const clearValue = useCallback(() => {
    localStorage.removeItem(key);
    setState(initialValue);
  }, [key, initialValue]);

  return [state, setValue, clearValue];
}

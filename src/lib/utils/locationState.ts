import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  city: string;
  state: string;
  zip: string;
}

const STORAGE_KEY = 'user_location';

class LocationStateManager {
  private listeners: Set<(location: UserLocation | null) => void> = new Set();

  getLocation(): UserLocation | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  setLocation(location: UserLocation): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save location:', e);
    }
  }

  clearLocation(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  subscribe(listener: (location: UserLocation | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const location = this.getLocation();
    this.listeners.forEach(listener => listener(location));
  }
}

export const locationState = new LocationStateManager();

export function useUserLocation() {
  const [location, setLocationState] = useState<UserLocation | null>(
    () => locationState.getLocation()
  );

  useEffect(() => {
    return locationState.subscribe((loc) => setLocationState(loc));
  }, []);

  const setLocation = useCallback((loc: UserLocation) => {
    locationState.setLocation(loc);
  }, []);

  const clearLocation = useCallback(() => {
    locationState.clearLocation();
  }, []);

  const displayString = location
    ? [location.city, location.state].filter(Boolean).join(', ')
    : '';

  return {
    location,
    setLocation,
    clearLocation,
    displayString,
    hasLocation: !!location && !!(location.city || location.state || location.zip),
  };
}

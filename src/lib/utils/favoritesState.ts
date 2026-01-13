/**
 * Favorites State Management
 *
 * Provides reactive localStorage persistence for user product favorites/bookmarks.
 * Follows the existing observable pattern from cartState.ts.
 */

import { useState, useEffect, useCallback } from 'react';

export interface FavoriteProduct {
  id: number;
  name: string;
  brand: string;
  image: string;
  priceRange?: string;
  category?: string;
  skinTypes?: string[];
  savedAt: string;
}

class FavoritesStateManager {
  private listeners: Set<(favorites: FavoriteProduct[]) => void> = new Set();
  private storageKey = 'user_favorites';

  // Toast callback for when a product is added
  private onAddCallback: ((productName: string) => void) | null = null;

  // Get all favorites
  getFavorites(): FavoriteProduct[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load favorites:', e);
      return [];
    }
  }

  // Save favorites to localStorage
  private saveFavorites(favorites: FavoriteProduct[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favorites));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }

  // Check if a product is favorited
  isFavorite(productId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => f.id === productId);
  }

  // Add a product to favorites
  addFavorite(product: Omit<FavoriteProduct, 'savedAt'>): void {
    const favorites = this.getFavorites();
    if (!favorites.some(f => f.id === product.id)) {
      favorites.push({
        ...product,
        savedAt: new Date().toISOString(),
      });
      this.saveFavorites(favorites);
      if (this.onAddCallback) {
        this.onAddCallback(product.name);
      }
    }
  }

  // Remove a product from favorites
  removeFavorite(productId: number): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(f => f.id !== productId);
    this.saveFavorites(filtered);
  }

  // Toggle favorite status
  toggleFavorite(product: Omit<FavoriteProduct, 'savedAt'>): boolean {
    if (this.isFavorite(product.id)) {
      this.removeFavorite(product.id);
      return false;
    } else {
      this.addFavorite(product);
      return true;
    }
  }

  // Get favorites count
  getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  // Clear all favorites
  clearFavorites(): void {
    this.saveFavorites([]);
  }

  // Set callback for when a product is added (for toast notifications)
  setOnAddCallback(callback: ((productName: string) => void) | null): void {
    this.onAddCallback = callback;
  }

  // Subscribe to favorites changes
  subscribe(listener: (favorites: FavoriteProduct[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getFavorites());
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    const favorites = this.getFavorites();
    this.listeners.forEach(listener => listener(favorites));
  }
}

// Singleton instance
export const favoritesState = new FavoritesStateManager();

// React hook for favorites list
export function useFavorites(): {
  favorites: FavoriteProduct[];
  addFavorite: (product: Omit<FavoriteProduct, 'savedAt'>) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (product: Omit<FavoriteProduct, 'savedAt'>) => boolean;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
  count: number;
} {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(favoritesState.getFavorites());

  useEffect(() => {
    return favoritesState.subscribe(setFavorites);
  }, []);

  return {
    favorites,
    addFavorite: favoritesState.addFavorite.bind(favoritesState),
    removeFavorite: favoritesState.removeFavorite.bind(favoritesState),
    toggleFavorite: favoritesState.toggleFavorite.bind(favoritesState),
    isFavorite: favoritesState.isFavorite.bind(favoritesState),
    clearFavorites: favoritesState.clearFavorites.bind(favoritesState),
    count: favorites.length,
  };
}

// React hook for single product favorite status (optimized for product cards)
export function useFavoriteStatus(productId: number): {
  isFavorite: boolean;
  toggle: () => void;
} {
  const [isFavorite, setIsFavorite] = useState(() => favoritesState.isFavorite(productId));

  useEffect(() => {
    const unsubscribe = favoritesState.subscribe(() => {
      setIsFavorite(favoritesState.isFavorite(productId));
    });
    return unsubscribe;
  }, [productId]);

  const toggle = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  return { isFavorite, toggle };
}

/**
 * Recently Viewed Products State Management
 *
 * Tracks the last 10 products viewed by the user.
 * Follows the existing observable pattern from cartState.ts.
 */

import { useState, useEffect } from 'react';

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  brand: string;
  image: string;
  priceRange?: string;
  category?: string;
  viewedAt: string;
}

const MAX_ITEMS = 10;

class RecentlyViewedStateManager {
  private listeners: Set<(items: RecentlyViewedProduct[]) => void> = new Set();
  private storageKey = 'recently_viewed_products';

  // Get all recently viewed products
  getRecentlyViewed(): RecentlyViewedProduct[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load recently viewed:', e);
      return [];
    }
  }

  // Save to localStorage
  private saveRecentlyViewed(items: RecentlyViewedProduct[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save recently viewed:', e);
    }
  }

  // Add a product to recently viewed
  addRecentlyViewed(product: Omit<RecentlyViewedProduct, 'viewedAt'>): void {
    let items = this.getRecentlyViewed();

    // Remove existing entry if present (deduplication)
    items = items.filter(item => item.id !== product.id);

    // Add to beginning with timestamp
    items.unshift({
      ...product,
      viewedAt: new Date().toISOString(),
    });

    // Limit to MAX_ITEMS
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    this.saveRecentlyViewed(items);
  }

  // Clear all recently viewed
  clearRecentlyViewed(): void {
    this.saveRecentlyViewed([]);
  }

  // Get count
  getCount(): number {
    return this.getRecentlyViewed().length;
  }

  // Subscribe to changes
  subscribe(listener: (items: RecentlyViewedProduct[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getRecentlyViewed());
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(): void {
    const items = this.getRecentlyViewed();
    this.listeners.forEach(listener => listener(items));
  }
}

// Singleton instance
export const recentlyViewedState = new RecentlyViewedStateManager();

// React hook for recently viewed products
export function useRecentlyViewed(): {
  items: RecentlyViewedProduct[];
  addItem: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void;
  clear: () => void;
  count: number;
} {
  const [items, setItems] = useState<RecentlyViewedProduct[]>(recentlyViewedState.getRecentlyViewed());

  useEffect(() => {
    return recentlyViewedState.subscribe(setItems);
  }, []);

  return {
    items,
    addItem: recentlyViewedState.addRecentlyViewed.bind(recentlyViewedState),
    clear: recentlyViewedState.clearRecentlyViewed.bind(recentlyViewedState),
    count: items.length,
  };
}

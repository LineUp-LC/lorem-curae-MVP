/**
 * Saved Products State Management
 *
 * Provides reactive localStorage persistence for user saved products.
 * Follows the existing observable pattern from cartState.ts.
 * Includes Supabase sync for authenticated users.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase-browser';
import { onAction } from './gamificationTriggers';

export interface SavedProduct {
  id: number;
  name: string;
  brand: string;
  image: string;
  priceRange?: string;
  category?: string;
  skinTypes?: string[];
  savedAt: string;
}

class SavedProductsStateManager {
  private listeners: Set<(products: SavedProduct[]) => void> = new Set();
  private storageKey = 'savedProducts';

  // Toast callback for when a product is added
  private onAddCallback: ((productName: string) => void) | null = null;

  // Get all saved products
  getSavedProducts(): SavedProduct[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load saved products:', e);
      return [];
    }
  }

  // Save products to localStorage
  private saveProducts(products: SavedProduct[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(products));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }

  // Check if a product is saved
  isSaved(productId: number): boolean {
    const products = this.getSavedProducts();
    return products.some(p => p.id === productId);
  }

  // Add a product to saved
  addSavedProduct(product: Omit<SavedProduct, 'savedAt'>): void {
    const products = this.getSavedProducts();
    if (!products.some(p => p.id === product.id)) {
      products.push({
        ...product,
        savedAt: new Date().toISOString(),
      });
      this.saveProducts(products);
      if (this.onAddCallback) {
        this.onAddCallback(product.name);
      }
      // Gamification: award save points (non-blocking)
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          onAction(data.user.id, 'PRODUCT_SAVED', {
            totalSavedProducts: this.getSavedProducts().length,
          }).catch(() => {});
        }
      });
      // Sync to Supabase (async, non-blocking)
      this.syncToSupabase();
    }
  }

  // Remove a product from saved
  removeSavedProduct(productId: number): void {
    const products = this.getSavedProducts();
    const filtered = products.filter(p => p.id !== productId);
    this.saveProducts(filtered);
    // Sync to Supabase (async, non-blocking)
    this.syncToSupabase();
  }

  // Toggle saved status
  toggleSaved(product: Omit<SavedProduct, 'savedAt'>): boolean {
    if (this.isSaved(product.id)) {
      this.removeSavedProduct(product.id);
      return false;
    } else {
      this.addSavedProduct(product);
      return true;
    }
  }

  // Get saved products count
  getSavedProductsCount(): number {
    return this.getSavedProducts().length;
  }

  // Clear all saved products
  clearSavedProducts(): void {
    this.saveProducts([]);
  }

  // Sync saved products to Supabase (for authenticated users)
  async syncToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only sync for authenticated users

      const products = this.getSavedProducts();

      // Get current profile to merge preferences
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const currentPrefs = profile?.preferences || {};

      const { error } = await supabase
        .from('users_profiles')
        .update({
          preferences: {
            ...currentPrefs,
            savedProducts: products,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('[DataSync] Failed to sync saved products:', error);
      } else {
        console.log('[DataSync] Saved products synced to Supabase');
      }
    } catch (e) {
      console.error('[DataSync] Error syncing saved products:', e);
    }
  }

  // Hydrate saved products from Supabase profile
  async hydrateFromSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const serverProducts: SavedProduct[] = profile?.preferences?.savedProducts || [];
      const localProducts = this.getSavedProducts();

      // Merge: combine server and local, dedupe by ID
      const mergedMap = new Map<number, SavedProduct>();
      serverProducts.forEach(p => mergedMap.set(p.id, p));
      localProducts.forEach(p => {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, p);
        }
      });

      const merged = Array.from(mergedMap.values());
      this.saveProducts(merged);
      console.log('[DataSync] Saved products hydrated from Supabase');
    } catch (e) {
      console.error('[DataSync] Error hydrating saved products:', e);
    }
  }

  // Set callback for when a product is added (for toast notifications)
  setOnAddCallback(callback: ((productName: string) => void) | null): void {
    this.onAddCallback = callback;
  }

  // Subscribe to saved products changes
  subscribe(listener: (products: SavedProduct[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getSavedProducts());
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    const products = this.getSavedProducts();
    this.listeners.forEach(listener => listener(products));
  }
}

// Singleton instance
export const savedProductsState = new SavedProductsStateManager();

// React hook for saved products list
export function useSavedProducts(): {
  savedProducts: SavedProduct[];
  addSavedProduct: (product: Omit<SavedProduct, 'savedAt'>) => void;
  removeSavedProduct: (productId: number) => void;
  toggleSaved: (product: Omit<SavedProduct, 'savedAt'>) => boolean;
  isSaved: (productId: number) => boolean;
  clearSavedProducts: () => void;
  count: number;
} {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(savedProductsState.getSavedProducts());

  useEffect(() => {
    return savedProductsState.subscribe(setSavedProducts);
  }, []);

  return {
    savedProducts,
    addSavedProduct: savedProductsState.addSavedProduct.bind(savedProductsState),
    removeSavedProduct: savedProductsState.removeSavedProduct.bind(savedProductsState),
    toggleSaved: savedProductsState.toggleSaved.bind(savedProductsState),
    isSaved: savedProductsState.isSaved.bind(savedProductsState),
    clearSavedProducts: savedProductsState.clearSavedProducts.bind(savedProductsState),
    count: savedProducts.length,
  };
}

// React hook for single product saved status (optimized for product cards)
export function useSavedProductStatus(product: Omit<SavedProduct, 'savedAt'>): {
  isSaved: boolean;
  toggle: () => void;
} {
  const [isSaved, setIsSaved] = useState(() => savedProductsState.isSaved(product.id));

  useEffect(() => {
    const unsubscribe = savedProductsState.subscribe(() => {
      setIsSaved(savedProductsState.isSaved(product.id));
    });
    return unsubscribe;
  }, [product.id]);

  const toggle = useCallback(() => {
    savedProductsState.toggleSaved(product);
  }, [product]);

  return { isSaved, toggle };
}

// Dynamic cart state management - updates cart count badge in real-time

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

class CartStateManager {
  private listeners: Set<(count: number) => void> = new Set();
  private storageKey = 'cart_items';

  // Get current cart items
  getCartItems(): CartItem[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart items:', e);
      return [];
    }
  }

  // Save cart items
  private saveCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save cart items:', e);
    }
  }

  // Get total item count
  getCartCount(): number {
    const items = this.getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  // Add item to cart
  addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const items = this.getCartItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      // Update quantity if item already exists
      items[existingIndex].quantity += item.quantity || 1;
    } else {
      // Add new item
      items.push({ ...item, quantity: item.quantity || 1 } as CartItem);
    }

    this.saveCartItems(items);
  }

  // Update item quantity
  updateQuantity(id: number, quantity: number): void {
    if (quantity < 1) return;
    
    const items = this.getCartItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index >= 0) {
      items[index].quantity = quantity;
      this.saveCartItems(items);
    }
  }

  // Remove item from cart
  removeItem(id: number): void {
    const items = this.getCartItems();
    const filtered = items.filter(item => item.id !== id);
    this.saveCartItems(filtered);
  }

  // Clear entire cart
  clearCart(): void {
    this.saveCartItems([]);
  }

  // Subscribe to cart count changes
  subscribe(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current count
    listener(this.getCartCount());
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of count change
  private notifyListeners(): void {
    const count = this.getCartCount();
    this.listeners.forEach(listener => listener(count));
  }

  // Sync cart items with component state (for cart page)
  syncWithState(items: CartItem[]): void {
    this.saveCartItems(items);
  }
}

// Singleton instance
export const cartState = new CartStateManager();

// React hook for cart count
import { useState, useEffect } from 'react';

export function useCartCount(): number {
  const [count, setCount] = useState(cartState.getCartCount());

  useEffect(() => {
    return cartState.subscribe(setCount);
  }, []);

  return count;
}

// React hook for cart items
export function useCartItems(): {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  count: number;
} {
  const [items, setItems] = useState<CartItem[]>(cartState.getCartItems());
  const count = useCartCount();

  useEffect(() => {
    const unsubscribe = cartState.subscribe(() => {
      setItems(cartState.getCartItems());
    });
    return unsubscribe;
  }, []);

  return {
    items,
    addItem: cartState.addItem.bind(cartState),
    updateQuantity: cartState.updateQuantity.bind(cartState),
    removeItem: cartState.removeItem.bind(cartState),
    clearCart: cartState.clearCart.bind(cartState),
    count,
  };
}

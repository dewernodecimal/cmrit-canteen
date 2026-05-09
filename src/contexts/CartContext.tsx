'use client';

// ============================================================
// Cart Context — Shopping Cart State Management
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import type { MenuItem, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.CART);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Corrupted data — ignore
    }
  }, []);

  // Sync to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  }, [items]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    sessionStorage.removeItem(STORAGE_KEYS.CART);
  }, []);

  const getItemQuantity = useCallback(
    (menuItemId: string) => {
      return items.find((i) => i.menuItem.id === menuItemId)?.quantity ?? 0;
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        totalItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

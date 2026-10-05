'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CartProduct {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  image?: string;
  is_digital: boolean;
  variantId?: string;
  variantTitle?: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartProduct[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, delta: number, variantId?: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize guestSessionId & load local storage cache
  useEffect(() => {
    try {
      let gId = localStorage.getItem('sawfy_guest_id');
      if (!gId) {
        gId = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('sawfy_guest_id', gId);
      }
      setGuestSessionId(gId);

      const saved = localStorage.getItem('sawfy_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsInitialized(true);
  }, []);

  // Fetch latest cart from server /api/cart
  const refreshCart = useCallback(async () => {
    try {
      let gId = guestSessionId || (typeof window !== 'undefined' ? localStorage.getItem('sawfy_guest_id') : '');
      const res = await fetch(`/api/cart${gId ? `?guestSessionId=${gId}` : ''}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          localStorage.setItem('sawfy_cart', JSON.stringify(data.items));
        }
      }
    } catch (err) {
      console.warn('Cart refresh failed, using cached state', err);
    }
  }, [guestSessionId]);

  // Initial server fetch + Supabase Realtime listener & focus refetch
  useEffect(() => {
    if (!isInitialized) return;
    refreshCart();

    // 1. Refetch when window regains focus (e.g. user added item on mobile phone)
    const handleFocus = () => {
      refreshCart();
    };
    window.addEventListener('focus', handleFocus);

    // 2. Realtime listener on Supabase cart_items
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel('public:cart_items')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cart_items' },
          () => {
            refreshCart();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription skipped', e);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch (_) {}
      }
    };
  }, [isInitialized, refreshCart]);

  // Persist local changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('sawfy_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = async (newProduct: CartProduct) => {
    // 1. Optimistic local update
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === newProduct.id && item.variantId === newProduct.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newProduct.quantity || 1;
        return updated;
      }

      return [...prev, { ...newProduct, quantity: newProduct.quantity || 1 }];
    });
    setIsOpen(true);

    // 2. Sync to server API
    try {
      const gId = guestSessionId || localStorage.getItem('sawfy_guest_id');
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newProduct.id,
          variantId: newProduct.variantId,
          quantity: newProduct.quantity || 1,
          guestSessionId: gId,
        }),
      });
      // Silent refetch to sync identifiers
      setTimeout(refreshCart, 400);
    } catch (err) {
      console.warn('Failed to sync added item to server', err);
    }
  };

  const removeFromCart = async (id: string, variantId?: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.variantId === variantId)));

    try {
      const gId = guestSessionId || localStorage.getItem('sawfy_guest_id');
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          variantId,
          guestSessionId: gId,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync remove to server', err);
    }
  };

  const updateQuantity = async (id: string, delta: number, variantId?: string) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartProduct[]
    );

    try {
      const gId = guestSessionId || localStorage.getItem('sawfy_guest_id');
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          variantId,
          quantity: delta,
          guestSessionId: gId,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync quantity to server', err);
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      const gId = guestSessionId || localStorage.getItem('sawfy_guest_id');
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearAll: true,
          guestSessionId: gId,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync clear cart to server', err);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

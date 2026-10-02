'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sawfy_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage
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

  const addToCart = (newProduct: CartProduct) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === newProduct.id && item.variantId === newProduct.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newProduct.quantity || 1;
        return updated;
      }

      return [...prev, { ...newProduct, quantity: newProduct.quantity || 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.variantId === variantId)
      )
    );
  };

  const updateQuantity = (id: string, delta: number, variantId?: string) => {
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
  };

  const clearCart = () => setItems([]);

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

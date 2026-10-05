'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  price: number;
  image: string;
  badge?: string;
  weightInfo?: string;
  is_digital?: boolean;
  addedAt?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const supabase = createClient();

  const broadcastSync = useCallback(() => {
    try {
      supabase.channel('sawfy_wishlist_sync').send({
        type: 'broadcast',
        event: 'wishlist_sync',
        payload: { source: 'web', timestamp: Date.now() },
      });
    } catch (_) {}
  }, [supabase]);

  const refreshWishlist = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const q = new URLSearchParams();
      if (user?.id) q.set('userId', user.id);
      if (user?.email) q.set('email', user.email);
      const url = q.toString() ? `/api/wishlist?${q.toString()}` : '/api/wishlist';

      const res = await fetch(url, {
        cache: 'no-store',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          localStorage.setItem('sawfy_wishlist', JSON.stringify(data.items));
        }
      }
    } catch (err) {
      console.warn('Wishlist refresh error:', err);
    }
  }, [supabase]);

  useEffect(() => {
    // 1. Initial cached state
    try {
      const saved = localStorage.getItem('sawfy_wishlist');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (_) {}

    refreshWishlist();

    // 2. Realtime Broadcast Listener
    const channel = supabase
      .channel('sawfy_wishlist_sync')
      .on('broadcast', { event: 'wishlist_sync' }, () => {
        refreshWishlist();
      })
      .subscribe();

    // 3. Focus & Polling
    const handleFocus = () => refreshWishlist();
    window.addEventListener('focus', handleFocus);
    const pollTimer = setInterval(refreshWishlist, 2000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((i) => i.id === productId);
    },
    [items]
  );

  const toggleWishlist = async (product: any) => {
    const exists = isInWishlist(product.id);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    if (exists) {
      // Remove
      setItems((prev) => prev.filter((i) => i.id !== product.id));
      try {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({
            productId: product.id,
            userId: user?.id,
            email: user?.email,
          }),
        });
        broadcastSync();
      } catch (_) {}
    } else {
      // Add
      const newItem: WishlistItem = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        base_price: Number(product.base_price || product.price || 0),
        price: Number(product.price || product.base_price || 0),
        image: product.image || product.images?.[0] || '/images/catfish-real-glass-plate.png',
        badge: product.badge,
        weightInfo: product.weightInfo,
        is_digital: !!product.is_digital,
      };
      setItems((prev) => [newItem, ...prev]);
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            product: newItem,
            userId: user?.id,
            email: user?.email,
          }),
        });
        broadcastSync();
      } catch (_) {}
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          productId,
          userId: user?.id,
          email: user?.email,
        }),
      });
      broadcastSync();
    } catch (_) {}
  };


  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

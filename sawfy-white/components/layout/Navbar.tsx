'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';

export function Navbar({ locale = 'en' }: { locale?: string }) {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <a href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#008751] to-emerald-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
            🐟
          </div>
          <div>
            <span className="font-extrabold text-xl text-[#006b3f] tracking-tight block leading-none font-serif">
              Sawfy White
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#D4A843] font-bold block mt-0.5">
              Enterprises • Abeokuta
            </span>
          </div>
        </a>

        {/* Links & Interactive Cart */}
        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-700">
          <a
            href={`/${locale}/products`}
            className="hover:text-[#008751] transition-colors hidden sm:inline"
          >
            Products
          </a>
          <a
            href={`/${locale}/login`}
            className="hover:text-[#008751] transition-colors hidden sm:inline text-xs"
          >
            Sign In
          </a>

          {/* Cart Button with live counter badge */}
          <button
            onClick={openCart}
            className="relative px-3.5 py-2 rounded-xl bg-[#008751]/10 hover:bg-[#008751]/20 text-[#006b3f] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-base">🛒</span>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-[#008751] text-white text-[11px] px-1.5 py-0.2 rounded-full font-extrabold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Quick Checkout CTA */}
          <a
            href={`/${locale}/checkout`}
            className="bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Checkout</span>
            <span>→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

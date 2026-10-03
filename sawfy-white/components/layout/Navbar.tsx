'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function Navbar({ locale = 'en' }: { locale?: string }) {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo with Abstract Golden Leaping Catfish Crest */}
        <a href={`/${locale}`} className="group transition-opacity hover:opacity-95">
          <BrandLogo size="md" />
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
            href={`/${locale}/blog`}
            className="hover:text-[#008751] transition-colors hidden md:inline text-xs"
          >
            Blog
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

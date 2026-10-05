'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';

export interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  images: string[];
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'teal';
  is_digital?: boolean;
  variants?: any[];
  weightInfo?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Selections' },
  { id: 'whole', label: 'Whole Catfish' },
  { id: 'flakes', label: 'Flakes & Soup Cuts' },
  { id: 'bulk', label: 'Bulk Wholesale' },
  { id: 'digital', label: 'Digital Cookbook' },
];

function getProductCategory(p: CatalogProduct): string {
  if (p.is_digital || p.slug.includes('cookbook')) return 'digital';
  if (p.slug.includes('bulk') || p.title.toLowerCase().includes('bulk') || p.title.toLowerCase().includes('wholesale')) return 'bulk';
  if (
    p.slug.includes('flakes') ||
    p.slug.includes('cuts') ||
    p.slug.includes('steaks') ||
    p.title.toLowerCase().includes('flakes') ||
    p.title.toLowerCase().includes('soup pieces') ||
    p.title.toLowerCase().includes('steaks')
  ) {
    return 'flakes';
  }
  return 'whole';
}

export function CatalogExplorer({
  products,
  locale,
}: {
  products: CatalogProduct[];
  locale: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = getProductCategory(p);
        if (cat !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesBadge = p.badge?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBadge) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Bar & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catfish sizes, cuts, flakes, cookbook..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008751] focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#008751] text-white shadow-xs scale-102'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Results Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of {products.length} products
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-[#008751] font-bold hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              description={p.description}
              base_price={p.base_price}
              image={p.images[0]}
              images={p.images}
              badge={p.badge}
              badgeColor={p.badgeColor}
              is_digital={p.is_digital}
              variants={p.variants}
              weightInfo={p.weightInfo}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-gray-50/60 rounded-3xl border border-dashed border-gray-300 p-8">
          <div className="text-3xl mb-3">🐟</div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
            No catfish products match your current search &ldquo;{searchQuery}&rdquo;. Try another term or reset your category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2.5 bg-[#008751] text-white text-xs font-bold rounded-xl hover:bg-[#006b3f] transition-all cursor-pointer shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

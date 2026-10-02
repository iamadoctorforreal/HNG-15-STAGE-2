'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';

export interface ProductVariantData {
  id: string;
  title: string;
  price: number;
}

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  image: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'teal';
  is_digital?: boolean;
  variants?: ProductVariantData[];
}

export function ProductCard({
  id,
  title,
  slug,
  description,
  base_price,
  image,
  badge = 'Export Grade',
  badgeColor = 'emerald',
  is_digital = false,
  variants = [],
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantData | undefined>(
    variants.length > 0 ? variants[0] : undefined
  );
  const [added, setAdded] = useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : base_price;

  const handleAdd = () => {
    addToCart({
      id,
      title,
      slug,
      base_price,
      image,
      is_digital,
      variantId: selectedVariant?.id,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badgeStyles = {
    emerald: 'bg-emerald-50 text-[#008751] border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
  }[badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Product Image */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${badgeStyles}`}
          >
            {badge}
          </span>
        </div>
        {is_digital && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-2xs">
            ⚡ Instant Download
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#008751] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                Select Option:
              </label>
              <select
                value={selectedVariant?.id}
                onChange={(e) => {
                  const found = variants.find((v) => v.id === e.target.value);
                  setSelectedVariant(found);
                }}
                className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-[#008751]"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title} — ₦{v.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-gray-400 block">Price</span>
            <span className="text-xl font-extrabold text-gray-900">
              ₦{currentPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-[#008751] hover:bg-[#006b3f] text-white hover:shadow-md'
            }`}
          >
            <span>{added ? '✓ Added' : '🛒 Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

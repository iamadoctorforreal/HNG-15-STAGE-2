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
  images?: string[];
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'teal';
  is_digital?: boolean;
  variants?: ProductVariantData[];
  weightInfo?: string; // e.g. "Approx. 4-6 pieces per 500g"
}

export function ProductCard({
  id,
  title,
  slug,
  description,
  base_price,
  image,
  images = [],
  badge = 'Export Grade',
  badgeColor = 'emerald',
  is_digital = false,
  variants = [],
  weightInfo,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantData | undefined>(
    variants.length > 0 ? variants[0] : undefined
  );
  const [added, setAdded] = useState(false);

  // Multi-image carousel state
  const imageGallery = images.length > 0 ? images : [image];
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const currentPrice = selectedVariant ? selectedVariant.price : base_price;

  const handleAdd = () => {
    addToCart({
      id,
      title,
      slug,
      base_price,
      image: imageGallery[0],
      is_digital,
      variantId: selectedVariant?.id,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const badgeStyles = {
    emerald: 'bg-emerald-50 text-[#008751] border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
  }[badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Product Image Carousel */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100 select-none">
        <Image
          src={imageGallery[activeImgIndex]}
          alt={`${title} - view ${activeImgIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false}
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${badgeStyles}`}
          >
            {badge}
          </span>
        </div>

        {is_digital && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-2xs border border-gray-100">
            ⚡ Instant Download
          </div>
        )}

        {/* Carousel arrows (only if multiple images) */}
        {imageGallery.length > 1 && (
          <>
            <button
              onClick={prevImg}
              aria-label="Previous view"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              ‹
            </button>
            <button
              onClick={nextImg}
              aria-label="Next view"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              ›
            </button>

            {/* Thumbnail dots indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-2xs">
              {imageGallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeImgIndex ? 'bg-[#E8C468] w-3.5' : 'bg-white/60'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#008751] transition-colors leading-snug">
              {title}
            </h3>
          </div>

          {weightInfo && (
            <p className="text-[11px] font-semibold text-[#008751] bg-emerald-50 inline-block px-2 py-0.5 rounded mt-1.5">
              ⚖️ {weightInfo}
            </p>
          )}

          <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Select Option:
              </label>
              <select
                value={selectedVariant?.id}
                onChange={(e) => {
                  const found = variants.find((v) => v.id === e.target.value);
                  setSelectedVariant(found);
                }}
                className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-[#008751] focus:bg-white transition-colors"
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
            <span className="text-[11px] text-gray-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-[#005230]">
              ₦{currentPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
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

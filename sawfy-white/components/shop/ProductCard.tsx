'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  weightInfo?: string;
  locale?: string;
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
  locale = 'en',
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantData | undefined>(
    variants.length > 0 ? variants[0] : undefined
  );
  const [added, setAdded] = useState(false);

  // Multi-image gallery carousel
  const imageGallery = images && images.length > 0 ? images : [image];
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const currentPrice = selectedVariant ? selectedVariant.price : base_price;
  const productUrl = `/${locale}/products/${slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
    router.push(`/${locale}/checkout`);
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImgIndex((prev) => (prev + 1) % imageGallery.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImgIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  };

  const badgeStyles = {
    emerald: 'bg-emerald-50 text-[#008751] border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
  }[badgeColor];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Product Image Carousel - Clickable to Product Page */}
      <div className="relative h-68 w-full overflow-hidden bg-gray-100 select-none">
        <a href={productUrl} className="block w-full h-full relative cursor-pointer">
          <Image
            src={imageGallery[activeImgIndex]}
            alt={`${title} - view ${activeImgIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={false}
          />
        </a>

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${badgeStyles}`}
          >
            {badge}
          </span>
        </div>

        {is_digital && (
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 shadow-2xs border border-gray-100 pointer-events-none">
            ⚡ Instant Download
          </div>
        )}

        {/* Image count pill */}
        {imageGallery.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs pointer-events-none">
            {activeImgIndex + 1}/{imageGallery.length}
          </div>
        )}

        {/* Carousel arrows */}
        {imageGallery.length > 1 && (
          <>
            <button
              onClick={prevImg}
              aria-label="Previous view"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white text-base flex items-center justify-center transition-all cursor-pointer z-10 shadow-md active:scale-90"
            >
              ‹
            </button>
            <button
              onClick={nextImg}
              aria-label="Next view"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white text-base flex items-center justify-center transition-all cursor-pointer z-10 shadow-md active:scale-90"
            >
              ›
            </button>

            {/* Thumbnail dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {imageGallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveImgIndex(idx);
                  }}
                  className={`rounded-full transition-all cursor-pointer ${
                    idx === activeImgIndex ? 'bg-[#E8C468] w-4 h-1.5' : 'bg-white/70 w-1.5 h-1.5'
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
            <a href={productUrl} className="group-hover:text-[#008751] transition-colors">
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug line-clamp-2 hover:underline">
                {title}
              </h3>
            </a>
          </div>

          {weightInfo && (
            <p className="text-[11px] font-semibold text-[#008751] bg-emerald-50 border border-emerald-100/80 inline-block px-2.5 py-0.5 rounded-full mt-2">
              ⚖️ {weightInfo}
            </p>
          )}

          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Option Selector */}
          {variants.length > 0 && (
            <div className="mt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Select Sizing / Option:
              </label>
              <select
                value={selectedVariant?.id}
                onChange={(e) => {
                  const found = variants.find((v) => v.id === e.target.value);
                  setSelectedVariant(found);
                }}
                className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#008751] focus:bg-white transition-colors"
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

        {/* Dual Actions: Add to Cart + Buy Now */}
        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Price</span>
            <span className="text-xl font-black text-[#005230]">
              ₦{currentPrice.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs border cursor-pointer active:scale-95 ${
                added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-emerald-50 text-[#006b3f] border-[#008751]/40'
              }`}
            >
              <span>{added ? '✓ In Cart' : '🛒 Add to Cart'}</span>
            </button>

            {/* Direct Buy Now Checkout Button */}
            <button
              onClick={handleBuyNow}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#008751] hover:bg-[#006b3f] text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span>⚡ Buy Now</span>
            </button>
          </div>

          <a
            href={productUrl}
            className="block text-center text-[11px] font-bold text-[#008751] hover:underline pt-1"
          >
            View Full Product Details & Recipes →
          </a>
        </div>
      </div>
    </div>
  );
}

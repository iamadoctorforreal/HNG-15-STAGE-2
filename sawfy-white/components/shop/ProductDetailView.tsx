'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/shop/ProductCard';

interface Variant {
  id: string;
  title: string;
  price: number;
}

interface ProductDetailViewProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    base_price: number;
    badge?: string;
    badgeColor?: 'emerald' | 'amber' | 'teal';
    weightInfo?: string;
    is_digital?: boolean;
    images: string[];
    variants?: Variant[];
    metadata?: Record<string, any>;
  };
  relatedProducts: any[];
  locale: string;
}

export function ProductDetailView({ product, relatedProducts, locale }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : ['/images/catfish-jumbo.jpg'];
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      slug: product.slug,
      base_price: product.base_price,
      image: images[0],
      is_digital: Boolean(product.is_digital),
      variantId: selectedVariant?.id,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      title: product.title,
      slug: product.slug,
      base_price: product.base_price,
      image: images[0],
      is_digital: Boolean(product.is_digital),
      variantId: selectedVariant?.id,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      quantity,
    });
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs font-semibold text-gray-500 flex items-center gap-2">
        <a href={`/${locale}`} className="hover:text-[#008751]">Home</a>
        <span>/</span>
        <a href={`/${locale}/products`} className="hover:text-[#008751]">Dried Catfish Catalog</a>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate">{product.title}</span>
      </nav>

      {/* Main Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Multi-Image Showcase Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Active Image */}
          <div className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden bg-gray-100 border-2 border-gray-200/80 shadow-md">
            <Image
              src={images[selectedImgIndex]}
              alt={`${product.title} - view ${selectedImgIndex + 1}`}
              fill
              priority
              className="object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-emerald-950/80 backdrop-blur-md text-[#E8C468] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-700 shadow-md">
                ★ {product.badge}
              </div>
            )}
            {product.is_digital && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                ⚡ Instant Download PDF
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Strip */}
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIndex(idx)}
                className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === selectedImgIndex
                    ? 'border-[#008751] ring-2 ring-[#008751]/30 scale-102 shadow-md'
                    : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Visual Guarantee Checklist */}
          <div className="p-4 rounded-2xl bg-[#e6f5ed]/60 border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="font-bold text-[#006b3f]">
              <span className="block text-base">🌾</span>
              Farm-Raised
              <span className="block text-[10px] text-gray-500 font-normal">Abeokuta, Ogun</span>
            </div>
            <div className="font-bold text-[#006b3f]">
              <span className="block text-base">✨</span>
              100% Sand-Free
              <span className="block text-[10px] text-gray-500 font-normal">Hygienic Clean</span>
            </div>
            <div className="font-bold text-[#006b3f]">
              <span className="block text-base">🛡️</span>
              6-Month Shelf Life
              <span className="block text-[10px] text-gray-500 font-normal">Vacuum Sealed</span>
            </div>
            <div className="font-bold text-[#006b3f]">
              <span className="block text-base">✈️</span>
              Export Grade
              <span className="block text-[10px] text-gray-500 font-normal">Nigeria, UK & US</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Pricing, Options & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#008751]">
              Sawfy White Enterprises • Abeokuta
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif mt-2 leading-tight">
              {product.title}
            </h1>
            {product.weightInfo && (
              <p className="text-xs font-bold text-[#008751] bg-emerald-50 border border-emerald-200 inline-block px-3 py-1 rounded-full mt-3">
                ⚖️ {product.weightInfo}
              </p>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description}
          </p>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-gray-500">Unit Price:</span>
              <span className="text-2xl font-black text-[#005230]">
                ₦{currentPrice.toLocaleString()}
              </span>
            </div>
            {quantity > 1 && (
              <div className="flex items-baseline justify-between pt-2 border-t border-gray-100 text-xs font-bold text-gray-700">
                <span>Total for {quantity} packs:</span>
                <span className="text-base text-[#008751]">₦{totalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Sizing & Packaging Option Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-700 block mb-2">
                Choose Packaging & Sizing:
              </label>
              <div className="space-y-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'border-[#008751] bg-[#e6f5ed] text-[#006b3f] shadow-xs ring-1 ring-[#008751]'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="font-extrabold text-sm">₦{v.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-700 block mb-2">
              Quantity:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 text-lg cursor-pointer transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center font-black text-gray-600 hover:bg-gray-100 text-lg cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Packs ready for prompt Abeokuta dispatch
              </span>
            </div>
          </div>

          {/* Action Buttons: Add to Cart + Instant Buy Now */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleBuyNow}
              className="w-full py-4 rounded-2xl bg-[#008751] hover:bg-[#006b3f] text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>⚡ Buy Now (Immediate Checkout)</span>
              <span>→</span>
            </button>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs border-2 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-emerald-50 text-[#006b3f] border-[#008751]'
              }`}
            >
              <span>{added ? '✓ Added to Cart!' : '🛒 Add to Cart'}</span>
            </button>
          </div>

          {/* Culinary & Rehydration Guidance */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-950">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
              <span>🍲</span> Chef’s Abeokuta Preparation Tip:
            </div>
            <p className="leading-relaxed text-amber-900/90">
              Blanch pieces in warm salted water for 3 to 5 minutes before adding to your soup pot (Efo Riro, Egusi, or Ila Alasepo). The flesh becomes wonderfully tender while retaining its deep, rich, authentic savory aroma!
            </p>
          </div>
        </div>
      </div>

      {/* Real E-Commerce Upsells / Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#008751]">
                Complete Your Order
              </span>
              <h2 className="text-2xl font-black text-gray-900 font-serif mt-1">
                Frequently Bought Together & Related Selections
              </h2>
            </div>
            <a
              href={`/${locale}/products`}
              className="text-xs font-bold text-[#008751] hover:underline hidden sm:inline"
            >
              View All 10 Selections →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
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
        </section>
      )}
    </div>
  );
}

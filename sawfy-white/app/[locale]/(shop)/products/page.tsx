import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { FALLBACK_PRODUCTS } from '@/lib/constants';

export const metadata = {
  title: 'Dried Catfish Products & Digital Library — Sawfy White Enterprises',
  description:
    'Browse our complete collection of export-grade dried catfish packs, wholesale master cartons, flakes, snack packs, and digital culinary guides.',
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = FALLBACK_PRODUCTS;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b border-gray-200 pb-6 mb-10">
        <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
          Direct From Abeokuta, Nigeria • 100% Sand-Free
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 mt-1">
          Complete Dried Catfish Catalog & Digital Library
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Export-grade dried catfish prepared with heritage standards in Abeokuta, Nigeria. Sealed for domestic dispatch across all Nigerian states and international airfreight to the UK & USA.
        </p>
      </div>

      {/* 10 Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
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
    </div>
  );
}

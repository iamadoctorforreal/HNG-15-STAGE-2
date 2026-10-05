import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CatalogExplorer } from '@/components/shop/CatalogExplorer';
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
      <div className="bg-white/92 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-xl border border-emerald-900/10">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
            Direct From Abeokuta, Nigeria • 100% Sand-Free
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 mt-1">
            Complete Dried Catfish Catalog &amp; Digital Library
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Export-grade dried catfish prepared with heritage standards in Abeokuta, Nigeria. Sealed for domestic dispatch across all Nigerian states and international airfreight to the UK &amp; USA.
          </p>
        </div>

        {/* Live Search & Category Explorer */}
        <CatalogExplorer products={products} locale={locale} />
      </div>
    </div>
  );
}

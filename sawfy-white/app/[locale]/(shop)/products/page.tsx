import React from 'react';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Products & Digital Cookbook — Sawfy White Enterprises',
  description:
    'Browse our complete collection of export-grade dried catfish packs, wholesale cartons, and our digital recipe cookbook.',
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold font-serif text-gray-900">
          Our Products
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Export-grade catfish prepared in Abeokuta, Nigeria • Domestic and international delivery
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Product 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="h-44 bg-emerald-50 rounded-lg flex items-center justify-center text-5xl mb-4">
              🐟
            </div>
            <span className="text-[10px] font-bold text-[#008751] bg-emerald-50 px-2 py-0.5 rounded">
              EXPORT GRADE A
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Abeokuta Royal Dried Catfish (1kg)
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Carefully oven-smoked giant catfish. Sand-grit free, clean, and nutritious. Packaged for domestic consumption or shipping abroad.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">₦18,500</span>
            <a
              href={`/${locale}/checkout`}
              className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Order Now
            </a>
          </div>
        </div>

        {/* Product 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="h-44 bg-amber-50 rounded-lg flex items-center justify-center text-5xl mb-4">
              🍲
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              POPULAR FOR SOUPS
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Medium Dried Catfish (500g)
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              6-8 pieces of medium smoked catfish. Ideal for making traditional Yoruba stews and soups like Egusi and Efo Riro.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">₦9,500</span>
            <a
              href={`/${locale}/checkout`}
              className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Order Now
            </a>
          </div>
        </div>

        {/* Product 3 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="h-44 bg-teal-50 rounded-lg flex items-center justify-center text-5xl mb-4">
              📖
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              DIGITAL PRODUCT
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              The Abeokuta Catfish Kitchen (Cookbook)
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              45 authentic recipes, preparation secrets, and dietary guides for cooking with dried catfish. Delivered instantly via digital download.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">₦2,500</span>
            <a
              href={`/${locale}/checkout`}
              className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Buy Cookbook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6f5ed]/60 to-[#FAF8F5] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008751]/10 text-[#006b3f] text-xs font-semibold uppercase tracking-wider mb-6">
            <span>🇳🇬</span> Direct From Abeokuta, Ogun State
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#2D2D2D] tracking-tight font-serif max-w-4xl mx-auto leading-tight">
            Premium Export-Grade <span className="text-[#008751]">Dried Catfish</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Naturally oven-smoked to golden perfection. Sand-grit free, rich in Omega-3 & pure protein. Exported directly to your doorstep in Nigeria, the UK, and the USA.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`/${locale}/checkout`}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all text-center"
            >
              Order Now • Instant Checkout
            </a>
            <a
              href={`/${locale}/products`}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border border-gray-200 transition-colors text-center"
            >
              Browse Products & Cookbook
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#008751]">
            Our Selection
          </span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif mt-1">
            Created by Sawfy White Enterprises
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Hygienically packaged for long shelf-life and international shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center text-6xl">
              🐟
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-[11px] font-bold text-[#008751] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-max">
                Bestseller • 1kg Pack
              </span>
              <h3 className="font-bold text-lg text-gray-900 mt-2">
                Abeokuta Royal Dried Catfish (1kg)
              </h3>
              <p className="text-xs text-gray-600 mt-2 flex-1">
                5-7 jumbo catfish, thoroughly gutted, sand-free, and oven-smoked to retain rich natural oils and hearty flavor.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">₦18,500</span>
                <a
                  href={`/${locale}/checkout`}
                  className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-6xl">
              🍲
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded w-max">
                Stew & Soup Pack • 500g
              </span>
              <h3 className="font-bold text-lg text-gray-900 mt-2">
                Medium Dried Catfish (500g)
              </h3>
              <p className="text-xs text-gray-600 mt-2 flex-1">
                Ideal for family soups: Efo Riro, Egusi, Obe Ata, and Pepper Soup. Tender skin and smoky aroma.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">₦9,500</span>
                <a
                  href={`/${locale}/checkout`}
                  className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center text-6xl">
              📖
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded w-max">
                Digital Cookbook • Instant PDF
              </span>
              <h3 className="font-bold text-lg text-gray-900 mt-2">
                The Abeokuta Catfish Kitchen
              </h3>
              <p className="text-xs text-gray-600 mt-2 flex-1">
                45 authentic Nigerian recipes featuring dried catfish. From Abeokuta heritage soups to modern diaspora dishes.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">₦2,500</span>
                <a
                  href={`/${locale}/checkout`}
                  className="px-4 py-2 bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Get Cookbook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Pride & Abeokuta Connection */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
              Heritage & Authenticity
            </span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif mt-2 leading-tight">
              Rooted in the Ancient City Under the Rock
            </h2>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              In Abeokuta, food is not merely sustenance; it is culture, royalty, and community. At Sawfy White Enterprises, our catfish is farmed in freshwater ponds and smoked with select hardwoods according to time-honored Egba methods, updated with strict modern food safety standards.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-warm-gray-50 rounded-lg">
                <span className="font-bold text-gray-900 block">68% Dry Protein</span>
                <span className="text-xs text-gray-500">Laboratory verified nutrient density</span>
              </div>
              <div className="p-3 bg-warm-gray-50 rounded-lg">
                <span className="font-bold text-gray-900 block">90-Day Shelf Life</span>
                <span className="text-xs text-gray-500">Vacuum export packaging</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-[#008751]/10 to-amber-100/30 p-8 rounded-2xl border border-emerald-100 text-center">
            <span className="text-5xl block mb-4">🪨</span>
            <blockquote className="font-serif italic text-gray-700 text-base">
              "Bí o kò bá le wà ní Olúmọ, ẹja wa yóò mú ilé wá sí tabili rẹ."
            </blockquote>
            <p className="text-xs text-gray-500 mt-2">
              (If you cannot stand at Olumo Rock today, our catfish brings home directly to your table.)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

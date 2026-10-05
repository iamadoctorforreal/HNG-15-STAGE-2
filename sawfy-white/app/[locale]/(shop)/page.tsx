import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { WaterfallBackground } from '@/components/motion/WaterfallBackground';
import { LeadMagnetModal } from '@/components/shop/LeadMagnetModal';
import { RotatingHeroGreeting } from '@/components/ui/RotatingHeroGreeting';
import { FALLBACK_PRODUCTS } from '@/lib/constants';
import Image from 'next/image';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = FALLBACK_PRODUCTS;

  return (
    <div className="relative space-y-16 pb-16 min-h-screen">
      {/* Continuous Page-Wide Photorealistic Waterfall Background with Leaping Fishes */}
      <WaterfallBackground />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/88 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Rotating Cultural Greeting */}
                <div className="block">
                  <RotatingHeroGreeting />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008751]/10 text-[#006b3f] text-xs font-bold uppercase tracking-wider mb-6 border border-[#008751]/20">
                  <span>🌾</span> Farm-Raised in Abeokuta Fish Farms • Export-Grade
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-[#2D2D2D] tracking-tight font-serif leading-[1.1]">
                  Export-Grade <span className="text-[#008751]">Dried Catfish</span> From Abeokuta
                </h1>
                <p className="mt-6 text-base sm:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Farm-raised in clean Abeokuta aquaculture ponds, meticulously gutted, thoroughly washed, and hygienically dried to golden-brown crisp perfection. 100% sand-grit free, rich in Omega-3, and sealed for safe shipping across Nigeria, the UK, and the USA.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href={`/${locale}/products`}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-center text-sm"
                  >
                    Browse 10 Selections • Fast Dispatch
                  </a>
                  <a
                    href={`/${locale}/checkout`}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 transition-colors text-center text-sm shadow-xs"
                  >
                    Instant Checkout →
                  </a>
                </div>

                {/* Key Trust Badges */}
                <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 text-center lg:text-left">
                  <div>
                    <span className="font-extrabold text-[#005230] block text-xl">100%</span>
                    <span className="text-xs text-gray-600 font-medium">Sand &amp; Grit Free</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-[#005230] block text-xl">90 Days</span>
                    <span className="text-xs text-gray-600 font-medium">Export Shelf Life</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-[#005230] block text-xl">Global</span>
                    <span className="text-xs text-gray-600 font-medium">UK, US &amp; Nigeria</span>
                  </div>
                </div>
              </div>

              {/* Hero Image Showcase - Real Authentic Round-Curled Dried Catfish */}
              <div className="lg:col-span-5 relative">
                <a href={`/${locale}/products/whole-round-curled-dried-catfish-big`} className="block group">
                  <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-102">
                    <Image
                      src="/images/catfish-real-glass-plate.png"
                      alt="Authentic Nigerian Round-Curled Dried Catfish on Plate"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-6">
                      <div className="text-white w-full">
                        <span className="bg-[#008751] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          ★ Signature Eja Kika (Round Curled)
                        </span>
                        <h3 className="font-bold text-lg mt-1 font-serif group-hover:text-emerald-300 transition-colors">
                          Abeokuta Royal Dried Catfish
                        </h3>
                        <p className="text-xs text-emerald-100 mt-0.5">
                          Farm-raised in Abeokuta fish farms &bull; Ready to Dispatch
                        </p>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20">
                          <span className="text-base font-black text-amber-300">From ₦9,500</span>
                          <span className="text-xs font-bold bg-[#008751] px-3.5 py-1.5 rounded-xl hover:bg-[#006b3f] transition-colors shadow-sm">
                            🛒 View &amp; Order →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete 10-Product Catalogue Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/92 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-xl border border-emerald-900/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-gray-200">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#008751]">
                Farm-Raised in Abeokuta • 100% Sand-Free • Ready to Dispatch
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-serif mt-1">
                Our Curated Dried Catfish &amp; Culinary Library
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0 font-medium">
              Click any product to explore all photos, recipes &amp; direct checkout
            </p>
          </div>

          {/* 10 Products Grid with multi-image carousels and weight ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                title={prod.title}
                slug={prod.slug}
                description={prod.description}
                base_price={prod.base_price}
                image={prod.images[0]}
                images={prod.images}
                badge={prod.badge}
                badgeColor={prod.badgeColor}
                is_digital={prod.is_digital}
                variants={prod.variants}
                weightInfo={prod.weightInfo}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Heritage & Olumo Rock Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/85 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-xl border border-emerald-900/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative h-80 rounded-3xl overflow-hidden shadow-lg border border-gray-200">
            <Image
              src="/images/waterfall-fish-farm.jpg"
              alt="Abeokuta Aquaculture Fish Pond and Scenic Waterfall"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6">
            <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
              Abeokuta Aquaculture Heritage
            </span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif mt-2 leading-tight">
              Farm-Raised in the Ancient City Under the Rock
            </h2>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              In Abeokuta, catfish is not just food — it is heritage, royalty, and warm hospitality. At Sawfy White Enterprises, our catfish is farm-raised in modern aquaculture ponds in Abeokuta, fed pure nutrition, carefully cleaned, and hygienically dried to bring you that unforgettable deep, savory aroma that elevates any soup from simple to extraordinary.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-white/80 border border-emerald-100">
              <p className="font-serif italic text-gray-800 text-sm">
                &ldquo;Bí o kò bá le wà ní Olúmọ, ẹja dídá wa yóò mú ilé wá sí tábìlì rẹ.&rdquo;
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                (Even if you are in London or Texas, our dried catfish brings Abeokuta home to your table.)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Lead Magnet Download Modal */}
      <LeadMagnetModal />
    </div>
  );
}

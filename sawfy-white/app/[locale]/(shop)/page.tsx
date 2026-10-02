import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/ProductCard';
import Image from 'next/image';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featuredProducts = [
    {
      id: 'prod-001',
      title: 'Abeokuta Royal Dried Catfish (1kg Pack)',
      slug: 'abeokuta-royal-dried-catfish-1kg',
      description:
        '5-7 jumbo oven-smoked African catfish. Cleaned, gutted, sand-grit free, and sealed with 90-day export shelf life. Perfect for soup stews or diaspora travel packaging.',
      base_price: 18500,
      image: '/images/catfish-jumbo.jpg',
      badge: 'Bestseller • Export Grade A',
      badgeColor: 'emerald' as const,
      is_digital: false,
      variants: [
        { id: 'var-1a', title: '1kg Standard Pack (5-7 Giant Fish)', price: 18500 },
        { id: 'var-1b', title: '2kg Value Pack', price: 35000 },
        { id: 'var-1c', title: 'Carton (10kg Wholesale / Export)', price: 170000 },
      ],
    },
    {
      id: 'prod-002',
      title: 'Medium Dried Catfish (500g Stew & Soup Pack)',
      slug: 'medium-dried-catfish-500g',
      description:
        'Pre-cut stew-sized smoked catfish pieces. The absolute standard for making authentic Yoruba soups: Efo Riro, Egusi, Ila Alasepo, and Pepper Soup.',
      base_price: 9500,
      image: '/images/catfish-medium.jpg',
      badge: 'Popular for Soups',
      badgeColor: 'amber' as const,
      is_digital: false,
      variants: [
        { id: 'var-2a', title: '500g Stew Cut Pack', price: 9500 },
        { id: 'var-2b', title: '1kg Twin Pack', price: 18000 },
      ],
    },
    {
      id: 'prod-003',
      title: 'The Abeokuta Catfish Kitchen: 45 Authentic Recipes',
      slug: 'abeokuta-catfish-cookbook-digital',
      description:
        'Official Sawfy White digital cookbook with 45 authentic heritage recipes, soup-pairing guides, cleaning secrets, and nutritional breakdowns. Instant PDF download upon purchase.',
      base_price: 2500,
      image: '/images/cookbook-cover.jpg',
      badge: 'Digital Cookbook',
      badgeColor: 'teal' as const,
      is_digital: true,
      variants: [
        { id: 'var-3a', title: 'Deluxe PDF Edition', price: 2500 },
      ],
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6f5ed] via-[#FAF8F5] to-white py-16 sm:py-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#008751]/10 text-[#006b3f] text-xs font-bold uppercase tracking-wider mb-6">
                <span>🇳🇬</span> Direct From Abeokuta, Ogun State
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-[#2D2D2D] tracking-tight font-serif leading-[1.1]">
                Export-Grade <span className="text-[#008751]">Dried Catfish</span> From Abeokuta
              </h1>
              <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Thoroughly gutted, washed, and naturally hardwood-smoked to golden crisp perfection. 100% sand-free, rich in Omega-3, and sealed for safe shipping across Nigeria, the UK, and the USA.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href={`/${locale}/products`}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-center text-sm"
                >
                  Order Catfish Now • Fast Delivery
                </a>
                <a
                  href={`/${locale}/checkout`}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 transition-colors text-center text-sm"
                >
                  Instant Checkout →
                </a>
              </div>

              {/* Key Trust Badges */}
              <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 text-center lg:text-left">
                <div>
                  <span className="font-extrabold text-gray-900 block text-lg">100%</span>
                  <span className="text-xs text-gray-500">Sand & Grit Free</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900 block text-lg">90 Days</span>
                  <span className="text-xs text-gray-500">Export Shelf Life</span>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900 block text-lg">Global</span>
                  <span className="text-xs text-gray-500">UK, US & Nigeria</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/catfish-jumbo.jpg"
                  alt="Abeokuta Royal Dried Catfish"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="bg-[#008751] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Sawfy White Quality
                    </span>
                    <h3 className="font-bold text-lg mt-1 font-serif">
                      Abeokuta Royal Dried Catfish
                    </h3>
                    <p className="text-xs text-gray-200">
                      Oven-smoked with aromatic hardwoods in Abeokuta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#008751]">
              Freshly Smoked • Ready to Ship
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 font-serif mt-1">
              Featured Products & Cookbook
            </h2>
          </div>
          <a
            href={`/${locale}/products`}
            className="text-xs font-bold text-[#008751] hover:underline mt-2 sm:mt-0"
          >
            View Full Catalogue →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>

      {/* Cultural Heritage & Olumo Rock Story */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative h-80 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/images/catfish-stew_pack.jpg"
              alt="Abeokuta Traditional Catfish Stew Ingredients"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6">
            <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
              Abeokuta Heritage & Authenticity
            </span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif mt-2 leading-tight">
              Rooted in the Ancient City Under the Rock
            </h2>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              In Abeokuta, catfish is not just food — it is heritage, royalty, and warm hospitality. At Sawfy White Enterprises, our catfish is farmed in pure freshwater, seasoned, and slowly smoked to bring you that unforgettable deep, savory aroma that elevates any soup from simple to extraordinary.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-[#FAF8F5] border border-emerald-100">
              <p className="font-serif italic text-gray-800 text-sm">
                "Bí o kò bá le wà ní Olúmọ, ẹja wa yóò mú ilé wá sí tabili rẹ."
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                (Even if you are in London or Texas, our catfish brings Abeokuta home to your table.)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

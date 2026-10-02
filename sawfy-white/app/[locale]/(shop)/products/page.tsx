import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/ProductCard';

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

  const products = [
    {
      id: 'prod-001',
      title: 'Abeokuta Royal Dried Catfish (1kg Pack)',
      slug: 'abeokuta-royal-dried-catfish-1kg',
      description:
        '5-7 jumbo oven-smoked African catfish. Cleaned, gutted, sand-grit free, and sealed with 90-day export shelf life. Perfect for domestic cooking and overseas diaspora shipping.',
      base_price: 18500,
      image: '/images/catfish-jumbo.jpg',
      badge: 'Export Grade A',
      badgeColor: 'emerald' as const,
      is_digital: false,
      variants: [
        { id: 'var-1a', title: '1kg Standard Pack (5-7 Giant Fish)', price: 18500 },
        { id: 'var-1b', title: '2kg Value Pack', price: 35000 },
        { id: 'var-1c', title: 'Carton (10kg Wholesale Export)', price: 170000 },
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
      badge: 'Stew & Soup Pack',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b border-gray-200 pb-5 mb-10">
        <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
          Direct From Abeokuta, Nigeria
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-gray-900 mt-1">
          Our Products & Digital Cookbook
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Export-grade catfish prepared in Abeokuta, Nigeria • Domestic and international delivery to UK & USA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}

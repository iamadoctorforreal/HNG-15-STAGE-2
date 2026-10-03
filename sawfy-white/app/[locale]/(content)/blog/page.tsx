import React from 'react';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Catfish Culinary & Export Blog — Sawfy White Enterprises',
  description:
    'Authentic guides on traditional Nigerian soups, dried catfish nutritional benefits, and diaspora shipping guides to the UK & US.',
};

const ARTICLES = [
  {
    slug: 'authentic-yoruba-soups-with-dried-catfish',
    title: 'The True Abeokuta Way: How Authentic Yoruba Soups Use Dried Catfish',
    date: 'October 2, 2026',
    category: 'Culinary Heritage',
    excerpt:
      'From Efo Elegusi to Ila Alasepo, explore why the rich, umami depth of Abeokuta dried catfish is the irreplaceable secret ingredient in Nigerian gastronomy.',
    readTime: '5 min read',
  },
  {
    slug: 'why-sand-free-dried-catfish-matters-uk-usa-diaspora',
    title: 'Why 100% Sand-Free Dried Catfish is Revolutionizing Diaspora Cooking in the UK & USA',
    date: 'September 28, 2026',
    category: 'Export & Diaspora',
    excerpt:
      'Nothing ruins a pot of authentic soup like sandy grit. Discover how Sawfy White Enterprises guarantees pristine, zero-grit, vacuum-sealed fish across international borders.',
    readTime: '4 min read',
  },
  {
    slug: 'nutritional-powerhouse-omega-3-protein-catfish',
    title: 'The Nutritional Powerhouse: Why Dried Catfish is Packed with Clean Protein and Omega-3s',
    date: 'September 20, 2026',
    category: 'Health & Nutrition',
    excerpt:
      'With over 65% dry weight protein and essential fatty acids, dried catfish is one of the most nutrient-dense natural superfoods you can put on your family’s dining table.',
    readTime: '6 min read',
  },
  {
    slug: 'how-to-rehydrate-dried-catfish-properly',
    title: 'Chef’s Secret: How to Rehydrate Dried Catfish Without Losing Its Crisp Savory Texture',
    date: 'September 15, 2026',
    category: 'Kitchen Tips',
    excerpt:
      'Master the 5-minute warm salted water blanching method that softens fish flesh while preserving its firm body and deep savory essence.',
    readTime: '3 min read',
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b border-gray-200 pb-6 mb-10">
        <span className="text-xs font-bold text-[#008751] uppercase tracking-wider">
          Abeokuta Heritage & Kitchen Wisdom
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900 mt-1">
          The Sawfy White Culinary & Export Journal
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Discover culinary insights, nutrition breakdowns, and international export guides straight from Abeokuta, Ogun State, Nigeria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ARTICLES.map((article) => (
          <article
            key={article.slug}
            className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008751] font-bold text-[10px] uppercase">
                  {article.category}
                </span>
                <span>{article.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#008751] transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400">{article.date}</span>
              <span className="font-bold text-[#008751] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Read Article →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

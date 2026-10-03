import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { FALLBACK_PRODUCTS } from '@/lib/constants';
import { ProductDetailView } from '@/components/shop/ProductDetailView';

export function generateStaticParams() {
  return FALLBACK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: 'Product Not Found — Sawfy White' };

  return {
    title: `${product.title} — Sawfy White Enterprises Abeokuta`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  // Get 3 related products for upsell
  const relatedProducts = FALLBACK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      locale={locale}
    />
  );
}

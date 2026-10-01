import React from 'react';
import { CheckoutForm } from '@/components/shop/CheckoutForm';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Checkout — Sawfy White Enterprises',
  description:
    'Complete your order for premium export-grade dried catfish from Abeokuta, Ogun State, Nigeria.',
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-warm-gray-50/50 py-10">
      <CheckoutForm />
    </main>
  );
}

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Sign In — Sawfy White Enterprises',
  description: 'Sign in with Google or email to access your orders and cookbook downloads.',
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-12 px-4">
      <LoginForm mode="login" />
    </main>
  );
}

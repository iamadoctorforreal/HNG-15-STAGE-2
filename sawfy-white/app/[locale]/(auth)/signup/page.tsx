import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Create Account — Sawfy White Enterprises',
  description: 'Join the Sawfy White family and order export-grade Abeokuta catfish.',
};

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-12 px-4">
      <LoginForm mode="signup" />
    </main>
  );
}

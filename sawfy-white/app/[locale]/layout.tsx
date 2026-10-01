import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Sawfy White Enterprises — Export-Grade Abeokuta Dried Catfish',
  description:
    'Naturally oven-dried, export-grade African catfish sourced and processed in Abeokuta, Ogun State, Nigeria. Delivering to Nigeria, UK, US, and worldwide.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D] antialiased flex flex-col">
        {/* Navigation Banner */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href={`/${locale}`} className="flex items-center gap-2">
              <span className="text-2xl">🐟</span>
              <div>
                <span className="font-bold text-lg text-[#006b3f] tracking-tight block leading-none">
                  Sawfy White
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Enterprises • Abeokuta
                </span>
              </div>
            </a>

            <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <a href={`/${locale}/products`} className="hover:text-[#008751] transition-colors">
                Products
              </a>
              <a href={`/${locale}/checkout`} className="hover:text-[#008751] transition-colors">
                Checkout
              </a>
              <a
                href={`/${locale}/checkout`}
                className="bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>🛒</span> Checkout
              </a>
            </nav>
          </div>
        </header>

        <NextIntlClientProvider messages={messages}>
          <div className="flex-1">{children}</div>
        </NextIntlClientProvider>

        {/* Cultural Footer */}
        <footer className="bg-[#2D2D2D] text-white py-10 border-t-4 border-[#008751]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center sm:text-left grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <span className="text-2xl">🐟</span>
                <h3 className="font-bold text-lg text-emerald-400">
                  Sawfy White Enterprises
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Export-grade dried catfish farm-raised and processed in the historic city of Abeokuta, Ogun State, Nigeria. Sourced with honor, delivered fresh to homes across Nigeria and diaspora communities in the UK and US.
              </p>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider mb-2">
                Abeokuta Heritage
              </h4>
              <p>📍 Abeokuta, Ogun State, Nigeria</p>
              <p>🌿 100% Oven-Smoked, Sand-Free & Hygienic</p>
              <p>✈️ Export-Approved Packaging</p>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider mb-2">
                Direct Contact
              </h4>
              <p>📧 orders@sawfywhite.com</p>
              <p>📞 WhatsApp: +234 801 234 5678</p>
              <p className="text-emerald-400 font-semibold mt-4">
                Ẹ kú àbọ̀! Welcome to premium quality.
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Sawfy White Enterprises. All rights reserved. Made in Abeokuta, Nigeria 🇳🇬
          </div>
        </footer>
      </body>
    </html>
  );
}

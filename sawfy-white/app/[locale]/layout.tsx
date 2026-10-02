import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/hooks/useCart';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/shop/CartDrawer';
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
      <body className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D] antialiased flex flex-col font-sans">
        <CartProvider>
          {/* Top Cultural Announcement Bar */}
          <div className="bg-[#005230] text-emerald-100 text-xs py-2 px-4 text-center font-medium border-b border-emerald-800">
            <span>Ẹ kú àbọ̀!</span> Naturally oven-smoked export-grade catfish from Abeokuta • Worldwide shipping to Nigeria, UK & US 🇳🇬 ✈️
          </div>

          {/* Dynamic Navbar */}
          <Navbar locale={locale} />

          {/* Slide-over Cart Drawer */}
          <CartDrawer locale={locale} />

          {/* Main Page Content */}
          <NextIntlClientProvider messages={messages}>
            <div className="flex-1">{children}</div>
          </NextIntlClientProvider>

          {/* Cultural Footer */}
          <footer className="bg-[#2D2D2D] text-white py-12 border-t-4 border-[#008751]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                  <span className="text-2xl">🐟</span>
                  <h3 className="font-extrabold text-xl text-emerald-400 font-serif">
                    Sawfy White Enterprises
                  </h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
                  Export-grade dried catfish farm-raised and smoked in the historic city of Abeokuta, Ogun State, Nigeria. Sourced with honor, delivered fresh to homes across Nigeria and diaspora communities in the UK and US.
                </p>
                <div className="mt-4 flex gap-3 text-xs text-amber-300">
                  <span>★ Export Grade A</span>
                  <span>• Sand-Free</span>
                  <span>• 90-Day Shelf Life</span>
                </div>
              </div>

              <div className="text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-sm">
                  Navigation
                </h4>
                <p><a href={`/${locale}`} className="hover:text-emerald-400 transition-colors">Home</a></p>
                <p><a href={`/${locale}/products`} className="hover:text-emerald-400 transition-colors">Our Products</a></p>
                <p><a href={`/${locale}/checkout`} className="hover:text-emerald-400 transition-colors">Checkout</a></p>
                <p><a href={`/${locale}/login`} className="hover:text-emerald-400 transition-colors">My Account & Orders</a></p>
              </div>

              <div className="text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-sm">
                  Abeokuta Roots
                </h4>
                <p>📍 Abeokuta, Ogun State, Nigeria</p>
                <p>📧 orders@sawfywhite.com</p>
                <p>📞 WhatsApp: +234 801 234 5678</p>
                <div className="pt-2 text-emerald-400 font-bold">
                  Bí o kò bá le wà ní Olúmọ, ẹja wa yóò mú ilé wá sí tabili rẹ.
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-gray-700 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} Sawfy White Enterprises. All rights reserved.</span>
              <span className="text-emerald-400">Proudly rooted in Abeokuta, Nigeria 🇳🇬</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

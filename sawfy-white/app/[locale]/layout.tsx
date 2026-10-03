import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/hooks/useCart';
import { Navbar } from '@/components/layout/Navbar';
import { RotatingBanner } from '@/components/layout/RotatingBanner';
import { RotatingProverb } from '@/components/layout/RotatingProverb';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { CartDrawer } from '@/components/shop/CartDrawer';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Sawfy White Enterprises — Export-Grade Abeokuta Dried Catfish',
  description:
    'Hygienic, 100% sand-free export-grade dried catfish sourced and prepared in Abeokuta, Ogun State, Nigeria. Worldwide shipping to Nigeria, UK, US, and beyond.',
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
          {/* Top Multilingual Rotating Cultural Banner */}
          <RotatingBanner />

          {/* Dynamic Navbar */}
          <Navbar locale={locale} />

          {/* Slide-over Cart Drawer */}
          <CartDrawer locale={locale} />

          {/* Main Page Content */}
          <NextIntlClientProvider messages={messages}>
            <div className="flex-1">{children}</div>
          </NextIntlClientProvider>

          {/* Cultural Footer */}
          <footer className="bg-[#1f2923] text-white py-14 border-t-4 border-[#008751]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-4">
                  <BrandLogo size="md" light={true} />
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
                  Export-grade dried catfish sourced with pride in the historic city of Abeokuta, Ogun State, Nigeria. 100% sand-grit free, hygienically dried, and securely sealed for homes across Nigeria and diaspora communities in the UK and US.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#E8C468]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">★ Export Grade A</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">• 100% Sand-Free</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">• Long Shelf Life</span>
                </div>
              </div>

              <div className="text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-sm">
                  Explore
                </h4>
                <p><a href={`/${locale}`} className="hover:text-emerald-400 transition-colors">Home</a></p>
                <p><a href={`/${locale}/products`} className="hover:text-emerald-400 transition-colors">Dried Catfish Catalog</a></p>
                <p><a href={`/${locale}/blog`} className="hover:text-emerald-400 transition-colors">Culinary Blog</a></p>
                <p><a href={`/${locale}/checkout`} className="hover:text-emerald-400 transition-colors">Secure Checkout</a></p>
                <p><a href={`/${locale}/login`} className="hover:text-emerald-400 transition-colors">My Account & Orders</a></p>
              </div>

              <div className="text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-sm">
                  Abeokuta Roots
                </h4>
                <p>📍 Abeokuta, Ogun State, Nigeria</p>
                <p>📧 orders@fish.sawfywhite.com</p>
                <p>📞 WhatsApp: +234 801 234 5678</p>
                
                {/* Rotating Multilingual Cultural Proverb */}
                <RotatingProverb />
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} Sawfy White Enterprises. All rights reserved.</span>
              <span className="text-emerald-400 font-medium">Rooted in Abeokuta, Sourced with Heritage 🇳🇬</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

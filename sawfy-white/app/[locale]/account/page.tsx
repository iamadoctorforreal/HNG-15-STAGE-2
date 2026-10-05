'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import { BrandLogo } from '@/components/ui/BrandLogo';
import Image from 'next/image';

const PROFILE_GREETINGS = [
  'Welcome back',
  'Bon retour',
  'Barka da dawowa',
  'Ẹ kú àbọ̀',
  'Nnọọ ọzọ',
];

export default function AccountDashboardPage() {
  const supabase = createClient();
  const { addToCart } = useCart();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [activePolicyTab, setActivePolicyTab] = useState<'about' | 'shipping' | 'terms' | 'privacy'>('about');

  // Interactive Wishlist
  const [wishlist, setWishlist] = useState<any[]>([
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Whole Round-Curled Dried Catfish (Big)',
      slug: 'whole-round-curled-dried-catfish-big',
      base_price: 9500,
      price: 9500,
      image: '/images/catfish-real-glass-plate.png',
      is_digital: false,
      tag: 'Most Popular',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Cut & Cleaned Dried Catfish Soup Pieces',
      slug: 'cut-cleaned-dried-catfish-soup-pieces',
      base_price: 8500,
      price: 8500,
      image: '/images/catfish-soup-pieces.png',
      is_digital: false,
      tag: 'Ready to Cook',
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      title: 'Boneless Dried Catfish Steaks (Oven-Dried)',
      slug: 'boneless-dried-catfish-steaks',
      base_price: 13500,
      price: 13500,
      image: '/images/catfish-steaks.png',
      is_digital: false,
      tag: 'Export Grade',
    },
  ]);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getSession();

    // Rotate greeting, stopping after 2 minutes
    const timer = setInterval(() => {
      setGreetingIdx((prev) => (prev + 1) % PROFILE_GREETINGS.length);
    }, 3500);

    const stopTimer = setTimeout(() => {
      clearInterval(timer);
    }, 120000);

    return () => {
      clearInterval(timer);
      clearTimeout(stopTimer);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/en';
  };

  const handleAddWishlistToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      slug: item.slug,
      base_price: item.base_price,
      price: item.base_price,
      quantity: 1,
      image: item.image,
      is_digital: item.is_digital,
    });
  };

  const handleRemoveWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  };

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Valued Customer';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008751]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-lg border border-gray-100 text-center">
        <BrandLogo size="md" className="mx-auto mb-4" />
        <h2 className="text-2xl font-black font-serif text-gray-900 mb-2">Customer Account</h2>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          Sign in or create an account to view your order tracking, wish list, order history, and exclusive deals.
        </p>
        <a
          href="/en/login"
          className="inline-block w-full py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-xl text-sm transition-all shadow-md"
        >
          Sign In / Create Account →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#008751] text-white font-black text-2xl flex items-center justify-center shadow-md">
            {(firstName[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006b3f] text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
              {PROFILE_GREETINGS[greetingIdx]}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-gray-900">
              Welcome back, <span className="text-[#008751]">{firstName}</span>!
            </h1>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200">
              ★ Abeokuta Catfish Connoisseur • Gold Tier
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* 2. Current Order Tracking Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <h2 className="text-lg font-black text-gray-900 font-serif">Current Order Tracking</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006b3f] text-[10px] font-black uppercase">
                Live
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Order #SW-849201 • Dispatched from Abeokuta Fish Farms</p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006b3f] text-xs font-bold">
            In Transit 📦
          </span>
        </div>

        {/* 4-Step Milestone Stepper */}
        <div className="grid grid-cols-4 gap-2 text-center my-6">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#008751] text-white flex items-center justify-center text-xs font-bold mb-2 shadow-xs">
              ✓
            </div>
            <span className="text-xs font-bold text-gray-800">Order Placed</span>
            <span className="text-[10px] text-gray-400">Oct 04, 10:15 AM</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#008751] text-white flex items-center justify-center text-xs font-bold mb-2 shadow-xs">
              ✓
            </div>
            <span className="text-xs font-bold text-gray-800">Quality Checked</span>
            <span className="text-[10px] text-gray-400">100% Sand-Free</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#D4A843] text-white flex items-center justify-center text-xs font-black mb-2 shadow-xs animate-pulse">
              🚚
            </div>
            <span className="text-xs font-black text-[#005230]">Dispatched</span>
            <span className="text-[10px] text-emerald-600 font-bold">In Transit</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold mb-2">
              4
            </div>
            <span className="text-xs font-medium text-gray-400">Delivered</span>
            <span className="text-[10px] text-gray-400">Est. Tomorrow</span>
          </div>
        </div>

        {/* Tracking Metadata Box */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block">Courier Partner:</span>
            <strong className="text-gray-800">GIG Logistics / DHL Diaspora</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Tracking Number:</span>
            <strong className="text-[#008751] font-mono">NG-ABK-849201</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Estimated Doorstep Delivery:</span>
            <strong className="text-emerald-700 font-bold">Tomorrow by 4:00 PM</strong>
          </div>
        </div>
      </div>

      {/* 3. Best Deals of the Day & Exclusive Upsells */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Deal of the Day Hero Banner */}
        <div className="md:col-span-7 bg-[#004729] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-emerald-800">
          <div className="inline-block px-3 py-1 rounded-full bg-[#E8C468] text-[#004729] text-[10px] font-black uppercase tracking-wider mb-4">
            🔥 Deal of the Day • Save 20%
          </div>
          <h3 className="text-2xl font-black font-serif text-white mb-2">
            Abeokuta Heritage Feast Combo
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed mb-6">
            2kg Premium Round-Curled Dried Catfish + Free Abeokuta Pepper Soup Seasoning Blend + Digital PDF Cookbook.
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              <span className="text-xs text-white/60 line-through block">₦24,500</span>
              <span className="text-2xl font-black text-[#E8C468]">₦19,500</span>
            </div>
            <button
              onClick={() => {
                addToCart({
                  id: '00000000-0000-0000-0000-000000000001',
                  title: 'Abeokuta Heritage Feast Combo (2kg + Spices)',
                  slug: 'abeokuta-heritage-feast-combo',
                  base_price: 19500,
                  price: 19500,
                  quantity: 1,
                  image: '/images/catfish-real-glass-plate.png',
                  is_digital: false,
                });
              }}
              className="px-6 py-3 rounded-xl bg-[#E8C468] hover:bg-[#d4a843] text-[#004729] font-black text-xs transition-all shadow-md cursor-pointer"
            >
              Add Deal to Cart 🛒
            </button>
          </div>
        </div>

        {/* Exclusive Upsell: Digital Cookbook */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#006b3f] text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-200">
              📖 Chef&apos;s Secret
            </div>
            <h4 className="text-lg font-black font-serif text-gray-900 mb-2">
              Abeokuta Catfish Recipe Collection
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              50+ Traditional Yoruba recipes for Efo Riro, Egusi, Obe Eja, and Catfish Pepper Soup with secret Abeokuta spices.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <span className="text-lg font-black text-[#008751]">₦3,500</span>
            <button
              onClick={() => {
                addToCart({
                  id: '00000000-0000-0000-0000-000000000010',
                  title: 'Abeokuta Catfish Heritage Cookbook (Digital PDF)',
                  slug: 'digital-catfish-cookbook',
                  base_price: 3500,
                  price: 3500,
                  quantity: 1,
                  image: '/images/catfish-efo-soup.png',
                  is_digital: true,
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white font-bold text-xs transition-all cursor-pointer"
            >
              + Add Cookbook
            </button>
          </div>
        </div>
      </div>

      {/* 4. My Wishlist Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <h2 className="text-lg font-black text-gray-900 font-serif">My Wishlist</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006b3f] text-[10px] font-black">
              {wishlist.length} Items
            </span>
          </div>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-400 transition-all bg-[#FAF8F5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.tag}
                    </span>
                    <button
                      onClick={() => handleRemoveWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">{item.title}</h4>
                  <p className="text-sm font-black text-[#008751]">₦{item.base_price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAddWishlistToCart(item)}
                  className="mt-4 w-full py-2 bg-white hover:bg-emerald-50 text-[#005230] border border-[#008751] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Move to Cart 🛒
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4 text-center">Your wishlist is currently empty.</p>
        )}
      </div>

      {/* 5. Order History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md">
        <h2 className="text-lg font-black text-gray-900 font-serif mb-4 pb-4 border-b border-gray-100">
          📋 Order History
        </h2>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-xs text-gray-900">Order #SW-784019</strong>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Delivered ✓
                </span>
              </div>
              <p className="text-xs text-gray-600">
                2x Whole Round-Curled Dried Catfish (Big) • 1x Cookbook PDF
              </p>
              <span className="text-[11px] text-gray-400">Delivered on Oct 02, 2026</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-gray-900">₦22,500</span>
              <button
                onClick={() => {
                  addToCart({
                    id: '00000000-0000-0000-0000-000000000001',
                    title: 'Whole Round-Curled Dried Catfish (Big)',
                    slug: 'whole-round-curled-dried-catfish-big',
                    base_price: 9500,
                    price: 9500,
                    quantity: 2,
                    image: '/images/catfish-real-glass-plate.png',
                    is_digital: false,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold transition-all cursor-pointer"
              >
                ⚡ Reorder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Company Heritage & Policies Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-md">
        <h2 className="text-lg font-black text-gray-900 font-serif mb-4">
          Sawfy White Heritage & Customer Policies
        </h2>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-3">
          {(['about', 'shipping', 'terms', 'privacy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePolicyTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePolicyTab === tab
                  ? 'bg-[#008751] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'about' && 'About Us'}
              {tab === 'shipping' && 'Shipping & Delivery'}
              {tab === 'terms' && 'Terms of Service'}
              {tab === 'privacy' && 'Privacy Policy'}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="text-xs text-gray-600 leading-relaxed space-y-3">
          {activePolicyTab === 'about' && (
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Rooted in Abeokuta, Ogun State 🇳🇬</p>
              <p>
                Sawfy White Enterprises cultivates, hygienically processes, and export-packages premium African catfish (<span className="italic">Clarias gariepinus</span>) in the historic city of Abeokuta. Every fish is raised in natural aquifer-fed ponds, meticulously gutted, thoroughly washed, and gently smoked in clean modern kilns.
              </p>
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                ★ 100% Sand-Grit Free Guarantee: Never dried in open air or roadside sand. Clean, crisp, and soup-ready straight from the seal.
              </div>
            </div>
          )}

          {activePolicyTab === 'shipping' && (
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Global Shipping Standards</p>
              <p>
                • <strong>Nigeria Domestic:</strong> Lagos/Ogun within 24-48 hours. Nationwide interstate via GIG Logistics in 2-4 business days.<br />
                • <strong>UK & USA Diaspora:</strong> Shipped via DHL Express with doorstep tracking in 3-5 business days. Vacuum-sealed with 90+ days ambient shelf stability.
              </p>
            </div>
          )}

          {activePolicyTab === 'terms' && (
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Terms of Service</p>
              <p>
                All purchases are backed by our fresh product replacement guarantee. Payments are processed securely via Paystack and Flutterwave with 256-bit bank encryption.
              </p>
            </div>
          )}

          {activePolicyTab === 'privacy' && (
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Privacy & Data Security</p>
              <p>
                Your personal details are used strictly to fulfill shipments and synchronize your cart across devices. We never share or sell customer data to third parties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

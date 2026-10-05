'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createClient } from '@/lib/supabase/client';

const USER_GREETINGS = [
  { prefix: 'Welcome back' },
  { prefix: 'Bon retour' },
  { prefix: 'Barka da dawowa' },
  { prefix: 'Ẹ kú àbọ̀' },
  { prefix: 'Nnọọ ọzọ' },
];

function RotatingUserGreeting({ name }: { name: string }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % USER_GREETINGS.length);
        setFade(true);
      }, 300);
    }, 4000);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, []);

  const current = USER_GREETINGS[index];

  return (
    <span
      className={`text-xs text-gray-600 font-medium hidden sm:inline transition-opacity duration-300 ${
        fade ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {current.prefix}, <strong className="text-[#005230]">{name}</strong>!
    </span>
  );
}

export function Navbar({ locale = 'en' }: { locale?: string }) {
  const { totalItems, openCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Extract first name
          const fName =
            user.user_metadata?.first_name ||
            user.user_metadata?.full_name?.split(' ')[0] ||
            user.user_metadata?.name?.split(' ')[0] ||
            user.email?.split('@')[0] ||
            '';
          setFirstName(fName);

          // Check if admin role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            setIsAdmin(true);
          }
          if (profile?.full_name && !fName) {
            setFirstName(profile.full_name.split(' ')[0]);
          }
        }
      } catch (e) {
        console.warn('Navbar auth check:', e);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const fName =
            session.user.user_metadata?.first_name ||
            session.user.user_metadata?.full_name?.split(' ')[0] ||
            session.user.email?.split('@')[0] ||
            '';
          setFirstName(fName);
        } else {
          setUser(null);
          setIsAdmin(false);
          setFirstName('');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setFirstName('');
    window.location.href = `/${locale}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo with Abstract Golden Leaping Catfish Crest */}
        <a href={`/${locale}`} className="group transition-opacity hover:opacity-95">
          <BrandLogo size="md" />
        </a>

        {/* Links & Interactive Cart */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-gray-700">
          <a
            href={`/${locale}/products`}
            className="hover:text-[#008751] transition-colors hidden sm:inline"
          >
            Products
          </a>
          <a
            href={`/${locale}/blog`}
            className="hover:text-[#008751] transition-colors hidden md:inline text-xs"
          >
            Blog
          </a>

          {/* Conditional Auth Navigation */}
          {!loading && (
            <>
              {user ? (
                // Logged In: Show Greeting + Sign Out (+ Admin if admin role)
                <div className="flex items-center gap-3">
                  <RotatingUserGreeting name={firstName || 'Customer'} />

                  {/* ONLY show Admin link if user is verified admin */}
                  {isAdmin && (
                    <a
                      href={`/${locale}/admin`}
                      className="text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors font-bold"
                    >
                      Admin Dashboard
                    </a>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Logged Out: Show Sign In & Sign Up
                <div className="flex items-center gap-2.5">
                  <a
                    href={`/${locale}/login`}
                    className="hover:text-[#008751] transition-colors text-xs font-bold"
                  >
                    Sign In
                  </a>
                  <span className="text-gray-300 text-xs">|</span>
                  <a
                    href={`/${locale}/signup`}
                    className="text-[#008751] hover:text-[#006b3f] transition-colors text-xs font-bold"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </>
          )}

          {/* Cart Button with live counter badge */}
          <button
            onClick={openCart}
            className="relative px-3.5 py-2 rounded-xl bg-[#008751]/10 hover:bg-[#008751]/20 text-[#006b3f] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-base">🛒</span>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-[#008751] text-white text-[11px] px-1.5 py-0.2 rounded-full font-extrabold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Quick Checkout CTA */}
          <a
            href={`/${locale}/checkout`}
            className="bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Checkout</span>
            <span>→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BrandLogo } from '@/components/ui/BrandLogo';

const CONGRATS_GREETINGS = [
  { lang: 'English', getHeading: (name: string) => `Congratulations, ${name}!` },
  { lang: 'Français', getHeading: (name: string) => `Félicitations, ${name}!` },
  { lang: 'Hausa', getHeading: (name: string) => `Barka, ${name}!` },
  { lang: 'Yorùbá', getHeading: (name: string) => `Ẹ kú oríire, ${name}!` },
  { lang: 'Igbo', getHeading: (name: string) => `Ekele, ${name}!` },
];

function RotatingCongratsHeading({ name }: { name: string }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % CONGRATS_GREETINGS.length);
        setFade(true);
      }, 350);
    }, 3500);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, []);

  const current = CONGRATS_GREETINGS[index];

  return (
    <div>
      <div className="mb-1">
        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#006b3f] text-[10px] font-bold uppercase tracking-wider">
          {current.lang}
        </span>
      </div>
      <h2
        className={`text-2xl font-black font-serif text-gray-900 transition-all duration-300 transform ${
          fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        }`}
      >
        {current.getHeading(name)}
      </h2>
    </div>
  );
}

export function LoginForm({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{ email: string; name: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Check if email was passed in URL query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email');
      if (urlEmail) {
        setEmail(urlEmail);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/en/account`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err?.message || 'Google Sign-In failed', type: 'error' });
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (currentMode === 'signup') {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.error || 'Registration failed');
        }

        // Show explicit registration success state requiring them to log in
        setRegisteredUser({
          email: regData.email || email,
          name: regData.firstName || firstName || 'Valued Customer',
        });
        setPassword('');
        return;
      } else {
        let { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error && error.message.toLowerCase().includes('email not confirmed')) {
          // Auto-confirm account via API and retry
          try {
            const autoConfirmRes = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            if (autoConfirmRes.ok) {
              const retry = await supabase.auth.signInWithPassword({ email, password });
              error = retry.error;
            }
          } catch {}
        }

        if (error) {
          throw error;
        }

        window.location.href = '/en/account';
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 1. Explicit Registration Success Screen
  if (registeredUser) {
    return (
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl border-2 border-[#008751]/30 shadow-xl text-center">
        <BrandLogo size="md" showText={false} className="mb-4 mx-auto" />
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008751] text-3xl flex items-center justify-center mx-auto mb-4 font-black">
          ✓
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006b3f] text-xs font-bold mb-3 border border-emerald-200">
          <span>🎉</span> Registration Successful
        </div>
        <RotatingCongratsHeading name={registeredUser.name} />
        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          Your Sawfy White account has been successfully created and activated! We also sent a personalized welcome confirmation to <strong className="text-gray-900">{registeredUser.email}</strong>.
        </p>
        <div className="text-xs text-gray-700 mt-4 bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 leading-relaxed font-medium">
          Please sign in with your email and password below to access your account and shopping cart.
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              setCurrentMode('login');
              setRegisteredUser(null);
              setMessage({
                text: 'Registration complete! Please enter your password to sign in.',
                type: 'success',
              });
            }}
            className="w-full py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all text-center cursor-pointer"
          >
            Sign In with Your Password →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-lg">
      <div className="text-center mb-6 flex flex-col items-center">
        <BrandLogo size="md" showText={false} className="mb-2" />
        <h2 className="text-2xl font-black font-serif text-gray-900">
          {currentMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {currentMode === 'signup'
            ? 'Join Sawfy White to track dried catfish shipments & save orders'
            : 'Sign in to access your orders and synchronized cart'}
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3.5 rounded-xl text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-3.5 px-4 border border-gray-300 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-2xs font-bold text-xs text-gray-800 disabled:opacity-50 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-400 font-medium">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {currentMode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                placeholder="e.g. Babatunde"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                placeholder="e.g. Adeleke"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Password (at least 6 characters) *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Processing...' : currentMode === 'signup' ? 'Create Account →' : 'Sign In →'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        {currentMode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => {
                setMessage(null);
                setCurrentMode('login');
              }}
              className="text-[#008751] font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => {
                setMessage(null);
                setCurrentMode('signup');
              }}
              className="text-[#008751] font-bold hover:underline cursor-pointer"
            >
              Create an Account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

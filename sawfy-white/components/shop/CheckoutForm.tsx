'use client';

import React, { useState, useEffect } from 'react';
import { PAYMENT_METHOD_OPTIONS, routePaymentMethod } from '@/lib/payments/routing';
import { PaymentMethod, ShippingAddress } from '@/types';
import { useCart } from '@/hooks/useCart';
import { createClient } from '@/lib/supabase/client';

export interface CheckoutItem {
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  unitPrice: number;
  quantity: number;
  isDigital: boolean;
}

export function CheckoutForm({
  initialItems = [],
  currency = 'NGN',
}: {
  initialItems?: CheckoutItem[];
  currency?: 'NGN' | 'USD';
}) {
  const { items: cartItems } = useCart();
  const supabase = createClient();

  const activeItems: CheckoutItem[] =
    cartItems.length > 0
      ? cartItems.map((c) => ({
          productId: c.id,
          variantId: c.variantId,
          title: c.title,
          variantTitle: c.variantTitle,
          unitPrice: c.price,
          quantity: c.quantity,
          isDigital: c.is_digital,
        }))
      : initialItems.length > 0
        ? initialItems
        : [
            {
              productId: 'prod-001',
              title: 'Whole Round-Curled Dried Catfish (1kg Pack)',
              variantTitle: '1kg Standard Pack (4-6 curled fish)',
              unitPrice: 18500,
              quantity: 1,
              isDigital: false,
            },
          ];

  const [items] = useState<CheckoutItem[]>(activeItems);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [createAccount, setCreateAccount] = useState(true);
  const [password, setPassword] = useState('');

  const [address, setAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('visa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check Supabase Auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          setAddress((prev) => ({
            ...prev,
            email: user.email || prev.email,
            firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || prev.firstName,
            lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ')[1] || prev.lastName,
          }));
        }
      } catch (err) {
        console.error('Error checking user session', err);
      }
    }
    checkAuth();
  }, [supabase]);

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed');
    }
  };

  // Financial calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const isDomestic =
    address.country.toLowerCase() === 'nigeria' ||
    address.country.toLowerCase() === 'ng';

  const shippingFee = items.every((i) => i.isDigital)
    ? 0
    : isDomestic
      ? 2500
      : currency === 'USD'
        ? 25
        : 35000;

  const total = subtotal + shippingFee;
  const currencySymbol = currency === 'USD' ? '$' : '₦';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!address.email || !address.firstName || !address.address) {
        throw new Error('Please fill in all required shipping address fields.');
      }

      let activeUserId = currentUser?.id;

      // If not logged in and user opted to create account, register in Supabase
      if (!currentUser && createAccount && password) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters to create your account.');
        }

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: address.email,
          password,
          options: {
            data: {
              first_name: address.firstName,
              last_name: address.lastName,
              full_name: `${address.firstName} ${address.lastName}`.trim(),
            },
          },
        });

        if (!signUpErr && signUpData?.user) {
          activeUserId = signUpData.user.id;
        }
      }

      // 1. Create order in our database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          guestEmail: address.email,
          guestName: `${address.firstName} ${address.lastName}`.trim(),
          items,
          shippingAddress: address,
          currency,
          paymentMethod: selectedMethod,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      const orderId = orderData.orderId;

      // 2. Gateway Routing (Invisible to user)
      const provider = routePaymentMethod(selectedMethod);

      if (provider === 'paystack') {
        const paystackRes = await fetch('/api/checkout/paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: address.email,
            amount: total,
            orderId,
          }),
        });

        const paystackData = await paystackRes.json();
        if (!paystackRes.ok) {
          throw new Error(paystackData.error || 'Payment gateway initialization failed');
        }

        window.location.href = paystackData.authorization_url;
      } else {
        // Flutterwave (Apple Pay, PayPal, Google Pay, Amex)
        const flwRes = await fetch('/api/checkout/flutterwave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: address.email,
            amount: total,
            orderId,
            customerName: `${address.firstName} ${address.lastName}`.trim(),
            phone: address.phone,
            currency,
          }),
        });

        const flwData = await flwRes.json();
        if (!flwRes.ok) {
          throw new Error(flwData.error || 'Payment gateway initialization failed');
        }

        window.location.href = flwData.link;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="mb-8 text-center sm:text-left border-b border-gray-200 pb-5">
        <span className="inline-block px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#006b3f] bg-emerald-50 rounded-full mb-2 border border-emerald-200">
          Sawfy White Enterprises • Abeokuta, Nigeria
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-serif">
          Secure Checkout &amp; Order Placement
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          Farm-raised Abeokuta dried catfish prepared and vacuum-sealed for swift dispatch.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <strong>Notice:</strong> {errorMessage}
        </div>
      )}

      {/* Authentication Status Card */}
      <div className="mb-8 p-5 rounded-2xl border transition-all bg-white shadow-xs">
        {currentUser ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#008751] font-bold flex items-center justify-center text-sm">
                ✓
              </span>
              <div>
                <span className="font-extrabold text-gray-900 block">
                  Logged in as {currentUser.email}
                </span>
                <span className="text-gray-500 text-[11px]">
                  Your dried catfish order and tracking details are automatically saved to your account.
                </span>
              </div>
            </div>
            <a
              href="/account"
              className="text-[#008751] font-bold hover:underline shrink-0 text-[11px]"
            >
              My Account &amp; Order History →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-800 block">
                  Customer Account &amp; Order Tracking
                </span>
                <span className="text-[11px] text-gray-500">
                  Sign in with Google, or an account will be created with your order below.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border border-gray-300 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping Address & Account Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 font-serif">
              <span>📍</span> Delivery Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={address.firstName}
                  onChange={handleInputChange}
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
                  name="lastName"
                  value={address.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="e.g. Adeleke"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address (order confirmation &amp; account tracking) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={address.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>

              {/* Seamless Account Creation for Guests */}
              {!currentUser && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#006b3f]">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="rounded text-[#008751] focus:ring-[#008751]"
                    />
                    <span>Create a customer account to track this order</span>
                  </label>

                  {createAccount && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Choose a Password (minimum 6 characters) *
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none bg-white"
                      />
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        Your account will be safely created in Supabase with full order history.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number (for courier dispatch) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="+234 801 234 5678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={address.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="House number, street, landmark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="e.g. Abeokuta, Lagos, London"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  placeholder="e.g. Ogun State"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  name="country"
                  value={address.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#008751] focus:outline-none bg-white font-medium"
                >
                  <option value="Nigeria">Nigeria (Domestic Shipping)</option>
                  <option value="United Kingdom">United Kingdom (UK Diaspora Airfreight)</option>
                  <option value="United States">United States (USA Diaspora Airfreight)</option>
                  <option value="Canada">Canada (Diaspora)</option>
                  <option value="Other">Other International Destination</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 font-serif">
                <span>💳</span> Select Payment Method
              </h2>
              <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                🔒 256-bit Encrypted
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Choose your preferred payment method. Handled securely through Paystack &amp; Flutterwave.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                    selectedMethod === option.id
                      ? 'border-[#008751] bg-emerald-50/50 ring-2 ring-[#008751]/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={selectedMethod === option.id}
                    onChange={() => setSelectedMethod(option.id)}
                    className="mt-1 text-[#008751] focus:ring-[#008751]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <span>{option.icon}</span>
                      <span>{option.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs sticky top-24">
            <h2 className="text-lg font-black text-gray-900 mb-4 font-serif">
              Order Summary
            </h2>

            <div className="divide-y divide-gray-100 mb-6 max-h-72 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {item.title}
                    </p>
                    {item.variantTitle && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.variantTitle} × {item.quantity}
                      </p>
                    )}
                    {item.isDigital && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        ⚡ Instant PDF Download
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-[#005230] whitespace-nowrap">
                    {currencySymbol}
                    {(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Shipping{' '}
                  <span className="text-[10px] text-gray-400">
                    ({isDomestic ? 'Nigeria' : 'International'})
                  </span>
                </span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0
                    ? 'FREE'
                    : `${currencySymbol}${shippingFee.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-3">
                <span>Total Amount</span>
                <span className="text-lg text-[#005230]">
                  {currencySymbol}
                  {total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-4 px-4 bg-[#008751] hover:bg-[#006b3f] disabled:opacity-50 text-white font-black rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Connecting to secure payment...
                </>
              ) : (
                `Complete Order • ${currencySymbol}${total.toLocaleString()} →`
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <span>🛡️</span> 100% Export-Grade Quality Guarantee • Abeokuta, Nigeria
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

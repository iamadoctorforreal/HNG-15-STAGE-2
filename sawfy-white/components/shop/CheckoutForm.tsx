'use client';

import React, { useState } from 'react';
import { PAYMENT_METHOD_OPTIONS, routePaymentMethod } from '@/lib/payments/routing';
import { PaymentMethod, ShippingAddress } from '@/types';

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
  const [items] = useState<CheckoutItem[]>(
    initialItems.length > 0
      ? initialItems
      : [
          {
            productId: 'prod-001',
            title: 'Abeokuta Royal Dried Catfish (Jumbo Pack - 1kg)',
            variantTitle: '1kg Pack (5-7 Giant Fish)',
            unitPrice: 18500,
            quantity: 1,
            isDigital: false,
          },
          {
            productId: 'prod-003',
            title: 'Abeokuta Catfish Kitchen: Traditional Recipes (Cookbook)',
            variantTitle: 'Deluxe Edition',
            unitPrice: 2500,
            quantity: 1,
            isDigital: true,
          },
        ]
  );

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

      // 1. Create order in our database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

        // Redirect to Paystack payment gateway
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

        // Redirect to Flutterwave payment link
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
      <div className="mb-8 text-center sm:text-left border-b border-warm-gray-200 pb-5">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 rounded-full mb-2">
          Sawfy White Enterprises • Abeokuta, Nigeria
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
          Secure Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Ẹ kú àbọ̀! Export-grade Abeokuta dried catfish prepared and packed for you.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <strong>Notice:</strong> {errorMessage}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span> Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={address.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Babatunde"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Adeleke"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address (for order confirmation) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={address.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="name@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+234 801 234 5678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={address.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="House number, street name, landmark"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Abeokuta or London"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Ogun State"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  name="country"
                  value={address.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="Nigeria">Nigeria (Domestic)</option>
                  <option value="United Kingdom">United Kingdom (Diaspora)</option>
                  <option value="United States">United States (Diaspora)</option>
                  <option value="Canada">Canada (Diaspora)</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Other">Other International</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection (Single list — no gateway names shown!) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>💳</span> Select Payment Method
              </h2>
              <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded">
                🔒 256-bit Encrypted
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Choose your preferred payment method. You will be securely directed to complete the transaction.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                    selectedMethod === option.id
                      ? 'border-primary-600 bg-primary-50/40 ring-2 ring-primary-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={selectedMethod === option.id}
                    onChange={() => setSelectedMethod(option.id)}
                    className="mt-1 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-sm text-gray-900">
                      <span>{option.icon}</span>
                      <span>{option.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
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
          <div className="bg-warm-gray-50 p-6 rounded-xl border border-warm-gray-200 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 font-serif">
              Order Summary
            </h2>

            <div className="divide-y divide-gray-200 mb-6 max-h-72 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {item.title}
                    </p>
                    {item.variantTitle && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variantTitle} × {item.quantity}
                      </p>
                    )}
                    {item.isDigital && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ⚡ Instant Digital Download
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {currencySymbol}
                    {(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  {currencySymbol}
                  {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Estimated Shipping{' '}
                  <span className="text-xs text-gray-400">
                    ({isDomestic ? 'Nigeria' : 'International'})
                  </span>
                </span>
                <span>
                  {shippingFee === 0
                    ? 'FREE'
                    : `${currencySymbol}${shippingFee.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-primary-700">
                  {currencySymbol}
                  {total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors text-center text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Connecting to secure payment...
                </>
              ) : (
                `Complete Order • ${currencySymbol}${total.toLocaleString()}`
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <span>🛡️</span> 100% Export-Grade Quality Guarantee • Abeokuta, Nigeria
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

import { describe, it, expect } from 'vitest';
import { routePaymentMethod, PAYMENT_METHOD_OPTIONS } from '@/lib/payments/routing';

describe('Payment Method Routing (Dual-Gateway)', () => {
  it('routes Visa, Mastercard, Verve, and Bank Transfer to Paystack', () => {
    expect(routePaymentMethod('visa')).toBe('paystack');
    expect(routePaymentMethod('mastercard')).toBe('paystack');
    expect(routePaymentMethod('verve')).toBe('paystack');
    expect(routePaymentMethod('bank_transfer')).toBe('paystack');
    expect(routePaymentMethod('ussd')).toBe('paystack');
  });

  it('routes Apple Pay, Google Pay, PayPal, and Amex to Flutterwave', () => {
    expect(routePaymentMethod('apple_pay')).toBe('flutterwave');
    expect(routePaymentMethod('google_pay')).toBe('flutterwave');
    expect(routePaymentMethod('paypal')).toBe('flutterwave');
    expect(routePaymentMethod('amex')).toBe('flutterwave');
  });

  it('provides customer-facing payment options without exposing gateway names', () => {
    const optionNames = PAYMENT_METHOD_OPTIONS.map((opt) => opt.name.toLowerCase());
    expect(optionNames).not.toContain('paystack');
    expect(optionNames).not.toContain('flutterwave');
    expect(optionNames).toContain('visa');
    expect(optionNames).toContain('apple pay');
    expect(optionNames).toContain('paypal');
  });
});

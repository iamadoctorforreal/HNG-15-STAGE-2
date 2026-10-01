import { PaymentMethod, PaymentProvider } from '@/types';

/**
 * Maps the customer's selected payment method to the appropriate payment provider.
 * The customer only chooses their preferred payment method (Visa, Apple Pay, PayPal, etc.).
 * The system handles gateway routing transparently behind the scenes.
 */
export function routePaymentMethod(method: PaymentMethod): PaymentProvider {
  switch (method) {
    case 'apple_pay':
    case 'google_pay':
    case 'paypal':
    case 'amex':
      return 'flutterwave';

    case 'visa':
    case 'mastercard':
    case 'verve':
    case 'bank_transfer':
    case 'ussd':
    default:
      return 'paystack';
  }
}

export const PAYMENT_METHOD_OPTIONS: {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: 'visa',
    name: 'Visa',
    icon: '💳',
    description: 'Pay securely with your Visa debit or credit card',
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: '💳',
    description: 'Fast and secure Mastercard payment',
  },
  {
    id: 'verve',
    name: 'Verve',
    icon: '💳',
    description: 'Domestic Nigerian debit card payment',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct transfer from your Nigerian bank account',
  },
  {
    id: 'ussd',
    name: 'USSD / Mobile Money',
    icon: '📱',
    description: 'Pay directly via USSD code on your mobile phone',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍏',
    description: 'Instant 1-tap checkout with Apple Pay (Safari / iOS)',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🌐',
    description: 'Quick payment using saved Google Pay accounts',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay safely with your PayPal balance or linked cards',
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: '💳',
    description: 'International card payment via American Express',
  },
];

export type Currency = 'NGN' | 'USD';
export type Locale = 'en' | 'yo' | 'fr';

export type Product = {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  currency: Currency;
  is_active: boolean;
  is_digital: boolean;
  digital_storage_path?: string;
  images: string[];
  metadata?: {
    protein_content?: string;
    origin?: string;
    grade?: string;
    features?: string[];
  };
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  title: string;
  sku?: string;
  price: number;
  stock_quantity?: number;
  is_active: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'visa'
  | 'mastercard'
  | 'verve'
  | 'bank_transfer'
  | 'ussd'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'amex';

export type PaymentProvider = 'paystack' | 'flutterwave';

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
};

export type Order = {
  id: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  status: OrderStatus;
  payment_provider?: PaymentProvider;
  payment_reference?: string;
  currency: Currency;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_title: string;
  variant_title?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  is_digital: boolean;
};

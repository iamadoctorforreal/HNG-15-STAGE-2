-- ============================================================
-- SAWFY WHITE ENTERPRISES — SUPABASE DATABASE SCHEMA
-- E-commerce tables with Row Level Security (RLS)
-- Products, Variants, Carts, Orders, Line Items, Digital Tokens
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS (Physical Goods & Digital Products like Cookbooks)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_digital BOOLEAN NOT NULL DEFAULT false,
  digital_storage_path TEXT,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PRODUCT VARIANTS (Sizes, Bundles, Editions)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT UNIQUE,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CARTS (Supports both Authenticated Users and Anonymous Guests)
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);

-- 6. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id, variant_id)
);

-- 7. ORDERS
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('paystack', 'flutterwave');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  payment_provider payment_gateway,
  payment_reference TEXT UNIQUE,
  currency TEXT NOT NULL DEFAULT 'NGN',
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ORDER ITEMS (Immutable snapshot of line items at purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(12, 2) NOT NULL,
  is_digital BOOLEAN NOT NULL DEFAULT false
);

-- 9. DIGITAL PRODUCT ACCESS TOKENS (For Cookbooks / Downloads)
CREATE TABLE IF NOT EXISTS public.digital_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_access_tokens ENABLE ROW LEVEL SECURITY;

-- Products & Categories: Public Read
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active variants" ON public.product_variants;
CREATE POLICY "Public can view active variants" ON public.product_variants
  FOR SELECT USING (is_active = true);

-- Profiles: Users manage their own profile
DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.profiles;
CREATE POLICY "Users can view and edit own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Carts: Authenticated users manage own cart
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

-- Orders: Users can view own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Digital Tokens: Users can view own access tokens
DROP POLICY IF EXISTS "Users can view own digital tokens" ON public.digital_access_tokens;
CREATE POLICY "Users can view own digital tokens" ON public.digital_access_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA: ABEOKUTA CATFISH & DIGITAL COOKBOOK
-- ============================================================
INSERT INTO public.products (id, title, slug, description, base_price, currency, is_active, is_digital, metadata)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Abeokuta Royal Dried Catfish (Jumbo Pack - 1kg)',
    'abeokuta-royal-dried-catfish-1kg',
    'Naturally oven-dried, export-grade African catfish farm-raised in Abeokuta. Clean, sand-grit free, zero sand, rich in healthy Omega-3 fats and protein. Prepared to meet international diaspora export standards.',
    18500,
    'NGN',
    true,
    false,
    '{"grade": "Export Grade A", "origin": "Abeokuta, Ogun State, Nigeria", "protein_content": "68% dry weight"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Medium Dried Catfish (500g Stew Pack)',
    'medium-dried-catfish-500g',
    'Perfect size for traditional Yoruba soups: Efo Riro, Egusi, Obe Ata, and Pepper Soup. Tender yet crunchy skin that absorbs authentic soup spices beautifully.',
    9500,
    'NGN',
    true,
    false,
    '{"grade": "Export Grade", "origin": "Abeokuta, Ogun State, Nigeria", "protein_content": "65% dry weight"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'The Abeokuta Catfish Kitchen: Traditional & Modern Recipes (Digital Cookbook)',
    'abeokuta-catfish-cookbook-digital',
    '45 authentic Nigerian recipes featuring dried catfish — from Abeokuta heritage soups (Efo Elegusi, Ila Alasepo, Obe Dindin) to diaspora fusion dishes. Includes step-by-step cleaning guides, storage tips, and nutritional profiles.',
    2500,
    'NGN',
    true,
    true,
    '{"features": ["Instant PDF Download", "45 recipes", "Nutritional guides"]}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- Variants
INSERT INTO public.product_variants (product_id, title, price, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', '1kg Pack (5-7 Giant Fish)', 18500, true),
  ('00000000-0000-0000-0000-000000000001', '2kg Value Pack', 35000, true),
  ('00000000-0000-0000-0000-000000000002', '500g Pack (6-8 pieces)', 9500, true),
  ('00000000-0000-0000-0000-000000000003', 'Deluxe Digital Edition (PDF)', 2500, true)
ON CONFLICT DO NOTHING;

# 🐟 Sawfy White Enterprises — E-Commerce Website

[![HNG 15 Stage 2](https://img.shields.io/badge/HNG15-Stage%202-008751.svg)](https://hng.tech)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)
[![Paystack](https://img.shields.io/badge/Payment-Paystack-00C3F7.svg)](https://paystack.com)
[![Flutterwave](https://img.shields.io/badge/Payment-Flutterwave-FB9129.svg)](https://flutterwave.com)
[![Mailgun](https://img.shields.io/badge/Email-Mailgun-E23B2A.svg)](https://mailgun.com)

> **Sawfy White Enterprises** is a mobile-first, SEO-rich e-commerce platform for selling premium export-grade dried catfish from Abeokuta, Ogun State, Nigeria. Built for domestic Nigerian buyers and the diaspora in the UK and USA.

---

## 🚀 Key Features

1. **Product Catalog & Digital Cookbook**
   - Export-grade dried catfish in various weight bundles (500g, 1kg, wholesale cartons)
   - Digital cookbook product: *"The Abeokuta Catfish Kitchen: 45 Authentic Recipes"* with secure token-gated expiring downloads
2. **Seamless Dual-Gateway Checkout (Invisible to Customer)**
   - Single intuitive payment method selection (Visa, Mastercard, Verve, Bank Transfer, Apple Pay, Google Pay, PayPal, Amex)
   - Cards & Bank Transfer silently route to **Paystack** (in Kobo)
   - Apple Pay, PayPal, Google Pay & Amex silently route to **Flutterwave** (standard units)
3. **Database Persistence via Supabase**
   - PostgreSQL schema with Row-Level Security (RLS)
   - Profiles, Products, Variants, Carts, Orders, and Digital Access Tokens
4. **Automated Order Fulfillment & Emails via Mailgun**
   - Webhook verification with HMAC-SHA512 (Paystack) and Secret Hash (Flutterwave)
   - Transactional order confirmation emails with embedded digital cookbook links
5. **Google Authentication (OAuth 2.0)**
   - One-tap sign in configured via Google Cloud Console and Supabase Auth
6. **Multi-Language Support (i18n)**
   - English, Yoruba (Ẹ kú àbọ̀!), and French

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first `@theme`)
- **Database & Auth**: Supabase (PostgreSQL + Supabase SSR)
- **Payments**: Paystack + Flutterwave
- **Emails**: Mailgun (`mailgun.js`)
- **i18n**: `next-intl`
- **Testing**: Vitest unit testing suite

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/iamadoctorforreal/HNG-15-STAGE-2.git
cd HNG-15-STAGE-2/sawfy-white
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your credentials:
```bash
cp .env.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=orders@your_mailgun_domain

PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_SECRET_HASH=your_webhook_hash
NEXT_PUBLIC_FLW_PUBLIC_KEY=your_flw_public_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_CURRENCY=NGN
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Unit Tests
```bash
npm run test
```

---

## 🏛️ Brand Hierarchy & Cultural Root
- **Parent Brand**: Sawfy White Enterprises
- **Origin**: Abeokuta, Ogun State, Nigeria 🇳🇬
- **Heritage**: Celebrating Egba culture, Adire textiles, and the historic Olumo Rock

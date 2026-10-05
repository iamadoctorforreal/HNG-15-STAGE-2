# AGENTS.md — Sawfy White Enterprises 🐟

> AI Coding Agent instructions for building the Sawfy White Enterprises e-commerce website.
> Last updated: 2026-10-01

---

## Project Overview

**Sawfy White Enterprises** is a mobile-first, SEO-rich e-commerce website for selling premium export-grade dried catfish from Abeokuta, Ogun State, Nigeria. The shop serves Nigerian domestic buyers and the Nigerian/African diaspora in the UK and US. It includes a content-driven blog and a digital cookbook product (free basic + paid premium).

> **Brand hierarchy**: Sawfy White Enterprises is the parent company. All product lines and sub-brands are "created by Sawfy White Enterprises" or "a Sawfy White product".

### Business Context
- **Primary market**: Nigeria (domestic shipping)
- **Secondary market**: UK/US (Nigerian/African diaspora — bulk & retail)
- **Products**: Dried catfish (various sizes, bulk/wholesale, retail, weight-based + pre-packaged) + digital cookbook
- **Currencies**: Nigerian Naira (₦) and US Dollar ($)
- **Brand identity**: Clean, warm, Yoruba/Egba-inspired, culturally rooted in Abeokuta

---

## Tech Stack (Exact Versions)

| Layer | Technology | Package | Version |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | `next` | `^15.2.x` |
| React | React 19 | `react`, `react-dom` | `^19.0.0` |
| Styling | Tailwind CSS v4 (CSS-first) | `tailwindcss`, `@tailwindcss/postcss` | `^4.0.x` |
| Animations | Motion (formerly Framer Motion) | `motion` | `^12.x` |
| Database | Supabase (PostgreSQL) | `@supabase/supabase-js` | `^2.49.x` |
| Auth (SSR) | Supabase SSR | `@supabase/ssr` | `^0.5.x` |
| Emails | Mailgun | `mailgun.js`, `form-data` | `^10.3.x`, `^4.0.x` |
| Payments (primary) | Paystack | Native `fetch` + `crypto` | N/A |
| Payments (secondary) | Flutterwave (Apple Pay, PayPal, extra methods) | Native `fetch` | N/A |
| i18n | next-intl | `next-intl` | `^3.26.x` |
| Testing (unit) | Vitest + React Testing Library | `vitest`, `@testing-library/react` | Latest |
| Testing (e2e) | Playwright | `@playwright/test` | Latest |
| Hosting | Vercel | N/A | N/A |
| Language | TypeScript | `typescript` | `^5.x` |

### Critical Version Notes
- **DO NOT** use `@supabase/auth-helpers-nextjs` — it is deprecated. Use `@supabase/ssr`.
- **DO NOT** use `mailgun-js` — it is deprecated. Use `mailgun.js`.
- **DO NOT** use `framer-motion` imports — use `motion/react` imports.
- Tailwind CSS v4 does NOT use `tailwind.config.js`. Configuration is CSS-first via `@import "tailwindcss"` and `@theme` blocks.
- Next.js 15: `cookies()`, `headers()`, `params`, and `searchParams` are **async Promises** — always `await` them.
- Next.js 15: `fetch` defaults to `cache: 'no-store'`. For cacheable data, explicitly set `next: { revalidate: 3600 }`.

---

## Project Structure

```
sawfy-white/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── auth/callback/route.ts
│   │   ├── (shop)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # Product catalog
│   │   │   │   └── [slug]/page.tsx         # Product detail
│   │   │   ├── cart/page.tsx               # Shopping cart
│   │   │   ├── checkout/page.tsx           # Checkout (REQUIRED)
│   │   │   └── orders/
│   │   │       ├── page.tsx                # Order history
│   │   │       └── [id]/page.tsx           # Order detail
│   │   ├── (content)/
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx                # Blog listing
│   │   │       └── [slug]/page.tsx         # Blog post
│   │   ├── (seo)/
│   │   │   ├── order-nigerian-catfish-usa/page.tsx
│   │   │   ├── buy-dried-catfish-uk/page.tsx
│   │   │   └── bulk-dried-catfish-nigeria/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── page.tsx                # Dashboard
│   │   │       ├── products/page.tsx       # Product CRUD
│   │   │       ├── orders/page.tsx         # Order management
│   │   │       └── blog/page.tsx           # Blog CRUD
│   │   ├── account/page.tsx                # User profile
│   │   ├── layout.tsx                      # Root locale layout
│   │   └── not-found.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── products/route.ts
│   │   ├── products/[slug]/route.ts
│   │   ├── cart/route.ts
│   │   ├── cart/[id]/route.ts
│   │   ├── orders/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── checkout/
│   │   │   ├── paystack/route.ts
│   │   │   └── flutterwave/route.ts
│   │   ├── webhooks/
│   │   │   ├── paystack/route.ts
│   │   │   └── flutterwave/route.ts
│   │   ├── download/[token]/route.ts
│   │   ├── email/route.ts
│   │   ├── admin/
│   │   │   ├── products/route.ts
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   ├── blog/route.ts
│   │   │   └── blog/[id]/route.ts
│   │   └── blog/route.ts
│   └── globals.css
├── components/
│   ├── ui/                     # Generic UI: Button, Input, Modal, Badge, Card
│   ├── shop/                   # ProductCard, CartDrawer, VariantSelector, CheckoutForm
│   ├── layout/                 # Navbar, Footer, MobileNav, LanguageSwitcher
│   └── motion/                 # MotionButton, ScrollReveal, PageTransition (client components)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient
│   │   ├── server.ts           # createServerClient (async cookies)
│   │   └── admin.ts            # Service role client (webhooks/admin only)
│   ├── payments/
│   │   ├── paystack.ts         # Initialize + verify helpers
│   │   ├── flutterwave.ts      # Initialize + verify helpers
│   │   └── order-fulfillment.ts # Shared fulfillment logic
│   ├── mailgun.ts              # Email sending utilities
│   ├── utils.ts                # Formatters, helpers, currency conversion
│   └── constants.ts            # Shipping zones, product categories, etc.
├── hooks/                      # Custom React hooks (useCart, useAuth, etc.)
├── types/                      # TypeScript type definitions
│   ├── database.ts             # Supabase generated types
│   └── index.ts                # Shared app types
├── messages/
│   ├── en.json                 # English translations
│   ├── yo.json                 # Yoruba translations
│   ├── ha.json                 # Hausa translations
│   ├── ig.json                 # Igbo translations
│   └── fr.json                 # French translations
├── i18n/
│   ├── routing.ts              # Locale routing config
│   └── request.ts              # Request-level i18n config
├── __tests__/
│   ├── api/                    # API route handler tests
│   ├── components/             # Component tests
│   ├── lib/                    # Utility function tests
│   └── e2e/                    # Playwright e2e tests
├── middleware.ts                # Chained: next-intl + Supabase session refresh
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── playwright.config.ts
├── .env.local                  # Local environment variables (NEVER commit)
├── .env.example                # Template for env vars
├── package.json
└── tsconfig.json
```

---

## Coding Standards

### General Rules
1. **TypeScript everywhere** — no `any` types. Define proper interfaces/types in `types/`.
2. **Server Components by default** — only use `'use client'` when necessary (interactivity, hooks, browser APIs, Motion animations).
3. **Server Actions** for form mutations when appropriate — API routes for webhooks and external integrations.
4. **Error handling** — every async operation must have proper try/catch with user-friendly error messages.
5. **Loading states** — every page and data-fetching component must have loading UI (skeletons preferred over spinners).
6. **Accessibility** — semantic HTML, proper ARIA labels, keyboard navigation, color contrast compliance.
7. **Mobile-first** — design for mobile viewport first, then scale up with responsive breakpoints.

### Component Patterns
- Use **named exports** for components.
- Client components must be small and focused — isolate interactivity into micro-components.
- Motion/animation components go in `components/motion/` and are always `'use client'`.
- All text content must use `useTranslations()` from `next-intl` — no hardcoded strings.

### Supabase Patterns
- **Browser client** (`lib/supabase/client.ts`): For client components only.
- **Server client** (`lib/supabase/server.ts`): For Server Components, Server Actions, Route Handlers. Always `await cookies()`.
- **Admin client** (`lib/supabase/admin.ts`): Service role key — ONLY for webhooks and admin operations. Never expose to client.
- **Always use `supabase.auth.getUser()`** for auth verification on the server — NEVER `getSession()`.
- **RLS (Row Level Security)** is enabled on all tables — the schema defines who can read/write what.

### Payment Integration Patterns

#### Dual-Gateway Strategy (Invisible to Users)
- **Paystack (primary)**: Handles Visa, Mastercard, Verve, bank transfers, USSD, and mobile money.
- **Flutterwave (secondary)**: Handles Apple Pay, PayPal, Google Pay, American Express, and other international methods.
- **Users never see provider names.** They select a payment method (e.g., "Visa", "PayPal", "Apple Pay") and the system silently routes to the correct provider behind the scenes.
- At checkout, present a **single list of payment method icons/options**. User picks one → system routes to Paystack or Flutterwave accordingly.

#### Payment Method → Provider Routing
| Payment Method | Routed To |
|---|---|
| Visa / Mastercard / Verve | Paystack |
| Bank Transfer (Nigerian banks) | Paystack |
| USSD / Mobile Money | Paystack |
| Apple Pay | Flutterwave |
| PayPal | Flutterwave |
| Google Pay | Flutterwave |
| American Express | Flutterwave |

#### Paystack Rules
- Amounts in **kobo** (multiply NGN by 100). ₦5,000 = `500000`.
- Webhook signature: HMAC-SHA512 of raw body text using secret key.
- Read `req.text()` for webhook body — NEVER `req.json()` then re-stringify.
- Return HTTP 200 immediately from webhooks.

#### Flutterwave Rules
- Amounts in **standard units** (e.g., `5000` = ₦5,000). DO NOT multiply by 100.
- Webhook auth: `verif-hash` header matching dashboard secret hash (NOT HMAC body hashing).
- Always run **secondary verification** via GET `/v3/transactions/:id/verify` before fulfilling orders.
- Read `req.text()` for webhook body — NEVER `req.json()` then re-stringify.
- Return HTTP 200 immediately from webhooks.

#### Shared Rules
- Add `export const dynamic = 'force-dynamic';` to all webhook route handlers.
- Both gateways feed into the same `order-fulfillment.ts` logic — the fulfillment path is payment-provider-agnostic.

### Email Patterns
- Use `mailgun.js` with `form-data` constructor.
- Send order confirmation emails from webhook handlers (after payment verification).
- Send welcome emails from the auth callback or profile creation trigger.
- Always include both `text` and `html` versions of emails.

### i18n Patterns
- All translatable strings live in `messages/{locale}.json`.
- Use `useTranslations('namespace')` in client components.
- Use `getTranslations('namespace')` in server components.
- Call `setRequestLocale(locale)` in every server component layout/page for static rendering.
- `params` in Next.js 15 layouts/pages is `Promise<{ locale: string }>` — always await it.

### Testing Requirements
- **Every API route handler** must have unit tests (Vitest).
- **Cart logic, price calculations, currency conversion** must have unit tests.
- **Key UI components** (ProductCard, CartDrawer, CheckoutForm) must have component tests.
- **Critical flows** (browse → add to cart → checkout → payment → confirmation) must have e2e tests (Playwright).
- **Run all tests before committing** — no broken tests in the repo.
- **Minimum coverage**: 80% for API routes, 70% for components.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role key (server-only, for webhooks/admin)

# Mailgun
MAILGUN_API_KEY=                    # Mailgun API key
MAILGUN_DOMAIN=                     # Mailgun sending domain
MAILGUN_FROM_EMAIL=                 # Default from email (e.g., orders@yourdomain.com)

# Paystack
PAYSTACK_SECRET_KEY=                # Paystack secret key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=    # Paystack public key

# Flutterwave
FLW_SECRET_KEY=                     # Flutterwave secret key
FLW_SECRET_HASH=                    # Flutterwave webhook secret hash
NEXT_PUBLIC_FLW_PUBLIC_KEY=         # Flutterwave public key

# App
NEXT_PUBLIC_SITE_URL=               # Production URL (e.g., https://dragonfish.com)
NEXT_PUBLIC_DEFAULT_CURRENCY=NGN    # Default currency
```

---

## Design System

### Colors
```css
@theme {
  /* Primary — Nigerian Green */
  --color-primary-50: #e6f5ed;
  --color-primary-100: #b3e0c9;
  --color-primary-500: #008751;
  --color-primary-600: #006b3f;
  --color-primary-700: #005230;

  /* Secondary — Gold/Ochre */
  --color-secondary-400: #E8C468;
  --color-secondary-500: #D4A843;
  --color-secondary-600: #B8922E;

  /* Neutral — Warm tones */
  --color-cream: #FFF8E7;
  --color-warm-gray-50: #FAF8F5;
  --color-warm-gray-100: #F0EDE8;
  --color-warm-gray-900: #2D2D2D;

  /* Accent */
  --color-fish-orange: #E86A33;

  /* Fonts */
  --font-sans: "Inter", "Geist Sans", -apple-system, sans-serif;
  --font-heading: "Playfair Display", Georgia, serif;
}
```

### Cultural Design Elements
- Adire textile patterns as subtle background textures and section dividers.
- Yoruba greetings on homepage: "Ẹ kú àbọ̀!" (Welcome!).
- Warm, appetizing food photography style.
- Rich green (#008751) as primary brand color — representing Nigeria.
- Gold/ochre accents — representing premium quality and Abeokuta royalty.

### Interaction Design (Motion)
- **Scroll reveals**: Content fades/slides in as user scrolls — `motion/react` with `whileInView`.
- **Product card hover**: Gentle `scale(1.02)` lift with shadow transition.
- **Add to cart button**: Micro-press `scale(0.96)` tap feedback.
- **Cart drawer**: Slide-in from right with spring physics.
- **Page transitions**: Subtle opacity fade between pages.
- **Hero section**: Gentle parallax on scroll.
- All animations must be performant and non-distracting — enhancement, not decoration.

---

## Database Schema

Use the full SQL schema provided in the project plan. Key tables:
- `profiles` — extends `auth.users` with profile data and role
- `categories` — product categories
- `products` — physical (catfish) and digital (cookbook) products
- `product_variants` — sizes, weights, editions
- `carts` / `cart_items` — shopping cart (supports auth + guest)
- `orders` / `order_items` — purchase records with immutable snapshots
- `digital_access_tokens` — secure, expiring download tokens for cookbook

### Auto-profile creation trigger
A PostgreSQL trigger automatically creates a `profiles` row when a new user signs up via Supabase Auth (including Google OAuth).

### RLS Policies Summary
- **Products/Categories**: Public read for active items.
- **Profiles**: Users can only read/edit their own profile.
- **Cart**: Users can only manage their own cart.
- **Orders**: Users can only view their own orders.
- **Digital tokens**: Users can only view their own download tokens.
- **Admin operations**: Use service role client (bypasses RLS).

---

## Middleware Architecture

The middleware (`middleware.ts`) chains two concerns:
1. **next-intl**: Resolves locale from URL path, handles locale routing and redirects.
2. **Supabase SSR**: Refreshes the user's auth session on every request via cookie exchange.

Both must run on every non-API, non-static-asset request. The middleware is composed — next-intl runs first and produces a response, then Supabase cookie logic is applied to that response.

---

## Key Implementation Patterns

### Checkout Flow (Critical Path)
1. User reviews cart → clicks "Checkout".
2. Checkout page: User enters shipping address, reviews order summary.
3. User selects a **payment method** from a single list of options (Visa, Mastercard, Verve, Bank Transfer, Apple Pay, PayPal, Google Pay, American Express, etc.).
4. System silently routes to the correct provider: cards/bank → Paystack, Apple Pay/PayPal/Google Pay → Flutterwave. User never sees provider names.
5. API creates an `order` record with `status: 'pending'` and clears cart.
6. API initializes payment with the routed provider → returns redirect URL.
7. User completes payment on the provider's hosted page.
8. Provider sends webhook → API verifies signature → updates order to `status: 'paid'`.
9. Fulfillment: Send confirmation email via Mailgun. If digital product, generate download token.
10. User redirected back to order confirmation page.

### Digital Cookbook Delivery
1. Cookbook PDF stored in private Supabase Storage bucket (`digital-assets`).
2. On verified payment, create `digital_access_tokens` record (max 5 downloads, expires in 7 days).
3. Download link: `/api/download/[token]`.
4. Route handler validates token → increments download count → generates 60-second signed URL → redirects.

### Multi-Currency Pricing
- Products have prices stored in both NGN and USD.
- User's preferred currency is stored in their profile.
- Currency selection available in header/footer.
- Payment provider receives amount in the user's selected currency.

---

## Mobile Application Architecture (React Native / Expo)

### Core Objective
A high-performance Android mobile application built with React Native / Expo sharing the exact same backend, database (Supabase PostgreSQL), authentication pool, and API endpoints as the Next.js web application (`shop.sawfywhite.com`).

### Essential Requirements
1. **Shared Unified Authentication**:
   - Users authenticate on both the website and mobile app using the **exact same account** (Supabase Auth).
   - Logging in on mobile with an account created on the web provides immediate access to the user's profile and cart.
2. **Instant Real-Time Bi-Directional Cart Synchronization**:
   - **Web → Mobile**: When an authenticated user adds, updates, or removes an item on the web store, it instantly appears in their mobile app cart.
   - **Mobile → Web**: When a user adds, updates, or removes an item in the mobile app, it instantly reflects in the web app cart.
   - **Implementation**: Both platforms persist cart state to the shared Supabase `carts` and `cart_items` tables using identical schema and API endpoints (`/api/cart`). Real-time updates are driven by Supabase Realtime channels (`postgres_changes` on `cart_items`) with automatic refetch on app focus / route navigation.
3. **Physical Phone Verification**:
   - Must be installed and validated on a physical Android smartphone to confirm login, cart addition, and bi-directional real-time sync.

---

## Mobile App Submission Requirements (Mandatory Checklist)

For final submission, the following three deliverables are required:

1. **APK Download Link**:
   - Compile a release Android APK (`app-release.apk`).
   - Upload the APK to Google Drive (or an equivalent accessible file-sharing platform with public download permissions).
   - Provide the direct download link.
2. **Repository Link**:
   - `https://github.com/iamadoctorforreal/HNG-15-STAGE-3-MOBILE-APP.git`
   - Public GitHub repository containing the full source code for the mobile application.
3. **Video Demonstration (Continuous Single Take)**:
   - Must be a **single continuous video recording** (no cuts or video splices) demonstrating cross-platform sync with the existing e-commerce store:
     - **Step 1**: Open web application (`shop.sawfywhite.com`) and register/sign in with a new account. Show successful login state.
     - **Step 2**: Add a dried catfish product to the cart on the web application. Show the item in the web cart.
     - **Step 3**: Open the mobile application on a phone or screen. Log in to the mobile application using the exact same account credentials.
     - **Step 4**: Show that the product added earlier from the website is visible in the mobile application's cart.
     - **Step 5**: Add another dried catfish product to the cart from inside the mobile application.
     - **Step 6**: Return to the web application and demonstrate that the product added from the mobile application is now also visible in the web application's cart.

---

## Build Priority

### Completed (Web Storefront MVP)
1. ✅ Product catalog + product detail pages (10 curated Abeokuta catfish selections)
2. ✅ Shopping cart drawer with instant add, quantity adjustment, and clear
3. ✅ Checkout page with dual payment routing (Paystack & Flutterwave)
4. ✅ Supabase database persistence & SSR auth
5. ✅ Mailgun transactional verification & confirmation emails
6. ✅ Continuous 2K waterfall background with 3D streamlines, ripples, and leaping fish
7. ✅ Multilingual cultural banners & proverbs (5 languages)
8. ✅ Unit tests for all API endpoints

### Active Phase: Mobile Application & Cross-Platform Sync
1. 🟡 **Mobile App Scaffold**: Setup React Native / Expo application with shared Supabase client and Abeokuta brand styling.
2. 🟡 **Unified Auth Screen**: Mobile Login & Signup matching web credentials (Supabase Auth).
3. 🟡 **Shared Cart Engine**: Implement `/api/cart` and Supabase Realtime listener in mobile app and web app.
4. 🟡 **Product Catalog Screen**: Render all 10 Abeokuta dried catfish products with size selector and "Add to Cart".
5. 🟡 **Physical Device Testing**: Validate APK build and install on physical Android phone.
6. 🟡 **E2E Sync Video Recording**: Record continuous single-take demonstration video following all 6 steps.
7. 🟡 **APK Build & Release Distribution**: Generate APK, upload to Google Drive, and assemble final submission package.

---

## Commands Reference

```bash
# Web Storefront
cd sawfy-white
npm run dev                    # Start Next.js dev server (localhost:3000)
npm run test                   # Run Vitest unit tests
npm run build                  # Production build

# Mobile Application (Expo / React Native)
cd sawfy-white-mobile
npx expo start                 # Start Expo dev server
npx expo run:android           # Run on connected Android device / emulator
npx eas build -p android --profile preview  # Build standalone APK
```

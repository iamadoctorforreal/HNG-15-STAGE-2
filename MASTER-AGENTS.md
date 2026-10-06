# AGENTS.md — Omnichannel E-Commerce & Mobile App Engine

> **Turnkey AI Coding Agent Instructions for Building Cross-Platform E-Commerce Ecosystems**  
> *Next.js 15 Web Storefront + React Native / Expo Android App + Supabase Realtime Sync + Dual Payments + High-Conversion SEO*

---

## 1. Project Initialization & Context

You are tasked with building a production-grade, mobile-first, SEO-rich cross-platform e-commerce ecosystem consisting of:
1. **Next.js 15 Web Storefront** (App Router, Tailwind CSS v4, Motion, SSR Auth, Schema.org SEO, next-intl i18n).
2. **React Native / Expo Mobile App** (Hermes engine, standalone APK build, unified Supabase Auth, instant real-time sync).
3. **Shared Backend & Database** (Supabase PostgreSQL, RLS policies, Realtime Broadcast Channels).
4. **Dual Invisible Payment Gateways** (Paystack for domestic cards/transfers + Flutterwave for Apple Pay/PayPal/Google Pay).
5. **Transactional Email Engine** (Mailgun for welcome, orders, and invoice dispatch).

---

## 2. Tech Stack & Exact Versions

| Component | Technology | Version | Key Rule |
| :--- | :--- | :--- | :--- |
| **Web Framework** | Next.js (App Router) | `^15.2.x` | `cookies()`, `params`, `searchParams` are async Promises (`await`). |
| **React** | React 19 | `^19.0.0` | Server Components by default; `'use client'` only for interactive micro-components. |
| **Styling** | Tailwind CSS v4 | `^4.0.x` | CSS-first (`@import "tailwindcss"; @theme { ... }`). No `tailwind.config.js`. |
| **Animations** | Motion | `^12.x` | Import from `motion/react`, never `framer-motion`. |
| **Database & Auth** | Supabase | `^2.49.x` | Use `@supabase/ssr` on Web. Never use deprecated `@supabase/auth-helpers-nextjs`. |
| **Mobile Framework** | Expo / React Native | SDK 52+ | Pure TypeScript. Always wrap backend endpoints in defensive fallback. |
| **Mobile Build** | EAS Build (`eas-cli`) | Latest | `app.json` slug must match project ID on Expo. Output standalone `.apk`. |
| **Payments** | Paystack & Flutterwave | Native `fetch` | Invisible routing. Paystack = kobo (`x 100`). Flutterwave = standard units. |
| **Emails** | Mailgun | `mailgun.js` | Use with `form-data`. Never use deprecated `mailgun-js`. |
| **i18n** | next-intl | `^3.26.x` | Localized routes (`/[locale]`), JSON dictionaries in `messages/`. |

---

## 3. The 8 Non-Negotiable System Patterns

### Pattern 1: Unified Auth Pool Across Web & Mobile
* Users authenticate with the **exact same Supabase user pool** across Web and Mobile.
* A profile created on Web can sign into Mobile immediately with the same cart and order history.
* **Navigation Rule**: Upon logging in, **always route the user to the Home Page** (with active user session and top greeting). Keep the Customer Dashboard accessible via an unmissable link in the navigation.

### Pattern 2: Bi-Directional Instant Real-Time Synchronization
* When an item is added, updated, or removed on Web, it must appear in the Mobile cart immediately without page reload.
* When an item is added, updated, or removed on Mobile, it must appear in the Web cart drawer immediately without refresh.
* **Mechanism**:
  - Both platforms read/write to the shared Supabase PostgreSQL `carts` and `cart_items` tables.
  - On every mutation, emit a broadcast payload over Supabase Realtime channel `sawfy_cart_sync`.
  - Same pattern applies to the Wishlist via `sawfy_wishlist_sync`.

### Pattern 3: Invisible Dual-Gateway Payment Routing
* Users **never see gateway names** (never say "Paystack" or "Flutterwave" in the UI).
* Users select a payment method from a unified list:
  - Visa, Mastercard, Verve, Nigerian Bank Transfer, USSD → Route to **Paystack**.
  - Apple Pay, PayPal, Google Pay, American Express → Route to **Flutterwave**.
* Both gateways feed into a shared `order-fulfillment.ts` handler to update order status and trigger Mailgun emails.

### Pattern 4: Defensive Hermes Variable Fallback
* React Native Android uses the Hermes JavaScript engine. Never evaluate raw imported API URLs in lifecycle calls without a fallback:
  ```typescript
  const BACKEND_URL = typeof API_BASE_URL !== 'undefined' && API_BASE_URL 
    ? API_BASE_URL 
    : 'https://your-domain.com';
  ```
  *(Prevents `ReferenceError: Property 'API_BASE_URL' doesn't exist` during Fast Refresh).*

### Pattern 5: Conversion Rate Optimization (CRO) by Design
* **Objection Handling**: Prominently display trust badges above the fold (e.g., 100% Purity Guarantee, Long Shelf Life, Global Courier).
* **Direct Actions**: Add "Move to Cart" and "Instant Checkout" buttons directly on product cards.
* **AOV Boosters**: Place high-margin add-ons (recipe guides, spice seasonings, accessory kits) at checkout and inside customer dashboard.
* **Lead Magnet**: Include a free downloadable PDF guide modal with email capture to retarget visitors who do not buy on day one.

### Pattern 6: Built-in SEO Richness
* Include Schema.org JSON-LD structured data (`OnlineStore`, `Product`, `Offer`, `PostalAddress`) in root layout.
* Implement dynamic `app/sitemap.ts` mapping all products and supported languages.
* Implement `app/robots.ts` granting crawler access.

### Pattern 7: Android System Navigation Bar Inset & Edge-to-Edge Avoidance
* **The Problem**: On Android devices with physical or software 3-button navigation (Back ◀, Home ⚪, Recents ◼), the system renders the button bar as an overlay on top of React Native screens. Standard `SafeAreaView` does not add bottom insets for soft navigation keys on Android, causing bottom tab bars (`Home`, `Products`, `Cart`, `Dashboard`) to render behind the system buttons and become unclickable.
* **The Dual Fix**:
  1. In `app.json`, explicitly configure the Android navigation bar:
     ```json
     "androidNavigationBar": {
       "visible": "always",
       "backgroundColor": "#FFFFFF",
       "barStyle": "dark-content"
     }
     ```
  2. In your root `tabBarContainer` styling (in `App.tsx` or navigation shell):
     ```typescript
     tabBarContainer: {
       flexDirection: 'row',
       backgroundColor: '#FFFFFF',
       borderTopWidth: 1,
       borderTopColor: '#E2E8F0',
       paddingTop: 8,
       paddingBottom: Platform.OS === 'android' ? 24 : 6,
       minHeight: Platform.OS === 'android' ? 76 : 58,
       // ...
     }
     ```
  *This guarantees the interactive tabs always float cleanly above the Android system buttons on every physical phone model.*

### Pattern 8: 4-Tab Dedicated Mobile Layout & Above-The-Fold Search
* **Mobile Tab Structure**: Provide a dedicated 4-tab bottom navigation:
  1. **`🏠 Home`**: Brand story, cultural greeting, hero banner, free lead magnet, and direct catalog CTA.
  2. **`🐟 Products`**: Dedicated catalog view with instant live search and category chips.
  3. **`🛒 Cart`**: Live shopping cart with real-time sync badge, coupon input, and checkout.
  4. **`👤 Dashboard`** (or `🔑 Sign In` if logged out): Order tracking, order history, real-time wishlist, and WhatsApp customer care.
* **Immediate Search Bar Discovery**:
  - On Mobile, place the search bar and category chips **at the very top above the fold** (never bury them underneath hero banners or carousels).
  - Typing in the search bar should dynamically collapse extraneous promotional elements so customers see matching products immediately.
  - On Web, place an unmissable live search bar in the top navigation bar and directly at the top of the homepage catalog.

---

## 4. Phase-by-Phase Execution Plan

### Phase 1: Product Architecture & Database Schema
1. Configure `FALLBACK_PRODUCTS` array (10 curated offerings with multi-image carousels, pack variants, and weights).
2. Create Supabase database tables: `profiles`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `digital_access_tokens`.
3. Add PostgreSQL trigger on `auth.users` to automatically create a corresponding `profiles` row upon signup.

### Phase 2: Web Storefront Development
1. Setup Next.js 15 App Router with `app/[locale]/layout.tsx` and `app/[locale]/(shop)/page.tsx`.
2. Configure Tailwind CSS v4 `@theme` colors (Primary, Accent, Cream, Slate).
3. Build `Navbar` with distinct `🏠 Home`, `🐟 Products`, `📖 Blog`, and `👤 Dashboard` links, plus live search.
4. Implement `CartDrawer` with quantity increment/decrement, free shipping progress, and clear cart actions.
5. Create checkout page with address inputs, shipping calculation, and dual-payment routing.
6. Build customer dashboard (`account/page.tsx`) with order history, shipment tracking, real-time wishlist, and daily deals.

### Phase 3: Mobile App Scaffold & Real-Time Engine
1. Scaffold Expo project with `expo-status-bar`, `@react-native-async-storage/async-storage`, and `@supabase/supabase-js`.
2. Configure `app.json` with `androidNavigationBar` settings (`visible: "always"`, white background) to protect bottom navigation.
3. Build Contexts: `AuthContext.tsx`, `CartContext.tsx`, `WishlistContext.tsx` with Supabase Realtime broadcast channels.
4. Build Screens:
   - `ProductsScreen.tsx`: Top search bar, category chips, 10 products with image view and quick add.
   - `CartScreen.tsx`: Live item listing, coupon discount, subtotal, and checkout modal.
   - `DashboardScreen.tsx`: Real-time order tracking, live order history, wishlist, daily deals, and WhatsApp customer care desk.
5. Setup bottom navigation with 4 dedicated tabs: **`🏠 Home`**, **`🐟 Products`**, **`🛒 Cart`**, and **`👤 Dashboard`** / **`🔑 Sign In`**, with `Platform.OS === 'android'` bottom padding (24px).

### Phase 4: Cloud APK Compilation with EAS
1. In `app.json`, set `extra.eas.projectId` and ensure the `slug` strictly matches the registered Expo slug.
2. In `eas.json`, configure:
   ```json
   {
     "build": {
       "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
       "production": { "android": { "buildType": "apk" } }
     }
   }
   ```
3. Run `npx eas-cli login` and trigger cloud build:
   ```bash
   npx eas-cli build -p android --profile preview
   ```

---

## 5. Verification Checklist Before Handover

- [ ] Web unit tests pass: `npm run test` (Vitest).
- [ ] Mobile TypeScript compiles with 0 errors: `npx tsc --noEmit`.
- [ ] User logs in on Web → Redirects to Home page with active session.
- [ ] User logs in on Mobile → Redirects to Home page with active session.
- [ ] Adding item on Web instantly appears in Mobile cart without refresh.
- [ ] Adding item on Mobile instantly appears in Web cart without refresh.
- [ ] Wishlist ❤️ toggles sync instantly across Web and Mobile dashboards.
- [ ] Mobile bottom navigation bar sits safely above Android 3-button system controls (◀, ⚪, ◼) on physical phone.
- [ ] Top search bar is immediately visible above the fold on both Web and Mobile.
- [ ] Standalone Android APK builds successfully and installs on physical device.


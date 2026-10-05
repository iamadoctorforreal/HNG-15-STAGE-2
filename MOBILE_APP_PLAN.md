# Sawfy White Enterprises — Mobile App Plan & Cross-Platform Sync Specification 📱🐟

> **Target**: Mobile Application for Sawfy White Enterprises e-commerce store (`shop.sawfywhite.com`).
> **Stack**: React Native (Expo SDK) + TypeScript + Supabase (`@supabase/supabase-js`) + Shared Next.js Backend.

---

## 1. Executive Objectives

1. **Shared User Accounts**: Seamless authentication between the website and mobile app via Supabase Auth.
2. **Instant Bi-Directional Cart Synchronization**:
   - Product added on Web → instantly appears in Mobile cart.
   - Product added on Mobile → instantly appears in Web cart.
   - Utilizing identical product identifiers, variants, and the shared Supabase database (`carts`, `cart_items`) with real-time updates.
3. **Physical Device Validation**:
   - Tested and verified on a physical Android smartphone.
4. **HNG Submission Deliverables**:
   - **Repository Link**: [https://github.com/iamadoctorforreal/HNG-15-STAGE-3-MOBILE-APP.git](https://github.com/iamadoctorforreal/HNG-15-STAGE-3-MOBILE-APP.git)
   - **APK Download Link**: Public Google Drive download link (Release APK).
   - **Video Demonstration**: Single continuous video covering all 6 mandatory verification steps.

---

## 2. Shared Architecture & API Endpoints

```
  ┌────────────────────────────────────────────────────────┐
  │                 Shared Backend Layer                   │
  │     - Supabase Auth (Users pool)                       │
  │     - Supabase PostgreSQL (`carts`, `cart_items`)      │
  │     - Next.js API Routes: `shop.sawfywhite.com/api`    │
  └───────────────────────────┬────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
 ┌───────────────────────────┐ ┌───────────────────────────┐
 │     Web Application       │ │    Mobile Application     │
 │  (shop.sawfywhite.com)    │ │   (React Native / Expo)   │
 ├───────────────────────────┤ ├───────────────────────────┤
 │ - Next.js 15 App Router   │ │ - Expo React Native (APK) │
 │ - CartDrawer + useCart    │ │ - Shared Supabase Client  │
 │ - Supabase SSR Cookies    │ │ - AsyncStorage Session    │
 │ - Realtime Cart Listener  │ │ - Realtime Cart Listener  │
 └───────────────────────────┘ └───────────────────────────┘
```

### Key Shared Endpoints & Database Tables
| Resource | Web Implementation | Mobile Implementation |
|---|---|---|
| **Auth** | Supabase SSR (`/api/auth/*`) | Supabase JS + AsyncStorage |
| **Products** | `/api/products` or `FALLBACK_PRODUCTS` | `/api/products` or cached catalog |
| **Cart Fetch** | `GET /api/cart` or `public.carts` | `GET /api/cart` or `public.carts` |
| **Cart Add/Update** | `POST /api/cart` | `POST /api/cart` |
| **Cart Remove** | `DELETE /api/cart/[id]` | `DELETE /api/cart/[id]` |
| **Realtime Sync** | `postgres_changes` on `cart_items` | `postgres_changes` on `cart_items` |

---

## 3. Video Demonstration Protocol (Single Continuous Take)

For submission, record a **single continuous video** with zero cuts demonstrating:
1. **Open Web App & Sign In**: Register a new user account on `shop.sawfywhite.com`. Verify successful logged-in state.
2. **Add Product from Web**: Add an item (e.g. *Abeokuta Heritage Round-Curled Dried Catfish*) to the cart on the website. Show the cart drawer with the item.
3. **Open Mobile App & Log In**: Open the mobile app on the phone/screen. Log in using the same credentials from Step 1.
4. **Verify Synced Cart on Mobile**: Open the mobile cart screen. Show that the item added on the website is already in the mobile cart.
5. **Add Product from Mobile App**: Add a different item (e.g. *Artisanal Dried Catfish Flakes*) to the cart inside the mobile app.
6. **Verify Synced Cart on Web**: Return to the web browser and demonstrate that the second item added from the mobile app is now visible in the web cart.

---

## 4. Phase-by-Phase Execution Plan

### Step 1: Server Cart API & Web Realtime Bridge
- Create `/api/cart/route.ts` on the web app to provide standard REST endpoints (`GET`, `POST`, `DELETE`) for carts.
- Update `hooks/useCart.tsx` so authenticated users push their cart to Supabase and subscribe to changes via Supabase Realtime channel.

### Step 2: Expo Mobile Project Setup (`sawfy-white-mobile`)
- Initialize Expo app with TypeScript template.
- Install `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, and navigation packages.
- Configure Abeokuta brand theme: `#008751` (Green), `#FAF8F5` (Cream), `#D4A843` (Gold), `#2D2D2D` (Text).

### Step 3: Mobile Screens Implementation
- **Auth Screen**: Login & Sign Up (Supabase Auth).
- **Product Catalog Screen**: Card grid of Abeokuta dried catfish with images, badges, price, and "Add to Cart".
- **Cart Screen**: Live list of cart items, quantity modifiers, total calculation, and "Checkout" CTA.

### Step 4: Physical Android Testing & APK Build
- Test live syncing on physical Android device over network.
- Build release APK: `eas build -p android --profile preview` (or local Gradle `assembleRelease`).
- Upload APK to Google Drive and configure public view/download permissions.

### Step 5: Video Recording & Final Submission Assembly
- Perform rehearsal run of Steps 1-6.
- Record single-take video recording.
- Assemble submission package: APK link + GitHub repository link + Video demonstration link.

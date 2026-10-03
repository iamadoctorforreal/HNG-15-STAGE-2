import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isDigital = searchParams.get('digital');

    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (isDigital !== null && isDigital !== undefined && isDigital !== '') {
      query = query.eq('is_digital', isDigital === 'true');
    }

    const { data: products, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error || !products || products.length === 0) {
      return NextResponse.json({ products: FALLBACK_PRODUCTS, source: 'curated_catalog' });
    }

    return NextResponse.json({ products, source: 'database' });
  } catch (error: any) {
    return NextResponse.json({ products: FALLBACK_PRODUCTS, source: 'fallback_error' });
  }
}

// 10 Curated Products for Sawfy White Enterprises (Strictly "Dried Catfish")
export const FALLBACK_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Whole Round-Curled Dried Catfish (Big Size - With Head)',
    slug: 'whole-round-curled-dried-catfish-big',
    description:
      'Traditionally curled into circular shape. Sourced from Abeokuta freshwaters, meticulously gutted, washed, and dried to golden crisp perfection. 100% sand-grit free.',
    base_price: 18500,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Artisanal Round Curl',
    badgeColor: 'emerald' as const,
    weightInfo: 'Approx. 4-6 pieces per 1kg',
    images: ['/images/catfish-jumbo.jpg', '/images/catfish-stew.jpg', '/images/catfish-medium.jpg'],
    metadata: {
      origin: 'Abeokuta, Ogun State, Nigeria',
      pieces_per_kg: '4-6 large curled fish',
      features: ['Curled circular shape', '100% sand-free', 'Intact heads & tails', '90-day shelf life'],
    },
    variants: [
      { id: 'var-1a', product_id: 'prod-001', title: '500g Pack (2-3 curled fish)', price: 9500, is_active: true },
      { id: 'var-1b', product_id: 'prod-001', title: '1kg Standard Pack (4-6 curled fish)', price: 18500, is_active: true },
      { id: 'var-1c', product_id: 'prod-001', title: '2kg Value Pack (8-12 curled fish)', price: 36000, is_active: true },
    ],
  },
  {
    id: 'prod-002',
    title: 'Jumbo Straight Dried Catfish (Big Size - With Head)',
    slug: 'jumbo-straight-dried-catfish-big',
    description:
      'Long-bodied straight export grade dried catfish. Premium large sizing, crispy skin, deep savory aroma, and zero sand residue.',
    base_price: 21000,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Jumbo Straight Cut',
    badgeColor: 'emerald' as const,
    weightInfo: 'Approx. 3-4 giant fish per 1kg',
    images: ['/images/catfish-jumbo.jpg', '/images/catfish-stew.jpg'],
    metadata: {
      origin: 'Abeokuta, Ogun State, Nigeria',
      features: ['Straight body orientation', 'Giant sizing', 'Export grade packaging'],
    },
    variants: [
      { id: 'var-2a', product_id: 'prod-002', title: '1kg Jumbo Pack (3-4 Giant Fish)', price: 21000, is_active: true },
      { id: 'var-2b', product_id: 'prod-002', title: '2kg Double Jumbo Pack', price: 40000, is_active: true },
    ],
  },
  {
    id: 'prod-003',
    title: 'Medium Whole Dried Catfish (Family Soup Pack - With Head)',
    slug: 'medium-whole-dried-catfish-family',
    description:
      'The quintessential Nigerian kitchen staple. Plump medium dried catfish that reconstitute quickly in Egusi, Efo Riro, and Ila Alasepo soups.',
    base_price: 16000,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Bestseller for Soups',
    badgeColor: 'amber' as const,
    weightInfo: 'Approx. 8-10 pieces per 1kg',
    images: ['/images/catfish-medium.jpg', '/images/catfish-stew.jpg', '/images/catfish-jumbo.jpg'],
    variants: [
      { id: 'var-3a', product_id: 'prod-003', title: '500g Stew Cut Pack (4-5 pieces)', price: 8500, is_active: true },
      { id: 'var-3b', product_id: 'prod-003', title: '1kg Family Pack (8-10 pieces)', price: 16000, is_active: true },
      { id: 'var-3c', product_id: 'prod-003', title: '2kg Extended Family Pack', price: 31000, is_active: true },
    ],
  },
  {
    id: 'prod-004',
    title: 'Small Crispy Whole Dried Catfish (Crunchy Snacking & Soup Size)',
    slug: 'small-crispy-whole-dried-catfish',
    description:
      'Petite, golden, extra-crunchy dried catfish. Perfect for pounding into pepper soup bases or eating as a nutritious crispy protein snack.',
    base_price: 7500,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Extra Crunchy',
    badgeColor: 'teal' as const,
    weightInfo: 'Approx. 14-18 pieces per 500g',
    images: ['/images/catfish-medium.jpg', '/images/catfish-jumbo.jpg'],
    variants: [
      { id: 'var-4a', product_id: 'prod-004', title: '500g Crunch Pack (14-18 pieces)', price: 7500, is_active: true },
      { id: 'var-4b', product_id: 'prod-004', title: '1kg Crunch Pack (28-36 pieces)', price: 14000, is_active: true },
    ],
  },
  {
    id: 'prod-005',
    title: 'Headless Dried Catfish Chunks (Cut Pieces - No Head, 100% Meaty)',
    slug: 'headless-dried-catfish-chunks-no-head',
    description:
      'Pure meaty chunks with heads removed for quick cooking. Zero waste, high protein, and pre-cut for immediate addition to stews and pasta sauces.',
    base_price: 11000,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Headless Meaty Chunks',
    badgeColor: 'emerald' as const,
    weightInfo: '100% Meaty Cuts • 0% Waste',
    images: ['/images/catfish-stew.jpg', '/images/catfish-medium.jpg'],
    variants: [
      { id: 'var-5a', product_id: 'prod-005', title: '500g Headless Meaty Pack', price: 11000, is_active: true },
      { id: 'var-5b', product_id: 'prod-005', title: '1kg Headless Meaty Pack', price: 21500, is_active: true },
    ],
  },
  {
    id: 'prod-006',
    title: 'Artisanal Dried Catfish Flakes (Soup Seasoning & Topping)',
    slug: 'artisanal-dried-catfish-flakes',
    description:
      'Coarsely crushed, rich dried catfish flakes. Sprinkle directly into jollof rice, yam porridge, noodles, or vegetable sauces for rich umami flavor.',
    base_price: 4500,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Artisanal Seasoning',
    badgeColor: 'amber' as const,
    weightInfo: '250g Jar / 500g Pouch',
    images: ['/images/catfish-stew.jpg', '/images/catfish-medium.jpg'],
    variants: [
      { id: 'var-6a', product_id: 'prod-006', title: '250g Glass Jar', price: 4500, is_active: true },
      { id: 'var-6b', product_id: 'prod-006', title: '500g Refill Pouch', price: 8500, is_active: true },
    ],
  },
  {
    id: 'prod-007',
    title: 'Crispy Dried Catfish Leisure Snack Pack (Ready-to-Eat)',
    slug: 'crispy-dried-catfish-leisure-snack-pack',
    description:
      'High-protein, guilt-free afternoon snack. Seasoned naturally, crispy, and packaged in a resealable pouch for your desk, travel, or gym bag.',
    base_price: 3000,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Leisure Snack',
    badgeColor: 'teal' as const,
    weightInfo: '150g Grab & Go Resealable Pouch',
    images: ['/images/catfish-medium.jpg', '/images/catfish-jumbo.jpg'],
    variants: [
      { id: 'var-7a', product_id: 'prod-007', title: '150g Single Pouch', price: 3000, is_active: true },
      { id: 'var-7b', product_id: 'prod-007', title: '3-Pack Snack Bundle (450g Total)', price: 8200, is_active: true },
    ],
  },
  {
    id: 'prod-008',
    title: 'Wholesale Export Carton — 10kg Master Pack',
    slug: 'wholesale-export-carton-10kg-master-pack',
    description:
      'Commercial grade wholesale carton. Double-sealed in moisture-barrier bags designed for international flights and diaspora retail distribution in the UK & US.',
    base_price: 165000,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    badge: 'Wholesale & Export',
    badgeColor: 'emerald' as const,
    weightInfo: '10kg Net Export Weight (~50-60 Fish)',
    images: ['/images/catfish-jumbo.jpg', '/images/catfish-stew.jpg'],
    variants: [
      { id: 'var-8a', product_id: 'prod-008', title: '10kg Export Master Carton', price: 165000, is_active: true },
      { id: 'var-8b', product_id: 'prod-008', title: '20kg Commercial Twin Bundle', price: 320000, is_active: true },
    ],
  },
  {
    id: 'prod-009',
    title: 'The Abeokuta Catfish Kitchen: 45 Heritage Recipes (Digital Cookbook)',
    slug: 'abeokuta-catfish-kitchen-recipes-digital',
    description:
      'Comprehensive digital cookbook featuring 45 authentic Nigerian catfish dishes, soup pairings, rehydration guides, and nutritional profiles. Instant PDF download.',
    base_price: 2500,
    currency: 'NGN',
    is_active: true,
    is_digital: true,
    badge: 'Digital Cookbook',
    badgeColor: 'teal' as const,
    weightInfo: 'Instant PDF Download • 120 Pages',
    images: ['/images/cookbook-cover.jpg'],
    variants: [
      { id: 'var-9a', product_id: 'prod-009', title: 'Deluxe PDF Edition', price: 2500, is_active: true },
    ],
  },
  {
    id: 'prod-010',
    title: 'The Catfish Master: Commercial Storage & Export Handbook (Digital Guide)',
    slug: 'catfish-commercial-storage-export-handbook',
    description:
      'Professional guide covering diaspora shipment rules, moisture testing, pest-proofing, and wholesale distribution secrets for Nigerian dried catfish.',
    base_price: 4500,
    currency: 'NGN',
    is_active: true,
    is_digital: true,
    badge: 'Business Handbook',
    badgeColor: 'teal' as const,
    weightInfo: 'Instant PDF Guide • 85 Pages',
    images: ['/images/cookbook-cover.jpg'],
    variants: [
      { id: 'var-10a', product_id: 'prod-010', title: 'Professional PDF Handbook', price: 4500, is_active: true },
    ],
  },
];

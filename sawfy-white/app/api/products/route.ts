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

    if (error) {
      // Fallback: If Supabase table isn't populated yet, return the default catalogue
      return NextResponse.json({ products: FALLBACK_PRODUCTS, source: 'fallback' });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ products: FALLBACK_PRODUCTS, source: 'seed' });
    }

    return NextResponse.json({ products, source: 'database' });
  } catch (error: any) {
    return NextResponse.json({ products: FALLBACK_PRODUCTS, source: 'fallback_error' });
  }
}

// Export-grade Abeokuta catfish catalog
const FALLBACK_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Abeokuta Royal Dried Catfish (Jumbo Pack - 1kg)',
    slug: 'abeokuta-royal-dried-catfish-1kg',
    description:
      'Naturally oven-dried, export-grade African catfish farm-raised in Abeokuta. Clean, sandy-grit free, zero sand, rich in healthy Omega-3 fats and protein. Prepared to meet international diaspora export standards.',
    base_price: 18500,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    images: ['/images/catfish-jumbo.jpg'],
    metadata: {
      protein_content: '68% dry weight protein',
      origin: 'Abeokuta, Ogun State, Nigeria',
      grade: 'Premium Export Grade A',
      features: ['Oven-smoked to perfection', 'Zero preservatives', '90-day shelf life', 'Aromatic rich flavor'],
    },
    variants: [
      { id: 'var-1a', product_id: 'prod-001', title: '1kg Pack (5-7 Giant Fish)', price: 18500, is_active: true },
      { id: 'var-1b', product_id: 'prod-001', title: '2kg Value Bundle', price: 35000, is_active: true },
      { id: 'var-1c', product_id: 'prod-001', title: 'Carton (10kg Wholesale / Export)', price: 170000, is_active: true },
    ],
  },
  {
    id: 'prod-002',
    title: 'Medium Dried Catfish (500g Snacking & Stew Pack)',
    slug: 'medium-dried-catfish-500g',
    description:
      'Perfect size for traditional Yoruba soups: Efo Riro, Egusi, Obe Ata, and Pepper Soup. Tender yet crunchy skin that absorbs authentic soup spices beautifully.',
    base_price: 9500,
    currency: 'NGN',
    is_active: true,
    is_digital: false,
    images: ['/images/catfish-medium.jpg'],
    metadata: {
      protein_content: '65% dry weight protein',
      origin: 'Abeokuta, Ogun State, Nigeria',
      grade: 'Export Grade',
      features: ['Pre-cleaned and gutted', 'Ready to cook', 'Ideal for UK/US shipping'],
    },
    variants: [
      { id: 'var-2a', product_id: 'prod-002', title: '500g Pack (6-8 pieces)', price: 9500, is_active: true },
      { id: 'var-2b', product_id: 'prod-002', title: '1kg Twin Pack', price: 18000, is_active: true },
    ],
  },
  {
    id: 'prod-003',
    title: 'The Abeokuta Catfish Kitchen: Traditional & Modern Recipes (Digital Cookbook)',
    slug: 'abeokuta-catfish-cookbook-digital',
    description:
      '45 authentic Nigerian recipes featuring dried catfish — from Abeokuta heritage soups (Efo Elegusi, Ila Alasepo, Obe Dindin) to diaspora fusion dishes. Includes step-by-step cleaning guides, storage tips, and nutritional profiles.',
    base_price: 2500,
    currency: 'NGN',
    is_active: true,
    is_digital: true,
    images: ['/images/cookbook-cover.jpg'],
    metadata: {
      origin: 'Sawfy White Culinary Labs, Abeokuta',
      features: ['Instant PDF Download', 'High-res food photography', '45 detailed recipes', 'Measurement conversions'],
    },
    variants: [
      { id: 'var-3a', product_id: 'prod-003', title: 'Basic Digital Edition (PDF)', price: 0, is_active: true },
      { id: 'var-3b', product_id: 'prod-003', title: 'Deluxe Edition + Video Tutorials (PDF & Links)', price: 2500, is_active: true },
    ],
  },
];

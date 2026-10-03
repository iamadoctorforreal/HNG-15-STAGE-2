import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_PRODUCTS } from '@/lib/constants';

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

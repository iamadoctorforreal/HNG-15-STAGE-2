import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_PRODUCTS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

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
      ascending: true,
    });

    if (error || !products || products.length === 0) {
      return NextResponse.json(
        { products: FALLBACK_PRODUCTS, source: 'curated_catalog' },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { products, source: 'database' },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { products: FALLBACK_PRODUCTS, source: 'fallback_error' },
      { headers: CORS_HEADERS }
    );
  }
}

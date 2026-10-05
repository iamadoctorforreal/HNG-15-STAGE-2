import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// In-memory persistent fallback store across runtime instances
declare global {
  var _wishlistStore: Map<string, any[]> | undefined;
}
if (!global._wishlistStore) {
  global._wishlistStore = new Map<string, any[]>();
}

async function getAuthenticatedUser(req: Request) {
  // 1. Check Authorization Bearer header (Mobile App)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      return user;
    }
  }

  // 2. Check SSR cookies (Web App)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

// GET: Retrieve Wishlist items
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const guestSessionId = searchParams.get('guestSessionId');

    const key = user?.id || guestSessionId || 'default_user';

    // Try reading from user profile in Supabase if logged in
    if (user?.id) {
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.preferences?.wishlist && Array.isArray(profile.preferences.wishlist)) {
          global._wishlistStore!.set(user.id, profile.preferences.wishlist);
          return NextResponse.json({ items: profile.preferences.wishlist }, { headers: CORS_HEADERS });
        }
      } catch (_) {}
    }

    const items = global._wishlistStore!.get(key) || [];
    return NextResponse.json({ items }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// POST: Add or toggle item in Wishlist
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { product, guestSessionId } = body;

    if (!product || !product.id) {
      return NextResponse.json({ error: 'Product is required' }, { status: 400, headers: CORS_HEADERS });
    }

    const key = user?.id || guestSessionId || 'default_user';
    const currentItems = global._wishlistStore!.get(key) || [];

    const existingIndex = currentItems.findIndex((i: any) => i.id === product.id);
    let updatedItems: any[];

    if (existingIndex > -1) {
      // Already in wishlist
      updatedItems = currentItems;
    } else {
      const newItem = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        base_price: Number(product.base_price || product.price || 0),
        price: Number(product.price || product.base_price || 0),
        image: product.image || '/images/catfish-real-glass-plate.png',
        badge: product.badge || 'Abeokuta Heritage',
        weightInfo: product.weightInfo || '1kg Farm Pack',
        is_digital: !!product.is_digital,
        addedAt: new Date().toISOString(),
      };
      updatedItems = [newItem, ...currentItems];
    }

    global._wishlistStore!.set(key, updatedItems);

    // Persist to user profile if logged in
    if (user?.id) {
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            preferences: { wishlist: updatedItems },
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (_) {}
    }

    return NextResponse.json({ success: true, items: updatedItems }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

// DELETE: Remove item from Wishlist
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId, guestSessionId } = body;

    const key = user?.id || guestSessionId || 'default_user';
    const currentItems = global._wishlistStore!.get(key) || [];

    const updatedItems = currentItems.filter((i: any) => i.id !== productId);
    global._wishlistStore!.set(key, updatedItems);

    if (user?.id) {
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            preferences: { wishlist: updatedItems },
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (_) {}
    }

    return NextResponse.json({ success: true, items: updatedItems }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

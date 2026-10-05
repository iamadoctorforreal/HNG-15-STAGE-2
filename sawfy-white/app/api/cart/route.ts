import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Helper to resolve user from either SSR cookies or Authorization: Bearer <token>
async function getAuthenticatedUser(req: Request) {
  // 1. Check Authorization header (used by Mobile App)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      return user;
    }
  }

  // 2. Check SSR cookies (used by Web App)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch (e) {
    return null;
  }
}

function normalizeProductId(id: string): string {
  if (id.startsWith('prod-')) {
    const num = id.replace('prod-', '').padStart(12, '0');
    return `00000000-0000-0000-0000-${num}`;
  }
  return id;
}

function normalizeVariantId(id?: string): string | null {
  if (!id) return null;
  if (id.startsWith('var-')) {
    const pNum = id.slice(4, 5).padStart(4, '0');
    const vChar = id.slice(5);
    const vNum = (vChar.charCodeAt(0) - 96).toString().padStart(12, '0');
    return `00000000-0000-${pNum}-0000-${vNum}`;
  }
  return id;
}

// GET: Fetch current user's cart and items
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const guestSessionId = searchParams.get('guestSessionId');

    if (!user && !guestSessionId) {
      return NextResponse.json({ cartId: null, items: [] });
    }

    // Find cart
    let query = supabaseAdmin.from('carts').select('id, user_id, guest_session_id');
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('guest_session_id', guestSessionId);
    }

    const { data: existingCart } = await query.maybeSingle();

    if (!existingCart) {
      return NextResponse.json({ cartId: null, items: [] });
    }

    // Fetch cart items with joined product
    const { data: items, error } = await supabaseAdmin
      .from('cart_items')
      .select('id, product_id, variant_id, quantity, product:products(*), variant:product_variants(*)')
      .eq('cart_id', existingCart.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format formatted items matching CartProduct interface
    const formatted = (items || []).map((ci: any) => {
      const prod = ci.product || {};
      const meta = prod.metadata || {};
      const img = meta.images?.[0] || prod.images?.[0] || '/images/catfish-real-glass-plate.png';
      return {
        id: prod.id || ci.product_id,
        title: prod.title || 'Dried Catfish',
        slug: prod.slug || 'dried-catfish',
        base_price: Number(prod.base_price) || 0,
        image: img,
        is_digital: prod.is_digital || false,
        variantId: ci.variant_id || undefined,
        variantTitle: ci.variant?.title || undefined,
        price: Number(ci.variant?.price || prod.base_price || 0),
        quantity: ci.quantity || 1,
      };
    });

    return NextResponse.json({ cartId: existingCart.id, items: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add or update item in cart
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId, variantId, quantity = 1, guestSessionId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const normPid = normalizeProductId(productId);
    const normVid = normalizeVariantId(variantId);

    if (!user && !guestSessionId) {
      return NextResponse.json(
        { error: 'User must be authenticated or provide guestSessionId' },
        { status: 401 }
      );
    }

    // 1. Get or create cart
    let cartId: string | null = null;
    let query = supabaseAdmin.from('carts').select('id');
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('guest_session_id', guestSessionId);
    }

    const { data: existingCart } = await query.maybeSingle();

    if (existingCart) {
      cartId = existingCart.id;
    } else {
      const { data: newCart, error: createCartErr } = await supabaseAdmin
        .from('carts')
        .insert({
          user_id: user ? user.id : null,
          guest_session_id: user ? null : guestSessionId,
        })
        .select('id')
        .single();

      if (createCartErr) {
        return NextResponse.json({ error: createCartErr.message }, { status: 500 });
      }
      cartId = newCart.id;
    }

    // 2. Check if item already in cart
    let itemQuery = supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', normPid);

    if (normVid) {
      itemQuery = itemQuery.eq('variant_id', normVid);
    } else {
      itemQuery = itemQuery.is('variant_id', null);
    }

    const { data: existingItem } = await itemQuery.maybeSingle();

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.quantity + quantity;
      if (newQty > 0) {
        await supabaseAdmin
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existingItem.id);
      } else {
        await supabaseAdmin.from('cart_items').delete().eq('id', existingItem.id);
      }
    } else {
      // Insert new item
      await supabaseAdmin.from('cart_items').insert({
        cart_id: cartId,
        product_id: normPid,
        variant_id: normVid || null,
        quantity: Math.max(1, quantity),
      });
    }

    return NextResponse.json({ success: true, cartId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove item or clear cart
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { productId, variantId, clearAll = false, guestSessionId } = body;

    let query = supabaseAdmin.from('carts').select('id');
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('guest_session_id', guestSessionId);
    }

    const { data: existingCart } = await query.maybeSingle();
    if (!existingCart) {
      return NextResponse.json({ success: true, message: 'Cart not found' });
    }

    if (clearAll) {
      await supabaseAdmin.from('cart_items').delete().eq('cart_id', existingCart.id);
    } else if (productId) {
      const normPid = normalizeProductId(productId);
      const normVid = normalizeVariantId(variantId);

      let itemDelete = supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('cart_id', existingCart.id)
        .eq('product_id', normPid);

      if (normVid) {
        itemDelete = itemDelete.eq('variant_id', normVid);
      }
      await itemDelete;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

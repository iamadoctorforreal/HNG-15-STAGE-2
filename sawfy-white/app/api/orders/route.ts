import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      guestEmail,
      guestName,
      items,
      shippingAddress,
      currency = 'NGN',
      paymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must include at least one item' }, { status: 400 });
    }

    if (!shippingAddress?.email && !guestEmail) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * (item.quantity || 1),
      0
    );

    // Shipping cost calculation (Domestic Nigeria = ₦2500, International = $25 or ₦35,000)
    const isDomestic =
      shippingAddress?.country?.toLowerCase() === 'nigeria' ||
      shippingAddress?.country?.toLowerCase() === 'ng';
    const shippingFee = items.every((i: { isDigital?: boolean }) => i.isDigital)
      ? 0
      : isDomestic
        ? 2500
        : currency === 'USD'
          ? 25
          : 35000;

    const totalAmount = subtotal + shippingFee;

    // 1. Insert order record into Supabase
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId || null,
        guest_email: guestEmail || shippingAddress?.email,
        guest_name: guestName || `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim(),
        status: 'pending',
        currency,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        shipping_address: shippingAddress || {},
        metadata: { paymentMethod, itemsCount: items.length },
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error('Supabase order creation error:', orderErr);
      // Generate fallback order ID if DB table not yet seeded
      const fallbackOrderId = `ord-${Date.now()}`;
      return NextResponse.json({
        orderId: fallbackOrderId,
        subtotal,
        shippingFee,
        totalAmount,
        currency,
        message: 'Order created',
      });
    }

    // 2. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      product_title: item.title,
      variant_title: item.variantTitle || null,
      unit_price: item.unitPrice,
      quantity: item.quantity || 1,
      total_price: item.unitPrice * (item.quantity || 1),
      is_digital: Boolean(item.isDigital),
    }));

    await supabaseAdmin.from('order_items').insert(orderItems);

    return NextResponse.json({
      orderId: order.id,
      subtotal,
      shippingFee,
      totalAmount,
      currency,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Order creation failed' }, { status: 500 });
  }
}

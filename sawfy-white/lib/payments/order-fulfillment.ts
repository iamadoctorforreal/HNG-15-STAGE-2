import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendOrderConfirmationEmail } from '@/lib/mailgun';

export type FulfillmentParams = {
  orderId: string;
  paymentReference: string;
  provider: 'paystack' | 'flutterwave';
};

/**
 * Shared, provider-agnostic order fulfillment.
 * Triggered upon successful payment verification from either Paystack or Flutterwave.
 */
export async function fulfillOrder({
  orderId,
  paymentReference,
  provider,
}: FulfillmentParams) {
  // 1. Fetch current order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    throw new Error(`Order ${orderId} not found: ${orderErr?.message}`);
  }

  // Idempotency: If already paid or completed, avoid duplicate emails/tokens
  if (order.status === 'paid' || order.status === 'completed') {
    return { success: true, message: 'Order already fulfilled', order };
  }

  // 2. Mark order as paid
  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      payment_provider: provider,
      payment_reference: paymentReference,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateErr) {
    throw new Error(`Failed to update order status: ${updateErr.message}`);
  }

  // 3. Check for digital items (e.g. Catfish Cookbook) and generate download tokens
  let digitalDownloadToken: string | undefined;
  const digitalItems = (order.items || []).filter(
    (item: { is_digital: boolean }) => item.is_digital
  );

  for (const item of digitalItems) {
    const { data: tokenRecord, error: tokenErr } = await supabaseAdmin
      .from('digital_access_tokens')
      .insert({
        order_id: orderId,
        product_id: item.product_id,
        user_id: order.user_id || null,
        max_downloads: 5,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('token')
      .single();

    if (!tokenErr && tokenRecord) {
      digitalDownloadToken = tokenRecord.token;
    }
  }

  // 4. Send Order Confirmation Email via Mailgun
  const customerEmail =
    order.shipping_address?.email || order.guest_email;
  const customerName =
    order.shipping_address?.firstName
      ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
      : order.guest_name || 'Valued Customer';

  if (customerEmail) {
    try {
      await sendOrderConfirmationEmail({
        to: customerEmail,
        orderId: order.id,
        customerName,
        totalAmount: `${order.currency === 'USD' ? '$' : '₦'}${Number(order.total_amount).toLocaleString()}`,
        downloadToken: digitalDownloadToken,
      });
    } catch (emailErr) {
      console.error('Failed to send Mailgun confirmation email:', emailErr);
    }
  }

  return { success: true, orderId, digitalDownloadToken };
}

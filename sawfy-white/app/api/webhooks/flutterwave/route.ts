import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/payments/order-fulfillment';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    if (!secretHash || signature !== secretHash) {
      return NextResponse.json({ error: 'Unauthorized webhook hash' }, { status: 401 });
    }

    const payload = await req.json();

    if (payload.status === 'successful' && payload.event === 'charge.completed') {
      const transactionId = payload.data?.id;

      // Always perform secondary verification directly with Flutterwave API
      if (process.env.FLW_SECRET_KEY && transactionId) {
        const verifyRes = await fetch(
          `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            },
          }
        );
        const verifyData = await verifyRes.json();

        if (
          verifyData.status === 'success' &&
          verifyData.data?.status === 'successful'
        ) {
          const orderId = verifyData.data?.meta?.orderId;
          if (orderId) {
            await fulfillOrder({
              orderId,
              paymentReference: String(transactionId),
              provider: 'flutterwave',
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error handling Flutterwave webhook:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

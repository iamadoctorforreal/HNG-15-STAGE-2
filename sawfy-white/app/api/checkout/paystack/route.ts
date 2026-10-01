import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, amount, orderId, callbackUrl } = await req.json();

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters: email, amount, and orderId are required' },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Paystack secret key is not configured' },
        { status: 500 }
      );
    }

    // Paystack amounts are in KOBO (multiply NGN by 100)
    const amountInKobo = Math.round(Number(amount) * 100);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectCallback = callbackUrl || `${siteUrl}/orders/${orderId}`;

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference: `SAWFY-${orderId}-${Date.now()}`,
        callback_url: redirectCallback,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: 'Store Name',
              variable_name: 'store_name',
              value: 'Sawfy White Enterprises',
            },
          ],
        },
      }),
    });

    const data = await res.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Paystack initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

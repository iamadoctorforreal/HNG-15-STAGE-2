import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, amount, orderId, customerName, phone, currency = 'NGN' } =
      await req.json();

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters: email, amount, and orderId are required' },
        { status: 400 }
      );
    }

    if (!process.env.FLW_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Flutterwave secret key is not configured' },
        { status: 500 }
      );
    }

    const tx_ref = `FLW-${orderId}-${Date.now()}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Flutterwave accepts standard units (e.g. 5000 for NGN 5000)
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref,
        amount: Number(amount),
        currency: currency.toUpperCase(),
        redirect_url: `${siteUrl}/orders/${orderId}`,
        customer: {
          email,
          name: customerName || 'Customer',
          phonenumber: phone || '',
        },
        meta: { orderId },
        customizations: {
          title: 'Sawfy White Enterprises',
          description: `Payment for Order #${orderId.slice(0, 8)}`,
          logo: `${siteUrl}/logo.png`,
        },
      }),
    });

    const data = await res.json();

    if (data.status !== 'success') {
      return NextResponse.json(
        { error: data.message || 'Flutterwave payment initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      link: data.data.link,
      tx_ref,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

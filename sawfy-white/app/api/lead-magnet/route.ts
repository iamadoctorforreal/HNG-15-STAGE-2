import { NextResponse } from 'next/server';
import { sendLeadMagnetEmail } from '@/lib/mailgun';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Dispatch email with guide link via Mailgun
    try {
      await sendLeadMagnetEmail({
        to: email,
        name: name || '',
      });
    } catch (mailErr) {
      console.warn('Mailgun lead magnet email error:', mailErr);
    }

    // 2. Optionally save to leads table if available
    try {
      await supabaseAdmin.from('profiles').upsert({
        email,
        full_name: name || 'Lead Magnet Subscriber',
        role: 'customer',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Guide sent to your email successfully!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to send guide' },
      { status: 500 }
    );
  }
}

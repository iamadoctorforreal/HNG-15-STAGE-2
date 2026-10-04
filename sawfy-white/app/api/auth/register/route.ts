import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendVerificationEmail } from '@/lib/mailgun';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (req.headers.get('x-forwarded-host')
        ? `https://${req.headers.get('x-forwarded-host')}`
        : new URL(req.url).origin);

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

    // 1. Generate secure signup verification link in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: fullName,
        },
        redirectTo: `${siteUrl}/api/auth/callback?next=/en/account`,
      },
    });

    if (error) {
      if (
        error.message.includes('already been registered') ||
        error.message.includes('already exists')
      ) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Build the secure branded verification link
    const tokenHash = data?.properties?.hashed_token;
    const actionLink = data?.properties?.action_link;
    const verificationUrl = tokenHash
      ? `${siteUrl}/api/auth/callback?token_hash=${tokenHash}&type=signup&next=/en/account`
      : actionLink;

    // 3. Upsert into profiles table
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: 'customer',
      });
    }

    // 4. Dispatch the verification link email directly via Mailgun!
    if (verificationUrl) {
      try {
        await sendVerificationEmail({
          to: email,
          name: firstName || fullName,
          verificationUrl,
        });
      } catch (mailErr) {
        console.warn('Mailgun verification email dispatch error:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email,
      message: 'Account created! Please check your email inbox to verify and activate your account.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWelcomeRegistrationEmail } from '@/lib/mailgun';

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

    // 1. Create user with auto-confirmed email using Admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Instantly confirmed so user can log in without getting stuck!
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        full_name: `${firstName || ''} ${lastName || ''}`.trim(),
      },
    });

    if (error) {
      // If user already exists, let them know clearly
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Insert into profiles table
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: `${firstName || ''} ${lastName || ''}`.trim(),
        role: 'customer',
      });
    }

    // 3. Dispatch official branded welcome email via Mailgun
    try {
      await sendWelcomeRegistrationEmail({
        to: email,
        name: firstName || email.split('@')[0],
      });
    } catch (mailErr) {
      console.warn('Welcome email dispatch warning:', mailErr);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account successfully registered and confirmed!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

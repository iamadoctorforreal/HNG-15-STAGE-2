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

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName?.trim() || '';
    const cleanLastName = lastName?.trim() || '';
    const fullName = `${cleanFirstName} ${cleanLastName}`.trim() || cleanEmail.split('@')[0];
    const preferredGreetingName = cleanFirstName || fullName.split(' ')[0] || 'Friend';

    // 1. Check if user already exists in Supabase
    let userId: string | null = null;
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existing) {
      // User exists: Ensure email is confirmed and password updated so they can log in immediately
      const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existing.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            first_name: cleanFirstName || existing.user_metadata?.first_name || '',
            last_name: cleanLastName || existing.user_metadata?.last_name || '',
            full_name: fullName,
          },
        }
      );
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
      userId = updated.user.id;
    } else {
      // Create brand new user as pre-confirmed
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          full_name: fullName,
        },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      userId = createdUser?.user?.id || null;
    }

    // 2. Ensure profile exists in profiles table
    if (userId) {
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        role: 'customer',
      });
    }

    // 3. Dispatch personalized welcome email via Mailgun with first name
    try {
      await sendWelcomeRegistrationEmail({
        to: cleanEmail,
        name: preferredGreetingName,
      });
    } catch (mailErr) {
      console.warn('Mailgun welcome email dispatch warning (non-blocking):', mailErr);
    }

    return NextResponse.json({
      success: true,
      requiresVerification: false,
      autoConfirmed: true,
      email: cleanEmail,
      firstName: preferredGreetingName,
      message: 'Account registered successfully! Please sign in with your email and password.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

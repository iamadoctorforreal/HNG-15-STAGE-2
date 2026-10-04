import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sendWelcomeRegistrationEmail } from '@/lib/mailgun';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/en/account';

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (request.headers.get('x-forwarded-host')
      ? `https://${request.headers.get('x-forwarded-host')}`
      : new URL(request.url).origin);

  if (code || (token_hash && type)) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${siteUrl}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wuqfacjwfkijewdqvous.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {}
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    let authUser = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        authUser = data.user;
      } else if (error) {
        console.error('exchangeCodeForSession error:', error);
      }
    } else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error && data?.user) {
        authUser = data.user;
      } else if (error) {
        console.error('verifyOtp error:', error);
      }
    }

    if (authUser) {
      // If newly registered/verified user, dispatch official welcome email
      if (authUser.email) {
        const createdAt = new Date(authUser.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 180000;
        if (isNewUser) {
          try {
            await sendWelcomeRegistrationEmail({
              to: authUser.email,
              name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
            });
          } catch (mailErr) {
            console.warn('Welcome email delivery error:', mailErr);
          }
        }
      }
      return response;
    }
  }

  return NextResponse.redirect(`${siteUrl}/en/login?error=auth_failed`);
}

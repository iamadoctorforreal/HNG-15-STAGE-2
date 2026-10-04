import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendWelcomeRegistrationEmail } from '@/lib/mailgun';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (request.headers.get('x-forwarded-host')
      ? `https://${request.headers.get('x-forwarded-host')}`
      : new URL(request.url).origin);

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // If newly registered user (created within the last 2 minutes), dispatch Mailgun welcome email
      if (data.user.email) {
        const createdAt = new Date(data.user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 120000;
        if (isNewUser) {
          try {
            await sendWelcomeRegistrationEmail({
              to: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            });
          } catch (mailErr) {
            console.warn('OAuth welcome email delivery error:', mailErr);
          }
        }
      }
      return response;
    }
    console.error('exchangeCodeForSession error:', error);
  }

  return NextResponse.redirect(`${siteUrl}/en/login?error=auth_failed`);
}

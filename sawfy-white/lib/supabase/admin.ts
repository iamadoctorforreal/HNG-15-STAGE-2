import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key.
 * Bypasses Row Level Security — use ONLY for:
 * - Webhook handlers (payment verification)
 * - Admin operations
 * - Background jobs
 *
 * NEVER expose this client to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

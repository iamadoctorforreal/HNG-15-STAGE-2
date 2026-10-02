import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wuqfacjwfkijewdqvous.supabase.co';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-test-environments';

/**
 * Admin Supabase client with service role key.
 * Bypasses Row Level Security — use ONLY for:
 * - Webhook handlers (payment verification)
 * - Admin operations
 * - Background jobs
 *
 * NEVER expose this client to the browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

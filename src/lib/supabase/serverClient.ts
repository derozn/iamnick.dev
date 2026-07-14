import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client for the doodle wall adapters. Built with the
 * service-role key, which bypasses RLS — it must never be imported from
 * anything that can reach the client bundle. Only src/lib/supabase/ may
 * import @supabase/supabase-js, and only API routes import this folder.
 *
 * Auth options follow the current server pattern: no session persistence,
 * no token refresh, no URL detection — this client is a stateless
 * per-instance singleton, not a user session.
 */
export function createServerClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

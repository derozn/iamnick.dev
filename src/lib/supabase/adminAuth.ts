import { cookies } from 'next/headers';
import { createServerClient as createSsrClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SITE_URL } from '@/lib/site';

/**
 * Admin (carny) authentication for /admin — Supabase Auth with Google OAuth
 * and the HARD allow-list below (ADR-0001: Nick's account only).
 *
 * The whole flow is server-side: the anon key builds a cookie-session client
 * here (route handlers + server components), so no Supabase key or client
 * ever reaches the browser bundle. Identity checks use getClaims(), which
 * verifies the JWT signature against the project's JWKS — never getSession's
 * unvalidated user object (cookies are attacker-supplied input).
 *
 * No auth middleware/proxy: /admin is one page for one person. An expired
 * access token in a server-component render simply reads as signed-out and
 * offers the sign-in button again; route handlers CAN write cookies, so any
 * refresh that happens there persists.
 */

/**
 * The carny's identity — the HARD allow-list for /admin (ADR-0001: Nick's
 * account only, never widened to "any Google login"). Lives in this
 * server-only module (not doodle-wall/constants.ts) so it is structurally
 * unreachable from the client bundle. Compared lowercased against the email
 * claim, and only for sessions whose provider is Google (app_metadata is
 * server-controlled; user_metadata is user-editable and never consulted).
 */
export const MODERATOR_EMAILS: readonly string[] = ['nick@iamnick.dev'];

export type AdminIdentity =
  /** Supabase env absent — pre-provisioning stub mode, /admin is inert. */
  | { kind: 'unconfigured' }
  | { kind: 'anonymous' }
  /** Signed in with Google, but not the carny. */
  | { kind: 'denied'; email: string }
  | { kind: 'moderator'; email: string };

/** Pure allow-list rule, unit-testable without any Supabase machinery. */
export function isModeratorEmail(email: string): boolean {
  const normalised = email.trim().toLowerCase();
  return MODERATOR_EMAILS.some((allowed) => allowed.toLowerCase() === normalised);
}

/**
 * ONE configured-predicate with getTileAdapters: all three Supabase vars or
 * stub. The auth client itself only needs URL + anon key, but treating a
 * partial env as "configured" here while the adapters call it stub would let
 * the carny sign in over an in-memory fake queue mid-provisioning.
 */
function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Cookie-session Supabase client for the current request, or null in stub
 * mode. A new client per request — it's a fetch configuration, not a
 * connection (and the cookie jar differs per request).
 */
export async function createAdminAuthClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();
  return createSsrClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies; token refreshes persist
          // when they happen in a route handler instead.
        }
      },
    },
  });
}

/**
 * The origin the auth redirects (and OAuth redirectTo) are built against.
 * In production this is pinned to SITE_URL — x-forwarded-* headers are
 * request input and must never steer a redirect target. Elsewhere (dev,
 * previews) the request URL's own origin is what the visitor actually hit.
 */
export function requestOrigin(req: Request): string {
  if (process.env.VERCEL_ENV === 'production') return SITE_URL;
  return new URL(req.url).origin;
}

/** Who is at the carny's counter this request? */
export async function getAdminIdentity(): Promise<AdminIdentity> {
  const client = await createAdminAuthClient();
  if (!client) return { kind: 'unconfigured' };

  const { data } = await client.auth.getClaims();
  const claims = data?.claims;
  const email = claims?.email;
  if (typeof email !== 'string' || email.length === 0) return { kind: 'anonymous' };

  // Provider pin: the allow-list's security model is "Google vouched for
  // this mailbox". A session minted any other way (e.g. email/password
  // signup claiming the carny's address, should that provider ever be
  // enabled) must never pass, however its email claim reads. app_metadata
  // is set by the auth server, not the user.
  const appMetadata = claims?.app_metadata as { provider?: string; providers?: string[] } | null;
  const viaGoogle =
    appMetadata?.provider === 'google' || (appMetadata?.providers ?? []).includes('google');
  if (!viaGoogle) return { kind: 'denied', email };

  return isModeratorEmail(email) ? { kind: 'moderator', email } : { kind: 'denied', email };
}

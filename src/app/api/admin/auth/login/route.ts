import { createAdminAuthClient, requestOrigin } from '@/lib/supabase/adminAuth';

/**
 * GET /api/admin/auth/login — start the carny's Google sign-in (ADR-0001).
 * Server-side OAuth: signInWithOAuth writes the PKCE verifier cookie and
 * hands back Google's authorisation URL; we redirect there. The callback
 * route completes the exchange. No Supabase client in the browser.
 */
export const runtime = 'nodejs';

export async function GET(req: Request): Promise<Response> {
  const client = await createAdminAuthClient();
  // Stub mode: /admin explains the provisioning gate; nothing to sign into.
  if (!client) return Response.redirect(`${requestOrigin(req)}/admin`, 303);

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${requestOrigin(req)}/api/admin/auth/callback` },
  });
  if (error || !data.url) {
    return Response.redirect(`${requestOrigin(req)}/admin?auth=error`, 303);
  }
  return Response.redirect(data.url, 303);
}

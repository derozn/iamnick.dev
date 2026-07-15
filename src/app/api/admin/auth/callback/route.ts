import { createAdminAuthClient, requestOrigin } from '@/lib/supabase/adminAuth';

/**
 * GET /api/admin/auth/callback — the OAuth return leg: exchange the code
 * for a cookie session, then land on /admin (which applies the allow-list;
 * ANY Google account can complete this exchange, but only the carny's gets
 * past the counter). This URL must be in Supabase's redirect allow-list.
 */
export const runtime = 'nodejs';

export async function GET(req: Request): Promise<Response> {
  const origin = requestOrigin(req);
  const client = await createAdminAuthClient();
  const code = new URL(req.url).searchParams.get('code');

  if (client && code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return Response.redirect(`${origin}/admin`, 303);
  }
  return Response.redirect(`${origin}/admin?auth=error`, 303);
}

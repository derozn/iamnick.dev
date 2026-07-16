import { createAdminAuthClient, requestOrigin } from '@/lib/supabase/adminAuth';

/**
 * POST /api/admin/auth/logout — clear the carny's session (also the exit for
 * a denied account to sign in with the right one). POST, not GET: a
 * navigation must not be able to sign the carny out cross-site.
 */
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const client = await createAdminAuthClient();
  await client?.auth.signOut();
  return Response.redirect(`${requestOrigin(req)}/admin`, 303);
}

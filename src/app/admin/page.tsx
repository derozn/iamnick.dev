import type { Metadata } from 'next';

import { createTileService } from '@/lib/doodle-wall/tileService';
import { getAdminIdentity } from '@/lib/supabase/adminAuth';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

import { AdminQueue } from './AdminQueue';

/**
 * /admin — the carny's counter: the doodle wall's pre-moderation queue
 * (ADR-0001, Stage 2). Server component, no caching: identity comes from the
 * session cookie (getClaims-verified in the adapter) and every render shows
 * the live queue. Phone-first — approving tiles from Nick's phone is the
 * designed workflow.
 *
 * Four states: pre-provisioning stub (inert), signed out (Google sign-in),
 * signed in but not the carny (denied + sign-out), and the carny (queue).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The carny’s counter',
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const identity = await getAdminIdentity();
  const { auth } = await searchParams;

  return (
    <main className="min-h-screen bg-background-primary px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
            the carny&rsquo;s counter
          </p>
          <h1 className="font-rye letterpress mt-2 text-[34px] text-ink">Pre-moderation Queue</h1>
        </header>

        {identity.kind === 'unconfigured' && (
          <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              The counter is dark — no Supabase environment is configured, so the site is running in
              stub mode and there is no real queue to review.
            </p>
          </section>
        )}

        {identity.kind === 'anonymous' && (
          <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
            {auth === 'error' && (
              <p className="font-fell-sc mb-4 text-[13px] tracking-[0.06em] text-accent">
                Sign-in didn&rsquo;t complete — try again.
              </p>
            )}
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              Carny only past this point.
            </p>
            <a
              href="/api/admin/auth/login"
              className="paper-button mt-6 inline-block rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
            >
              Sign in with Google
            </a>
          </section>
        )}

        {identity.kind === 'denied' && (
          <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
            <p className="font-fell text-[15px] leading-relaxed text-ink/90">
              <span className="font-fell-sc">{identity.email}</span> isn&rsquo;t the carny — this
              counter serves exactly one person.
            </p>
            <form action="/api/admin/auth/logout" method="post">
              <button
                type="submit"
                className="paper-button mt-6 rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
              >
                Sign out
              </button>
            </form>
          </section>
        )}

        {identity.kind === 'moderator' && <ModeratorView email={identity.email} />}
      </div>
    </main>
  );
}

async function ModeratorView({ email }: { email: string }) {
  const queue = await createTileService(getTileAdapters()).getQueue();
  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-3">
        <p className="font-fell text-[13px] italic text-ink-soft/80">{email}</p>
        <form action="/api/admin/auth/logout" method="post">
          <button
            type="submit"
            className="font-fell-sc text-[12px] tracking-[0.06em] text-brass-text underline-offset-2 hover:underline"
          >
            sign out
          </button>
        </form>
      </div>
      {/* Keyed by content: router.refresh() re-runs this server component,
          and a changed queue must REMOUNT the client list — its useState
          snapshot never re-reads the prop on its own. */}
      <AdminQueue key={queue.map((tile) => tile.id).join('|')} initialTiles={queue} />
    </>
  );
}

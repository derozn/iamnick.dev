import type { Metadata } from 'next';

import { createTileService } from '@/lib/doodle-wall/tileService';
import { getAdminIdentity } from '@/lib/supabase/adminAuth';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

import { AdminGate } from './AdminGate';
import { AdminQueue } from './AdminQueue';

/**
 * /admin — the carny's counter, queue view: the doodle wall's
 * pre-moderation queue (ADR-0001, Stage 2). Server component, no caching:
 * identity comes from the session cookie (getClaims-verified in the
 * adapter) and every render shows the live queue. Phone-first — approving
 * tiles from Nick's phone is the designed workflow. The AdminGate owns the
 * shell + non-moderator states; /admin/wall is the housekeeping view.
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
    <AdminGate
      identity={identity}
      authError={auth === 'error'}
      tab="queue"
      title="Pre-moderation Queue"
    >
      {identity.kind === 'moderator' && <QueueView />}
    </AdminGate>
  );
}

async function QueueView() {
  const queue = await createTileService(getTileAdapters()).getQueue();
  return (
    /* Keyed by content: router.refresh() re-runs this server component, and
       a changed queue must REMOUNT the client list — its useState snapshot
       never re-reads the prop on its own. */
    <AdminQueue key={queue.map((tile) => tile.id).join('|')} initialTiles={queue} />
  );
}

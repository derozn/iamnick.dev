import type { Metadata } from 'next';

import { createTileService } from '@/lib/doodle-wall/tileService';
import { getAdminIdentity } from '@/lib/supabase/adminAuth';
import { getTileAdapters } from '@/lib/supabase/tileAdapters';

import { AdminGate } from '../AdminGate';
import { AdminWall } from '../AdminWall';

/**
 * /admin/wall — the carny's counter, housekeeping view: the wall as
 * currently hung (the same newest-first bounded set the public wall
 * serves), each tile with a take-down (final reject). Tiles older than the
 * wall bound have already aged out of public view, so the hung set is
 * exactly what housekeeping can ever need to touch.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The carny’s counter — the wall',
  robots: { index: false, follow: false },
};

export default async function AdminWallPage() {
  const identity = await getAdminIdentity();

  return (
    <AdminGate identity={identity} tab="wall" title="The Wall">
      {identity.kind === 'moderator' && <WallView />}
    </AdminGate>
  );
}

async function WallView() {
  const wall = await createTileService(getTileAdapters()).getWall();
  return (
    /* Keyed by content, same reason as the queue: refresh must remount. */
    <AdminWall key={wall.map((tile) => tile.id).join('|')} initialTiles={wall} />
  );
}

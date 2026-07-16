'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { sendVerdict } from './verdictClient';

import type { WallTile } from '@/lib/doodle-wall/types';

/**
 * Housekeeping — the wall exactly as currently hung (the same newest-first
 * bounded set GET /api/wall serves), with a take-down per tile: the reject
 * verdict on an approved tile. Rejection is FINAL (no restore), so taking
 * down is a two-tap: the first tap arms the button, the second commits;
 * tapping anything else disarms.
 */

export function AdminWall({ initialTiles }: { initialTiles: WallTile[] }) {
  const router = useRouter();
  const [tiles, setTiles] = useState(initialTiles);
  const [armed, setArmed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const takeDown = async (id: string) => {
    if (armed !== id) {
      setArmed(id);
      return;
    }
    setArmed(null);
    setBusy(id);
    setError(null);
    const outcome = await sendVerdict(id, 'reject');
    // 'stale' (already ruled on / gone) drops too — it is off the wall
    // either way.
    if (outcome === 'error') setError('something went wrong — try again');
    else setTiles((current) => current.filter((tile) => tile.id !== id));
    setBusy(null);
  };

  if (tiles.length === 0) {
    return (
      <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
        <p className="font-fell text-[15px] italic leading-relaxed text-ink/90">
          The wall is bare — nothing approved is hanging yet.
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="paper-button mt-6 rounded-[3px] px-5 py-2 font-fell-sc text-[14px] tracking-[0.06em]"
        >
          Check again
        </button>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-label="Approved tiles on the wall">
      <div className="flex items-center justify-between">
        <p className="font-fell-sc text-[13px] tracking-[0.1em] text-ink-soft">
          {tiles.length} hanging, newest first — taking down is final
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="font-fell-sc text-[12px] tracking-[0.06em] text-brass-text underline-offset-2 hover:underline"
        >
          refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="font-fell-sc mt-3 text-[13px] tracking-[0.06em] text-accent">
          {error}
        </p>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.id} className="ticket-frame halftone rounded-[5px] p-3">
            {/* Untrusted visitor art: a plain image, never markup. */}
            <img
              src={tile.imageUrl}
              alt="Approved doodle tile"
              width={256}
              height={256}
              className="mx-auto aspect-square w-full rounded-[3px] bg-[#0d0d12]"
            />
            <button
              type="button"
              disabled={busy === tile.id}
              onClick={() => takeDown(tile.id)}
              onBlur={() => setArmed((a) => (a === tile.id ? null : a))}
              className={`paper-button mt-3 w-full rounded-[3px] px-3 py-2 font-fell-sc text-[13px] tracking-[0.06em] disabled:opacity-40 ${
                armed === tile.id ? 'text-accent' : ''
              }`}
            >
              {armed === tile.id ? 'Tap again — final' : 'Take down'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

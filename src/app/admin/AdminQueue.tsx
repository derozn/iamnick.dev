'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Verdict } from '@/lib/doodle-wall/tileService';
import type { WallTile } from '@/lib/doodle-wall/types';

import { sendVerdict } from './verdictClient';

/**
 * The queue itself — one card per pending tile, oldest first (first drawn,
 * first reviewed), each with the only two verdicts that exist. Client
 * component so a verdict can strike the card without a reload; the server
 * page hands in the initial queue (keyed, so router.refresh() remounts)
 * and sendVerdict owns the PATCH semantics.
 *
 * imageUrl is a data URI in stub mode and a Storage URL live — <img> takes
 * both (same contract as the overlay's wall grid).
 */

/** Deterministic UTC stamp — server and client render identically. */
const stamp = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;

export function AdminQueue({ initialTiles }: { initialTiles: WallTile[] }) {
  const router = useRouter();
  const [tiles, setTiles] = useState(initialTiles);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (id: string, verdict: Verdict) => {
    setBusy(id);
    setError(null);
    const outcome = await sendVerdict(id, verdict);
    // 'stale' drops too: the tile was already ruled on — a stranded card
    // helps no one.
    if (outcome === 'error') setError('something went wrong — try again');
    else setTiles((current) => current.filter((tile) => tile.id !== id));
    setBusy(null);
  };

  if (tiles.length === 0) {
    return (
      <section className="ticket-frame halftone mt-8 rounded-[5px] p-6 text-center">
        <p className="font-fell text-[15px] italic leading-relaxed text-ink/90">
          The queue is clear — nothing awaiting the carny.
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
    <section className="mt-6" aria-label="Pending tiles">
      <div className="flex items-center justify-between">
        <p className="font-fell-sc text-[13px] tracking-[0.1em] text-ink-soft">
          {tiles.length} awaiting review, oldest first
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

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <li key={tile.id} className="ticket-frame halftone rounded-[5px] p-4">
            {/* Untrusted visitor art: a plain image, never markup. */}
            <img
              src={tile.imageUrl}
              alt="Pending doodle tile"
              width={256}
              height={256}
              className="mx-auto aspect-square w-full max-w-[256px] rounded-[3px] bg-[#0d0d12]"
            />
            <p className="font-fell mt-3 text-center text-[12px] italic text-ink-soft/80">
              drawn {stamp(tile.createdAt)}
            </p>
            <div className="mt-3 flex gap-3">
              {(['approve', 'reject'] as const).map((verdict) => (
                <button
                  key={verdict}
                  type="button"
                  disabled={busy === tile.id}
                  onClick={() => decide(tile.id, verdict)}
                  className={`paper-button flex-1 rounded-[3px] px-4 py-3 font-fell-sc text-[14px] tracking-[0.06em] disabled:opacity-40${
                    verdict === 'reject' ? ' text-accent' : ''
                  }`}
                >
                  {verdict === 'approve' ? 'Approve' : 'Reject'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

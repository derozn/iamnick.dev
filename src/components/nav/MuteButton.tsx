'use client';

import { useSceneStore } from '@/store/scene';

/**
 * MuteButton — letterpress speaker toggle, sitting just left of the burger
 * (which hides while a panel/game owns the top-right; this stays put so the
 * carnival can always be silenced). Only shown once the visitor has entered —
 * there's nothing to hear before the start click initialises the mixer.
 */
export function MuteButton() {
  const muted = useSceneStore((s) => s.muted);
  const toggleMuted = useSceneStore((s) => s.toggleMuted);
  const started = useSceneStore((s) => s.started);

  if (!started) return null;
  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={!muted}
      className="paper-button fixed right-16 top-3 z-[47] flex h-10 w-10 items-center justify-center rounded-[4px]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-ink"
        aria-hidden
      >
        {/* speaker body */}
        <path d="M11 5 6.5 9H3v6h3.5L11 19V5z" />
        {muted ? (
          // struck out
          <path d="M16 9l5 6M21 9l-5 6" />
        ) : (
          // sound waves
          <>
            <path d="M15.5 9.5a4 4 0 0 1 0 5" />
            <path d="M18 7.5a7 7 0 0 1 0 9" />
          </>
        )}
      </svg>
    </button>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { STRIKER_SWINGS, useSceneStore } from '@/store/scene';
import {
  GREAT,
  meterValue,
  OK,
  PERFECT,
  resultLabel,
} from '@/components/three/game/highStrikerConfig';

// NB: no @react-three/* imports — static bundle (highStrikerConfig is three-free).

const EASE = [0.22, 0.61, 0.27, 1] as const;

/**
 * HighStrikerHud — DOM overlay for the strength test (sibling of BallTossHud,
 * same letterpress conventions). Shows while `mode === 'playing' &&
 * activeStall === 'high-striker'`.
 *
 * The power gauge is pure DOM: while armed, an rAF loop writes the needle's
 * transform from the SAME deterministic `meterValue(now - strikerArmedAt)` the
 * canvas tap reads — zero per-frame store traffic, and the needle you see is
 * exactly the power you get.
 */
export function HighStrikerHud() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'high-striker');
  const phase = useSceneStore((s) => s.strikerPhase);
  const attemptsLeft = useSceneStore((s) => s.strikerAttemptsLeft);
  const best = useSceneStore((s) => s.strikerBest);
  const power = useSceneStore((s) => s.strikerPower);
  const exit = useSceneStore((s) => s.exit);
  const setStriker = useSceneStore((s) => s.setStriker);
  const replay = useSceneStore((s) => s.replayStriker);
  const resetStriker = useSceneStore((s) => s.resetStriker);

  const needle = useRef<HTMLDivElement>(null);

  // fresh round each step-in
  useEffect(() => {
    if (active) resetStriker();
  }, [active, resetStriker]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, exit]);

  // The needle loop — writes style directly (no React re-renders at 60fps).
  useEffect(() => {
    if (!active || phase !== 'armed') return;
    let raf = 0;
    const tick = () => {
      const el = needle.current;
      if (el) {
        const v = meterValue(performance.now() - useSceneStore.getState().strikerArmedAt);
        // gauge is bottom-up: 0 → bottom, 1 → top of the track
        el.style.bottom = `${v * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, phase]);

  const arm = () => setStriker({ strikerPhase: 'armed', strikerArmedAt: performance.now() });

  const modal = phase === 'intro' || phase === 'done';
  const pct = (v: number) => Math.round(v * 100);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* The pole + bell own the screen centre/top, so ALL chrome hugs the
              bottom edge (stats live down there too) — only Exit sits up top. */}
          {/* Exit ✕ takes the burger's exact slot (h-10 w-10, top-3 right-4) so the
              swap is seamless and it sits flush with the mute button at right-16. */}
          <button
            onClick={exit}
            aria-label="Exit game"
            className="paper-button pointer-events-auto absolute right-4 top-3 flex h-10 w-10 items-center justify-center rounded-[4px] font-rye text-[15px]"
          >
            ✕
          </button>

          {/* Bottom stack: hint / last-swing verdict, then the stats chip. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2">
            {phase === 'armed' && (
              <p className="ticket-frame rounded-[3px] px-4 py-1.5 font-fell text-[13px] italic text-ink">
                Tap when the needle peaks — ring the bell!
              </p>
            )}
            {phase === 'struck' && (
              <p className="ticket-frame rounded-[3px] px-4 py-1.5 font-fell text-[13px] italic text-ink">
                {pct(power)}% — {resultLabel(power)}
              </p>
            )}
            <div className="ticket-frame pointer-events-auto flex items-center gap-4 rounded-[3px] px-4 py-2 font-fell-sc text-[14px] tracking-[0.08em] text-ink">
              <span aria-label={`${attemptsLeft} swings left`}>
                Swings{' '}
                <span className="font-rye tracking-[0.2em] text-oxblood">
                  {'●'.repeat(attemptsLeft)}
                  {'○'.repeat(Math.max(0, STRIKER_SWINGS - attemptsLeft))}
                </span>
              </span>
              <span aria-hidden className="text-ink-soft/50">
                |
              </span>
              <span>
                Best <span className="font-rye text-oxblood">{pct(best)}%</span>
              </span>
            </div>
          </div>

          {/* Power gauge — right edge, letterpress track with a brass needle. */}
          {(phase === 'armed' || phase === 'struck') && (
            <div className="absolute bottom-[16vh] right-4 top-[16vh] flex items-stretch md:right-8">
              <div className="ticket-frame relative w-9 rounded-[4px] px-1.5 py-2">
                <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-ink/10">
                  {/* scoring bands (top = strongest) */}
                  <div
                    className="absolute inset-x-0 top-0 bg-oxblood/80"
                    style={{ height: `${(1 - PERFECT) * 100}%` }}
                  />
                  <div
                    className="absolute inset-x-0 bg-brass/50"
                    style={{
                      top: `${(1 - PERFECT) * 100}%`,
                      height: `${(PERFECT - GREAT) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute inset-x-0 bg-brass/25"
                    style={{ top: `${(1 - GREAT) * 100}%`, height: `${(GREAT - OK) * 100}%` }}
                  />
                  {/* the needle (rAF-driven while armed; frozen at the hit while struck) */}
                  <div
                    ref={needle}
                    className="absolute inset-x-0 h-[3px] -translate-y-1/2 bg-ink shadow-[0_0_6px_rgba(255,207,94,0.9)]"
                    style={{ bottom: `${phase === 'struck' ? power * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal cards: how-to / verdict */}
          <AnimatePresence>
            {modal && (
              <motion.div
                className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="absolute inset-0 bg-background-primary/55 backdrop-blur-[2px]" />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.99 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="ticket-frame halftone relative z-10 w-full max-w-md rounded-[5px] p-6 text-center md:p-8"
                >
                  {phase === 'intro' && (
                    <>
                      <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
                        Test your strength
                      </p>
                      <h2 className="font-rye letterpress mt-2 text-[34px] text-ink">
                        High Striker
                      </h2>
                      <p className="font-fell mt-4 text-[15px] leading-relaxed text-ink/90">
                        The needle sweeps up and down — <strong>tap anywhere</strong> when it peaks
                        to swing the mallet. Send the puck to the top and{' '}
                        <strong>ring the bell</strong>. Three swings.
                      </p>
                      <button
                        onClick={arm}
                        className="paper-button mt-6 rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
                      >
                        Grab the mallet
                      </button>
                    </>
                  )}

                  {phase === 'done' && (
                    <>
                      <h2 className="font-rye letterpress text-[32px] text-ink">
                        {best >= PERFECT ? '🔔 DING!' : resultLabel(best)}
                      </h2>
                      <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
                        Best swing <span className="font-rye text-oxblood">{pct(best)}%</span>
                        {best >= PERFECT
                          ? ' — you rang the bell. The carny eyes you with new respect.'
                          : ' — the bell lives to ring another day.'}
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={replay}
                          className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
                        >
                          Play again
                        </button>
                        <button
                          onClick={exit}
                          className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[14px] tracking-[0.06em]"
                        >
                          Exit
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

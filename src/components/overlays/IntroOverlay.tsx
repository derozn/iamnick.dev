'use client';

import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';
import { useQualityTier } from '@/components/three/hooks/useQualityTier';
import { initAudio } from '@/lib/audio';

// NB: deliberately NO @react-three/* import here — this overlay is in the static
// (non-dynamic) bundle, and importing drei/three would pull the whole 3-D chunk
// into first-load JS, defeating the code-split. The loader is `sceneReady`-driven
// (a Suspense signal in Scene), not a drei useProgress readout.

const EASE = [0.22, 0.61, 0.27, 1] as const;

/**
 * IntroOverlay — the DOM half of the Bruno-Simon-style entry sequence. The
 * visuals (dark veil, film grain, bulb-marquee progress, spotlight iris and the
 * final dissolve) are drawn IN-CANVAS by the LoaderVeil shader; this overlay
 * contributes what must be HTML:
 *
 *   1. An instant-paint dark cover for the window before the 3-D chunk arrives
 *      (fades once the veil reports its first frame via `veilLive`).
 *   2. The letterpress title block + live load percentage (`loadProgress`).
 *   3. The "click to enter" button + hand-drawn arrow, whose tip lands on the
 *      shader disc's rim (both sized 23vmin) once `sceneReady`.
 *
 * Clicking start() irises the shader open in sync with the camera pull-out while
 * this overlay fades. Skipped entirely on the reduced-motion / no-canvas tier.
 */
export function IntroOverlay() {
  const tier = useQualityTier();
  const sceneReady = useSceneStore((s) => s.sceneReady);
  const started = useSceneStore((s) => s.started);
  const start = useSceneStore((s) => s.start);
  // The in-canvas shader veil (LoaderVeil) owns the dark cover + spotlight once
  // it has rendered its first frame; until then (3-D chunk still downloading)
  // this overlay's own dark cover carries the splash. Same colours ⇒ seamless.
  const veilLive = useSceneStore((s) => s.veilLive);
  const pct = useSceneStore((s) => Math.round(s.loadProgress * 100));

  // No canvas → no intro to gate (reduced-motion, or tier still resolving on first
  // paint). Bailing is seamless: the loading backdrop is the same gradient
  // MidwayCanvas already paints, so there's no flash before it resolves.
  const show = tier !== 'none' && !started;

  // AnimatePresence keeps the overlay mounted so it can animate OUT on `started`:
  // the disc irises open + the mask fades, synced with the camera pull-back.
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {/* HTML loading cover — only until the shader veil's first frame (it
          paints the identical gradient, grain and marquee in-canvas). Covers the
          window before the 3-D chunk arrives. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#14141f] to-[#070810]"
            initial={{ opacity: 1 }}
            animate={{ opacity: veilLive ? 0 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          />

          {/* Loading text — stays put, then fades out together with the reveal. */}
          <motion.div
            aria-hidden={sceneReady}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: sceneReady ? 0 : 1 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="font-fell-sc text-[14px] tracking-[0.34em] text-brass">now showing</p>
            {/* presentational, not an <h1> — the résumé's h1 is the page's heading */}
            <p className="font-rye mt-2 text-[40px] leading-none text-paper md:text-[56px]">
              iamnick<span className="text-accent">.dev</span>
            </p>
            <p className="font-fell mt-3 text-[15px] italic text-paper/70">Raising the big top…</p>
            {/* Bulb-marquee progress rail — ONE design from first paint to reveal.
            Before the 3-D chunk lands (no progress data yet) the bulbs run a
            carnival chase; once the canvas is live they light up with real load
            progress. DOM (not shader) precisely so it exists before the chunk. */}
            <div className="mt-7 flex items-center gap-[1.15vmin]">
              {Array.from({ length: 16 }).map((_, i) => {
                const lit = veilLive && i < Math.round((pct / 100) * 16);
                return (
                  <span
                    key={i}
                    className={
                      'block h-[1.5vmin] min-h-[7px] w-[1.5vmin] min-w-[7px] rounded-full ' +
                      (lit
                        ? 'bg-[#ffd34d] shadow-[0_0_9px_2px_rgba(255,211,77,0.65)]'
                        : 'border border-paper/25 bg-paper/10')
                    }
                    style={
                      !veilLive
                        ? { animation: 'bulb-chase 1.9s infinite', animationDelay: `${i * 0.1}s` }
                        : undefined
                    }
                  />
                );
              })}
            </div>
            <p
              className="font-fell-sc mt-4 text-[13px] tracking-[0.3em] text-brass tabular-nums"
              style={{ opacity: veilLive ? 1 : 0 }}
            >
              {pct}%
            </p>
          </motion.div>

          {/* Enter prompt — full-screen click target (click anywhere / the iris), with a
          hand-drawn arrow pointing at the disc. Inert until the scene is ready. */}
          <motion.button
            type="button"
            disabled={!sceneReady}
            onClick={() => {
              // the guaranteed user gesture — the only place the mixer may be born
              initAudio(useSceneStore.getState().muted);
              start();
            }}
            aria-label="Enter the carnival"
            className="absolute inset-0 z-20"
            style={{ pointerEvents: sceneReady ? 'auto' : 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: sceneReady ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: sceneReady ? 0.5 : 0 }}
          >
            {/* Prompt sits OUTSIDE the disc — only the arrow TIP touches the rim.
                Every offset is in vmin (the disc radius is 23vmin too), so the whole
                prompt scales with the viewport and the tip stays on the rim on mobile
                and desktop alike. The wrapper is a zero-size anchor at screen-centre;
                its children are placed by absolute vmin offsets from there. */}
            <motion.span
              className="pointer-events-none absolute left-1/2 top-1/2 block select-none text-paper"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                className="font-rye absolute whitespace-nowrap text-[17px] leading-none tracking-wide sm:text-[22px]"
                style={{ left: '21vmin', top: '-36vmin' }}
              >
                click to enter
              </span>
              {/* curved arrow: tip at bottom-left lands on the rim (~23vmin from
                  centre); tail + text stay outside. */}
              <svg
                viewBox="0 0 100 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="absolute"
                style={{ left: '15.6vmin', top: '-26.8vmin', width: '14vmin', height: 'auto' }}
              >
                <path d="M94 10 C 70 6, 28 20, 8 72" />
                <path d="M8 72 l 22 -4" />
                <path d="M8 72 l 5 -21" />
              </svg>
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

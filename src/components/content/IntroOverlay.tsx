'use client';

import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';
import { useQualityTier } from '@/components/three/hooks/useQualityTier';

// NB: deliberately NO @react-three/* import here — this overlay is in the static
// (non-dynamic) bundle, and importing drei/three would pull the whole 3-D chunk
// into first-load JS, defeating the code-split. The loader is `sceneReady`-driven
// (a Suspense signal in Scene), not a drei useProgress readout.

const EASE = [0.22, 0.61, 0.27, 1] as const;

/**
 * IntroOverlay — the Bruno-Simon-style entry sequence over the carnival canvas.
 *
 *   1. Loading — a full-dark letterpress splash (the same gradient MidwayCanvas
 *      paints) with a marquee bar, shown until the scene's GLBs/textures have
 *      loaded (`sceneReady`). Masks the noticeable first-render delay.
 *   2. Reveal — seamlessly (same dark), the dark cover fades while the loading text
 *      fades out, opening a lit circular vignette of the framed entrance; the rest
 *      stays in the dark void. A hand-drawn arrow points at the disc to enter.
 *   3. Iris open — clicking expands the disc + fades the mask to reveal the whole
 *      carnival while the camera pulls back to the overview (`start()`).
 *
 * Skipped entirely on the reduced-motion / no-canvas tier.
 */
export function IntroOverlay() {
  const tier = useQualityTier();
  const sceneReady = useSceneStore((s) => s.sceneReady);
  const started = useSceneStore((s) => s.started);
  const start = useSceneStore((s) => s.start);

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
          {/* The lit disc masks the dark void (scale ~1). On start it irises open
              (exit scale → 6) to reveal the carnival. */}
          <motion.div
            aria-hidden
            className="intro-spotlight"
            initial={{ scale: 0.92 }}
            animate={{ scale: sceneReady ? 1 : 0.92 }}
            exit={{ scale: 6, transition: { duration: 1.1, ease: EASE } }}
            transition={{ duration: 1, ease: EASE }}
          />

          {/* Loading cover — full dark over the disc too while assets load; fades out as
          the centre "opens" into the vignette (same colour ⇒ seamless). */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#14141f] to-[#070810]"
            initial={{ opacity: 1 }}
            animate={{ opacity: sceneReady ? 0 : 1 }}
            transition={{ duration: 0.9, ease: EASE }}
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
            {/* Indeterminate rail — a brass marquee sweep while assets load. */}
            <div className="relative mt-7 h-[3px] w-56 overflow-hidden rounded-full bg-paper/15">
              <motion.div
                className="absolute inset-y-0 w-1/3 rounded-full bg-brass"
                animate={{ x: ['-110%', '320%'] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

          {/* Enter prompt — full-screen click target (click anywhere / the iris), with a
          hand-drawn arrow pointing at the disc. Inert until the scene is ready. */}
          <motion.button
            type="button"
            disabled={!sceneReady}
            onClick={start}
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

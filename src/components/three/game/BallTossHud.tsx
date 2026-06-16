'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';

/**
 * BallTossHud — the DOM overlay for the ball-toss game. A sibling of
 * <ContentOverlay>, it shows only while the visitor has stepped into the booth
 * (`mode === 'playing' && activeStall === 'ball-toss'`). It reads summary state
 * (score / balls / phase) from the store; the throw itself happens in-canvas.
 *
 * Exit ✕ and Escape both call `exit()`, which clears the focus so the iso camera
 * eases back to the overview and <BallTossGame> unmounts.
 *
 * (Step 1: Exit affordances + a thin status bar. Instructions, power meter and the
 * win/lose cards land in Step 5.)
 */
export function BallTossHud() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'ball-toss');
  const score = useSceneStore((s) => s.ballTossScore);
  const ballsLeft = useSceneStore((s) => s.ballTossBallsLeft);
  const exit = useSceneStore((s) => s.exit);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, exit]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top bar: score + balls, and Exit */}
          <div className="flex items-start justify-between gap-4">
            <div className="hud-chip pointer-events-auto flex items-center gap-4 px-4 py-2 font-functional text-[13px] text-text-primary">
              <span>
                Score <span className="font-semibold text-accent">{score}</span>
              </span>
              <span aria-hidden className="text-text-primary/30">
                |
              </span>
              <span>
                Balls <span className="font-semibold text-accent">{ballsLeft}</span>
              </span>
            </div>

            <button
              onClick={exit}
              aria-label="Exit game"
              className="hud-button pointer-events-auto flex h-9 w-9 items-center justify-center text-[16px] text-accent [--hud-cut:8px]"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

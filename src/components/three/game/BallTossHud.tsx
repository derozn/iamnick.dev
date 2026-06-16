'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';

const EASE = [0.22, 0.61, 0.27, 1] as const;

/**
 * BallTossHud — the DOM overlay for the ball-toss game. A sibling of
 * <ContentOverlay>, it shows only while the visitor has stepped into the booth
 * (`mode === 'playing' && activeStall === 'ball-toss'`). It reads summary state
 * (score / balls / phase) from the store; the throw itself happens in-canvas.
 *
 * Layout: a pointer-events-none frame (so throws reach the canvas) carrying the
 * score/balls chip and Exit ✕, plus a modal card for the non-play phases —
 * how-to (intro), winner (won) and out-of-balls (lost). Exit ✕ / Escape leave.
 */
export function BallTossHud() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'ball-toss');
  const phase = useSceneStore((s) => s.ballTossPhase);
  const score = useSceneStore((s) => s.ballTossScore);
  const ballsLeft = useSceneStore((s) => s.ballTossBallsLeft);
  const exit = useSceneStore((s) => s.exit);
  const setBallToss = useSceneStore((s) => s.setBallToss);
  const replay = useSceneStore((s) => s.replayBallToss);
  const focus = useSceneStore((s) => s.focus);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, exit]);

  const startPlaying = () => setBallToss({ ballTossPhase: 'aiming' });
  const seeWork = () => {
    exit();
    focus('work');
  };

  const modal = phase === 'intro' || phase === 'won' || phase === 'lost';

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
          {/* Top bar: score + balls, and Exit */}
          <div className="flex items-start justify-between gap-4 p-4 md:p-6">
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

          {/* Aiming hint */}
          {phase === 'aiming' && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
              <p className="font-functional text-[12px] text-text-primary/70">
                Aim · hold to charge · release to throw
              </p>
            </div>
          )}

          {/* Modal cards: how-to / winner / out-of-balls */}
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
                  className="hud-card relative z-10 w-full max-w-md p-6 text-center md:p-8"
                >
                  {phase === 'intro' && (
                    <>
                      <p className="font-functional text-[12px] uppercase tracking-[0.2em] text-accent">
                        Step right up
                      </p>
                      <h2 className="mt-2 font-expressive text-[26px] font-semibold text-text-primary">
                        Ball Toss
                      </h2>
                      <p className="mt-4 text-[15px] leading-relaxed text-text-primary/85">
                        Knock down the milk bottles. <strong>Aim</strong> where you want to throw,{' '}
                        <strong>hold</strong> to charge your power, and <strong>release</strong> to
                        let it fly. You get three balls — clear the stack for a prize.
                      </p>
                      <button
                        onClick={startPlaying}
                        className="hud-button mt-6 px-6 py-3 font-expressive text-[15px] font-semibold text-accent"
                      >
                        Start throwing
                      </button>
                    </>
                  )}

                  {phase === 'won' && (
                    <>
                      <h2 className="font-expressive text-[28px] font-semibold text-text-primary">
                        🎉 Winner!
                      </h2>
                      <p className="mt-3 text-[15px] leading-relaxed text-text-primary/85">
                        You knocked &apos;em all down — final score{' '}
                        <span className="font-semibold text-accent">{score}</span>.
                      </p>
                      <p className="mt-2 text-[14px] text-text-primary/70">
                        Prize unlocked: now go read my work →
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={seeWork}
                          className="hud-button px-5 py-3 font-expressive text-[15px] font-semibold text-accent"
                        >
                          See my work →
                        </button>
                        <button
                          onClick={replay}
                          className="hud-button px-5 py-3 font-functional text-[14px] text-text-primary"
                        >
                          Play again
                        </button>
                        <button
                          onClick={exit}
                          className="hud-button px-5 py-3 font-functional text-[14px] text-text-primary"
                        >
                          Exit
                        </button>
                      </div>
                    </>
                  )}

                  {phase === 'lost' && (
                    <>
                      <h2 className="font-expressive text-[26px] font-semibold text-text-primary">
                        Out of balls
                      </h2>
                      <p className="mt-3 text-[15px] leading-relaxed text-text-primary/85">
                        Final score <span className="font-semibold text-accent">{score}</span>. So
                        close — give it another go?
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={replay}
                          className="hud-button px-5 py-3 font-expressive text-[15px] font-semibold text-accent"
                        >
                          Play again
                        </button>
                        <button
                          onClick={exit}
                          className="hud-button px-5 py-3 font-functional text-[14px] text-text-primary"
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

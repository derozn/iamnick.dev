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
            <div className="ticket-frame pointer-events-auto flex items-center gap-4 rounded-[3px] px-4 py-2 font-fell-sc text-[14px] tracking-[0.08em] text-ink">
              <span>
                Score <span className="font-rye text-oxblood">{score}</span>
              </span>
              <span aria-hidden className="text-ink-soft/50">
                |
              </span>
              <span>
                Balls <span className="font-rye text-oxblood">{ballsLeft}</span>
              </span>
            </div>

            <button
              onClick={exit}
              aria-label="Exit game"
              className="paper-button pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[3px] font-rye text-[15px]"
            >
              ✕
            </button>
          </div>

          {/* Aiming hint */}
          {phase === 'aiming' && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
              <p className="ticket-frame rounded-[3px] px-4 py-1.5 font-fell text-[13px] italic text-ink">
                Drag back to aim &amp; power · release to throw
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
                  className="ticket-frame halftone relative z-10 w-full max-w-md rounded-[5px] p-6 text-center md:p-8"
                >
                  {phase === 'intro' && (
                    <>
                      <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
                        Step right up
                      </p>
                      <h2 className="font-rye letterpress mt-2 text-[34px] text-ink">Ball Toss</h2>
                      <p className="font-fell mt-4 text-[15px] leading-relaxed text-ink/90">
                        Knock down the milk bottles. It&apos;s a slingshot:{' '}
                        <strong>drag the ball back</strong> — further for more power, aim by pulling
                        off to one side — then <strong>release</strong> to let it fly. You get three
                        balls; clear the stack for a prize.
                      </p>
                      <button
                        onClick={startPlaying}
                        className="paper-button mt-6 rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
                      >
                        Start throwing
                      </button>
                    </>
                  )}

                  {phase === 'won' && (
                    <>
                      <h2 className="font-rye letterpress text-[36px] text-ink">🎉 Winner!</h2>
                      <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
                        You knocked &apos;em all down — final score{' '}
                        <span className="font-rye text-oxblood">{score}</span>.
                      </p>
                      <p className="font-fell mt-2 text-[14px] italic text-ink-soft">
                        Prize unlocked: now go read my work →
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={seeWork}
                          className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
                        >
                          See my work →
                        </button>
                        <button
                          onClick={replay}
                          className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[14px] tracking-[0.06em]"
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

                  {phase === 'lost' && (
                    <>
                      <h2 className="font-rye letterpress text-[32px] text-ink">Out of balls</h2>
                      <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
                        Final score <span className="font-rye text-oxblood">{score}</span>. So close
                        — give it another go?
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

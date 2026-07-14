'use client';

import { AnimatePresence, motion } from 'motion/react';
import { FocusTrap } from 'focus-trap-react';

import { useSceneStore } from '@/store/scene';
import { playSfx } from '@/lib/audio';
import { TICKET_COUNT } from '@/components/three/tickets/ticketConfig';
import { EASE } from '@/lib/motion';

// NB: no @react-three/* imports — this HUD lives in the static bundle
// (ticketConfig is deliberately three-free).

/**
 * TicketHud — the DOM half of the golden-ticket hunt: a letterpress tally chip
 * (bottom-left, appears after the first punch) and the full-house modal when
 * all tickets are found, with a "tear them up" reset for another run.
 */
export function TicketHud() {
  const found = useSceneStore((s) => s.ticketsFound.length);
  const celebrated = useSceneStore((s) => s.ticketsCelebrated);
  const celebrate = useSceneStore((s) => s.celebrateTickets);
  const resetTickets = useSceneStore((s) => s.resetTickets);
  const started = useSceneStore((s) => s.started);
  const playing = useSceneStore((s) => s.mode === 'playing');

  // Hide the tally while a game owns the screen — the high striker's stats hug
  // the same bottom edge and the two collided on mobile (same pattern as
  // SiteNav's burger: game chrome wins, the chip fades back on exit).
  const showChip = started && !playing && found > 0;
  const showModal = started && found >= TICKET_COUNT && !celebrated;

  return (
    <>
      <AnimatePresence>
        {showChip && (
          <motion.div
            key="ticket-chip"
            className="ticket-frame fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span aria-hidden className="text-[15px]">
              🎟
            </span>
            {/* keyed on the count so each punch pops the number */}
            <motion.span
              key={found}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="font-rye letterpress text-[15px] leading-none text-ink"
            >
              {found} / {TICKET_COUNT}
            </motion.span>
            <span className="font-fell-sc text-[11px] tracking-[0.18em] text-brass-text">
              tickets punched
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              escapeDeactivates: false,
              allowOutsideClick: true,
            }}
          >
            <motion.div
              key="ticket-modal"
              className="fixed inset-0 z-[48] flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={celebrate}
                className="absolute inset-0 cursor-default bg-background-primary/60 backdrop-blur-[2px]"
              />
              <motion.div
                role="dialog"
                aria-label="Full house"
                className="ticket-frame ticket-perf halftone relative w-[min(92vw,430px)] px-8 py-9 text-center"
                initial={{ scale: 0.9, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                onAnimationComplete={() => playSfx('pop')}
              >
                <p className="font-fell-sc letterpress text-[13px] tracking-[0.3em] text-brass-text">
                  full house
                </p>
                <h2 className="font-rye letterpress mt-2 text-[34px] leading-tight text-ink">
                  You found every golden ticket!
                </h2>
                <p className="font-fell mt-3 text-[15px] italic text-ink/80">
                  Eight for eight — the midway holds no more secrets from you. Consider yourself an
                  honorary carny.
                </p>
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button type="button" onClick={celebrate} className="paper-button px-5 py-2">
                    <span className="font-rye text-[15px] text-ink">Take a bow</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetTickets}
                    className="font-fell-sc text-[12px] tracking-[0.18em] text-brass-text underline-offset-4 hover:underline"
                  >
                    tear them up &amp; hunt again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FocusTrap } from 'focus-trap-react';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from '@/components/three/synty/attractions';
import { SectionContent } from './SectionContent';
import { CareerTickets } from './CareerTickets';
import { EASE } from '@/lib/motion';
import { useKeyDown } from '@/hooks/useKeyDown';

/**
 * ContentOverlay — the neon HUD panel that rises over the dimmed carnival when a
 * tent is opened (scene store `viewing`). Backdrop click / ✕ / Escape close it;
 * body scroll is locked while open so the camera holds at the attraction.
 */
export function ContentOverlay() {
  const mode = useSceneStore((s) => s.mode);
  const activeId = useSceneStore((s) => s.activeAttraction);
  const close = useSceneStore((s) => s.close);

  const isOpen = mode === 'viewing' && !!activeId;
  const attraction = ATTRACTIONS.find((a) => a.id === activeId);
  // The career booth opens the letterpress ticket deck on its own stage, rather
  // than the neon HUD card — first step of the HUD overhaul.
  const isCareer = attraction?.section === 'work';

  useKeyDown((e) => {
    if (e.key === 'Escape') close();
  }, isOpen);

  // Lock body scroll while open so the camera holds at the attraction.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && attraction && (
        // Focus stays inside the panel while it's open and returns to the
        // opener on close (WCAG 2.4.3). initialFocus: false — FortunePanel
        // focuses its own input; other panels leave focus put until Tab.
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            escapeDeactivates: false, // the store's Escape handler closes us
            allowOutsideClick: true,
            // The panel animates in; skip the visibility check (it also lets the
            // trap work under jsdom, which has no layout — see ContentOverlay.test).
            tabbableOptions: { displayCheck: 'none' },
          }}
        >
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 cursor-default bg-background-primary/75 backdrop-blur-sm"
            />

            {/* Letterpress stage. Career opens the ticket deck; every other section
              gets a bone double-rule panel. Both share the filmic grain+vignette. */}
            {isCareer ? (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={attraction.title}
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.99 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col items-center overflow-y-auto px-4 py-8"
              >
                <CareerTickets />
              </motion.div>
            ) : (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={attraction.title}
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.99 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="ticket-frame halftone relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[5px] p-6 md:p-10"
              >
                <SectionContent section={attraction.section} />
              </motion.div>
            )}

            {/* Unifying filmic surface over the whole frame (spec §7) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  'radial-gradient(ellipse 82% 76% at 50% 47%, transparent 42%, rgba(0,0,0,0.62) 100%)',
              }}
            />
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-[0.10] mix-blend-overlay"
            >
              <filter id="overlay-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.85"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#overlay-grain)" />
            </svg>

            {/* ✕ takes the burger's exact slot (h-10 w-10, top-3 right-4) so it sits
              flush with the mute button at right-16 — one geometry for every
              top-right control. */}
            <button
              onClick={close}
              aria-label="Close panel"
              className="font-rye paper-button absolute right-4 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-[4px] text-[15px]"
            >
              ✕
            </button>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}

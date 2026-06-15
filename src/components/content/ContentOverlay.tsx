'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from '@/components/three/synty/attractions';
import { SectionContent } from './SectionContent';

const EASE = [0.22, 0.61, 0.27, 1] as const;

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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && attraction && (
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
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={attraction.title}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.99 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="hud-card relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 md:p-10"
          >
            <button
              onClick={close}
              aria-label="Close panel"
              className="hud-button absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-[16px] text-accent [--hud-cut:8px]"
            >
              ✕
            </button>
            <SectionContent section={attraction.section} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

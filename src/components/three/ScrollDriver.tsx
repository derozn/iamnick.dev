'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

import { useSceneStore } from '@/store/scene';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * ScrollDriver — binds native document scroll to the scene store.
 *
 * Renders null; mounted INSIDE the Canvas so `invalidate` comes from the fiber
 * root (and three.js stays out of the main bundle — the page itself only ships
 * the dynamic MidwayCanvas shell).
 *
 * - Passive, rAF-throttled scroll listener → overall progress [0, 1]. While a
 *   stall is stepped into (`mode === 'playing'`) scroll is locked, so progress
 *   is held frozen and the camera stays docked at the stall.
 * - Measures each `[data-attraction]` section's offset range (normalised to
 *   scroll progress, using the viewport-centre crossing points) on mount,
 *   window resize, and document.body resize (ResizeObserver).
 * - Calls invalidate() after every store update so the demand-mode frameloop
 *   renders exactly when something changed.
 */
export function ScrollDriver() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let rafId = 0;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const readProgress = () => {
      // Scroll is locked while a stall is stepped into — freeze progress so the
      // camera holds docked at the stall until the visitor exits.
      if (useSceneStore.getState().mode === 'playing') return;
      useSceneStore.getState().setProgress(clamp01(window.scrollY / maxScroll()));
      invalidate();
    };

    const onScroll = () => {
      if (rafId) return; // rAF throttle — at most one store write per frame
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        readProgress();
      });
    };

    const measure = () => {
      const max = maxScroll();
      const halfViewport = window.innerHeight / 2;
      const sections: Record<string, { start: number; end: number }> = {};

      document.querySelectorAll<HTMLElement>('[data-attraction]').forEach((el) => {
        const id = el.dataset.attraction;
        if (!id) return;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        // Band = scroll positions where the viewport centre is inside the section.
        sections[id] = {
          start: clamp01((top - halfViewport) / max),
          end: clamp01((top + rect.height - halfViewport) / max),
        };
      });

      useSceneStore.getState().setSections(sections);
      readProgress();
    };

    measure();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [invalidate]);

  return null;
}

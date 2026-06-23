'use client';

import dynamic from 'next/dynamic';

import { useQualityTier } from './hooks/useQualityTier';

/* three.js and the whole scene graph load in their own chunk, client-only. */
const Scene = dynamic(() => import('./Scene'), { ssr: false });

/**
 * MidwayCanvas — fixed, full-viewport on-rails Dark Carnival behind the page.
 *
 * Sits at `z-0` (NOT a negative z-index — that puts the canvas behind the body in
 * hit-testing, so the in-scene attraction markers wouldn't receive clicks). It's
 * first in the DOM so the (pointer-events-none) scroll spacer paints over it but
 * passes clicks through to the canvas; the nav (z-40) and content overlay (z-30)
 * sit above.
 *
 * The gradient div doubles as the loading backdrop and the permanent fallback
 * for the 'none' tier (prefers-reduced-motion / SSR first paint) — content is
 * fully usable without the canvas (ADR-0003).
 */
export function MidwayCanvas() {
  const tier = useQualityTier();

  return (
    <div
      aria-hidden="true"
      className="midway-canvas fixed inset-0 z-0 bg-gradient-to-b from-[#14141f] to-[#070810]"
    >
      {tier !== 'none' && <Scene tier={tier} />}
    </div>
  );
}

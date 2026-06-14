'use client';

import dynamic from 'next/dynamic';

import { useQualityTier } from './hooks/useQualityTier';

/* three.js and the whole scene graph load in their own chunk, client-only. */
const Scene = dynamic(() => import('./Scene'), { ssr: false });

/**
 * MidwayCanvas — fixed, full-viewport on-rails Dark Carnival behind the page.
 *
 * Contract: fixed inset-0 -z-10 aria-hidden.
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
      className="fixed inset-0 -z-10 bg-gradient-to-b from-[#14141f] to-[#070810]"
    >
      {tier !== 'none' && <Scene tier={tier} />}
    </div>
  );
}

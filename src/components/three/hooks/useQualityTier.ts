'use client';

import { useEffect, useState } from 'react';

export type QualityTier = 'high' | 'low' | 'none';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SMALL_VIEWPORT_QUERY = '(max-width: 960px)';

function computeTier(): QualityTier {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return 'none';

  const nav = navigator as Navigator & { deviceMemory?: number };
  const smallViewport = window.matchMedia(SMALL_VIEWPORT_QUERY).matches;
  const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;

  return smallViewport || lowCpu || lowMemory ? 'low' : 'high';
}

/**
 * Device quality tier for the 3-D journey.
 *
 * - 'none' — prefers-reduced-motion: render the static gradient fallback only.
 * - 'low'  — small viewport / weak hardware: no post-fx, fewer particles, dpr ≤ 1.5.
 * - 'high' — full experience: bloom, 1500 dust particles, dpr ≤ 2.
 *
 * Starts as 'none' (SSR/hydration-safe) and resolves after mount; listens for
 * media-query changes so the tier tracks viewport + motion-preference changes.
 */
export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>('none');

  useEffect(() => {
    const queries = [REDUCED_MOTION_QUERY, SMALL_VIEWPORT_QUERY].map((q) => window.matchMedia(q));
    const update = () => setTier(computeTier());

    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  return tier;
}

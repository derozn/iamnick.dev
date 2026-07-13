'use client';

import { useEffect } from 'react';

import { useSceneStore } from '@/store/scene';

// NB: no @react-three/* imports — this lives in the static bundle.

/**
 * DebugBridge — exposes the scene store on `window` when the page is loaded with
 * `?debug=1`, so headless Playwright verification can drive deterministic states
 * (collect tickets, focus attractions, set game phases) instead of fighting the
 * demand frameloop with synthetic input. No-op in normal visits.
 */
export function DebugBridge() {
  useEffect(() => {
    if (!window.location.search.includes('debug=1')) return;
    (window as Window & { __sceneStore?: typeof useSceneStore }).__sceneStore = useSceneStore;
  }, []);
  return null;
}

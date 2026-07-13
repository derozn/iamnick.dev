'use client';

import { useMemo } from 'react';

import { useSceneStore } from '@/store/scene';

export interface DebugGates {
  /** `?off=synty,rides,glow,…` — named scene pieces to unmount. */
  off: Set<string>;
  /** `?offp=<regex>` — drop Synty prefabs whose name matches. */
  offp: RegExp | undefined;
}

/**
 * Headless-verification gates parsed from the URL. `?debug=1` arms them;
 * `?off=` / `?offp=` bisect the scene and `?bloom=0` forces the composer off for
 * A/B comparison. Inert in normal visits; SSR-safe (Scene is dynamic ssr:false).
 */
export function useDebugGates(high: boolean): { dbg: DebugGates; bloomOn: boolean } {
  const dbg = useMemo<DebugGates>(() => {
    if (typeof window === 'undefined' || !window.location.search.includes('debug=1')) {
      return { off: new Set<string>(), offp: undefined };
    }
    const q = new URLSearchParams(window.location.search);
    const off = new Set((q.get('off') ?? '').split(',').filter(Boolean));
    const offp = q.get('offp') ? new RegExp(q.get('offp')!) : undefined;
    return { off, offp };
  }, []);

  // Bloom is a mount-time decision (emissive intensities bake once): high tier,
  // not opted out via ?bloom=0, and not persistently blocked by a prior context loss.
  const bloomOn = useMemo(() => {
    const optOut = typeof window !== 'undefined' && window.location.search.includes('bloom=0');
    return high && !optOut && !useSceneStore.getState().postFxBlocked;
  }, [high]);

  return { dbg, bloomOn };
}

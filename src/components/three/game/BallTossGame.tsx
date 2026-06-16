'use client';

import { useSceneStore } from '@/store/scene';

/**
 * BallTossGame — the in-Canvas carnival ball-toss mini-game. Mounts inside the
 * scene's <Suspense> and self-gates on store state: it only renders while the
 * visitor has stepped into the ball-toss booth (`mode === 'playing'` and
 * `activeStall === 'ball-toss'`).
 *
 * Custom lightweight physics (no physics dep): the ball is a projectile under
 * gravity, bottles are sphere-vs-box targets that topple with a hand-rolled
 * linear+angular integrator. The per-frame sim lives in refs (R3F lint forbids
 * mutating hook returns / reading ref.current in render); only summary state
 * (score / balls / phase) is mirrored to the store for the DOM HUD.
 *
 * (Step 1 stub — wiring only. The pyramid, throw and toppling land in later steps.)
 */
export function BallTossGame() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'ball-toss');
  if (!active) return null;
  return null;
}

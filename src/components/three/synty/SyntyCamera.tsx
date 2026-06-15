'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from './attractions';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (u: number) => u * u * (3 - 2 * u);

const N = ATTRACTIONS.length;
const LAST = N - 1;
/** Fraction of each segment the camera holds at a stop (slow-down); rest is transit. */
const HOLD = 0.55;

const desiredPos = new Vector3();
const desiredLook = new Vector3();

/**
 * Map scroll progress → curve parameter t with a plateau at each attraction, so
 * the walk slows/holds as it arrives at a tent and smoothsteps between.
 */
function mapT(p: number): number {
  const seg = 1 / LAST;
  const hold = (seg * HOLD) / 2;
  for (let i = 0; i <= LAST; i++) {
    const c = i * seg;
    if (p >= c - hold && p <= c + hold) return c; // holding at stop i
  }
  for (let i = 0; i < LAST; i++) {
    const a = i * seg + hold;
    const b = (i + 1) * seg - hold;
    if (p > a && p < b) return (i + smooth((p - a) / (b - a))) / LAST;
  }
  return p;
}

/**
 * SyntyCamera — scroll-driven first-person walk through the translated demo that
 * **stops at each attraction**: it flies a CatmullRom of the per-attraction camera
 * positions, looking at each structure, holding briefly at every tent (mapT) so the
 * visitor can read the glowing marker and click in. Damped.
 */
export function SyntyCamera() {
  const invalidate = useThree((s) => s.invalidate);
  const init = useRef(false);
  const look = useRef(new Vector3());

  const { camCurve, lookCurve } = useMemo(
    () => ({
      camCurve: new CatmullRomCurve3(
        ATTRACTIONS.map((a) => new Vector3(...a.cam)),
        false,
        'centripetal',
      ),
      lookCurve: new CatmullRomCurve3(
        ATTRACTIONS.map((a) => new Vector3(...a.look)),
        false,
        'centripetal',
      ),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const t = clamp01(mapT(clamp01(useSceneStore.getState().progress)));
    camCurve.getPoint(t, desiredPos);
    lookCurve.getPoint(t, desiredLook);

    if (!init.current) {
      init.current = true;
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
    }
    const dt = Math.min(delta, 0.1);
    const m1 = damp3(camera.position, desiredPos, 0.32, dt);
    const m2 = damp3(look.current, desiredLook, 0.32, dt);
    camera.up.set(0, 1, 0);
    camera.lookAt(look.current);
    if (m1 || m2) invalidate();
  });

  return null;
}

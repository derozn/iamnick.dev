'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* A walk through the translated demo (three coords): start elevated outside the
 * entrance (south, −Z), descend to eye level and move through the midway toward
 * the ferris wheel at the back (−X / +Z). Landmark-derived. */
const CAM_PTS: [number, number, number][] = [
  [3, 11, -52],
  [0, 5, -34],
  [-3, 3.3, -16],
  [-10, 3.3, 2],
  [-18, 3.3, 20],
];
const LOOK_PTS: [number, number, number][] = [
  [0, 6, -33],
  [-2, 4, -18],
  [-8, 3.6, -2],
  [-16, 4, 14],
  [-24, 7, 30],
];

const desiredPos = new Vector3();
const desiredLook = new Vector3();

/**
 * SyntyCamera — scroll-driven first-person walk through the translated Synty demo:
 * samples two CatmullRom curves (path + gaze) by scroll progress, descending from
 * an establishing shot into an eye-level stroll up the midway. Damped.
 */
export function SyntyCamera() {
  const invalidate = useThree((s) => s.invalidate);
  const init = useRef(false);
  const look = useRef(new Vector3());

  const { path, gaze } = useMemo(
    () => ({
      path: new CatmullRomCurve3(
        CAM_PTS.map((p) => new Vector3(...p)),
        false,
        'centripetal',
      ),
      gaze: new CatmullRomCurve3(
        LOOK_PTS.map((p) => new Vector3(...p)),
        false,
        'centripetal',
      ),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const p = clamp01(useSceneStore.getState().progress);
    path.getPoint(p, desiredPos);
    gaze.getPoint(p, desiredLook);

    if (!init.current) {
      init.current = true;
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
    }
    const dt = Math.min(delta, 0.1);
    const m1 = damp3(camera.position, desiredPos, 0.35, dt);
    const m2 = damp3(look.current, desiredLook, 0.35, dt);
    camera.up.set(0, 1, 0);
    camera.lookAt(look.current);
    if (m1 || m2) invalidate();
  });

  return null;
}

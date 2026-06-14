'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';
import {
  BOB_AMP,
  BOB_CYCLES,
  CAMERA_PATH,
  LOOK_PATH,
  POSITION_SMOOTHING,
  TARGET_SMOOTHING,
} from './carnival.config';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* Pre-allocated scratch — never allocate inside useFrame. */
const desiredPos = new Vector3();
const desiredLook = new Vector3();

/**
 * FirstPersonRig — drives an eye-level camera along a choreographed path, on rails.
 *
 * Scroll progress 0 → 1 samples CAMERA_PATH for position and LOOK_PATH for gaze
 * (two CatmullRom curves), so the camera walks in down the avenue, arcs into the
 * plaza, and pans across the bustle before settling on the ferris wheel. A
 * subtle head-bob (derived from progress) sells the walk. Position and target
 * are critically damped so nothing snaps.
 */
export function FirstPersonRig() {
  const invalidate = useThree((state) => state.invalidate);
  const initialized = useRef(false);
  const lookCurrent = useRef(new Vector3());

  const { camCurve, lookCurve } = useMemo(
    () => ({
      camCurve: new CatmullRomCurve3(
        CAMERA_PATH.map((p) => new Vector3(...p)),
        false,
        'centripetal',
      ),
      lookCurve: new CatmullRomCurve3(
        LOOK_PATH.map((p) => new Vector3(...p)),
        false,
        'centripetal',
      ),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const p = clamp01(useSceneStore.getState().progress);

    camCurve.getPoint(p, desiredPos);
    desiredPos.y += Math.sin(p * Math.PI * BOB_CYCLES) * BOB_AMP;
    lookCurve.getPoint(p, desiredLook);

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(desiredPos);
      lookCurrent.current.copy(desiredLook);
    }

    const dt = Math.min(delta, 0.1); // clamp tab-switch spikes
    const movingPos = damp3(camera.position, desiredPos, POSITION_SMOOTHING, dt);
    const movingLook = damp3(lookCurrent.current, desiredLook, TARGET_SMOOTHING, dt);

    camera.up.set(0, 1, 0);
    camera.lookAt(lookCurrent.current);

    if (movingPos || movingLook) invalidate();
  });

  return null;
}

'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* The demo carnival core sits around the origin; orbit-and-descend reveals it. */
const FOCAL = new Vector3(0, 3, 0);
const A0 = 0.5;
const A1 = 2.5;

const desiredPos = new Vector3();
const desiredLook = new Vector3();

/**
 * SyntyCamera — scroll-driven cinematic over the translated Synty demo: a slow
 * orbit-and-descent from a high establishing shot down to eye level inside the
 * carnival. Damped; demand-frameloop friendly.
 */
export function SyntyCamera() {
  const invalidate = useThree((s) => s.invalidate);
  const init = useRef(false);
  const look = useRef(new Vector3().copy(FOCAL));

  useFrame(({ camera }, delta) => {
    const p = clamp01(useSceneStore.getState().progress);
    const ang = A0 + (A1 - A0) * p;
    const rad = 62 - 44 * p;
    const h = 48 - 45 * p;
    desiredPos.set(FOCAL.x + Math.cos(ang) * rad, h, FOCAL.z + Math.sin(ang) * rad);
    desiredLook.set(FOCAL.x, 3 - 1.5 * p, FOCAL.z);

    if (!init.current) {
      init.current = true;
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
      camera.far = 800;
      camera.updateProjectionMatrix();
    }
    const dt = Math.min(delta, 0.1);
    const m1 = damp3(camera.position, desiredPos, 0.4, dt);
    const m2 = damp3(look.current, desiredLook, 0.4, dt);
    camera.up.set(0, 1, 0);
    camera.lookAt(look.current);
    if (m1 || m2) invalidate();
  });

  return null;
}

'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';
import {
  BOB_AMP,
  BOB_CYCLES,
  DRIFT_WEAVES,
  END_Z,
  EYE_HEIGHT,
  LOOK_AHEAD,
  PATH_DRIFT_X,
  POSITION_SMOOTHING,
  START_Z,
  TARGET_SMOOTHING,
} from './carnival.config';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Pre-allocated scratch — never allocate inside useFrame. */
const desiredPos = new Vector3();
const desiredLook = new Vector3();

/** Centreline X drift at progress p — a gentle S-weave so it reads as walking. */
function driftX(p: number) {
  return Math.sin(p * Math.PI * DRIFT_WEAVES) * PATH_DRIFT_X;
}

/**
 * FirstPersonRig — drives an eye-level camera straight down the midway, on rails.
 *
 * Scroll progress 0 → 1 maps to forward travel START_Z → END_Z. The camera
 * weaves laterally and bobs subtly (both derived from progress, so motion only
 * happens while scrolling — the demand frameloop stays idle when still). It
 * looks a fixed distance ahead down the street. Position and target are
 * critically damped so nothing snaps.
 */
export function FirstPersonRig() {
  const invalidate = useThree((state) => state.invalidate);
  const initialized = useRef(false);
  const lookCurrent = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    const { progress } = useSceneStore.getState();
    const p = clamp01(progress);

    const z = lerp(START_Z, END_Z, p);
    desiredPos.set(driftX(p), EYE_HEIGHT + Math.sin(p * Math.PI * BOB_CYCLES) * BOB_AMP, z);

    // Look ahead down the street, easing toward the upcoming weave.
    desiredLook.set(driftX(p + 0.03) * 0.6, EYE_HEIGHT - 0.06, z - LOOK_AHEAD);

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

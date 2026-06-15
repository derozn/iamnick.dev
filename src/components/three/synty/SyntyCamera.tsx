'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS, ROAD } from './attractions';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (u: number) => u * u * (3 - 2 * u);
const smoothstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)));

const EYE = 3.4;
const S = ATTRACTIONS.length;
/** Fraction of each scroll segment spent holding at a stop (the rest is transit). */
const HOLD = 0.32;

const desiredPos = new Vector3();
const desiredLook = new Vector3();
const ahead = new Vector3();
const stopLook = new Vector3();

/**
 * SyntyCamera — a first-person walk that **follows the gravel road**. The camera
 * position rides ROAD (a CatmullRom through the path waypoints); scroll maps to a
 * point on that road, holding at each attraction's `pathT`. The gaze looks ahead
 * down the path while walking and **turns to face the structure** as it arrives at
 * each stop — so you never cut through props and you face each tent's opening.
 */
export function SyntyCamera() {
  const invalidate = useThree((s) => s.invalidate);
  const init = useRef(false);
  const look = useRef(new Vector3());

  const road = useMemo(
    () =>
      new CatmullRomCurve3(
        ROAD.map(([x, z]) => new Vector3(x, EYE, z)),
        false,
        'centripetal',
      ),
    [],
  );

  useFrame(({ camera }, delta) => {
    const p = clamp01(useSceneStore.getState().progress);

    // which pair of stops the scroll is between, and how far through (held at ends)
    const f = p * (S - 1);
    const seg = Math.min(S - 2, Math.floor(f));
    const u = f - seg;
    const held = u <= HOLD ? 0 : u >= 1 - HOLD ? 1 : smooth((u - HOLD) / (1 - 2 * HOLD));

    // camera position: a point on the road between the two stops' pathT
    const pathT =
      ATTRACTIONS[seg].pathT + (ATTRACTIONS[seg + 1].pathT - ATTRACTIONS[seg].pathT) * held;
    road.getPoint(pathT, desiredPos);

    // gaze: look ahead down the road, turning to the structure near each stop
    road.getPoint(Math.min(1, pathT + 0.035), ahead);
    const near = u < 0.5 ? seg : seg + 1;
    stopLook.set(...ATTRACTIONS[near].look);
    const distToStop = Math.min(u, 1 - u); // 0 at a stop, 0.5 mid-transit
    const facing = 1 - smoothstep(HOLD * 0.5, HOLD * 1.6, distToStop);
    desiredLook.copy(ahead).lerp(stopLook, facing);

    if (!init.current) {
      init.current = true;
      camera.position.copy(desiredPos);
      look.current.copy(desiredLook);
    }
    const dt = Math.min(delta, 0.1);
    const m1 = damp3(camera.position, desiredPos, 0.3, dt);
    const m2 = damp3(look.current, desiredLook, 0.3, dt);
    camera.up.set(0, 1, 0);
    camera.lookAt(look.current);
    if (m1 || m2) invalidate();
  });

  return null;
}

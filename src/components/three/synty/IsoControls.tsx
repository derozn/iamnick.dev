'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { damp3 } from 'maath/easing';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from './attractions';

/**
 * IsoControls — Bruno-Simon-style navigation. A fixed isometric angle; the visitor
 * **drags to pan** across the carnival and **scrolls to zoom**. Clicking an
 * indicator sets `focusedAttraction`, and the camera **flies in** to that structure
 * and opens its content on arrival; closing returns to the overview.
 */

const AZ = Math.PI * 1.25; // 225° — view from the front (entrance) corner, looking in
const POLAR = 0.92; // tilt down from vertical (~53°)
const MIN_D = 13;
const MAX_D = 64;
const DEFAULT_D = 38; // overview zoom — closer than max, still sees the carnival

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const RIGHT = new Vector3(Math.cos(AZ), 0, -Math.sin(AZ)); // screen-right on the ground
const FWD = new Vector3(Math.sin(AZ), 0, Math.cos(AZ)); // screen-up on the ground
const DIR = new Vector3(
  Math.sin(POLAR) * Math.sin(AZ),
  Math.cos(POLAR),
  Math.sin(POLAR) * Math.cos(AZ),
); // unit camera offset direction

const clampTarget = (v: Vector3) => {
  v.x = clamp(v.x, -32, 32);
  v.z = clamp(v.z, -40, 40);
};

export function IsoControls() {
  const { camera, gl, invalidate } = useThree();
  const focused = useSceneStore((s) => s.focusedAttraction);

  const panTarget = useRef(new Vector3(-2, 1.5, -10));
  const dist = useRef(DEFAULT_D);
  const wantDist = useRef(DEFAULT_D);
  const camPos = useRef(new Vector3(-2, 1.5, -10).addScaledVector(DIR, DEFAULT_D));
  const look = useRef(new Vector3(-2, 1.5, -10));
  const drag = useRef<{ x: number; y: number } | null>(null);
  const focusedRef = useRef<string | null>(null);
  const open = useSceneStore((s) => s.open);

  // React to focus changes: fly to a head-on view of the structure's opening (or
  // back to the iso overview), and raise its content once the fly-in has settled.
  useEffect(() => {
    focusedRef.current = focused;
    if (focused) {
      const a = ATTRACTIONS.find((x) => x.id === focused);
      if (a) {
        // re-centre the overview on this structure for the return trip
        panTarget.current.set(a.position[0], 1.5, a.position[2]);
        const t = setTimeout(() => open(focused), 1400);
        invalidate();
        return () => clearTimeout(t);
      }
    }
    wantDist.current = DEFAULT_D;
    invalidate();
  }, [focused, invalidate, open]);

  // Drag to pan, wheel to zoom (disabled while focused on a structure).
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (useSceneStore.getState().focusedAttraction) return;
      drag.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      document.body.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current = { x: e.clientX, y: e.clientY };
      const k = dist.current * 0.0016;
      panTarget.current.addScaledVector(RIGHT, -dx * k).addScaledVector(FWD, -dy * k);
      clampTarget(panTarget.current);
      invalidate();
    };
    const onUp = (e: PointerEvent) => {
      drag.current = null;
      document.body.style.cursor = 'grab';
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be released */
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (useSceneStore.getState().focusedAttraction) return;
      e.preventDefault();
      wantDist.current = clamp(wantDist.current * (1 + e.deltaY * 0.0012), MIN_D, MAX_D);
      invalidate();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    document.body.style.cursor = 'grab';
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      document.body.style.cursor = '';
    };
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // Where do we want the camera + its look target this frame?
    const f = focusedRef.current;
    const a = f ? ATTRACTIONS.find((x) => x.id === f) : undefined;
    if (a) {
      // near eye-level, looking into the opening (out of iso, first-person feel)
      WANT_LOOK.set(a.position[0], a.position[1], a.position[2]);
      WANT_POS.copy(WANT_LOOK)
        .addScaledVector(FACE.set(a.facing[0], a.facing[1], a.facing[2]).normalize(), a.focusDist)
        .add(RISE.set(0, a.focusDist * 0.16, 0));
    } else {
      const dd = wantDist.current - dist.current;
      dist.current += dd * (1 - Math.exp(-dt / 0.28));
      WANT_LOOK.copy(panTarget.current);
      WANT_POS.copy(panTarget.current).addScaledVector(DIR, dist.current);
    }

    const m1 = damp3(camPos.current, WANT_POS, 0.32, dt);
    const m2 = damp3(look.current, WANT_LOOK, 0.32, dt);
    camera.position.copy(camPos.current);
    camera.up.set(0, 1, 0);
    camera.lookAt(look.current);

    if (m1 || m2) invalidate();
  });

  return null;
}

const WANT_POS = new Vector3();
const WANT_LOOK = new Vector3();
const FACE = new Vector3();
const RISE = new Vector3();

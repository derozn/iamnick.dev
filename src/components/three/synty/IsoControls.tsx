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
const FOCUS_D = 17;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const RIGHT = new Vector3(Math.cos(AZ), 0, -Math.sin(AZ)); // screen-right on the ground
const FWD = new Vector3(Math.sin(AZ), 0, Math.cos(AZ)); // screen-up on the ground
const DIR = new Vector3(
  Math.sin(POLAR) * Math.sin(AZ),
  Math.cos(POLAR),
  Math.sin(POLAR) * Math.cos(AZ),
); // unit camera offset direction

const clampTarget = (v: Vector3) => {
  v.x = clamp(v.x, -32, 26);
  v.z = clamp(v.z, -40, 40);
};

export function IsoControls() {
  const { camera, gl, invalidate } = useThree();
  const focused = useSceneStore((s) => s.focusedAttraction);

  const target = useRef(new Vector3(-2, 1.5, -10));
  const wantTarget = useRef(new Vector3(-2, 1.5, -10));
  const dist = useRef(MAX_D);
  const wantDist = useRef(MAX_D);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const open = useSceneStore((s) => s.open);

  // React to focus changes: fly the camera to the structure (or back to overview),
  // and raise its content once the fly-in has had time to settle.
  useEffect(() => {
    if (focused) {
      const a = ATTRACTIONS.find((x) => x.id === focused);
      if (a) {
        wantTarget.current.set(a.position[0], a.position[1], a.position[2]);
        wantDist.current = FOCUS_D;
        const t = setTimeout(() => open(focused), 1000);
        invalidate();
        return () => clearTimeout(t);
      }
    }
    wantDist.current = MAX_D;
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
      wantTarget.current.addScaledVector(RIGHT, -dx * k).addScaledVector(FWD, -dy * k);
      clampTarget(wantTarget.current);
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
    const moving = damp3(target.current, wantTarget.current, 0.28, dt);
    const dd = wantDist.current - dist.current;
    dist.current += dd * (1 - Math.exp(-dt / 0.28));

    camera.position.copy(target.current).addScaledVector(DIR, dist.current);
    camera.up.set(0, 1, 0);
    camera.lookAt(target.current);

    if (moving || Math.abs(dd) > 0.02) invalidate();
  });

  return null;
}

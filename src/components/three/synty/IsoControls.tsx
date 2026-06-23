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
const MIN_D = 12;
const MAX_D = 40; // capped zoom-out — you stay near the scene and pan; the far edge fades into fog
const DEFAULT_D = 26; // default zoom — close to the scene (Bruno-Simon feel), not a wide overview
// Pan strength is viewport-relative (world units per *fraction of the canvas
// swiped*), not per-pixel — so a swipe covers the same ground on a phone as on a
// desktop. Calibrated to match the previous desktop feel (≈0.0016 px⁻¹ @ 1600px).
const PAN_SENS = 2.6;
// Touch gets a gentler factor: a finger sweeps most of a small screen in one go,
// so the desktop strength felt twitchy — this dials it back to a comfortable drag.
const TOUCH_PAN_SENS = 1.1;

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

// Intro (Bruno-Simon style): before the visitor clicks "start", the camera holds a
// tight, framed vignette of the entrance — the natural start point — then expands
// to the overview on start. This also masks the scene's load time.
const OVERVIEW_TARGET = new Vector3(-2, 1.5, -10);
// The iris frames the entrance sign HEAD-ON — camera on the welcome-face side (−z)
// looking straight at it, NOT from the iso corner — so the sign reads front-on.
const INTRO_LOOK = new Vector3(-1.77, 2.8, -30.7); // the carnival entrance sign
const INTRO_DIR = new Vector3(0, 0.16, -1).normalize(); // front-on, a touch above
const INTRO_D = 19; // camera distance from the sign (pulled back so the lights aren't blown out up close)

export function IsoControls() {
  const { camera, gl, invalidate } = useThree();
  const focused = useSceneStore((s) => s.focusedAttraction);
  const started = useSceneStore((s) => s.started);

  // Start framed head-on on the entrance sign (intro); the start effect expands to
  // the iso overview. panTarget/dist are the post-start (overview) values — the
  // intro framing is applied directly in useFrame while `!started`.
  const panTarget = useRef(OVERVIEW_TARGET.clone());
  const dist = useRef(DEFAULT_D);
  const wantDist = useRef(DEFAULT_D);
  const camPos = useRef(INTRO_LOOK.clone().addScaledVector(INTRO_DIR, INTRO_D));
  const look = useRef(INTRO_LOOK.clone());
  // Active pointers (id → last client position) so we can tell a one-finger pan
  // from a two-finger pinch; `pinch` holds the gesture's reference span + zoom.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ span: number; baseDist: number } | null>(null);
  const focusedRef = useRef<string | null>(null);
  const open = useSceneStore((s) => s.open);
  const stepIn = useSceneStore((s) => s.stepIn);

  // React to focus changes: fly to a head-on view of the structure's opening (or
  // back to the iso overview), and on arrival either raise its content panel or —
  // for a `game:` section — step into the playable game instead.
  useEffect(() => {
    focusedRef.current = focused;
    if (focused) {
      const a = ATTRACTIONS.find((x) => x.id === focused);
      if (a) {
        // re-centre the overview on this structure for the return trip
        panTarget.current.set(a.position[0], 1.5, a.position[2]);
        // Keep the 1.4 s fly-in so the camera has arrived at the counter before the
        // game arms (or the content panel rises).
        const isGame = a.section.startsWith('game:');
        const t = setTimeout(() => (isGame ? stepIn(a.id) : open(a.id)), 1400);
        invalidate();
        return () => clearTimeout(t);
      }
    }
    // Returning to the overview — but don't clobber the tight INTRO_D before the
    // visitor has started (the start effect owns the expand).
    if (useSceneStore.getState().started) wantDist.current = DEFAULT_D;
    invalidate();
  }, [focused, invalidate, open, stepIn]);

  // Start: expand from the framed vignette to the full overview. The damped frame
  // loop slides the camera out smoothly as the target + distance change.
  useEffect(() => {
    if (!started) return;
    panTarget.current.copy(OVERVIEW_TARGET);
    wantDist.current = DEFAULT_D;
    invalidate();
  }, [started, invalidate]);

  // Drag to pan, wheel / pinch to zoom (disabled while focused on a structure).
  useEffect(() => {
    const el = gl.domElement;
    // NB: touch must drive the camera, not scroll the page. That's enforced with
    // `touch-action: none` on the canvas via CSS (see globals.css) — set there,
    // not here, because mutating gl.domElement trips the react-hooks rule.

    const twoPointerSpan = () => {
      const [a, b] = [...pointers.current.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onDown = (e: PointerEvent) => {
      const st = useSceneStore.getState();
      if (!st.started || st.focusedAttraction) return; // intro locks the camera
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
      if (pointers.current.size === 2) {
        pinch.current = { span: twoPointerSpan(), baseDist: wantDist.current };
      }
      document.body.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two fingers → pinch-zoom (the touch equivalent of the scroll wheel).
      if (pointers.current.size >= 2 && pinch.current) {
        const span = twoPointerSpan();
        if (span > 0) {
          wantDist.current = clamp(
            (pinch.current.baseDist * pinch.current.span) / span,
            MIN_D,
            MAX_D,
          );
          invalidate();
        }
        return;
      }

      // One finger / mouse → pan, in world units per fraction of the canvas swept.
      const sens = e.pointerType === 'touch' ? TOUCH_PAN_SENS : PAN_SENS;
      const k = (dist.current * sens) / (el.clientWidth || window.innerWidth);
      panTarget.current.addScaledVector(RIGHT, -dx * k).addScaledVector(FWD, -dy * k);
      clampTarget(panTarget.current);
      invalidate();
    };
    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      document.body.style.cursor = pointers.current.size ? 'grabbing' : 'grab';
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be released */
      }
    };
    const onWheel = (e: WheelEvent) => {
      const st = useSceneStore.getState();
      if (!st.started || st.focusedAttraction) return; // intro locks zoom
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
    const active = pointers.current;
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      active.clear();
      pinch.current = null;
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
    } else if (!useSceneStore.getState().started) {
      // Intro: head-on at the entrance sign (front view, not the iso angle).
      WANT_LOOK.copy(INTRO_LOOK);
      WANT_POS.copy(INTRO_LOOK).addScaledVector(INTRO_DIR, INTRO_D);
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

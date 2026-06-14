'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { damp, damp3 } from 'maath/easing';

import { useSceneStore, type SectionRange } from '@/store/scene';
import {
  MIDWAY_ATTRACTIONS,
  HOLD_FRACTION,
  POSITION_SMOOTHING,
  TARGET_SMOOTHING,
  MAX_BANK,
  BANK_GAIN,
  BANK_SMOOTHING,
} from './midway.config';

/* Pre-allocated scratch — never allocate inside useFrame. */
const desiredPosition = new Vector3();
const desiredLook = new Vector3();

const LAST = MIDWAY_ATTRACTIONS.length - 1;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (u: number) => u * u * (3 - 2 * u); // smoothstep 0..1

/** Scroll band for stop i — measured DOM band, or a uniform fallback pre-measure. */
function bandStart(i: number, sections: Record<string, SectionRange>): number {
  return sections[MIDWAY_ATTRACTIONS[i].id]?.start ?? i / MIDWAY_ATTRACTIONS.length;
}
function bandEnd(i: number, sections: Record<string, SectionRange>): number {
  return sections[MIDWAY_ATTRACTIONS[i].id]?.end ?? (i + 1) / MIDWAY_ATTRACTIONS.length;
}

/** Centre ± HOLD_FRACTION of the band — the camera holds docked inside this range. */
function holdStart(i: number, sections: Record<string, SectionRange>): number {
  const s = bandStart(i, sections);
  const e = bandEnd(i, sections);
  return (s + e) / 2 - ((e - s) * HOLD_FRACTION) / 2;
}
function holdEnd(i: number, sections: Record<string, SectionRange>): number {
  const s = bandStart(i, sections);
  const e = bandEnd(i, sections);
  return (s + e) / 2 + ((e - s) * HOLD_FRACTION) / 2;
}

/**
 * Remap overall scroll progress → curve parameter t ∈ [0, 1].
 * Plateaus while progress sits inside a stop's hold band (camera docks at the
 * island) and smoothsteps through the transit between consecutive holds.
 */
function mapProgressToT(progress: number, sections: Record<string, SectionRange>): number {
  if (progress <= holdEnd(0, sections)) return 0;

  for (let i = 0; i < LAST; i++) {
    const transitStart = holdEnd(i, sections);
    const transitEnd = holdStart(i + 1, sections);

    if (progress <= transitStart) return i / LAST;
    if (progress < transitEnd) {
      const u = (progress - transitStart) / (transitEnd - transitStart);
      return (i + smooth(u)) / LAST;
    }
    if (progress <= holdEnd(i + 1, sections)) return (i + 1) / LAST;
  }

  return 1;
}

/**
 * CameraRig — flies the camera along a CatmullRom spline through the per-stop
 * control points, with the look-at easing toward the current stop's island
 * centre. Both position and target are critically damped (maath damp3) so
 * motion never snaps; a subtle bank/roll leans into lateral turns.
 *
 * Demand-frameloop friendly: while any damp is still converging it calls
 * invalidate() to request the next frame; once settled, rendering stops.
 */
export function CameraRig() {
  const invalidate = useThree((state) => state.invalidate);
  const isMobile = useThree((state) => state.size.width < 960);

  const initialized = useRef(false);
  const lookCurrent = useRef(new Vector3());
  const bank = useRef({ value: 0 });

  const { curve, lookTargets } = useMemo(() => {
    const mode = isMobile ? 'mobile' : 'desktop';

    const points = MIDWAY_ATTRACTIONS.map((stop) =>
      new Vector3(...stop.position).add(new Vector3(...stop.camOffset[mode])),
    );
    const curve = new CatmullRomCurve3(points, false, 'centripetal');
    curve.arcLengthDivisions = 256;
    curve.getLength(); // warm the arc-length cache outside the frameloop

    const lookTargets = MIDWAY_ATTRACTIONS.map((stop) =>
      new Vector3(...stop.position).add(new Vector3(...stop.lookAtOffset[mode])),
    );

    return { curve, lookTargets };
  }, [isMobile]);

  // Re-render once when the curve flips between desktop/mobile layouts.
  useEffect(() => invalidate(), [curve, invalidate]);

  useFrame(({ camera }, delta) => {
    const { progress, sections } = useSceneStore.getState();

    const t = clamp01(mapProgressToT(progress, sections));
    curve.getPointAt(t, desiredPosition);

    // Blend look-at between neighbouring stops; t's plateaus make it settle
    // exactly on the current island while docked.
    const f = t * LAST;
    const i0 = Math.floor(f);
    const i1 = Math.min(LAST, i0 + 1);
    desiredLook.lerpVectors(lookTargets[i0], lookTargets[i1], smooth(f - i0));

    if (!initialized.current) {
      initialized.current = true;
      camera.position.copy(desiredPosition);
      lookCurrent.current.copy(desiredLook);
    }

    const dt = Math.min(delta, 0.1); // clamp tab-switch spikes
    const movingPos = damp3(camera.position, desiredPosition, POSITION_SMOOTHING, dt);
    const movingLook = damp3(lookCurrent.current, desiredLook, TARGET_SMOOTHING, dt);

    // Bank into lateral turns: positional lag on x maps to a small roll.
    const lag = desiredPosition.x - camera.position.x;
    const targetBank = Math.max(-MAX_BANK, Math.min(MAX_BANK, -lag * BANK_GAIN));
    const movingBank = damp(bank.current, 'value', targetBank, BANK_SMOOTHING, dt);

    camera.up.set(0, 1, 0);
    camera.lookAt(lookCurrent.current);
    if (bank.current.value !== 0) camera.rotateZ(bank.current.value);

    // Keep requesting frames until every damp has converged.
    if (movingPos || movingLook || movingBank) invalidate();
  });

  return null;
}

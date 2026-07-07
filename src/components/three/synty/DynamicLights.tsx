'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type DirectionalLight, Matrix4, type PointLight, Vector3 } from 'three';

import demoInstances from './demo-instances.json';
import { unityTRS } from './conversion';
import { ATTRACTIONS } from './attractions';
import { EXTRA_LAMPS } from './sceneAdditions';

/**
 * DynamicLights — the Synty Demo lighting mood, but bounded for real GPUs.
 *
 * A forward renderer compiles every point light into one shader; ~37 static
 * lights crashed weaker GPUs (context loss). Instead we keep a cheap, fixed base
 * rig (hemisphere + ambient + two directional keys) and a small **fixed pool** of
 * point lights that, each frame, snap to the candidate glows nearest the camera.
 * The shader cost is constant (pool size) no matter how many candidates exist.
 */

const data = demoInstances as Record<string, number[][]>;
const _m = new Matrix4();
const _v = new Vector3();
const _fwd = new Vector3();
const posOf = (names: string[], yLift: number): Vector3[] =>
  names
    .flatMap((n) => data[n] ?? [])
    .map((t) => {
      unityTRS(t, _m);
      _v.setFromMatrixPosition(_m);
      return new Vector3(_v.x, _v.y + yLift, _v.z);
    });

interface Candidate {
  pos: Vector3;
  color: Color;
  intensity: number;
  distance: number;
  decay: number;
}

const WARM = new Color('#ff9a3c');

/** Every glow the pool can borrow from: lamp props, ride neon, per-attraction warmth. */
const CANDIDATES: Candidate[] = [
  // warm carnival lamps from the demo's light props
  ...posOf(
    [
      'SM_Prop_Light_01',
      'SM_Prop_Light_02',
      'SM_Prop_Light_03',
      'SM_Prop_Light_04',
      'SM_Prop_Light_05',
      'SM_Prop_Light_Pole_01',
      'SM_Prop_Lamp_Post_02',
    ],
    2,
  ).map((pos) => ({ pos, color: WARM, intensity: 13, distance: 11, decay: 2 })),
  // our extra street lamps (bulb sits ~4.3m up the post)
  ...EXTRA_LAMPS.map(([x, z]) => ({
    pos: new Vector3(x, 4.3, z),
    color: WARM,
    intensity: 13,
    distance: 11,
    decay: 2,
  })),
  // vivid neon accents at the actual rides
  ...posOf(['SM_Prop_Ferris_Wheel_01'], 6).map((pos) => ({
    pos,
    color: new Color('#22d3ee'),
    intensity: 16,
    distance: 24,
    decay: 1.6,
  })),
  ...posOf(['SM_Prop_Merry_Go_Round_01'], 4).map((pos) => ({
    pos,
    color: new Color('#ff2d6e'),
    intensity: 14,
    distance: 20,
    decay: 1.6,
  })),
  ...posOf(['SM_Prop_Teacup_Ride_01'], 3).map((pos) => ({
    pos,
    color: new Color('#b06cff'),
    intensity: 14,
    distance: 18,
    decay: 1.6,
  })),
  ...posOf(['SM_Prop_Swinging_Chairs_01'], 6).map((pos) => ({
    pos,
    color: new Color('#ffb84d'),
    intensity: 14,
    distance: 18,
    decay: 1.6,
  })),
  // a warm pool at every point of interest so each structure reads when focused
  ...ATTRACTIONS.map((a) => ({
    pos: new Vector3(a.position[0], a.position[1] + 2.6, a.position[2]),
    color: WARM,
    intensity: 15,
    distance: 14,
    decay: 2,
  })),
  // front-fill for the entrance sign: the moon key sits at +z (BEHIND the sign
  // from the intro camera), so its welcome face read back-lit/dark. This pool
  // floats in front of the face (-z side, where the visitor stands) and washes
  // it warm — it's the first thing anyone sees.
  {
    pos: new Vector3(-1.77, 3.6, -35),
    color: WARM,
    intensity: 16,
    distance: 14,
    decay: 1.8,
  },
];

export function DynamicLights({ pool = 8 }: { pool?: number }) {
  const lights = useRef<(PointLight | null)[]>([]);
  const keyRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const order = useMemo(() => CANDIDATES.map((_, i) => i), []);
  // which candidate each slot currently plays (-1 = none yet); slots are STABLE:
  // a slot keeps its candidate while that candidate stays in the nearest set, so
  // a small camera move can't shuffle every light between slots.
  const assigned = useRef<number[]>([]);

  useFrame(({ camera }, delta) => {
    const cp = camera.position;
    const dt = Math.min(delta, 0.1);

    // CAMERA-RELATIVE studio rig: the key rides above-and-behind the viewer, the
    // rim opposes it. A static key can't work here — the overview looks from a
    // fixed 225° azimuth but every focus fly-in faces its own direction (the
    // striker looks north, the entrance south…), so whichever quadrant a fixed
    // key sits in, SOME view renders back-lit ("inverted"-looking lighting).
    // Both lights aim at their default (0,0,0) target; with parallel rays only
    // the direction matters, and panning never changes direction — only the
    // damped fly-ins swing it, so it inherits their smoothness.
    camera.getWorldDirection(_fwd);
    _fwd.y = 0;
    if (_fwd.lengthSq() < 1e-4) _fwd.set(0, 0, -1);
    _fwd.normalize();
    keyRef.current?.position.set(-_fwd.x * 45, 90, -_fwd.z * 45);
    rimRef.current?.position.set(_fwd.x * 50, 45, _fwd.z * 50);
    // nearest-`pool` candidates win the fixed light slots this frame
    order.sort(
      (a, b) => CANDIDATES[a].pos.distanceToSquared(cp) - CANDIDATES[b].pos.distanceToSquared(cp),
    );
    if (assigned.current.length !== pool) assigned.current = Array(pool).fill(-1);
    const want = new Set(order.slice(0, pool));
    const slots = assigned.current;
    // free slots whose candidate fell out of the nearest set
    for (let k = 0; k < pool; k++) if (slots[k] !== -1 && !want.has(slots[k])) slots[k] = -1;
    // hand incoming candidates to the freed slots
    const held = new Set(slots);
    for (const idx of want) {
      if (held.has(idx)) continue;
      const free = slots.indexOf(-1);
      if (free === -1) break;
      slots[free] = idx;
    }
    for (let k = 0; k < pool; k++) {
      const l = lights.current[k];
      if (!l) continue;
      const idx = slots[k];
      if (idx === -1) {
        l.intensity = 0;
        continue;
      }
      const c = CANDIDATES[idx];
      // FADE, don't snap: a light popping to full strength at a new position read
      // as objects flicking between lit and unlit (worst during focus fly-ins and
      // after the pool re-seeds on a tier change/resize).
      if (l.userData.candidate !== idx) {
        l.userData.candidate = idx;
        l.position.copy(c.pos);
        l.color.copy(c.color);
        l.distance = c.distance;
        l.decay = c.decay;
        l.intensity = 0;
      }
      l.intensity += (c.intensity - l.intensity) * (1 - Math.exp(-dt / 0.16));
    }
  });

  return (
    <>
      {/* cheap, constant base rig — deep neon-night levels tuned for the promo mood:
          a low, cool fill so the scene falls into shadow and the warm pools (lamps,
          pumpkins, per-booth) carry the light. The fill is warm-violet on the ground
          and cool on top so shadows stay coloured, not dead-black, and unlit props in
          the gaps still separate from the fog without washing out the contrast. */}
      <hemisphereLight args={['#46588f', '#2a1f2c', 0.6]} />
      <ambientLight intensity={0.28} color="#2c2440" />
      {/* moon key — cool, high, kept modest so the firelight pools dominate.
          Positioned per-frame in useFrame: it FOLLOWS the camera (above-behind)
          so the faces the visitor is looking at are always the lit ones. */}
      <directionalLight ref={keyRef} position={[-40, 90, -50]} intensity={0.85} color="#aab6f0" />
      {/* violet rim — per-frame at the opposite side, for silhouette depth +
          carnival colour on the edges the key doesn't reach */}
      <directionalLight ref={rimRef} position={[50, 45, 40]} intensity={0.8} color="#a86cff" />

      {/* fixed pool — the shader only ever compiles `pool` point lights */}
      {Array.from({ length: pool }).map((_, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            lights.current[i] = el;
          }}
          decay={2}
          distance={10}
          intensity={0}
        />
      ))}
    </>
  );
}

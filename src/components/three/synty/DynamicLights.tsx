'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Matrix4, type PointLight, Vector3 } from 'three';

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
  ).map((pos) => ({ pos, color: WARM, intensity: 8, distance: 8, decay: 2 })),
  // our extra street lamps (bulb sits ~4.3m up the post)
  ...EXTRA_LAMPS.map(([x, z]) => ({
    pos: new Vector3(x, 4.3, z),
    color: WARM,
    intensity: 8,
    distance: 8,
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
    intensity: 10,
    distance: 12,
    decay: 2,
  })),
];

export function DynamicLights({ pool = 8 }: { pool?: number }) {
  const lights = useRef<(PointLight | null)[]>([]);
  const order = useMemo(() => CANDIDATES.map((_, i) => i), []);

  useFrame(({ camera }) => {
    const cp = camera.position;
    // nearest-`pool` candidates win the fixed light slots this frame
    order.sort(
      (a, b) => CANDIDATES[a].pos.distanceToSquared(cp) - CANDIDATES[b].pos.distanceToSquared(cp),
    );
    for (let k = 0; k < pool; k++) {
      const l = lights.current[k];
      if (!l) continue;
      const c = CANDIDATES[order[k]];
      l.position.copy(c.pos);
      l.color.copy(c.color);
      l.intensity = c.intensity;
      l.distance = c.distance;
      l.decay = c.decay;
    }
  });

  return (
    <>
      {/* cheap, constant base rig — carries the whole scene */}
      <hemisphereLight args={['#3a4a74', '#100e16', 1.1]} />
      <ambientLight intensity={0.4} color="#222046" />
      <directionalLight position={[40, 90, 50]} intensity={1.0} color="#9aa6de" />
      <directionalLight position={[-50, 45, -40]} intensity={0.45} color="#9a6cff" />

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

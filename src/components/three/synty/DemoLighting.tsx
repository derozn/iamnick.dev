import demoInstances from './demo-instances.json';
import { unityTRS } from './conversion';
import { Matrix4, Vector3 } from 'three';
import { useMemo } from 'react';

/**
 * DemoLighting — the Synty Demo.unity lighting recipe, translated:
 *  - exp² blue-grey fog + trilight ambient (approximated with hemisphere + ambient)
 *  - two blue directional keys (the dusk "moon")
 *  - warm orange point-glows at the demo's light props (capped for perf)
 *  - neon ride accents (cyan / red / warm) near the plaza cluster
 */

const data = demoInstances as Record<string, number[][]>;
const _m = new Matrix4();
const _v = new Vector3();
const posOf = (names: string[], yLift: number): [number, number, number][] =>
  names
    .flatMap((n) => data[n] ?? [])
    .map((t) => {
      unityTRS(t, _m);
      _v.setFromMatrixPosition(_m);
      return [_v.x, _v.y + yLift, _v.z] as [number, number, number];
    });

const warmPositions = posOf(
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
);

/** Neon accents AT the real ride positions (the rides sit far from the core). */
const rideAccents: { p: [number, number, number]; c: string }[] = [
  ...posOf(['SM_Prop_Ferris_Wheel_01'], 6).map((p) => ({ p, c: '#22d3ee' })),
  ...posOf(['SM_Prop_Merry_Go_Round_01'], 4).map((p) => ({ p, c: '#ff2d6e' })),
  ...posOf(['SM_Prop_Teacup_Ride_01'], 3).map((p) => ({ p, c: '#b06cff' })),
  ...posOf(['SM_Prop_Swinging_Chairs_01'], 6).map((p) => ({ p, c: '#ffb84d' })),
  ...posOf(['SM_Prop_Bumper_Car_Arena_01'], 3).map((p) => ({ p, c: '#22d3ee' })),
  ...posOf(['SM_Prop_Bouncy_Castle_01'], 3).map((p) => ({ p, c: '#ff2d6e' })),
];

export function DemoLighting({ warmCap = 22 }: { warmCap?: number }) {
  // keep the warm glows nearest the carnival core (perf cap)
  const warm = useMemo(
    () =>
      warmPositions
        .map((p) => ({ p, d: p[0] * p[0] + p[2] * p[2] }))
        .sort((a, b) => a.d - b.d)
        .slice(0, warmCap)
        .map((x) => x.p),
    [warmCap],
  );

  return (
    <>
      {/* Night base, but bright enough to read the whole carnival everywhere */}
      <hemisphereLight args={['#3a4a74', '#100e16', 1.5]} />
      <ambientLight intensity={0.6} color="#222046" />
      <directionalLight position={[40, 90, 50]} intensity={1.5} color="#9aa6de" />
      <directionalLight position={[-50, 45, -40]} intensity={0.6} color="#9a6cff" />

      {/* Warm carnival glows at the demo's light props */}
      {warm.map((p, i) => (
        <pointLight key={i} position={p} color="#ff9a3c" intensity={9} distance={7} decay={2} />
      ))}

      {/* Vivid neon accents at the actual rides */}
      {rideAccents.map((r, i) => (
        <pointLight key={i} position={r.p} color={r.c} intensity={22} distance={24} decay={1.5} />
      ))}
    </>
  );
}

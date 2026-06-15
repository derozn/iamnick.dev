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

const warmPositions = (() => {
  const data = demoInstances as Record<string, number[][]>;
  const lit = [
    'SM_Prop_Light_01',
    'SM_Prop_Light_02',
    'SM_Prop_Light_03',
    'SM_Prop_Light_04',
    'SM_Prop_Light_05',
    'SM_Prop_Light_Pole_01',
    'SM_Prop_Lamp_Post_02',
  ].flatMap((n) => data[n] ?? []);
  const m = new Matrix4();
  const v = new Vector3();
  return lit.map((t) => {
    unityTRS(t, m);
    v.setFromMatrixPosition(m);
    return [v.x, v.y + 2, v.z] as [number, number, number];
  });
})();

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
      {/* Neon-night base — readable at ground level, low enough that glows pop */}
      <hemisphereLight args={['#28365e', '#0b0a10', 0.9]} />
      <ambientLight intensity={0.32} color="#1a1636" />
      <directionalLight position={[40, 90, 50]} intensity={0.95} color="#8b96d8" />
      <directionalLight position={[-50, 45, -40]} intensity={0.4} color="#9a6cff" />

      {/* Warm carnival glows at the demo's light props */}
      {warm.map((p, i) => (
        <pointLight key={i} position={p} color="#ff9a3c" intensity={9} distance={7} decay={2} />
      ))}

      {/* Vivid neon ride accents near the core */}
      <pointLight position={[-6, 8, 4]} color="#22d3ee" intensity={28} distance={26} decay={1.5} />
      <pointLight position={[9, 7, -5]} color="#ff2d6e" intensity={20} distance={22} decay={1.6} />
      <pointLight position={[2, 6, 12]} color="#b06cff" intensity={16} distance={20} decay={1.6} />
      <pointLight position={[14, 6, 6]} color="#ffb84d" intensity={12} distance={18} decay={1.7} />
    </>
  );
}

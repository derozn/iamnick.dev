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
    ...(data['SM_Prop_Light_01'] ?? []),
    ...(data['SM_Prop_Light_02'] ?? []),
    ...(data['SM_Prop_Light_03'] ?? []),
    ...(data['SM_Prop_Lamp_01'] ?? []),
    ...(data['SM_Prop_Lantern_01'] ?? []),
    ...(data['SM_Prop_Lamp_Post_01'] ?? []),
  ];
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
      <hemisphereLight args={['#33485f', '#0c0b09', 1.0]} />
      <ambientLight intensity={0.28} color="#16202f" />
      <directionalLight position={[60, 95, 42]} intensity={1.7} color="#8c9fd6" />
      <directionalLight position={[-55, 55, -42]} intensity={0.78} color="#8c9fd6" />

      {warm.map((p, i) => (
        <pointLight key={i} position={p} color="#e87d1d" intensity={6} distance={6} decay={2} />
      ))}

      {/* neon ride accents near the core */}
      <pointLight position={[-6, 8, 4]} color="#11b3d4" intensity={20} distance={22} decay={1.6} />
      <pointLight position={[8, 6, -4]} color="#d41e11" intensity={14} distance={18} decay={1.7} />
      <pointLight position={[2, 6, 10]} color="#eeb968" intensity={10} distance={16} decay={1.7} />
    </>
  );
}

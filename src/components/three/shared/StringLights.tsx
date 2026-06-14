import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';

import { type Vec3 } from '../carnival.config';

/**
 * StringLights — strands of glowing bulbs slung across the carnival in catenary
 * sags, following both legs of the dog-leg and across the plaza. One
 * InstancedMesh (one draw call) of emissive (toneMapped-off) bulbs that Bloom
 * blooms; warm-dominant palette with cool/neon accents. Bulbs **twinkle** (gentle
 * per-bulb flicker) so the carnival reads as alive (animates on the high tier).
 */

/** Each strand = endpoints [a, b]; bulbs hang between them with a sag. */
const STRANDS: [Vec3, Vec3][] = [
  // games corridor (across the road)
  [
    [-6, 3.4, -7],
    [6, 3.4, -7],
  ],
  [
    [-6, 3.4, -13],
    [6, 3.4, -13],
  ],
  [
    [-6, 3.4, -19],
    [6, 3.4, -19],
  ],
  // food corridor (along the road, hung across)
  [
    [-12, 3.5, -20],
    [-12, 3.5, -28],
  ],
  [
    [-20, 3.5, -20],
    [-20, 3.5, -28],
  ],
  [
    [-28, 3.6, -20],
    [-28, 3.6, -28],
  ],
  // plaza (radiating across the open circle)
  [
    [-46, 4.2, -24],
    [-28, 4.2, -24],
  ],
  [
    [-37, 4.2, -32],
    [-37, 4.2, -16],
  ],
];
const COLORS = ['#ffd9a0', '#ffc070', '#7fe9ff', '#ff8fd6', '#ffe6b0'];
const BULBS_PER = 13;
const SAG = 0.7;

const dummy = new Object3D();
const tmp = new Color();

export function StringLights() {
  const ref = useRef<InstancedMesh>(null);

  const { positions, baseColors, phases, count } = useMemo(() => {
    const positions: Vec3[] = [];
    const baseColors: Color[] = [];
    const phases: number[] = [];
    STRANDS.forEach(([a, b], s) => {
      for (let i = 0; i < BULBS_PER; i++) {
        const t = i / (BULBS_PER - 1);
        const x = a[0] + (b[0] - a[0]) * t;
        const z = a[2] + (b[2] - a[2]) * t;
        const y = a[1] + (b[1] - a[1]) * t - SAG * Math.sin(t * Math.PI);
        positions.push([x, y, z]);
        baseColors.push(new Color(COLORS[(s * 2 + i) % COLORS.length]));
        phases.push((s * 1.7 + i * 0.9) % (Math.PI * 2));
      }
    });
    return { positions, baseColors, phases, count: positions.length };
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    positions.forEach((pos, i) => {
      dummy.position.set(...pos);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, baseColors[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [positions, baseColors]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh || !mesh.instanceColor) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const f = 0.8 + 0.2 * Math.sin(t * 2.2 + phases[i]);
      tmp.copy(baseColors[i]).multiplyScalar(f);
      mesh.setColorAt(i, tmp);
    }
    mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

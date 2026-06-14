import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';

/**
 * StringLights — strands of glowing bulbs slung across the carnival in catenary
 * sags, the classic fairground overhead. One InstancedMesh (one draw call) of
 * emissive (toneMapped-off) bulbs that Bloom blooms; colours cycle warm / cyan /
 * magenta / amber. Bulbs **twinkle** — a gentle per-bulb brightness flicker — so
 * the carnival reads as alive (only animates while the frameloop runs, i.e. on
 * the high tier; cheap, no real lights).
 */

interface Strand {
  z: number;
  span: number; // x from −span/2 to +span/2
  y: number;
  bulbs: number;
}

const STRANDS: Strand[] = [
  { z: -7, span: 11, y: 3.4, bulbs: 12 },
  { z: -16, span: 11, y: 3.4, bulbs: 12 },
  { z: -25, span: 12, y: 3.5, bulbs: 13 },
  { z: -34, span: 18, y: 3.9, bulbs: 18 },
  { z: -46, span: 20, y: 4.0, bulbs: 20 },
  { z: -56, span: 16, y: 3.9, bulbs: 16 },
];
const COLORS = ['#ffd9a0', '#7fe9ff', '#ff8fd6', '#ffb060'];
const SAG = 0.7;

const dummy = new Object3D();
const tmp = new Color();

export function StringLights() {
  const ref = useRef<InstancedMesh>(null);

  const { positions, baseColors, phases, count } = useMemo(() => {
    const positions: [number, number, number][] = [];
    const baseColors: Color[] = [];
    const phases: number[] = [];
    let k = 0;
    STRANDS.forEach((s) => {
      for (let i = 0; i < s.bulbs; i++) {
        const t = i / (s.bulbs - 1);
        const x = -s.span / 2 + t * s.span;
        const y = s.y - SAG * Math.sin(t * Math.PI); // catenary-ish sag
        positions.push([x, y, s.z]);
        baseColors.push(new Color(COLORS[(k + i) % COLORS.length]));
        phases.push((k * 1.7 + i * 0.9) % (Math.PI * 2));
      }
      k++;
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
      const f = 0.78 + 0.22 * Math.sin(t * 2.2 + phases[i]);
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

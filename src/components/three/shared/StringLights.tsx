import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';

import { type Vec3 } from '../carnival.config';

/**
 * StringLights — strands of glowing bulbs slung across the midway in catenary
 * sags, the classic fairground overhead. One InstancedMesh (one draw call) of
 * emissive (toneMapped-off) bulbs that Bloom blooms; colours cycle warm / cyan /
 * magenta / amber for the neon-noir palette. Self-lit only — no actual lights,
 * so it's cheap.
 */

const STRAND_Z = [-10, -18, -26, -34, -42];
const COLORS = ['#ffd9a0', '#6fe9ff', '#ff8fd6', '#ffb060'];
const BULBS_PER_STRAND = 13;
const SPAN = 11; // x from −SPAN/2 to +SPAN/2
const TOP_Y = 3.5;
const SAG = 0.6;

interface Bulb {
  position: Vec3;
  color: string;
}

export function StringLights() {
  const bulbs = useMemo<Bulb[]>(() => {
    const out: Bulb[] = [];
    STRAND_Z.forEach((z, s) => {
      for (let i = 0; i < BULBS_PER_STRAND; i++) {
        const t = i / (BULBS_PER_STRAND - 1);
        const x = -SPAN / 2 + t * SPAN;
        const y = TOP_Y - SAG * Math.sin(t * Math.PI); // catenary-ish sag
        out.push({ position: [x, y, z], color: COLORS[(s + i) % COLORS.length] });
      }
    });
    return out;
  }, []);

  return (
    <Instances limit={bulbs.length} range={bulbs.length} frustumCulled={false}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
      {bulbs.map((b, i) => (
        <Instance key={i} position={b.position} color={b.color} />
      ))}
    </Instances>
  );
}

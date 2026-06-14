import { useMemo } from 'react';

/**
 * SpaceDust — static point cloud spanning the journey's bounding volume.
 *
 * Replaces the legacy drei <Stars> (which animates every frame): a single
 * Points object over a prebuilt Float32Array, zero per-frame work — the
 * camera's flight provides all the parallax. Count is set by quality tier.
 */
interface SpaceDustProps {
  count: number;
}

/* Carnival volume — fog motes drift low over the L-shaped footprint. */
const CENTER_X = -18;
const SPREAD_X = 76;
const TOP_Y = 4.5;
const SPAN_Y = 4.4;
const FRONT_Z = 6;
const SPAN_Z = 44;

/** Deterministic PRNG (mulberry32) — render-pure and stable across re-renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function SpaceDust({ count }: SpaceDustProps) {
  const positions = useMemo(() => {
    const random = mulberry32(0x9ad8ff);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      array[i * 3] = CENTER_X + (random() - 0.5) * SPREAD_X;
      array[i * 3 + 1] = TOP_Y - random() * SPAN_Y;
      array[i * 3 + 2] = FRONT_Z - random() * SPAN_Z;
    }
    return array;
  }, [count]);

  return (
    // key remounts the buffer if the quality tier (count) changes
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        color="#cdbfa6"
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </points>
  );
}

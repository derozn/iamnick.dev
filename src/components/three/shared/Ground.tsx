import { useMemo } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';
import { type Mesh, type Material } from 'three';

const DIRT = '/models/carnival/ground-dirt.glb';
const DIRT_ROUND = '/models/carnival/ground-dirt-round.glb';

useGLTF.preload(DIRT, true);
useGLTF.preload(DIRT_ROUND, true);

/**
 * A textured ground GLB at a raw scale (NOT normalised — tiles keep real size).
 * Applies polygonOffset so the gravel always wins the depth test over the grass
 * plane below (no z-fighting / "holes" at the grazing eye-level angle).
 */
function GroundTile({ url, ...props }: ThreeElements['group'] & { url: string }) {
  const { scene } = useGLTF(url, true);
  useMemo(() => {
    scene.traverse((o) => {
      const m = (o as Mesh).material as Material | undefined;
      if (m) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -3;
        m.polygonOffsetUnits = -3;
      }
    });
  }, [scene]);
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

/* Dirt tile = corner-origin 5×5 m → at scale 0.02 a 10×10 m patch; "centred" at
 * (cx,cz) → position [cx-5, y, cz+5]. The road is an L: a games leg down x=0, a
 * food leg along z=-24, joined by a corner. Each leg sits at its own tiny y so
 * the overlap at the bend never goes coplanar (the other half of the no-holes fix). */
const GAMES_LEG: [number, number][] = [
  [0, 1],
  [0, -9],
  [0, -19],
];
const FOOD_LEG: [number, number][] = [
  [-7, -24],
  [-17, -24],
  [-27, -24],
];
const CORNER: [number, number] = [-4, -22];

/**
 * Ground — the carnival floor: a dark grass field set well below, a **textured
 * gravel road** of real Synty dirt tiles along the dog-leg, stones/leaves/grass
 * scattered over it (in carnival.config) for detail, and a dirt **plaza circle**.
 */
export function Ground() {
  return (
    <group>
      {/* Grass field — dropped well below the gravel so it can't z-fight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, -0.25, -22]} receiveShadow>
        <planeGeometry args={[160, 220]} />
        <meshStandardMaterial color="#242a23" roughness={1} metalness={0} />
      </mesh>

      {/* Gravel road — games leg, food leg (slightly higher), corner (higher still) */}
      {GAMES_LEG.map(([cx, cz], i) => (
        <GroundTile key={`g${i}`} url={DIRT} position={[cx - 5, 0, cz + 5]} scale={0.02} />
      ))}
      {FOOD_LEG.map(([cx, cz], i) => (
        <GroundTile key={`f${i}`} url={DIRT} position={[cx - 5, 0.012, cz + 5]} scale={0.02} />
      ))}
      <GroundTile url={DIRT} position={[CORNER[0] - 5, 0.024, CORNER[1] + 5]} scale={0.02} />

      {/* Dirt plaza circle */}
      <GroundTile url={DIRT_ROUND} position={[-37, 0.03, -24]} scale={0.026} />
    </group>
  );
}

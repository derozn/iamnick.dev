import { Clone, useGLTF } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';

const DIRT = '/models/carnival/ground-dirt.glb';
const DIRT_ROUND = '/models/carnival/ground-dirt-round.glb';

useGLTF.preload(DIRT, true);
useGLTF.preload(DIRT_ROUND, true);

/** A textured ground GLB placed at a raw scale (NOT normalised — tiles must keep real size). */
function GroundTile({ url, ...props }: ThreeElements['group'] & { url: string }) {
  const { scene } = useGLTF(url, true);
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

/* Dirt tile (corner origin, 5×5 m at scale 0.01). At scale 0.02 it's a 10×10 m
 * patch covering x ±5 when offset −5; lay them down the spine for the road. */
const PATH_Z = [0, -10, -20, -30, -40];

/**
 * Ground — the carnival floor: a dark grass field with a **textured dirt road**
 * running down the spine (real Synty ground tiles) and a dirt **plaza circle**
 * where the road opens out. The textured path gives the floor structure and
 * grounds the rows of stalls either side.
 */
export function Ground() {
  return (
    <group>
      {/* Grass field — extends past the fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -30]} receiveShadow>
        <planeGeometry args={[140, 220]} />
        <meshStandardMaterial color="#262c26" roughness={1} metalness={0} />
      </mesh>

      {/* Dirt road down the centre */}
      {PATH_Z.map((cz) => (
        <GroundTile key={cz} url={DIRT} position={[-5, 0, cz + 5]} scale={0.02} />
      ))}

      {/* Dirt plaza where the road opens out */}
      <GroundTile url={DIRT_ROUND} position={[0, 0.01, -52]} scale={0.024} />
    </group>
  );
}

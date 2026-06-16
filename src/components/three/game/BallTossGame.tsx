'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, type Group, type Mesh, type MeshStandardMaterial, Vector3 } from 'three';

import { useSceneStore } from '@/store/scene';
import { CM, pyramidPositions, SYNTY } from './ballTossConfig';

/**
 * BallTossGame — the in-Canvas carnival ball-toss mini-game. Mounts inside the
 * scene's <Suspense> and self-gates on store state: it only renders while the
 * visitor has stepped into the ball-toss booth (`mode === 'playing'` and
 * `activeStall === 'ball-toss'`).
 *
 * Custom lightweight physics (no physics dep): the ball is a projectile under
 * gravity, bottles are sphere-vs-box targets that topple with a hand-rolled
 * linear+angular integrator. The per-frame sim lives in refs (R3F lint forbids
 * mutating hook returns / reading ref.current in render); only summary state
 * (score / balls / phase) is mirrored to the store for the DOM HUD.
 *
 * (Step 2: spawns the static 6-bottle pyramid on the booth counter. Throw and
 * toppling land in later steps.)
 */

useGLTF.preload(`${SYNTY}SM_Prop_Milk_Bottle_01.glb`, true);

/** A cloned, game-ready milk-bottle scene + its metrics (metres, after CM scale). */
function useBottleAsset() {
  const { scene } = useGLTF(`${SYNTY}SM_Prop_Milk_Bottle_01.glb`, true);

  return useMemo(() => {
    // Raw-unit bounding box → metres. Synty props carry a black COLOR_0 vertex
    // colour that would render the bottle pure black; disable vertexColors so it
    // lights from its texture like the scene props (see InstancedPrefab).
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const height = size.y * CM;
    const radius = (Math.max(size.x, size.z) / 2) * CM;
    const baseY = box.min.y * CM; // bottle origin → base offset (≈0)

    // One clone per bottle (a <primitive> can't mount twice); 6 small meshes is fine.
    const clones = Array.from({ length: 6 }, () => {
      const c = scene.clone(true);
      c.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh && m.material) {
          for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
            (mm as MeshStandardMaterial).vertexColors = false;
          }
        }
      });
      return c;
    });

    return { clones, height, radius, baseY };
  }, [scene]);
}

export function BallTossGame() {
  const active = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'ball-toss');

  if (!active) return null;
  return <BottleStack />;
}

/** Split out so the GLB only loads (suspends) once the game is actually entered. */
function BottleStack() {
  const { clones, height, radius, baseY } = useBottleAsset();

  // Resting upright positions for the pyramid. Spacing ≈ a hair over a diameter so
  // bottles touch but don't intersect; rise ≈ height so rows stack cleanly.
  const positions = useMemo(
    () => pyramidPositions(radius * 2 + 0.012, height * 0.96),
    [radius, height],
  );

  return (
    <group>
      {clones.map((clone, i) => (
        <Bottle key={i} object={clone} position={positions[i]} baseY={baseY} />
      ))}
    </group>
  );
}

function Bottle({ object, position, baseY }: { object: Group; position: Vector3; baseY: number }) {
  // Outer group sits at the bottle's resting base; the inner content is lifted by
  // −baseY×CM and scaled cm→m so the base rests exactly on `position`.
  return (
    <group position={position}>
      <group position={[0, -baseY, 0]} scale={CM}>
        <primitive object={object} />
      </group>
    </group>
  );
}

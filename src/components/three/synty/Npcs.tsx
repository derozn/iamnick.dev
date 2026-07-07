'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  type Group,
  MeshStandardMaterial,
  type Mesh,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three';

import npcManifest from './npcManifest.json';

/**
 * Npcs — the carnival's people: Synty characters run through Mixamo (idle /
 * wave / cheer loops) and converted via scripts/convert-npcs.sh. Each entry
 * places one animated character inside an existing warm light pool (NO new
 * lights), staggered in time so the crowd doesn't move in lockstep.
 *
 * The data array is filtered against npcManifest.json (written by the convert
 * script), so characters that haven't been converted yet simply don't render —
 * this component is safe to ship before the Mixamo pass lands.
 *
 * Perf: shared Synty base atlas (drei caches by URL ⇒ zero extra VRAM), no
 * shadows, mixers pause beyond MIXER_RANGE of the camera on the high tier and
 * freeze on a natural mid-clip pose on the low tier (demand loop stays quiet).
 */

interface NpcPlacement {
  /** GLB basename in /models/npcs (CharName__AnimName). */
  file: string;
  pos: [number, number, number];
  yaw: number;
  /** Per-NPC uniform scale fix if a conversion lands off (Mixamo cm units). */
  scale?: number;
}

const NPCS: NpcPlacement[] = [
  // barker working the ball-toss stall
  { file: 'SM_Chr_Carny_01__Idle', pos: [12.1, 0.1, -9.7], yaw: 2.36 },
  // clapping visitor at the teacups
  { file: 'SM_Chr_Visitor_Male_01__Clapping', pos: [-15.5, 0.12, -3.0], yaw: -0.6 },
  // visitor taking in the entrance
  { file: 'SM_Chr_Visitor_female_01__HappyIdle', pos: [-3.3, 0.02, -27.0], yaw: 0.4 },
  // clown waving at the big-top mouth
  { file: 'SM_Chr_Clown_Male_01__Waving', pos: [0.5, 0.15, 17.9], yaw: 3.1 },
  // clown loitering by the high striker
  { file: 'SM_Chr_Clown_Female_01__Idle', pos: [-8.1, 0.1, 7.0], yaw: 1.1 },
  // the ringleader cheering by the ferris queue
  { file: 'SM_Chr_RingLeader_01__Cheering', pos: [-19.9, 0.2, 25.1], yaw: 0.2 },
  // visitor wandering the bumper cars
  { file: 'SM_Chr_Visitor_Male_01__LookingAround', pos: [26.4, 0.1, 2.0], yaw: -1.9 },
];

/** Camera distance beyond which an NPC's mixer pauses (high tier). */
const MIXER_RANGE = 45;
const SYNTY = '/models/synty/';

const available = new Set(npcManifest as string[]);
const PLACED = NPCS.filter((n) => available.has(n.file));

function Npc({
  placement,
  material,
  offset,
  high,
}: {
  placement: NpcPlacement;
  material: MeshStandardMaterial;
  offset: number;
  high: boolean;
}) {
  const { scene, animations } = useGLTF(`/models/npcs/${placement.file}.glb`);
  // SkeletonUtils.clone is mandatory for skinned meshes (a reused character —
  // Visitor_Male appears twice — must not share bone instances).
  const model = useMemo(() => {
    const c = skeletonClone(scene) as Group;
    c.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.material = material;
        m.castShadow = false;
        m.receiveShadow = false;
        // animated bounds are unreliable; cost is bounded by the pool size
        m.frustumCulled = false;
      }
    });
    return c;
  }, [scene, material]);

  const group = useRef<Group>(null);
  const { mixer, actions } = useAnimations(animations, model);
  const anchor = useMemo(() => new Vector3(...placement.pos), [placement]);

  useEffect(() => {
    const action = Object.values(actions)[0];
    if (!action) return;
    action.reset().play();
    // stagger so the crowd doesn't move in sync; low tier freezes on a pose
    mixer.setTime(offset);
    if (!high) action.paused = true;
    return () => {
      action.stop();
    };
  }, [actions, mixer, offset, high]);

  useFrame(({ camera }) => {
    if (!high) return; // low tier: statue with a natural pose
    const action = Object.values(actions)[0];
    if (action) action.paused = anchor.distanceTo(camera.position) > MIXER_RANGE;
  });

  return (
    <group
      ref={group}
      position={placement.pos}
      rotation={[0, placement.yaw, 0]}
      scale={placement.scale ?? 1}
    >
      <primitive object={model} />
    </group>
  );
}

export function Npcs({ high }: { high: boolean }) {
  // same texture object as SyntyScene's (drei caches by URL) — zero extra VRAM
  const baseAtlas = useTexture(`${SYNTY}base-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
  }) as Texture;

  const material = useMemo(
    () => new MeshStandardMaterial({ map: baseAtlas, roughness: 0.9, metalness: 0 }),
    [baseAtlas],
  );

  if (PLACED.length === 0) return null;
  return (
    <>
      {PLACED.map((p, i) => (
        <Npc
          key={`${p.file}-${i}`}
          placement={p}
          material={material}
          offset={i * 0.7}
          high={high}
        />
      ))}
    </>
  );
}

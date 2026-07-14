'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';

import { getGlowTexture } from '@/components/three/shared/glowTexture';
import {
  BOARD_CENTER,
  BOARD_DEPTH,
  BOARD_H,
  BOARD_W,
  BOARD_YAW,
  BULB_COLOR,
  BULB_INSET,
  BULB_SPACING,
  FRAME_LINE,
  SCENE_TILE_COUNT,
  TILE_GROUND,
  TILE_SIZE,
  tileGridPosition,
  type WallTile,
} from './doodleWallConfig';

/**
 * DoodleWall — the communal stall's board at the end of the Midway: a 6×4 grid
 * of the newest approved tiles, rendered as textured planes on a flat board
 * with a thin emissive frame line per tile and a practical bulb string around
 * the edge (emissive bulbs + the shared additive halo sprites — the same
 * no-composer glow the rest of the carnival uses).
 *
 * This is scenery: always mounted, visible while travelling on Full AND Lite.
 * The stall prefab itself (SM_Prop_Stall_03) is placed via EXTRA_INSTANCES in
 * sceneAdditions.ts so it gets the shared-atlas treatment; this component only
 * adds the board. Drawing happens in the DOM step-in overlay (DoodleWallHud),
 * never here.
 *
 * Tiles come from GET /api/wall; `imageUrl` is a data URI in stub mode and an
 * https Storage URL once Supabase is live — TextureLoader handles both.
 */

/** z-offsets off the board face so frame < tile, no z-fighting. */
const FRAME_Z = BOARD_DEPTH / 2 + 0.004;
const TILE_Z = BOARD_DEPTH / 2 + 0.008;
const BULB_Z = BOARD_DEPTH / 2 + 0.03;

/** Bulb centres (local x/y) strung around the board's edge. */
function bulbPositions(): [number, number][] {
  const w = BOARD_W / 2 + BULB_INSET;
  const h = BOARD_H / 2 + BULB_INSET;
  const nx = Math.max(2, Math.round((2 * w) / BULB_SPACING));
  const ny = Math.max(2, Math.round((2 * h) / BULB_SPACING));
  const pts: [number, number][] = [];
  for (let i = 0; i <= nx; i++) {
    const x = -w + (2 * w * i) / nx;
    pts.push([x, h], [x, -h]);
  }
  for (let j = 1; j < ny; j++) {
    const y = -h + (2 * h * j) / ny;
    pts.push([-w, y], [w, y]);
  }
  return pts;
}

/** One approved tile as a textured plane. Until its PNG arrives (or if it never
 *  does) the slot shows the tile-ground colour, same as an empty frame. */
function TilePlane({
  url,
  geometry,
  fallback,
}: {
  url: string;
  geometry: PlaneGeometry;
  fallback: MeshBasicMaterial;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const [tex, setTex] = useState<Texture | null>(null);

  useEffect(() => {
    let live = true;
    let loaded: Texture | null = null;
    new TextureLoader().load(
      url,
      (t) => {
        if (!live) {
          t.dispose();
          return;
        }
        // Doodles are colour data → sRGB. Orientation: TextureLoader's default
        // flipY=true matches PlaneGeometry UVs (verified by headless screenshot;
        // the GLTF atlas' flipY=false convention does NOT apply here).
        t.colorSpace = SRGBColorSpace;
        loaded = t;
        setTex(t);
        invalidate(); // Lite runs frameloop='demand' — show the tile when it lands
      },
      undefined,
      () => {
        /* failed tile → the slot stays as tile-ground; scenery degrades quietly */
      },
    );
    return () => {
      live = false;
      loaded?.dispose();
    };
  }, [url, invalidate]);

  return (
    <mesh position={[0, 0, TILE_Z]} geometry={geometry} material={tex ? undefined : fallback}>
      {/* Unlit: a tile reads like a lit board at night, independent of scene lights. */}
      {tex && <meshBasicMaterial map={tex} />}
    </mesh>
  );
}

export function DoodleWall({ bloomOn = false }: { bloomOn?: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const [tiles, setTiles] = useState<WallTile[]>([]);

  // The wall is persisted, not live — one fetch per visit is the contract.
  useEffect(() => {
    let live = true;
    fetch('/api/wall')
      .then((r) => (r.ok ? (r.json() as Promise<{ tiles: WallTile[] }>) : null))
      .then((data) => {
        if (live && data) setTiles(data.tiles.slice(0, SCENE_TILE_COUNT));
      })
      .catch(() => {
        /* offline / API down → empty frames; the stall still reads as scenery */
      });
    return () => {
      live = false;
    };
  }, []);

  // Shared geometry + materials for the 24 slots (one program, one plane).
  const shared = useMemo(
    () => ({
      tileGeom: new PlaneGeometry(TILE_SIZE, TILE_SIZE),
      frameGeom: new PlaneGeometry(TILE_SIZE + 2 * FRAME_LINE, TILE_SIZE + 2 * FRAME_LINE),
      frameMat: new MeshBasicMaterial({ color: '#ffb84d' }),
      emptyMat: new MeshBasicMaterial({ color: TILE_GROUND }),
    }),
    [],
  );
  useEffect(
    () => () => {
      shared.tileGeom.dispose();
      shared.frameGeom.dispose();
      shared.frameMat.dispose();
      shared.emptyMat.dispose();
    },
    [shared],
  );

  // Practical bulb string: instanced emissive spheres…
  const bulbs = useMemo(() => bulbPositions(), []);
  const bulbMesh = useRef<InstancedMesh>(null);
  useEffect(() => {
    const m = bulbMesh.current;
    if (!m) return;
    const mat = new Matrix4();
    bulbs.forEach(([x, y], i) => {
      mat.makeTranslation(x, y, BULB_Z);
      m.setMatrixAt(i, mat);
    });
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [bulbs, invalidate]);

  // …plus the shared additive halo sprites (the carnival's fake-bloom system).
  // Mirrors BulbGlow: with the real composer on, the halos would stack into
  // extreme HDR values, so composer on ⇒ sprites off.
  const haloGeom = useMemo(() => {
    const g = new BufferGeometry();
    const arr: number[] = [];
    for (const [x, y] of bulbs) arr.push(x, y, BULB_Z);
    g.setAttribute('position', new Float32BufferAttribute(arr, 3));
    return g;
  }, [bulbs]);
  useEffect(() => () => haloGeom.dispose(), [haloGeom]);

  return (
    <group
      position={[BOARD_CENTER[0], BOARD_CENTER[1], BOARD_CENTER[2]]}
      rotation={[0, BOARD_YAW, 0]}
    >
      {/* The board slab the tiles hang on. */}
      <mesh>
        <boxGeometry args={[BOARD_W, BOARD_H, BOARD_DEPTH]} />
        <meshStandardMaterial color="#2a2333" />
      </mesh>

      {/* Support poles down into the stall roof — the board rides above the
          awning (a lit sign carrying the wall), not floating. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (BOARD_W / 2 - 0.3), -BOARD_H / 2 - 0.55, -0.02]}>
          <cylinderGeometry args={[0.035, 0.035, 1.4, 8]} />
          <meshStandardMaterial color="#241d2c" />
        </mesh>
      ))}

      {/* The 6×4 grid — newest tile top-left, empty slots keep their frame. */}
      {Array.from({ length: SCENE_TILE_COUNT }, (_, i) => {
        const { x, y } = tileGridPosition(i);
        const tile = tiles[i];
        return (
          <group key={tile ? tile.id : `empty-${i}`} position={[x, y, 0]}>
            <mesh
              position={[0, 0, FRAME_Z]}
              geometry={shared.frameGeom}
              material={shared.frameMat}
            />
            {tile ? (
              <TilePlane
                url={tile.imageUrl}
                geometry={shared.tileGeom}
                fallback={shared.emptyMat}
              />
            ) : (
              <mesh
                position={[0, 0, TILE_Z]}
                geometry={shared.tileGeom}
                material={shared.emptyMat}
              />
            )}
          </group>
        );
      })}

      {/* Practical bulbs around the board. */}
      <instancedMesh ref={bulbMesh} args={[undefined, undefined, bulbs.length]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={BULB_COLOR} toneMapped={false} />
      </instancedMesh>
      {!bloomOn && (
        <points geometry={haloGeom} frustumCulled={false}>
          <pointsMaterial
            map={getGlowTexture()}
            color={BULB_COLOR}
            size={0.45}
            sizeAttenuation
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
            opacity={0.85}
          />
        </points>
      )}
    </group>
  );
}

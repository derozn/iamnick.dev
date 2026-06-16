'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  type BufferGeometry,
  Color,
  InstancedMesh,
  type Material,
  Matrix4,
  type Mesh,
  type MeshStandardMaterial,
  type Texture,
  Vector3,
} from 'three';

import { CM, unityTRS } from './conversion';

const WHITE = new Color('#ffffff');
const ZERO = new Matrix4().makeScale(0, 0, 0); // collapsed = covers no pixels = ~free

/** Wire the shared Synty emissive atlas onto a material so its neon pixels glow + bloom. */
function applyEmissive(mat: Material | Material[], tex: Texture, intensity: number) {
  for (const m of Array.isArray(mat) ? mat : [mat]) {
    const sm = m as MeshStandardMaterial;
    if (!sm.emissiveMap) {
      sm.emissive = WHITE;
      sm.emissiveMap = tex;
      sm.emissiveIntensity = intensity;
      sm.needsUpdate = true;
    }
  }
}

/**
 * Point a material's base map at the shared atlas. With `force`, this also replaces
 * an already-present map — almost every prop uses the same 01_A atlas but each GLB
 * embedded its OWN copy (~512² each → hundreds of MB of VRAM across 255 prefabs).
 * Sharing one texture dedupes that, the big lever against context-loss flicker.
 */
function applyBase(mat: Material | Material[], tex: Texture, force: boolean) {
  for (const m of Array.isArray(mat) ? mat : [mat]) {
    const sm = m as MeshStandardMaterial;
    if (force || !sm.map) {
      sm.map = tex;
      sm.color = WHITE;
      sm.needsUpdate = true;
    }
  }
}

const cmScale = new Matrix4().makeScale(CM, CM, CM);

interface SubMesh {
  geometry: BufferGeometry;
  material: Material | Material[];
  base: Matrix4; // cm-scale × mesh-world-within-GLB
}

/**
 * InstancedPrefab — renders every placement of one Synty prefab as InstancedMesh(es).
 * A prefab GLB may contain several sub-meshes; each becomes its own InstancedMesh
 * sharing the prefab's instance list, so the whole demo (2.8k props) draws in a
 * few hundred calls instead of thousands of clones.
 *
 * **Distance culling:** with `cullDist` set, instances past that radius from the
 * camera are collapsed to a zero matrix (drawn but cover no pixels), so the fog's
 * far edge isn't paying full fragment cost. Visibility is tracked per instance and
 * the GPU buffer only re-uploads when something actually crosses the boundary.
 */
interface InstancedPrefabProps {
  url: string;
  transforms: number[][];
  emissive?: Texture;
  emissiveIntensity?: number;
  /** Shared base atlas, applied to any material the conversion left untextured. */
  baseAtlas?: Texture;
  /** Replace this prefab's own atlas copy with the shared one (dedup VRAM). */
  shareAtlas?: boolean;
  cullDist?: number;
  /** Push these surfaces toward camera in depth — decals/posters sit coplanar on walls and z-fight. */
  polygonOffset?: boolean;
}

export function InstancedPrefab({
  url,
  transforms,
  emissive,
  emissiveIntensity = 3,
  baseAtlas,
  shareAtlas = false,
  cullDist,
  polygonOffset = false,
}: InstancedPrefabProps) {
  const { scene } = useGLTF(url, true);

  const subs = useMemo<SubMesh[]>(() => {
    scene.updateWorldMatrix(true, true);
    const out: SubMesh[] = [];
    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && m.geometry) {
        // Some props (the candyfloss cart, train, mine carts, pie wall, dunk tank…)
        // carry a COLOR_0 vertex-colour attribute that is black. glTF auto-enables
        // vertexColors, so the shader multiplies the texture by that black colour and
        // the prop renders pure black despite a perfectly good map/UVs. Disable
        // vertexColors so they light naturally from their texture like every other
        // prop. (Synty props get all their colour from the atlas, never vertex colour.)
        for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
          (mm as MeshStandardMaterial).vertexColors = false;
        }
        if (baseAtlas) applyBase(m.material, baseAtlas, shareAtlas);
        if (emissive) applyEmissive(m.material, emissive, emissiveIntensity);
        if (polygonOffset) {
          for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
            mm.polygonOffset = true;
            mm.polygonOffsetFactor = -2;
            mm.polygonOffsetUnits = -2;
          }
        }
        m.geometry.computeVertexNormals(); // conversion flipped some normals -> black
        out.push({
          geometry: m.geometry,
          material: m.material,
          base: new Matrix4().multiplyMatrices(cmScale, m.matrixWorld),
        });
      }
    });
    return out;
  }, [scene, emissive, emissiveIntensity, baseAtlas, shareAtlas, polygonOffset]);

  // Per-instance world matrices (one row per sub) + a shared prop-origin position
  // (the transform's translation — submesh offsets are negligible at cull range).
  const { mats, origin } = useMemo(() => {
    const u = new Matrix4();
    const origin = transforms.map((t) => {
      unityTRS(t, u);
      return new Vector3().setFromMatrixPosition(u);
    });
    const mats = subs.map((s) =>
      transforms.map((t) => {
        unityTRS(t, u);
        return new Matrix4().multiplyMatrices(u, s.base);
      }),
    );
    return { mats, origin };
  }, [subs, transforms]);

  const refs = useRef<(InstancedMesh | null)[]>([]);
  const vis = useRef<Uint8Array>(new Uint8Array(0));
  const lastCam = useRef(new Vector3(Infinity, 0, 0));

  useLayoutEffect(() => {
    vis.current = new Uint8Array(transforms.length).fill(1);
    lastCam.current.set(Infinity, 0, 0);
    subs.forEach((_, s) => {
      const im = refs.current[s];
      if (!im) return;
      for (let i = 0; i < transforms.length; i++) im.setMatrixAt(i, mats[s][i]);
      im.instanceMatrix.needsUpdate = true;
    });
  }, [subs, mats, transforms]);

  useFrame(({ camera }) => {
    if (!cullDist) return;
    const cp = camera.position;
    if (cp.distanceToSquared(lastCam.current) < 4) return; // only re-cull when the camera moves
    lastCam.current.copy(cp);
    const seen = vis.current;
    const cd2 = cullDist * cullDist;
    let changed = false;
    for (let i = 0; i < origin.length; i++) {
      const v = origin[i].distanceToSquared(cp) < cd2 ? 1 : 0;
      if (v === seen[i]) continue;
      seen[i] = v;
      changed = true;
      for (let s = 0; s < subs.length; s++) {
        refs.current[s]?.setMatrixAt(i, v ? mats[s][i] : ZERO);
      }
    }
    if (changed) {
      for (let s = 0; s < subs.length; s++) {
        const im = refs.current[s];
        if (im) im.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {subs.map((s, i) => (
        <instancedMesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          args={[s.geometry, s.material as Material, transforms.length]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

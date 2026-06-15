'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
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
} from 'three';

import { CM, unityTRS } from './conversion';

const WHITE = new Color('#ffffff');

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
 */
interface InstancedPrefabProps {
  url: string;
  transforms: number[][];
  emissive?: Texture;
  emissiveIntensity?: number;
}

export function InstancedPrefab({
  url,
  transforms,
  emissive,
  emissiveIntensity = 1.8,
}: InstancedPrefabProps) {
  const { scene } = useGLTF(url, true);

  const subs = useMemo<SubMesh[]>(() => {
    scene.updateWorldMatrix(true, true);
    const out: SubMesh[] = [];
    scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && m.geometry) {
        if (emissive) applyEmissive(m.material, emissive, emissiveIntensity);
        out.push({
          geometry: m.geometry,
          material: m.material,
          base: new Matrix4().multiplyMatrices(cmScale, m.matrixWorld),
        });
      }
    });
    return out;
  }, [scene, emissive, emissiveIntensity]);

  return (
    <>
      {subs.map((s, i) => (
        <Sub key={i} sub={s} transforms={transforms} />
      ))}
    </>
  );
}

function Sub({ sub, transforms }: { sub: SubMesh; transforms: number[][] }) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    const u = new Matrix4();
    const m = new Matrix4();
    for (let i = 0; i < transforms.length; i++) {
      unityTRS(transforms[i], u);
      m.multiplyMatrices(u, sub.base);
      im.setMatrixAt(i, m);
    }
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [sub, transforms]);

  return (
    <instancedMesh
      ref={ref}
      args={[sub.geometry, sub.material as Material, transforms.length]}
      frustumCulled={false}
    />
  );
}

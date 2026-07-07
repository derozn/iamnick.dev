'use client';

import { useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  type Texture,
  Vector3,
} from 'three';

import demoInstances from './demo-instances.json';
import { unityTRS } from './conversion';
import { entries } from './SyntyScene';
import { SPINNERS } from './AnimatedRides';
import {
  CM_SCALE,
  extractBulbs,
  getGlowTexture,
  makeSampler,
  type Sampler,
} from './bulbGlowExtract';

const SYNTY = '/models/synty/';
const data = demoInstances as Record<string, number[][]>;

/**
 * BulbGlow — additive halo sprites at every bulb in the scene, so the carnival
 * glows at night WITHOUT a full-screen Bloom pass (the EffectComposer was the
 * flicker source). One <points> cloud per prefab, placed at each instance; prefabs
 * with no bulbs render nothing. The spinning rides are included at their rest pose —
 * their halo ring stays put while the bulbs travel through it, which reads fine for
 * a slow spin.
 */

function PrefabGlow({
  url,
  transforms,
  sample,
  opacity,
}: {
  url: string;
  transforms: number[][];
  sample: Sampler;
  opacity: number;
}) {
  const { scene } = useGLTF(url, true);

  const geometry = useMemo(() => {
    const { positions, colors } = extractBulbs(scene, sample);
    if (positions.length === 0) return null;

    const wp: number[] = [];
    const wc: number[] = [];
    const m = new Matrix4();
    const v = new Vector3();
    for (const t of transforms) {
      // world = unityTRS(t) · cmScale · rawVertex
      m.multiplyMatrices(unityTRS(t, new Matrix4()), CM_SCALE);
      for (let i = 0; i < positions.length; i += 3) {
        v.set(positions[i], positions[i + 1], positions[i + 2]).applyMatrix4(m);
        wp.push(v.x, v.y, v.z);
        wc.push(colors[i], colors[i + 1], colors[i + 2]);
      }
    }

    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(wp, 3));
    g.setAttribute('color', new Float32BufferAttribute(wc, 3));
    return g;
  }, [scene, transforms, sample]);

  if (!geometry) return null;
  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={getGlowTexture()}
        size={0.6}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        opacity={opacity}
      />
    </points>
  );
}

export function BulbGlow({ bloomOn = false }: { bloomOn?: boolean }) {
  const emissive = useTexture(`${SYNTY}emissive-atlas.png`) as Texture;
  const sample = useMemo(() => {
    const img = emissive.image as
      | (CanvasImageSource & { width: number; height: number })
      | undefined;
    return img && img.width ? makeSampler(img) : null;
  }, [emissive]);

  // static scene prefabs + the spinning rides at their rest pose
  const list = useMemo<[string, number[][]][]>(
    () => [...entries, ...SPINNERS.map((s) => [s.prefab, data[s.prefab]] as [string, number[][]])],
    [],
  );

  // With the real bloom pass on, these sprites are redundant (they exist to FAKE
  // bloom) — and worse: at overview zoom hundreds of additive, un-tone-mapped
  // halos stack in the same pixels into extreme HDR values that the bloom
  // mipmap-blur chain smears into a black frame. Composer on ⇒ sprites off.
  if (bloomOn || !sample) return null;
  return (
    <>
      {list.map(([name, transforms]) => (
        <PrefabGlow
          key={name}
          url={`${SYNTY}${name}.glb`}
          transforms={transforms}
          sample={sample}
          opacity={0.9}
        />
      ))}
    </>
  );
}

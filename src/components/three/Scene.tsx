'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { ScrollDriver } from './ScrollDriver';
import { SyntyScene } from './synty/SyntyScene';
import { SyntyCamera } from './synty/SyntyCamera';
import { DynamicLights } from './synty/DynamicLights';
import { AttractionOutlines } from './synty/AttractionOutlines';
import { PostFX } from './effects/PostFX';
import { type QualityTier } from './hooks/useQualityTier';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Deep neon-night — the demo geometry, our Dark Carnival mood over it. */
const FOG = '#0e0b1c';

/**
 * Scene — the single persistent R3F canvas: a faithful translation of the Synty
 * "POLYGON Horror Carnival" Demo scene (2.8k props, the demo's own lighting/fog),
 * revealed by a scroll-driven cinematic camera.
 */
export default function Scene({ tier }: SceneProps) {
  const high = tier === 'high';
  // Tighter fog on weaker GPUs both clears visual clutter and lets us cull the
  // props past it. cullDist is set just beyond where the fog reads near-opaque,
  // so collapsed (culled) instances are never visibly missing.
  const fogDensity = high ? 0.03 : 0.042;
  const cullDist = high ? 62 : 46;

  return (
    <Canvas
      frameloop="demand"
      dpr={high ? [1, 1.5] : [1, 1.25]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.45,
      }}
      camera={{ fov: 62, near: 0.3, far: 200, position: [-1.9, 3.4, -37] }}
    >
      <color attach="background" args={[FOG]} />
      <fogExp2 attach="fog" args={[FOG, fogDensity]} />

      <DynamicLights pool={high ? 8 : 4} />
      <ScrollDriver />
      <SyntyCamera />

      <Suspense fallback={null}>
        <SyntyScene cullDist={cullDist} />
      </Suspense>

      <AttractionOutlines />

      {high && <PostFX />}
    </Canvas>
  );
}

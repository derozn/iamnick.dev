'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { ScrollDriver } from './ScrollDriver';
import { SyntyScene } from './synty/SyntyScene';
import { SyntyCamera } from './synty/SyntyCamera';
import { DemoLighting } from './synty/DemoLighting';
import { AttractionMarkers } from './synty/AttractionMarkers';
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
  return (
    <Canvas
      frameloop="demand"
      dpr={tier === 'high' ? [1, 1.5] : [1, 1.25]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.45,
      }}
      camera={{ fov: 60, near: 0.3, far: 800, position: [50, 40, 60] }}
    >
      <color attach="background" args={[FOG]} />
      <fogExp2 attach="fog" args={[FOG, 0.011]} />

      <DemoLighting warmCap={tier === 'high' ? 40 : 16} />
      <ScrollDriver />
      <SyntyCamera />

      <Suspense fallback={null}>
        <SyntyScene />
      </Suspense>

      <AttractionMarkers />

      {tier === 'high' && <PostFX />}
    </Canvas>
  );
}

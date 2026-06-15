'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { ScrollDriver } from './ScrollDriver';
import { SyntyScene } from './synty/SyntyScene';
import { SyntyCamera } from './synty/SyntyCamera';
import { DemoLighting } from './synty/DemoLighting';
import { type QualityTier } from './hooks/useQualityTier';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Demo fog/background, translated from Demo.unity RenderSettings. */
const FOG = '#324566';

/**
 * Scene — the single persistent R3F canvas: a faithful translation of the Synty
 * "POLYGON Horror Carnival" Demo scene (2.8k props, the demo's own lighting/fog),
 * revealed by a scroll-driven cinematic camera.
 */
export default function Scene({ tier }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.25,
      }}
      camera={{ fov: 60, near: 0.3, far: 800, position: [50, 40, 60] }}
    >
      <color attach="background" args={[FOG]} />
      <fogExp2 attach="fog" args={[FOG, 0.014]} />

      <DemoLighting warmCap={tier === 'high' ? 26 : 12} />
      <ScrollDriver />
      <SyntyCamera />

      <Suspense fallback={null}>
        <SyntyScene />
      </Suspense>
    </Canvas>
  );
}

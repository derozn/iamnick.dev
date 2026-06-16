'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { SyntyScene } from './synty/SyntyScene';
import { AnimatedRides } from './synty/AnimatedRides';
import { IsoControls } from './synty/IsoControls';
import { Indicators } from './synty/Indicators';
import { DynamicLights } from './synty/DynamicLights';
import { type QualityTier } from './hooks/useQualityTier';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Deep neon-night — the demo geometry, our Dark Carnival mood over it. */
const FOG = '#0e0b1c';

/**
 * Scene — the single persistent R3F canvas. A faithful translation of the Synty
 * "POLYGON Horror Carnival" Demo scene, explored Bruno-Simon-style: a fixed
 * isometric camera the visitor drags/zooms around, with floating indicators that
 * fly the camera in to each structure's content.
 */
export default function Scene({ tier }: SceneProps) {
  const high = tier === 'high';
  // Light atmospheric fog only — the iso overview needs to read the whole scene
  // (no per-instance distance culling here; the camera sees everything).
  const fogDensity = high ? 0.01 : 0.016;

  return (
    <Canvas
      // Render continuously on high tier (smooth drag + ride spin); low tier renders
      // on demand to save power. (No post-processing — the EffectComposer was the
      // source of the black-flicker/context-loss, so the bulbs glow from emissive.)
      frameloop={high ? 'always' : 'demand'}
      // Cap the render resolution — fragment cost (scene + Bloom) scales with the
      // pixel count, so on a retina display this is the biggest lever against the
      // move/scroll lag + context-loss flicker.
      dpr={high ? [1, 1.25] : 1}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.45,
      }}
      // Low fov flattens perspective for the isometric read; IsoControls drives it.
      camera={{ fov: 34, near: 0.5, far: 400, position: [40, 44, 40] }}
    >
      <color attach="background" args={[FOG]} />
      <fogExp2 attach="fog" args={[FOG, fogDensity]} />

      <DynamicLights pool={high ? 8 : 4} />
      <IsoControls />

      <Suspense fallback={null}>
        <SyntyScene />
        <AnimatedRides />
      </Suspense>

      <Indicators />
    </Canvas>
  );
}

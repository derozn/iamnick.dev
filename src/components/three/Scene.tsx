'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { CameraRig } from './CameraRig';
import { ScrollDriver } from './ScrollDriver';
import { MidwayWorld } from './MidwayWorld';
import { SceneLighting } from './shared/SceneLighting';
import { type QualityTier } from './hooks/useQualityTier';
import { BACKGROUND_COLOR, FOG_FAR, FOG_NEAR, MIDWAY_ATTRACTIONS } from './midway.config';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Initial camera = the entrance attraction's desktop control point (CameraRig snaps on first frame). */
const entrance = MIDWAY_ATTRACTIONS[0];
const INITIAL_CAMERA: [number, number, number] = [
  entrance.position[0] + entrance.camOffset.desktop[0],
  entrance.position[1] + entrance.camOffset.desktop[1],
  entrance.position[2] + entrance.camOffset.desktop[2],
];

/**
 * Scene — the single persistent R3F canvas behind the page.
 *
 * frameloop="demand": frames render only when ScrollDriver/CameraRig
 * invalidate (scroll, resize, damping convergence) — idle costs nothing.
 */
export default function Scene({ tier }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        // AgX rolls saturated neon highlights off smoothly where ACES clips
        // them to white — keeps the signs readable instead of blown pink.
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{ fov: 50, near: 0.1, far: 60, position: INITIAL_CAMERA }}
    >
      <color attach="background" args={[BACKGROUND_COLOR]} />
      <fog attach="fog" args={[BACKGROUND_COLOR, FOG_NEAR, FOG_FAR]} />

      <SceneLighting tier={tier} />
      <ScrollDriver />
      <CameraRig />

      <Suspense fallback={null}>
        <MidwayWorld tier={tier} />
      </Suspense>
    </Canvas>
  );
}

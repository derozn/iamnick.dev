'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { CameraRig } from './CameraRig';
import { ScrollDriver } from './ScrollDriver';
import { JourneyWorld } from './JourneyWorld';
import { SceneLighting } from './shared/SceneLighting';
import { type QualityTier } from './hooks/useQualityTier';
import { BACKGROUND_COLOR, FOG_FAR, FOG_NEAR, JOURNEY_STOPS } from './journey.config';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Initial camera = hero stop's desktop control point (CameraRig snaps on first frame). */
const heroStop = JOURNEY_STOPS[0];
const INITIAL_CAMERA: [number, number, number] = [
  heroStop.position[0] + heroStop.camOffset.desktop[0],
  heroStop.position[1] + heroStop.camOffset.desktop[1],
  heroStop.position[2] + heroStop.camOffset.desktop[2],
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
        <JourneyWorld tier={tier} />
      </Suspense>
    </Canvas>
  );
}

'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgXToneMapping } from 'three';

import { FirstPersonRig } from './FirstPersonRig';
import { ScrollDriver } from './ScrollDriver';
import { CarnivalStreet } from './CarnivalStreet';
import { SceneLighting } from './shared/SceneLighting';
import { type QualityTier } from './hooks/useQualityTier';
import {
  BACKGROUND_COLOR,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  EYE_HEIGHT,
  FOG_FAR,
  FOG_NEAR,
  START_Z,
} from './carnival.config';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Initial camera = the start of the street at eye level (FirstPersonRig snaps on first frame). */
const INITIAL_CAMERA: [number, number, number] = [0, EYE_HEIGHT, START_Z];

/**
 * Scene — the single persistent R3F canvas behind the page: a first-person walk
 * down the Dark Carnival midway.
 *
 * frameloop="demand": frames render only when ScrollDriver/FirstPersonRig
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
        // AgX rolls saturated neon highlights off smoothly where ACES clips them.
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
        position: INITIAL_CAMERA,
      }}
    >
      <color attach="background" args={[BACKGROUND_COLOR]} />
      <fog attach="fog" args={[BACKGROUND_COLOR, FOG_NEAR, FOG_FAR]} />

      <SceneLighting tier={tier} />
      <ScrollDriver />
      <FirstPersonRig />

      <Suspense fallback={null}>
        <CarnivalStreet tier={tier} />
      </Suspense>
    </Canvas>
  );
}

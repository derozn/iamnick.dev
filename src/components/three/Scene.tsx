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
  CAMERA_PATH,
  FOG_FAR,
  FOG_NEAR,
} from './carnival.config';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Initial camera = the start of the path (FirstPersonRig snaps on first frame). */
const INITIAL_CAMERA: [number, number, number] = CAMERA_PATH[0];

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
      // High tier renders continuously so the string lights twinkle; low tier
      // stays demand-driven (renders only while scrolling) to save battery.
      frameloop={tier === 'high' ? 'always' : 'demand'}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        // AgX rolls saturated neon highlights off smoothly where ACES clips them.
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.4,
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

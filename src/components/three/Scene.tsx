'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';

import { useSceneStore } from '@/store/scene';
import { SyntyScene } from './synty/SyntyScene';
import { AnimatedRides } from './synty/AnimatedRides';
import { BulbGlow } from './synty/BulbGlow';
import { IsoControls } from './synty/IsoControls';
import { Indicators } from './synty/Indicators';
import { DynamicLights } from './synty/DynamicLights';
import { BallTossGame } from './game/BallTossGame';
import { type QualityTier } from './hooks/useQualityTier';

interface SceneProps {
  tier: Exclude<QualityTier, 'none'>;
}

/* Night-haze indigo. NB this is BOTH the background and the fog colour, and it
 * must be noticeably *lighter* than the dark geometry: exp² fog fades distant
 * objects toward this colour, so a near-black value (the old #0e0b1c) just sinks
 * the far scene into darkness — reading as the lights dimming as you zoom, not as
 * haze. A luminous dusk-indigo makes the far edge fade into visible atmosphere
 * (aerial perspective) for real depth, while near props stay crisp + moody. */
const FOG = '#2b2f57';

/**
 * Scene — the single persistent R3F canvas. A faithful translation of the Synty
 * "POLYGON Horror Carnival" Demo scene, explored Bruno-Simon-style: a fixed
 * isometric camera the visitor drags/zooms around, with floating indicators that
 * fly the camera in to each structure's content.
 */
export default function Scene({ tier }: SceneProps) {
  const high = tier === 'high';
  // Atmospheric fog for depth — paired with the luminous FOG colour above and the
  // capped zoom-out, the far edge of the carnival fades into haze (not darkness),
  // while near props stay crisp because exp² fog is light up close.
  const fogDensity = high ? 0.019 : 0.025;

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
        // ACES Filmic for the promo's punchy, saturated firelight (AgX read too
        // flat/desaturated for the warm-pool look). Exposure trimmed to suit.
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
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
        <BulbGlow />
        <BallTossGame />
        {/* A child of Suspense: it only mounts once all the GLBs/textures above
            have loaded, so it's a reliable "scene is ready" signal for the intro. */}
        <SceneReady />
      </Suspense>

      <Indicators />
    </Canvas>
  );
}

/** Flips the store's `sceneReady` once the Suspense tree above has resolved (all
 *  assets loaded), so the intro overlay can swap its loading screen for the
 *  "click to start" prompt over the framed scene. */
function SceneReady() {
  const setSceneReady = useSceneStore((s) => s.setSceneReady);
  useEffect(() => {
    setSceneReady(true);
    return () => setSceneReady(false);
  }, [setSceneReady]);
  return null;
}

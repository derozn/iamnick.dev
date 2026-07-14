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
import { HighStrikerGame } from './game/HighStrikerGame';
import { DoodleWall } from './game/DoodleWall';
import { SafePostFX } from './effects/SafePostFX';
import { LoaderVeil } from './intro/LoaderVeil';
import { Atmosphere } from './synty/Atmosphere';
import { GoldenTickets } from './tickets/GoldenTickets';
import { Npcs } from './synty/Npcs';
import { ConfettiBurst } from './effects/ConfettiBurst';
import { type QualityTier } from './hooks/useQualityTier';
import { useDebugGates } from './hooks/useDebugGates';

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
  // The composer may only mount once the loading veil has fully dissolved: its
  // final pass re-encodes the veil's raw shader colours (linear → ACES → sRGB),
  // washing the letterpress dark into grey-blue. Bloom ramping in as the iris
  // finishes doubles as the "lights come alive" beat.
  const veilDone = useSceneStore((s) => s.veilDone);
  // Debug bisection gates (?off/?offp) + the mount-time bloom decision (?bloom=0).
  // Bloom is ON by default on high tier — the historical black-frame (zero-length
  // normals → shader NaN → mipmap-blur smear) is fixed by sanitizeNormals in
  // InstancedPrefab; SafePostFX's context-loss tripwire persists a flag so a lost
  // context runs composer-free until reload.
  const { dbg, bloomOn } = useDebugGates(high);
  // Atmospheric fog for depth — paired with the luminous FOG colour above and the
  // capped zoom-out, the far edge of the carnival fades into haze (not darkness),
  // while near props stay crisp because exp² fog is light up close.
  const fogDensity = high ? 0.019 : 0.025;

  return (
    <Canvas
      // Render continuously on high tier (smooth drag + ride spin); low tier renders
      // on demand to save power. (Post-processing is back, but only on high tier and
      // behind SafePostFX's context-loss tripwire — see that component.)
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

      {/* Pool size is the SAME on both tiers: 8 forward point lights are cheap
          (the historical crash was ~37), and halving the pool on small viewports
          made whole areas drop their light when the tier flipped on resize. */}
      {!dbg.off.has('lights') && <DynamicLights pool={8} />}
      <IsoControls />
      {bloomOn && veilDone && !dbg.off.has('postfx') && <SafePostFX />}
      {/* In-canvas shader loading screen — outside Suspense so it renders (and
          reports real progress) while the GLBs below stream in. */}
      <LoaderVeil />

      <Suspense fallback={null}>
        {!dbg.off.has('atmo') && <Atmosphere high={high} />}
        {!dbg.off.has('synty') && <SyntyScene bloomOn={bloomOn} exclude={dbg.offp} />}
        {!dbg.off.has('rides') && <AnimatedRides bloomOn={bloomOn} />}
        {!dbg.off.has('glow') && <BulbGlow bloomOn={bloomOn} />}
        {!dbg.off.has('game') && <BallTossGame />}
        {!dbg.off.has('game') && <HighStrikerGame />}
        {/* Scenery, not gated on mode: the tile board shows while travelling. */}
        {!dbg.off.has('game') && <DoodleWall bloomOn={bloomOn} />}
        {!dbg.off.has('tickets') && <GoldenTickets bloomOn={bloomOn} />}
        <ConfettiBurst />
        {/* A child of Suspense: it only mounts once all the GLBs/textures above
            have loaded, so it's a reliable "scene is ready" signal for the intro. */}
        <SceneReady />
      </Suspense>

      {/* NPCs stream in AFTER the intro is ready (separate Suspense — they must
          not delay sceneReady/the loading screen). Renders nothing until the
          Mixamo conversion pass fills npcManifest.json. */}
      <Suspense fallback={null}>{!dbg.off.has('npcs') && <Npcs high={high} />}</Suspense>

      {!dbg.off.has('indicators') && <Indicators />}
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

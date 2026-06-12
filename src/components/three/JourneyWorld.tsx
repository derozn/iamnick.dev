import { useGLTF } from '@react-three/drei';

import { type QualityTier } from './hooks/useQualityTier';
import {
  DUST_COUNT_HIGH,
  DUST_COUNT_LOW,
  JOURNEY_STOPS,
  type JourneyStop,
  type StopId,
} from './journey.config';
import { HeroIsland } from './islands/HeroIsland';
import { Island, IslandProp } from './islands/Island';
import { PlatformLarge, PlatformLong, PlatformSmall } from './shared/Platforms';
import { SpaceDust } from './shared/SpaceDust';
import { PostFX } from './effects/PostFX';

const stop = Object.fromEntries(JOURNEY_STOPS.map((s) => [s.id, s])) as Record<StopId, JourneyStop>;

/* Decoration GLBs — themed per role island, ≤4 props each. */
const MODELS = {
  computerLarge: '/models/Computer Large.glb',
  computer: '/models/Computer.glb',
  antenna: '/models/Antenna.glb',
  antennaAlt: '/models/Antenna-OuHQCigiUR.glb',
  lootbox: '/models/Lootbox.glb',
  door: '/models/Door.glb',
  signs: '/models/Cyberpunk Signs.glb',
  acStacked: '/models/Ac Stacked.glb',
  streetlight: '/models/Streetlight.glb',
  gear: '/models/Collectible Gear.glb',
  tv: '/models/TV.glb',
} as const;

Object.values(MODELS).forEach((url) => useGLTF.preload(url));

interface JourneyWorldProps {
  tier: Exclude<QualityTier, 'none'>;
}

/**
 * JourneyWorld — every island placed at its journey.config position, plus
 * space dust spanning the whole path and (high tier only) the bloom pass.
 * The scene is small enough to keep fully resident; default frustum culling
 * skips off-screen islands and no island does per-frame work.
 */
export function JourneyWorld({ tier }: JourneyWorldProps) {
  return (
    <>
      {/* Stop 1 — hero: legacy Interactive Hero composition */}
      <HeroIsland position={stop.hero.position} scale={stop.hero.scale} />

      {/* Stop 2 — Travelex: global comms (big computer + antenna) */}
      <Island
        position={stop.travelex.position}
        scale={stop.travelex.scale}
        label="TRAVELEX"
        floatSpeed={1}
      >
        <PlatformLarge />
        <PlatformSmall position={[0.42, -0.1, 0.12]} rotation={[0, Math.PI / 3, 0]} />
        <IslandProp
          url={MODELS.computerLarge}
          position={[-0.06, 0, -0.04]}
          rotation={[0, Math.PI / 6, 0]}
        />
        <IslandProp
          url={MODELS.antenna}
          position={[0.12, 0, 0.08]}
          rotation={[0, -Math.PI / 4, 0]}
        />
      </Island>

      {/* Stop 3 — LICK: retail/store front (door, lootbox, neon signs) */}
      <Island position={stop.lick.position} scale={stop.lick.scale} label="LICK" floatSpeed={0.85}>
        <PlatformLarge rotation={[0, -Math.PI / 5, 0]} />
        <PlatformLong position={[-0.12, 0.18, -0.38]} rotation={[0, Math.PI / 2, 0]} />
        <IslandProp url={MODELS.door} position={[-0.05, 0, -0.12]} rotation={[0, Math.PI / 8, 0]} />
        <IslandProp
          url={MODELS.lootbox}
          position={[0.1, 0, 0.08]}
          rotation={[0, -Math.PI / 3, 0]}
        />
        <IslandProp url={MODELS.signs} position={[0.16, 0, -0.1]} rotation={[0, -Math.PI / 6, 0]} />
      </Island>

      {/* Stop 4 — Gousto: kitchen ops (computer + stacked AC units) */}
      <Island
        position={stop.gousto.position}
        scale={stop.gousto.scale}
        label="GOUSTO"
        floatSpeed={1.1}
      >
        <PlatformLarge rotation={[0, Math.PI / 7, 0]} />
        <PlatformSmall position={[-0.4, -0.06, -0.16]} rotation={[0, -Math.PI / 5, 0]} />
        <IslandProp
          url={MODELS.computer}
          position={[0.06, 0, 0.02]}
          rotation={[0, -Math.PI / 8, 0]}
        />
        <IslandProp
          url={MODELS.acStacked}
          position={[-0.1, 0, -0.1]}
          rotation={[0, Math.PI / 5, 0]}
        />
      </Island>

      {/* Stop 5 — earlier roles: small waypoint */}
      <Island position={stop.earlier.position} scale={stop.earlier.scale} floatSpeed={0.8}>
        <PlatformSmall rotation={[0, Math.PI / 4, 0]} />
        <IslandProp
          url={MODELS.streetlight}
          position={[0.05, 0, -0.04]}
          rotation={[0, Math.PI, 0]}
        />
      </Island>

      {/* Stop 6 — side projects */}
      <Island position={stop.projects.position} scale={stop.projects.scale} floatSpeed={1.05}>
        <PlatformSmall rotation={[0, -Math.PI / 6, 0]} />
        <IslandProp url={MODELS.gear} position={[0, 0.08, 0]} />
      </Island>

      {/* Stop 7 — about */}
      {/* TODO(phase-5): FaceParticles (src/modules/Interactive/Portrait) hooks in here. */}
      <Island position={stop.about.position} scale={stop.about.scale} floatSpeed={0.9}>
        <PlatformSmall rotation={[0, Math.PI / 3, 0]} />
        <IslandProp url={MODELS.tv} position={[0.02, 0, -0.02]} rotation={[0, -Math.PI / 12, 0]} />
      </Island>

      {/* Stop 8 — contact: broadcast antenna */}
      <Island position={stop.contact.position} scale={stop.contact.scale} floatSpeed={1}>
        <PlatformSmall />
        <IslandProp url={MODELS.antennaAlt} position={[0, 0, 0]} rotation={[0, Math.PI / 5, 0]} />
      </Island>

      <SpaceDust count={tier === 'high' ? DUST_COUNT_HIGH : DUST_COUNT_LOW} />

      {tier === 'high' && <PostFX />}
    </>
  );
}

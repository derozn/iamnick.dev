import { useGLTF } from '@react-three/drei';

import { type QualityTier } from './hooks/useQualityTier';
import {
  DUST_COUNT_HIGH,
  DUST_COUNT_LOW,
  MIDWAY_ATTRACTIONS,
  type AttractionId,
  type MidwayAttraction,
} from './midway.config';
import { Attraction } from './attractions/Attraction';
import { CarnivalProp } from './attractions/CarnivalProp';
import { SpaceDust } from './shared/SpaceDust';
import { PostFX } from './effects/PostFX';

const at = Object.fromEntries(MIDWAY_ATTRACTIONS.map((a) => [a.id, a])) as Record<
  AttractionId,
  MidwayAttraction
>;

/* Converted neutral Synty funfair GLBs (FBX→GLB, neutral assets only — ADR-0005). */
const MODELS = {
  entrance: '/models/carnival/entrance.glb',
  ticketBooth: '/models/carnival/ticket-booth.glb',
  stall01: '/models/carnival/stall-01.glb',
  stall02: '/models/carnival/stall-02.glb',
  tent: '/models/carnival/tent.glb',
  tentLarge: '/models/carnival/tent-large.glb',
  ferrisWheel: '/models/carnival/ferris-wheel.glb',
  highStriker: '/models/carnival/high-striker.glb',
} as const;

Object.values(MODELS).forEach((url) => useGLTF.preload(url, true));

interface MidwayWorldProps {
  tier: Exclude<QualityTier, 'none'>;
}

/**
 * MidwayWorld — the on-rails Dark Carnival, every attraction placed at its
 * midway.config position and dressed with a converted neutral Synty funfair
 * prop, normalised onto the spine. The neon-noir rig + fog + dust + bloom give
 * the abandoned-funfair-at-night read; a ferris wheel sits deep in the fog as a
 * persistent skyline landmark.
 *
 * Career Highlights run earliest → present: `earlier` opens, `travelex` (current
 * role) closes. Neon signs are decorative duplicates of the DOM headings (ADR-0003).
 *
 * Scene is small enough to keep fully resident; default frustum culling skips
 * off-screen attractions and none does per-frame work.
 */
export function MidwayWorld({ tier }: MidwayWorldProps) {
  return (
    <>
      {/* Ferris-wheel skyline landmark — deep in the fog, angled toward the path */}
      <CarnivalProp
        url={MODELS.ferrisWheel}
        targetSize={5}
        position={[-5.5, -3, -16]}
        rotation={[0, 0.5, 0]}
      />

      {/* Entrance — the way onto the Midway */}
      <Attraction
        position={at.header.position}
        scale={at.header.scale}
        label="NICK"
        floatSpeed={0.9}
      >
        <CarnivalProp url={MODELS.entrance} targetSize={1.7} />
      </Attraction>

      {/* Career Highlights — earliest first */}
      <Attraction
        position={at.earlier.position}
        scale={at.earlier.scale}
        label="EARLIER"
        floatSpeed={0.8}
      >
        <CarnivalProp url={MODELS.stall01} targetSize={1.1} />
      </Attraction>

      <Attraction
        position={at.gousto.position}
        scale={at.gousto.scale}
        label="GOUSTO"
        floatSpeed={1.1}
      >
        <CarnivalProp url={MODELS.tent} targetSize={1.2} />
      </Attraction>

      <Attraction position={at.lick.position} scale={at.lick.scale} label="LICK" floatSpeed={0.85}>
        <CarnivalProp url={MODELS.stall02} targetSize={1.1} />
      </Attraction>

      {/* Current role — closes the run, the largest tent */}
      <Attraction
        position={at.travelex.position}
        scale={at.travelex.scale}
        label="TRAVELEX"
        floatSpeed={1}
      >
        <CarnivalProp url={MODELS.tentLarge} targetSize={1.5} />
      </Attraction>

      {/* Side projects */}
      <Attraction
        position={at.projects.position}
        scale={at.projects.scale}
        label="PROJECTS"
        floatSpeed={1.05}
      >
        <CarnivalProp url={MODELS.highStriker} targetSize={1.4} />
      </Attraction>

      {/* Contact */}
      <Attraction
        position={at.contact.position}
        scale={at.contact.scale}
        label="CONTACT"
        floatSpeed={0.95}
      >
        <CarnivalProp url={MODELS.ticketBooth} targetSize={1.0} />
      </Attraction>

      {/* TODO(phase-3): ball-toss stall (Milk_Bottle_Toss / Can_Toss assets) between travelex and projects. */}
      {/* TODO(phase-4): doodle-wall stall after contact. */}

      <SpaceDust count={tier === 'high' ? DUST_COUNT_HIGH : DUST_COUNT_LOW} />

      {tier === 'high' && <PostFX />}
    </>
  );
}

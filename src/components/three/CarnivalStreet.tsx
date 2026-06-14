import { useGLTF } from '@react-three/drei';

import { type QualityTier } from './hooks/useQualityTier';
import {
  DUST_COUNT_HIGH,
  DUST_COUNT_LOW,
  FENCE_PLACEMENTS,
  FLAG_PLACEMENTS,
  LAMP_BULB_Y,
  LAMP_PLACEMENTS,
  MODELS,
  PLACEMENTS,
  type Placement,
} from './carnival.config';
import { CarnivalProp } from './attractions/CarnivalProp';
import { Ground } from './shared/Ground';
import { StringLights } from './shared/StringLights';
import { SpaceDust } from './shared/SpaceDust';
import { PostFX } from './effects/PostFX';

Object.values(MODELS).forEach((url) => useGLTF.preload(url, true));

function Prop({ model, position, rotationY = 0, size }: Placement) {
  return (
    <CarnivalProp
      url={MODELS[model]}
      targetSize={size}
      position={position}
      rotation={[0, rotationY, 0]}
    />
  );
}

/** Warm interior glow that punches through the fog from a lit stall/tent. */
function WarmPool({ position }: { position: [number, number, number] }) {
  return (
    <pointLight
      position={[position[0] * 0.78, 1.7, position[2]]}
      color="#ff9d5c"
      intensity={7}
      distance={7.5}
      decay={2}
    />
  );
}

/** Emissive bulb atop a lamp post — self-lit, blooms, no real light cost. */
function LampBulb({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], LAMP_BULB_Y, position[2]]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
    </mesh>
  );
}

interface CarnivalStreetProps {
  tier: Exclude<QualityTier, 'none'>;
}

/**
 * CarnivalStreet — the linear midway: ground, structures lining both sides,
 * overhead bunting + string lights, lamp posts, and the ride plaza closing the
 * street. Neon-noir night: warm pools glow from lit stalls, emissive bulbs +
 * string lights bloom, the ferris wheel looms through the fog.
 *
 * Phase 1 dresses the environment only — figures (rigs need posing) and the
 * content spine come next. Tier gates the heavier dressing (fences, full set of
 * warm lights, dust density). Nothing does per-frame work; the demand frameloop
 * renders only while the camera walks.
 */
export function CarnivalStreet({ tier }: CarnivalStreetProps) {
  const high = tier === 'high';
  const warm = PLACEMENTS.filter((p) => p.warm).filter((_, i) => high || i % 2 === 0);

  return (
    <>
      <Ground />

      {/* Structures + dressing */}
      {PLACEMENTS.map((p, i) => (
        <Prop key={`p${i}`} {...p} />
      ))}
      {FLAG_PLACEMENTS.map((p, i) => (
        <Prop key={`f${i}`} {...p} />
      ))}
      {LAMP_PLACEMENTS.map((p, i) => (
        <Prop key={`l${i}`} {...p} />
      ))}
      {LAMP_PLACEMENTS.map((p, i) => (
        <LampBulb key={`lb${i}`} position={p.position} />
      ))}
      {high && FENCE_PLACEMENTS.map((p, i) => <Prop key={`fe${i}`} {...p} />)}

      {/* Overhead string lights */}
      <StringLights />

      {/* Warm pools from lit stalls */}
      {warm.map((p, i) => (
        <WarmPool key={`w${i}`} position={p.position} />
      ))}

      {/* Neon ride accents */}
      <pointLight position={[-6, 5, -55]} color="#6fe9ff" intensity={9} distance={16} decay={1.6} />
      <pointLight
        position={[5.3, 2.5, -49]}
        color="#ff8fd6"
        intensity={7}
        distance={10}
        decay={1.8}
      />

      {/* Drifting fog motes */}
      <SpaceDust count={high ? DUST_COUNT_HIGH : DUST_COUNT_LOW} />

      {high && <PostFX />}
    </>
  );
}

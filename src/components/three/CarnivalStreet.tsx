import { useGLTF } from '@react-three/drei';

import { type QualityTier } from './hooks/useQualityTier';
import {
  DENSE_PLACEMENTS,
  DUST_COUNT_HIGH,
  DUST_COUNT_LOW,
  FENCE_PLACEMENTS,
  FLAG_PLACEMENTS,
  LAMP_BULB_Y,
  LAMP_PLACEMENTS,
  LAMP_SIZE,
  LANTERN_PLACEMENTS,
  MODELS,
  PLACEMENTS,
  type Lamp,
  type Placement,
  type Vec3,
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

/** The inviting interior glow of a lit stall/tent — warm, short-range. */
function WarmPool({ position }: { position: Vec3 }) {
  return (
    <pointLight
      position={[position[0], 1.7, position[2]]}
      color="#ff9a4e"
      intensity={10}
      distance={8}
      decay={2}
    />
  );
}

/** Lamp post: model + emissive bulb (blooms) + an optional warm pool on the gravel. */
function LampPost({ position, lit }: Lamp) {
  return (
    <group>
      <CarnivalProp url={MODELS.lampPost} targetSize={LAMP_SIZE} position={position} />
      <mesh position={[position[0], LAMP_BULB_Y, position[2]]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
      </mesh>
      {lit && (
        <pointLight
          position={[position[0], LAMP_BULB_Y - 0.2, position[2]]}
          color="#ffce92"
          intensity={13}
          distance={10}
          decay={2}
        />
      )}
    </group>
  );
}

/** A warm hanging lantern — glowing emissive core + a small warm pool (autumn). */
function Lantern({ position }: { position: Vec3 }) {
  return (
    <group>
      <CarnivalProp url={MODELS.lantern} targetSize={1.1} position={position} />
      <mesh position={[position[0], 1.35, position[2]]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshBasicMaterial color="#ffcf7a" toneMapped={false} />
      </mesh>
      <pointLight
        position={[position[0], 1.35, position[2]]}
        color="#ffb866"
        intensity={6}
        distance={5}
        decay={2}
      />
    </group>
  );
}

interface CarnivalStreetProps {
  tier: Exclude<QualityTier, 'none'>;
}

/**
 * CarnivalStreet — the dog-leg carnival assembled with a real night-light rig.
 *
 * Lighting is the headline: warm pools glow from lit stalls, **lamp posts pool
 * warm light on the gravel** down both road legs, lanterns flicker-warm at the
 * bend, and neon ride accents (ferris cyan, carousel magenta) cut through cool
 * moonlight + fog. The warm/cool contrast over textured gravel is what reads as
 * real. Emissive bulbs + string lights + signage carry the rest (free of light
 * cost) so the fixture count stays sane.
 *
 * Tier gates the heavy dressing (scatter zones, fences, full warm-light set).
 */
export function CarnivalStreet({ tier }: CarnivalStreetProps) {
  const high = tier === 'high';
  const warm = PLACEMENTS.filter((p) => p.warm).slice(0, high ? 7 : 4);
  const lamps = high ? LAMP_PLACEMENTS : LAMP_PLACEMENTS.map((l) => ({ ...l, lit: false }));

  return (
    <>
      <Ground />

      {/* Core structures + stall interiors */}
      {PLACEMENTS.map((p, i) => (
        <Prop key={`p${i}`} {...p} />
      ))}
      {FLAG_PLACEMENTS.map((p, i) => (
        <Prop key={`fl${i}`} {...p} />
      ))}

      {/* Life-like scatter zones + fences (high tier) */}
      {high && DENSE_PLACEMENTS.map((p, i) => <Prop key={`d${i}`} {...p} />)}
      {high && FENCE_PLACEMENTS.map((p, i) => <Prop key={`fe${i}`} {...p} />)}

      {/* Lamp posts (pools on the gravel) */}
      {lamps.map((l, i) => (
        <LampPost key={`lp${i}`} {...l} />
      ))}

      {/* Lanterns */}
      {LANTERN_PLACEMENTS.map((p, i) => (
        <Lantern key={`la${i}`} position={p} />
      ))}

      {/* Overhead twinkling string lights */}
      <StringLights />

      {/* Warm pools from lit stalls */}
      {warm.map((p, i) => (
        <WarmPool key={`w${i}`} position={p.position} />
      ))}

      {/* Soft warm plaza fill */}
      <pointLight
        position={[-37, 5, -24]}
        color="#ffba78"
        intensity={8}
        distance={26}
        decay={1.4}
      />

      {/* Neon ride accents */}
      <pointLight
        position={[-46, 8, -24]}
        color="#7fe9ff"
        intensity={16}
        distance={28}
        decay={1.5}
      />
      <pointLight
        position={[-37, 3.5, -31]}
        color="#ff8fd6"
        intensity={8}
        distance={13}
        decay={1.7}
      />
      <pointLight
        position={[-44, 5, -31]}
        color="#9b8cff"
        intensity={7}
        distance={14}
        decay={1.7}
      />

      {/* Sparse drifting dust */}
      <SpaceDust count={high ? DUST_COUNT_HIGH : DUST_COUNT_LOW} />

      {high && <PostFX />}
    </>
  );
}

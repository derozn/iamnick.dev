import { useGLTF } from '@react-three/drei';

import { type QualityTier } from './hooks/useQualityTier';
import {
  DUST_COUNT_HIGH,
  DUST_COUNT_LOW,
  FENCE_PLACEMENTS,
  FLAG_PLACEMENTS,
  LAMP_BULB_Y,
  LAMP_PLACEMENTS,
  LAMP_SIZE,
  MODELS,
  PLACEMENTS,
  type Lamp,
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
      position={[position[0] * 0.82, 1.8, position[2]]}
      color="#ffae6b"
      intensity={11}
      distance={9}
      decay={2}
    />
  );
}

/** A lamp post: the model + an emissive bulb (blooms) + an optional real warm pool. */
function LampPost({ position, lit }: Lamp) {
  return (
    <group>
      <CarnivalProp url={MODELS.lampPost} targetSize={LAMP_SIZE} position={position} />
      <mesh position={[position[0], LAMP_BULB_Y, position[2]]}>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
      </mesh>
      {lit && (
        <pointLight
          position={[position[0], LAMP_BULB_Y - 0.2, position[2]]}
          color="#ffd49a"
          intensity={10}
          distance={10}
          decay={2}
        />
      )}
    </group>
  );
}

interface CarnivalStreetProps {
  tier: Exclude<QualityTier, 'none'>;
}

/**
 * CarnivalStreet — the carnival come to life: a short avenue you walk in through,
 * opening into a plaza ringed with stalls, tents and rides, the ferris wheel
 * closing the back, framed by dark trees. Strategic lighting — warm pools from
 * lit stalls, lit lamp posts, twinkling string lights and neon ride accents over
 * a lifted ambient base so it glows like a fairground at night, not a void.
 *
 * Figures (rigs need posing) and the content spine come next. Tier gates the
 * heavier dressing (fences, full warm-light set, dust density).
 */
export function CarnivalStreet({ tier }: CarnivalStreetProps) {
  const high = tier === 'high';
  const warm = PLACEMENTS.filter((p) => p.warm).slice(0, high ? 7 : 4);
  const lamps = high ? LAMP_PLACEMENTS : LAMP_PLACEMENTS.map((l) => ({ ...l, lit: false }));

  return (
    <>
      <Ground />

      {/* Structures, scenery, landscape */}
      {PLACEMENTS.map((p, i) => (
        <Prop key={`p${i}`} {...p} />
      ))}
      {FLAG_PLACEMENTS.map((p, i) => (
        <Prop key={`fl${i}`} {...p} />
      ))}
      {high && FENCE_PLACEMENTS.map((p, i) => <Prop key={`fe${i}`} {...p} />)}

      {/* Lamp posts (lit) */}
      {lamps.map((l, i) => (
        <LampPost key={`lp${i}`} {...l} />
      ))}

      {/* Overhead twinkling string lights */}
      <StringLights />

      {/* Warm pools from lit stalls */}
      {warm.map((p, i) => (
        <WarmPool key={`w${i}`} position={p.position} />
      ))}

      {/* Soft warm fill so the plaza floor reads (the carnival glow) */}
      <pointLight position={[0, 5, -44]} color="#ffbb7d" intensity={7} distance={26} decay={1.4} />

      {/* Neon ride accents */}
      <pointLight position={[0, 7, -64]} color="#7fe9ff" intensity={14} distance={26} decay={1.5} />
      <pointLight
        position={[6.5, 3, -58]}
        color="#ff8fd6"
        intensity={8}
        distance={12}
        decay={1.7}
      />
      <pointLight
        position={[-6.5, 3, -58]}
        color="#7fe9ff"
        intensity={7}
        distance={12}
        decay={1.8}
      />

      {/* Sparse drifting dust */}
      <SpaceDust count={high ? DUST_COUNT_HIGH : DUST_COUNT_LOW} />

      {high && <PostFX />}
    </>
  );
}

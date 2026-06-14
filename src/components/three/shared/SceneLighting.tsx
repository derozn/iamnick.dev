import { Environment, Lightformer } from '@react-three/drei';

import { type QualityTier } from '../hooks/useQualityTier';
import { MIDWAY_ATTRACTIONS, type AttractionId, type Vec3 } from '../midway.config';

/**
 * SceneLighting — neon-noir three-part rig (kept from v1, ADR-0005):
 *
 * 1. Cool key directional (moon-ish, upper front-right) gives every attraction a
 *    lit face and a shaded face so the low-poly geometry reads as form.
 * 2. Hemisphere fill — accent-tinted sky over deep-violet ground — lifts the
 *    shadow side just enough to silhouette structures against the fog.
 * 3. High tier only: a violet rim directional from behind-left for depth
 *    separation, one small accent point light per attraction keyed to that
 *    attraction's signage palette, and a tiny Lightformer environment (rendered
 *    once, no network fetch) so PBR materials get specular response instead of
 *    reading flat.
 *
 * Everything is static — no useFrame, demand frameloop stays idle-cheap.
 */

interface AttractionAccent {
  /** Light offset relative to the attraction position (toward its open side). */
  offset: Vec3;
  color: string;
  intensity: number;
}

/* Accent per attraction, keyed to its dominant neon sign colour. Attractions sit
 * ~5 world units apart; distance 4 guarantees the pools never overlap. */
const ATTRACTION_ACCENTS: Record<AttractionId, AttractionAccent> = {
  header: { offset: [0.9, 1.1, 1.0], color: '#4cc9f0', intensity: 5 },
  earlier: { offset: [0.5, 1.2, 0.8], color: '#b388ff', intensity: 4 },
  gousto: { offset: [1.0, 1.1, 0.9], color: '#ff9e64', intensity: 4.5 },
  lick: { offset: [-1.0, 1.1, 0.9], color: '#ff5e87', intensity: 5 },
  travelex: { offset: [1.0, 1.1, 0.9], color: '#4cc9f0', intensity: 5 },
  projects: { offset: [-0.5, 1.2, 0.8], color: '#4cc9f0', intensity: 4 },
  contact: { offset: [0, 1.2, 0.9], color: '#b388ff', intensity: 4 },
};

const ACCENT_POSITIONS: { id: AttractionId; position: Vec3 }[] = MIDWAY_ATTRACTIONS.map((s) => {
  const a = ATTRACTION_ACCENTS[s.id];
  return {
    id: s.id,
    position: [
      s.position[0] + a.offset[0],
      s.position[1] + a.offset[1],
      s.position[2] + a.offset[2],
    ],
  };
});

interface SceneLightingProps {
  tier: Exclude<QualityTier, 'none'>;
}

export function SceneLighting({ tier }: SceneLightingProps) {
  return (
    <>
      {/* Key — cool directional, the "moon" of the scene */}
      <directionalLight position={[3.5, 7, 5]} intensity={1.6} color="#cfe1ff" />

      {/* Fill — accent-tinted sky over deep-violet ground */}
      <hemisphereLight args={['#3d7ea6', '#2a1d4e', 0.7]} />

      {tier === 'high' && (
        <>
          {/* Rim — violet counter-light from behind-left separates attractions from the bg */}
          <directionalLight position={[-4, 2, -6]} intensity={0.5} color="#7b6cff" />

          {/* Per-attraction signage accent pools */}
          {ACCENT_POSITIONS.map(({ id, position }) => {
            const { color, intensity } = ATTRACTION_ACCENTS[id];
            return (
              <pointLight
                key={id}
                position={position}
                color={color}
                intensity={intensity}
                distance={4}
                decay={1.8}
              />
            );
          })}

          {/* Tiny procedural env map (rendered once) for PBR specular response */}
          <Environment resolution={64} frames={1} environmentIntensity={0.3}>
            <Lightformer intensity={3} color="#4cc9f0" position={[0, 4, -9]} scale={[12, 4, 1]} />
            <Lightformer
              intensity={2}
              color="#5a3fbf"
              position={[-6, -1, 2]}
              rotation-y={Math.PI / 2}
              scale={[8, 3, 1]}
            />
            <Lightformer
              intensity={1.5}
              color="#ff5e87"
              position={[6, 0, 4]}
              rotation-y={-Math.PI / 2}
              scale={[6, 3, 1]}
            />
          </Environment>
        </>
      )}
    </>
  );
}

import { Environment, Lightformer } from '@react-three/drei';

import { type QualityTier } from '../hooks/useQualityTier';

/**
 * SceneLighting — the global neon-noir night rig for the midway street. Local
 * warm pools, lamp bulbs and neon accents live in CarnivalStreet; this is the
 * ambient base:
 *
 * 1. Dim cool "moon" key from high front so structures read as silhouettes.
 * 2. Low hemisphere fill — cool night sky over a warm-violet ground — lifts the
 *    shadow side just enough to separate props from the fog.
 * 3. High tier: a faint magenta rim from behind for depth, and a tiny Lightformer
 *    environment (rendered once, no fetch) for PBR specular so the props don't
 *    read flat.
 *
 * Static — no useFrame; the demand frameloop stays idle-cheap.
 */
interface SceneLightingProps {
  tier: Exclude<QualityTier, 'none'>;
}

export function SceneLighting({ tier }: SceneLightingProps) {
  return (
    <>
      {/* Soft ambient base so nothing reads as a black void */}
      <ambientLight intensity={0.45} color="#615d86" />

      {/* Moon key — cool, high front */}
      <directionalLight position={[6, 12, 8]} intensity={1.05} color="#bcc7ff" />

      {/* Hemisphere fill — night sky over warm-violet ground */}
      <hemisphereLight args={['#525d9e', '#42313f', 1.0]} />

      {tier === 'high' && (
        <>
          {/* Magenta rim from behind the ride plaza for depth */}
          <directionalLight position={[-8, 4, -52]} intensity={0.4} color="#b86cff" />

          {/* Tiny procedural env (rendered once) for PBR specular response */}
          <Environment resolution={64} frames={1} environmentIntensity={0.4}>
            <Lightformer intensity={2} color="#6fe9ff" position={[0, 5, -20]} scale={[14, 5, 1]} />
            <Lightformer
              intensity={1.6}
              color="#ff9d5c"
              position={[-7, 1, -6]}
              rotation-y={Math.PI / 2}
              scale={[10, 4, 1]}
            />
            <Lightformer
              intensity={1.4}
              color="#ff8fd6"
              position={[7, 1, -6]}
              rotation-y={-Math.PI / 2}
              scale={[10, 4, 1]}
            />
          </Environment>
        </>
      )}
    </>
  );
}

import { Bloom, EffectComposer } from '@react-three/postprocessing';

/**
 * PostFX — bloom pass that makes the Synty emissive atlas (bulbs, neon signs,
 * ride trim) and the neon accent lights glow. High tier only.
 */
export function PostFX() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.3} />
    </EffectComposer>
  );
}

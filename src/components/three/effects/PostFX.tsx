import { Bloom, EffectComposer } from '@react-three/postprocessing';

/**
 * PostFX — conservative bloom pass picking up the HDR sign textures, neon
 * Text3D labels, and accent point lights. Mounted only on the 'high' quality
 * tier (JourneyWorld gates it).
 */
export function PostFX() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.1} />
    </EffectComposer>
  );
}

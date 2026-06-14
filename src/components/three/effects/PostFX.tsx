import { Bloom, EffectComposer } from '@react-three/postprocessing';

/**
 * PostFX — conservative bloom pass picking up the neon trim, neon Text3D signs,
 * and accent point lights. Mounted only on the 'high' quality tier (CarnivalStreet
 * gates it).
 */
export function PostFX() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.6} luminanceSmoothing={0.32} />
    </EffectComposer>
  );
}

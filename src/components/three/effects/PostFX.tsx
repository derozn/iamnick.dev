import { Bloom, EffectComposer } from '@react-three/postprocessing';

/**
 * PostFX — bloom pass that makes the Synty emissive atlas (bulbs, neon signs,
 * ride trim) and the neon accent lights glow. High tier only.
 */
export function PostFX() {
  return (
    // multisampling=0: the composer's default 8× MSAA allocates big buffers at
    // retina res — heavy enough to destabilise it (bloom stops rendering — ride
    // bulbs go dark) and drop the GPU context (black flicker). We render the scene
    // with antialias off anyway, so drop it here too.
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.45} luminanceSmoothing={0.25} />
    </EffectComposer>
  );
}

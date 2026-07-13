import { useTexture } from '@react-three/drei';
import { LinearFilter, SRGBColorSpace, type Texture } from 'three';

const SYNTY = '/models/synty/';

/**
 * The Synty emissive atlas, configured for neon glow: glTF UV convention
 * (flipY off), sRGB, and — crucially — mipmaps OFF. The atlas is 99% black with
 * the bulb/light swatches packed into a tiny lit corner; with mipmaps on those
 * few-texel swatches average to black as rides recede and the bulbs go dark, so
 * every bulb must sample the sharp lit texel at any distance (twinkle is a
 * bonus). Shared by SyntyScene and AnimatedRides so the config can't drift.
 */
export function useEmissiveAtlas(): Texture {
  return useTexture(`${SYNTY}emissive-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.needsUpdate = true;
  }) as Texture;
}

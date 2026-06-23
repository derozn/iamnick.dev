import { useGLTF, useTexture } from '@react-three/drei';
import { LinearFilter, SRGBColorSpace, type Texture } from 'three';

import demoInstances from './demo-instances.json';
import manifest from './manifest.json';
import { InstancedPrefab } from './InstancedPrefab';
import { SPINNER_NAMES } from './AnimatedRides';
import { EXTRA_INSTANCES } from './sceneAdditions';

const SYNTY = '/models/synty/';
const available = new Set(manifest as string[]);

/**
 * Excluded prefabs: big 2-D backdrop/sky planes (our fog is the sky), and props
 * whose textures were dropped in conversion so they render as blank/untextured
 * planes (beartrap, cobwebs, decals, the blank recycle bin, signs, etc.).
 */
const EXCLUDE =
  /Background_Card|Sky_Dome|CloudRing|Tree_Background|SM_Env_Ground_Hill|BearTrap|Cable_01|Cobwebs|Decal|Net_01|Photo_Stand|Plushie_03|Sign_Closed|Spirit_Board|Dynamite|Needle|Rubbish_Bin/;

/**
 * A translation artefact piled ~454 stall accessories (ring-toss rings, cans,
 * plushies, bottles, signs, weapons…) at the scene origin — they came through with
 * local-to-parent transforms instead of world. Drop everything in that tight blob
 * (it's pure overdraw + clutter) except the central flag/light pole.
 */
const PILE_X = -0.3;
const PILE_Z = -0.7;
const PILE_R2 = 3 * 3;
const PILE_KEEP = /Bunting_Pole|Light_Pole|Lamp_Post|Flag/;

/** Prefabs that carry their own distinct (non-01_A) base texture — keep their map. */
const SHARE_SKIP = /Sign_|Poster|Board|Photo|Spirit/;
const inPile = (name: string, t: number[]) =>
  !PILE_KEEP.test(name) && (t[0] - PILE_X) ** 2 + (-t[2] - PILE_Z) ** 2 < PILE_R2;

/** [prefabName, transforms[]] for every demo prefab we have a GLB for, plus our additions. */
export const entries = Object.entries(demoInstances as Record<string, number[][]>)
  .filter(([name]) => available.has(name) && !EXCLUDE.test(name) && !SPINNER_NAMES.has(name))
  .map(([name, tfs]) => {
    const kept = tfs.filter((t) => !inPile(name, t));
    return [name, EXTRA_INSTANCES[name] ? [...kept, ...EXTRA_INSTANCES[name]] : kept];
  })
  .filter(([, tfs]) => (tfs as number[][]).length > 0) as [string, number[][]][];

entries.forEach(([name]) => useGLTF.preload(`${SYNTY}${name}.glb`, true));

/**
 * SyntyScene — a faithful translation of the Synty "POLYGON Horror Carnival"
 * Demo.unity scene (2.8k props, 255 unique models) into three.js: every prop at
 * its authored position/rotation/scale, rendered instanced. The professional
 * arrangement, 1:1.
 */
export function SyntyScene({ cullDist }: { cullDist?: number }) {
  // configure in the load callback (glTF UV convention + sRGB glow); mostly-black
  // map so non-neon pixels stay dark.
  const emissive = useTexture(`${SYNTY}emissive-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    // The Synty emissive atlas is 99% black with the bulb/light swatches packed
    // into a tiny lit corner. With mipmaps on, those few-texel swatches average to
    // black as the rides recede, so the bulbs go dark — disable mipmaps so every
    // bulb samples the sharp lit texel at any distance (light twinkle is a bonus).
    tex.generateMipmaps = false;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.needsUpdate = true;
  }) as Texture;

  // Shared base atlas — re-textures props the conversion left blank (most use it).
  const baseAtlas = useTexture(`${SYNTY}base-atlas.png`, (t) => {
    const tex = t as Texture;
    tex.flipY = false;
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
  }) as Texture;

  return (
    <>
      {entries.map(([name, transforms]) => (
        <InstancedPrefab
          key={name}
          url={`${SYNTY}${name}.glb`}
          transforms={transforms}
          emissive={emissive}
          baseAtlas={baseAtlas}
          // dedup the per-GLB atlas copies onto the one shared atlas (big VRAM win),
          // except signs/posters which carry their own distinct text texture.
          shareAtlas={!SHARE_SKIP.test(name)}
          cullDist={cullDist}
        />
      ))}
    </>
  );
}

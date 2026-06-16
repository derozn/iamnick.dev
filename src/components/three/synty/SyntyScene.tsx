import { useGLTF, useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Texture } from 'three';

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
  /Background_Card|Sky_Dome|CloudRing|Tree_Background|SM_Env_Ground_Hill|BearTrap|Cable_01|Cobwebs|Decal|Hoops_Hoola|Milk_Bottle_Toss|Net_01|Photo_Stand|Plushie_03|Rubbish_Bin_03|Sign_Closed|Spirit_Board|Table_01|Dynamite|Needle/;

/** [prefabName, transforms[]] for every demo prefab we have a GLB for, plus our additions. */
const entries = Object.entries(demoInstances as Record<string, number[][]>)
  .filter(([name]) => available.has(name) && !EXCLUDE.test(name) && !SPINNER_NAMES.has(name))
  .map(([name, tfs]) => [
    name,
    EXTRA_INSTANCES[name] ? [...tfs, ...EXTRA_INSTANCES[name]] : tfs,
  ]) as [string, number[][]][];

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
          cullDist={cullDist}
        />
      ))}
    </>
  );
}

import { useGLTF, useTexture } from '@react-three/drei';
import { SRGBColorSpace, type Texture } from 'three';

import demoInstances from './demo-instances.json';
import manifest from './manifest.json';
import { InstancedPrefab } from './InstancedPrefab';

const SYNTY = '/models/synty/';
const available = new Set(manifest as string[]);

/** Big 2-D backdrop planes / sky elements the demo uses — they occlude + don't translate; our fog is the sky. */
const EXCLUDE = /Background_Card|Sky_Dome|CloudRing|Tree_Background|SM_Env_Ground_Hill/;

/** Thin posters/decals authored flush against walls — need polygon offset or they z-fight. */
const DECAL = /Decal|Poster|Graffiti/;

/** [prefabName, transforms[]] for every demo prefab we have a GLB for. */
const entries = Object.entries(demoInstances as Record<string, number[][]>).filter(
  ([name]) => available.has(name) && !EXCLUDE.test(name),
);

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
          polygonOffset={DECAL.test(name)}
        />
      ))}
    </>
  );
}

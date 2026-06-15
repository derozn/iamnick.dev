import { useGLTF } from '@react-three/drei';

import demoInstances from './demo-instances.json';
import manifest from './manifest.json';
import { InstancedPrefab } from './InstancedPrefab';

const SYNTY = '/models/synty/';
const available = new Set(manifest as string[]);

/** [prefabName, transforms[]] for every demo prefab we have a GLB for. */
const entries = Object.entries(demoInstances as Record<string, number[][]>).filter(([name]) =>
  available.has(name),
);

entries.forEach(([name]) => useGLTF.preload(`${SYNTY}${name}.glb`, true));

/**
 * SyntyScene — a faithful translation of the Synty "POLYGON Horror Carnival"
 * Demo.unity scene (2.8k props, 255 unique models) into three.js: every prop at
 * its authored position/rotation/scale, rendered instanced. The professional
 * arrangement, 1:1.
 */
export function SyntyScene() {
  return (
    <>
      {entries.map(([name, transforms]) => (
        <InstancedPrefab key={name} url={`${SYNTY}${name}.glb`} transforms={transforms} />
      ))}
    </>
  );
}

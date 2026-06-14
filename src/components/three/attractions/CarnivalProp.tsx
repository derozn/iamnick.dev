import { useMemo } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';

type GroupProps = ThreeElements['group'];

/**
 * CarnivalProp — loads a converted neutral Synty funfair GLB and **normalizes**
 * it: scaled so its largest dimension equals `targetSize`, recentred on X/Z, and
 * dropped so its base sits at y = 0. Normalisation means placement only needs a
 * world position (+ optional yaw) — no per-prop scale/origin fiddling — so the
 * assets drop onto the Midway spine that's already tuned for the grey boxes.
 *
 * Source assets are Y-up and upright (verified at conversion). They keep their
 * Synty atlas albedo; the scene's neon-noir rig + bloom + per-attraction accent
 * pools do the unifying (ADR-0005 — "one world"). Draco-compressed → loaded with
 * drei's draco decoder.
 */
interface CarnivalPropProps extends GroupProps {
  url: string;
  /** Largest world-space dimension after normalisation. */
  targetSize?: number;
}

export function CarnivalProp({ url, targetSize = 1, ...props }: CarnivalPropProps) {
  const { scene } = useGLTF(url, true);

  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = targetSize / maxDim;
    // Post-scale translation: centre X/Z, sit the base (box.min.y) on the ground.
    return {
      scale: s,
      offset: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number],
    };
  }, [scene, targetSize]);

  return (
    <group {...props}>
      <group position={offset} scale={scale}>
        <Clone object={scene} />
      </group>
    </group>
  );
}

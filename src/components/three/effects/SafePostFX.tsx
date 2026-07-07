'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

import { useSceneStore } from '@/store/scene';
import { PostFX } from './PostFX';

/**
 * SafePostFX — the bloom composer behind a context-loss tripwire.
 *
 * Bloom was removed once already because the EffectComposer could drop the GL
 * context on weaker GPUs (black flicker). The root causes (8× MSAA buffers,
 * per-GLB atlas VRAM duplication, the origin prop-pile) have since been fixed, so
 * bloom gets a second chance — but if THIS device ever loses the context while the
 * composer is mounted, we flag the device (store + localStorage) and permanently
 * fall back to the emissive-only look. Self-healing: no user action needed.
 */
export function SafePostFX() {
  const blocked = useSceneStore((s) => s.postFxBlocked);
  const blockPostFx = useSceneStore((s) => s.blockPostFx);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (blocked) return;
    const canvas = gl.domElement;
    const onLost = () => blockPostFx();
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, blocked, blockPostFx]);

  if (blocked) return null;
  return <PostFX />;
}

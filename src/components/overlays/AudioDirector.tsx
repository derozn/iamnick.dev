'use client';

import { useEffect } from 'react';

import { useSceneStore } from '@/store/scene';
import { setDucked, setMuted, startAmbience } from '@/lib/audio';

// NB: no @react-three/* imports — static bundle. The mixer itself (lib/audio)
// is context-free too; it stays silent until the intro's start click calls
// initAudio() inside the user gesture.

/**
 * AudioDirector — mirrors scene state into the audio mixer:
 *   - `started` → the ambience bed begins with the camera pull-out
 *   - a content panel or game open → the mix ducks under the HUD
 *   - `muted` → master gain (persisted via the store)
 */
export function AudioDirector() {
  const started = useSceneStore((s) => s.started);
  const mode = useSceneStore((s) => s.mode);
  const muted = useSceneStore((s) => s.muted);

  useEffect(() => {
    if (started) startAmbience();
  }, [started]);

  useEffect(() => {
    setDucked(mode !== 'travelling');
  }, [mode]);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  return null;
}

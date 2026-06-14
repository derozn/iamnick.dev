import { create } from 'zustand';

/**
 * Scene-state model — the spine of the Dark Carnival (see docs/redesign/architecture.md).
 *
 * A single explicit `mode` drives camera, scroll-lock and input routing:
 *   - `travelling` — default. Scroll moves the camera along the Midway spline;
 *     attractions pass as the visitor scrolls. Input = scroll.
 *   - `playing` — entered via step-in at a stall. Scroll is locked; pointer/touch
 *     drives the active game; Exit/Skip returns to `travelling` at the same scroll
 *     position.
 *
 * Written by ScrollDriver (DOM side) and step-in affordances; read imperatively
 * by CameraRig inside useFrame via `useSceneStore.getState()` so per-scroll
 * updates never trigger React re-renders.
 *
 * Note: no stall is interactive until Phase 3 (ball-toss) / Phase 4 (doodle wall),
 * so nothing sets `mode = 'playing'` yet — the spine is in place ahead of them.
 */

export type SceneMode = 'travelling' | 'playing';

/** Normalised [0, 1] scroll-progress band occupied by one Midway attraction. */
export interface SectionRange {
  start: number;
  end: number;
}

export interface SceneState {
  /** Current interaction mode — `travelling` on-rails, or `playing` a stepped-in stall. */
  mode: SceneMode;
  /** Attraction id of the stall currently stepped into, or null while travelling. */
  activeStall: string | null;
  /** Overall document scroll progress: scrollTop / (scrollHeight - clientHeight), clamped [0, 1]. */
  progress: number;
  /** Per-attraction bands keyed by `data-attraction` id, measured by ScrollDriver. */
  sections: Record<string, SectionRange>;
  setProgress: (progress: number) => void;
  setSections: (sections: Record<string, SectionRange>) => void;
  /** Step into a stall — locks scroll, routes input to the game. */
  stepIn: (stall: string) => void;
  /** Exit the active stall back to travelling at the same scroll position. */
  exit: () => void;
}

export const useSceneStore = create<SceneState>()((set) => ({
  mode: 'travelling',
  activeStall: null,
  progress: 0,
  sections: {},
  setProgress: (progress) => set({ progress }),
  setSections: (sections) => set({ sections }),
  stepIn: (stall) => set({ mode: 'playing', activeStall: stall }),
  exit: () => set({ mode: 'travelling', activeStall: null }),
}));

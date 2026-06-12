import { create } from 'zustand';

/** Normalised [0, 1] scroll-progress band occupied by one journey stop. */
export interface SectionRange {
  start: number;
  end: number;
}

export interface ScrollState {
  /** Overall document scroll progress: scrollTop / (scrollHeight - clientHeight), clamped [0, 1]. */
  progress: number;
  /** Per-stop bands keyed by `data-journey-stop` id, measured by ScrollDriver. */
  sections: Record<string, SectionRange>;
  setProgress: (progress: number) => void;
  setSections: (sections: Record<string, SectionRange>) => void;
}

/**
 * Scroll store — written by ScrollDriver (DOM side), read imperatively by
 * CameraRig inside useFrame via `useScrollStore.getState()` so per-scroll
 * updates never trigger React re-renders.
 */
export const useScrollStore = create<ScrollState>()((set) => ({
  progress: 0,
  sections: {},
  setProgress: (progress) => set({ progress }),
  setSections: (sections) => set({ sections }),
}));

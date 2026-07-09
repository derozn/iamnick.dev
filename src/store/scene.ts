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
 * by FirstPersonRig inside useFrame via `useSceneStore.getState()` so per-scroll
 * updates never trigger React re-renders.
 *
 * Note: no stall is interactive until Phase 3 (ball-toss) / Phase 4 (doodle wall),
 * so nothing sets `mode = 'playing'` yet — the spine is in place ahead of them.
 */

export type SceneMode = 'travelling' | 'viewing' | 'playing';

/**
 * Ball-toss game phase — drives the DOM HUD. The per-frame physics lives in refs
 * inside `<BallTossGame>`; only this summary state reaches the store so the HUD can
 * react without coupling to the sim.
 *   - `intro`  — just stepped in; show the how-to-play card, bottles at rest.
 *   - `aiming` — armed, a ball is ready; pointer aims, charge-and-release throws.
 *   - `thrown` — a ball is in flight / bottles settling; input is parked.
 *   - `won`    — all bottles down; show the prize card.
 *   - `lost`   — out of balls with bottles standing; show the final-score card.
 */
export type BallTossPhase = 'intro' | 'aiming' | 'thrown' | 'won' | 'lost';

/** Balls the visitor gets per ball-toss round. */
export const BALL_TOSS_BALLS = 3;

/**
 * High-striker phase — drives the DOM HUD + in-canvas puck.
 *   - `intro`  — how-to card; the meter is idle.
 *   - `armed`  — needle sweeping; a tap captures power (deterministic from
 *                `strikerArmedAt`, see highStrikerConfig.meterValue).
 *   - `struck` — puck in flight; input parked.
 *   - `result` — swing resolved, brief beat before re-arm / done.
 *   - `done`   — attempts spent; show the verdict card.
 */
export type StrikerPhase = 'intro' | 'armed' | 'struck' | 'result' | 'done';

/** Swings the visitor gets per high-striker round. */
export const STRIKER_SWINGS = 3;

/** localStorage key: this device dropped the GL context with the composer on. */
const POSTFX_BLOCKED_KEY = 'iamnick:postfx-blocked';
/** localStorage key: visitor muted the carnival audio. */
const MUTED_KEY = 'iamnick:muted';
/** localStorage keys: golden-ticket hunt progress. */
const TICKETS_KEY = 'iamnick:tickets';
const TICKETS_CELEBRATED_KEY = 'iamnick:tickets-celebrated';

const readTickets = (): string[] => {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(TICKETS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

/** SSR-safe localStorage flag read (the store module is evaluated on the server too). */
const readFlag = (key: string) => {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const writeFlag = (key: string, on: boolean) => {
  try {
    if (on) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    // private mode etc. — the in-session state still applies
  }
};

/** Normalised [0, 1] scroll-progress band occupied by one Midway attraction. */
export interface SectionRange {
  start: number;
  end: number;
}

export interface SceneState {
  /** Intro: the scene's GLBs/textures have finished loading (Suspense resolved). */
  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
  /** Intro: the visitor has clicked "start" — the camera expands from the framed
   *  vignette to the full overview and controls become live. */
  started: boolean;
  start: () => void;

  /** This device lost the GL context while the bloom composer was mounted — the
   *  composer stays off (persisted per-device) and the emissive-only look carries
   *  the glow. The permanent safety net behind re-enabling post-processing. */
  postFxBlocked: boolean;
  blockPostFx: () => void;

  /** Carnival audio muted (persisted). AudioDirector mirrors this into the mixer. */
  muted: boolean;
  toggleMuted: () => void;

  /* --- Golden-ticket hunt (persisted) --- */
  /** Ids of tickets already punched. */
  ticketsFound: string[];
  collectTicket: (id: string) => void;
  /** The full-house modal has been shown (don't re-show on revisits). */
  ticketsCelebrated: boolean;
  celebrateTickets: () => void;
  /** Tear them up: clear the hunt for a fresh run. */
  resetTickets: () => void;
  /** Confetti trigger — bump `seq` with a world position and the in-canvas
   *  burst fires there. Shared by tickets and the high striker. */
  burst: { seq: number; pos: [number, number, number] };
  fireBurst: (pos: [number, number, number]) => void;

  /** Intro: real asset-load progress [0,1] (drei useProgress → LoaderVeil bridge). */
  loadProgress: number;
  setLoadProgress: (p: number) => void;
  /** Intro: the in-canvas shader veil has rendered its first frame — the HTML
   *  splash can fade out and hand the loading screen over to the shader. */
  veilLive: boolean;
  setVeilLive: (live: boolean) => void;
  /** Intro: the veil has fully dissolved and unmounted. Gates the bloom composer:
   *  mounting it under the veil washes the letterpress dark out (the composer
   *  re-encodes the raw shader values as linear → ACES → sRGB). */
  veilDone: boolean;
  setVeilDone: (done: boolean) => void;

  /** Current interaction mode — `travelling` on-rails, `viewing` a content tent, or `playing` a game. */
  mode: SceneMode;
  /** Attraction id whose content panel is open (viewing), or null. */
  activeAttraction: string | null;
  /** Attraction the iso camera is flying to / focused on (set on indicator click), or null. */
  focusedAttraction: string | null;
  /** Fly the iso camera in to an attraction; IsoControls opens its content on arrival. */
  focus: (attraction: string | null) => void;
  /** Attraction id of the stall currently stepped into for a game, or null. */
  activeStall: string | null;
  /** Overall document scroll progress: scrollTop / (scrollHeight - clientHeight), clamped [0, 1]. */
  progress: number;
  /** Per-attraction bands keyed by `data-attraction` id, measured by ScrollDriver. */
  sections: Record<string, SectionRange>;
  setProgress: (progress: number) => void;
  setSections: (sections: Record<string, SectionRange>) => void;
  /** Open a content tent — locks scroll, raises the HUD panel. */
  open: (attraction: string) => void;
  /** Close the content panel back to travelling. */
  close: () => void;
  /** Step into a stall — locks scroll, routes input to the game. */
  stepIn: (stall: string) => void;
  /** Exit the active stall back to travelling at the same scroll position. */
  exit: () => void;

  /* --- Ball-toss game slice (summary only; the sim runs in refs) --- */
  /** Running score for the current ball-toss round. */
  ballTossScore: number;
  /** Balls left to throw this round. */
  ballTossBallsLeft: number;
  /** Current phase of the ball-toss round (drives the HUD). */
  ballTossPhase: BallTossPhase;
  /** Bumped on each "Play again"; the in-canvas sim watches it to reset the stack. */
  ballTossRound: number;
  /** Reset the round to a fresh start (full balls, zero score, intro card). */
  resetBallToss: () => void;
  /** Play again in place: zero score, full balls, straight to aiming, bump round. */
  replayBallToss: () => void;
  /** Merge a partial summary update from the sim (score / balls / phase). */
  setBallToss: (patch: Partial<BallTossSlice>) => void;

  /* --- High-striker game slice (summary only; the puck sim runs in refs) --- */
  strikerPhase: StrikerPhase;
  /** performance.now() when the meter armed — the needle is derived from this. */
  strikerArmedAt: number;
  /** Power [0,1] captured at the last tap. */
  strikerPower: number;
  strikerAttemptsLeft: number;
  /** Best power this round (drives the verdict label). */
  strikerBest: number;
  /** Bumped on "Play again"; the in-canvas sim watches it to reset the puck. */
  strikerRound: number;
  setStriker: (patch: Partial<StrikerSlice>) => void;
  resetStriker: () => void;
  replayStriker: () => void;
}

/** The mutable summary fields the sim writes back to the store. */
type BallTossSlice = Pick<SceneState, 'ballTossScore' | 'ballTossBallsLeft' | 'ballTossPhase'>;

type StrikerSlice = Pick<
  SceneState,
  'strikerPhase' | 'strikerArmedAt' | 'strikerPower' | 'strikerAttemptsLeft' | 'strikerBest'
>;

export const useSceneStore = create<SceneState>()((set) => ({
  sceneReady: false,
  setSceneReady: (sceneReady) => set({ sceneReady }),
  started: false,
  start: () => set({ started: true }),

  loadProgress: 0,
  // never regress (useProgress can jitter as new loaders register)
  setLoadProgress: (p) => set((s) => (p > s.loadProgress ? { loadProgress: p } : s)),
  veilLive: false,
  setVeilLive: (veilLive) => set({ veilLive }),
  veilDone: false,
  setVeilDone: (veilDone) => set({ veilDone }),

  postFxBlocked: readFlag(POSTFX_BLOCKED_KEY),
  blockPostFx: () => {
    writeFlag(POSTFX_BLOCKED_KEY, true);
    set({ postFxBlocked: true });
  },

  muted: readFlag(MUTED_KEY),
  toggleMuted: () =>
    set((s) => {
      writeFlag(MUTED_KEY, !s.muted);
      return { muted: !s.muted };
    }),

  ticketsFound: readTickets(),
  collectTicket: (id) =>
    set((s) => {
      if (s.ticketsFound.includes(id)) return s;
      const ticketsFound = [...s.ticketsFound, id];
      try {
        window.localStorage.setItem(TICKETS_KEY, JSON.stringify(ticketsFound));
      } catch {
        // private mode — in-session progress still counts
      }
      return { ticketsFound };
    }),
  ticketsCelebrated: readFlag(TICKETS_CELEBRATED_KEY),
  celebrateTickets: () => {
    writeFlag(TICKETS_CELEBRATED_KEY, true);
    set({ ticketsCelebrated: true });
  },
  resetTickets: () => {
    try {
      window.localStorage.removeItem(TICKETS_KEY);
    } catch {
      // ignore
    }
    writeFlag(TICKETS_CELEBRATED_KEY, false);
    set({ ticketsFound: [], ticketsCelebrated: false });
  },
  burst: { seq: 0, pos: [0, 0, 0] },
  fireBurst: (pos) => set((s) => ({ burst: { seq: s.burst.seq + 1, pos } })),

  mode: 'travelling',
  activeAttraction: null,
  focusedAttraction: null,
  activeStall: null,
  progress: 0,
  sections: {},
  setProgress: (progress) => set({ progress }),
  setSections: (sections) => set({ sections }),
  focus: (attraction) => set({ focusedAttraction: attraction }),
  open: (attraction) => set({ mode: 'viewing', activeAttraction: attraction }),
  close: () => set({ mode: 'travelling', activeAttraction: null, focusedAttraction: null }),
  stepIn: (stall) => set({ mode: 'playing', activeStall: stall }),
  // Also clear focusedAttraction so IsoControls releases the booth and the iso
  // camera eases back to the overview (otherwise it stays parked at the stall).
  exit: () => set({ mode: 'travelling', activeStall: null, focusedAttraction: null }),

  ballTossScore: 0,
  ballTossBallsLeft: BALL_TOSS_BALLS,
  ballTossPhase: 'intro',
  ballTossRound: 0,
  resetBallToss: () =>
    set({ ballTossScore: 0, ballTossBallsLeft: BALL_TOSS_BALLS, ballTossPhase: 'intro' }),

  strikerPhase: 'intro',
  strikerArmedAt: 0,
  strikerPower: 0,
  strikerAttemptsLeft: STRIKER_SWINGS,
  strikerBest: 0,
  strikerRound: 0,
  setStriker: (patch) => set(patch),
  resetStriker: () =>
    set({
      strikerPhase: 'intro',
      strikerArmedAt: 0,
      strikerPower: 0,
      strikerAttemptsLeft: STRIKER_SWINGS,
      strikerBest: 0,
    }),
  replayStriker: () =>
    set((s) => ({
      strikerPhase: 'armed',
      strikerArmedAt: performance.now(),
      strikerPower: 0,
      strikerAttemptsLeft: STRIKER_SWINGS,
      strikerBest: 0,
      strikerRound: s.strikerRound + 1,
    })),
  replayBallToss: () =>
    set((s) => ({
      ballTossScore: 0,
      ballTossBallsLeft: BALL_TOSS_BALLS,
      ballTossPhase: 'aiming',
      ballTossRound: s.ballTossRound + 1,
    })),
  setBallToss: (patch) => set(patch),
}));

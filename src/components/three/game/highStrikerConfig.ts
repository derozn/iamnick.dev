/**
 * highStrikerConfig — every feel-knob of the strength-test mini-game in one
 * place (mirrors ballTossConfig). NO three imports: the DOM HUD shares this
 * file, so it must stay static-bundle safe.
 *
 * The game is pure timing: while `armed`, a needle sweeps a triangle wave; a
 * tap captures `meterValue(now - armedAt)` as the swing power. Both the DOM
 * gauge and the in-canvas tap read the SAME deterministic function, so what
 * you see is exactly what you hit — no store churn per frame.
 */

/** Prop base in three-space (Unity (-6.689, 0.108, -5.366) → z flipped). */
export const STRIKER_BASE: [number, number, number] = [-6.69, 0.11, 5.37];
/** World offset from the base to the puck rail (tune by eye — pole centre). */
export const PUCK_OFFSET: [number, number, number] = [0, 0, 0.3];
/** Puck travel (metres) — the prop is ~6.5 m tall with the bell at the top. */
export const PUCK_START_Y = 0.8;
export const POLE_TOP_Y = 6.0;

/** Seconds for one full up-and-down sweep of the power needle. */
export const METER_PERIOD = 1.25;

/** Deterministic needle position [0,1] for a given ms-since-armed. */
export const meterValue = (msSinceArmed: number): number => {
  const t = (msSinceArmed / 1000 / METER_PERIOD) % 1;
  return t < 0.5 ? t * 2 : 2 - t * 2; // triangle wave
};

/* Scoring bands */
export const PERFECT = 0.94;
export const GREAT = 0.72;
export const OK = 0.45;

/** Result copy by best power, worst → best (label shown on the done card). */
export const RESULT_LABELS: readonly [number, string][] = [
  [0, 'Wet noodle'],
  [OK, 'Fairly fair'],
  [GREAT, 'Big-top strong'],
  [PERFECT, 'RING THAT BELL!'],
];

export const resultLabel = (power: number): string => {
  let label = RESULT_LABELS[0][1];
  for (const [threshold, text] of RESULT_LABELS) {
    if (power >= threshold) label = text;
  }
  return label;
};

/* Puck kinematics */
export const RISE_TIME = 0.5; // seconds to reach apex (eased)
export const HOLD_TIME = 0.25; // pause at apex (bell moment)
export const FALL_G = -10; // gravity on the way down
/** Puck height for a given power — sub-linear so mid hits still look decent. */
export const puckApex = (power: number): number =>
  PUCK_START_Y + Math.pow(power, 1.2) * (POLE_TOP_Y - PUCK_START_Y);

/** Delay before re-arming after a swing resolves (or ending the round). */
export const REARM_DELAY = 1.3;

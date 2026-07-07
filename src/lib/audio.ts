/**
 * audio — the carnival's sound engine. A WebAudio singleton with NO react/three
 * imports, so anything (HUD buttons, the in-canvas games, the intro) can trigger
 * sounds without pulling the 3-D chunk into the static bundle.
 *
 * Every SFX is SYNTHESIZED (oscillators + shaped noise): zero downloads, zero
 * licensing, instant availability. The ambience is a generative night-fair bed
 * (wind + slow shimmer) — unless a real recording exists at /audio/ambience.mp3,
 * which is preferred when present (drop in any CC0 fairground loop).
 *
 * Graph: source → sfx/ambience gain → duck gain → master gain → destination.
 * The context is created lazily inside a user gesture (autoplay policy) via
 * `initAudio()`; everything is a no-op before that.
 */

export type SfxName = 'throw' | 'bottle' | 'punch' | 'bell' | 'whoosh' | 'pop' | 'click';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let duck: GainNode | null = null;
let sfxBus: GainNode | null = null;
let ambienceBus: GainNode | null = null;
let ambienceStarted = false;
let mutedFlag = false;
const lastPlayed = new Map<SfxName, number>();

const SFX_THROTTLE_MS = 80;
const AMBIENCE_LEVEL = 0.22;
const DUCKED_LEVEL = 0.3;

/** Create (or resume) the context. MUST be called from a user gesture. */
export function initAudio(muted: boolean) {
  if (typeof window === 'undefined') return;
  mutedFlag = muted;
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  duck = ctx.createGain();
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  ambienceBus = ctx.createGain();
  ambienceBus.gain.value = AMBIENCE_LEVEL;
  sfxBus.connect(duck);
  ambienceBus.connect(duck);
  duck.connect(master);
  master.connect(ctx.destination);
}

export function setMuted(muted: boolean) {
  mutedFlag = muted;
  if (!ctx || !master) return;
  master.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.05);
}

/** Pull the whole mix down while a content panel / game HUD is up. */
export function setDucked(ducked: boolean) {
  if (!ctx || !duck) return;
  duck.gain.linearRampToValueAtTime(ducked ? DUCKED_LEVEL : 1, ctx.currentTime + 0.4);
}

/* ---------------------------------------------------------------- helpers */

function noiseBuffer(seconds: number): AudioBuffer {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

interface ToneOpts {
  type?: OscillatorType;
  from: number;
  to?: number;
  dur: number;
  vol?: number;
  at?: number;
}

function tone({ type = 'sine', from, to, dur, vol = 0.5, at = 0 }: ToneOpts) {
  const c = ctx!;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(sfxBus!);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

interface NoiseOpts {
  dur: number;
  vol?: number;
  at?: number;
  filter?: { type: BiquadFilterType; from: number; to?: number; q?: number };
}

function noise({ dur, vol = 0.5, at = 0, filter }: NoiseOpts) {
  const c = ctx!;
  const t0 = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(dur + 0.05);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let head: AudioNode = src;
  if (filter) {
    const f = c.createBiquadFilter();
    f.type = filter.type;
    f.frequency.setValueAtTime(filter.from, t0);
    if (filter.to !== undefined) {
      f.frequency.exponentialRampToValueAtTime(Math.max(10, filter.to), t0 + dur);
    }
    f.Q.value = filter.q ?? 1;
    head.connect(f);
    head = f;
  }
  head.connect(g).connect(sfxBus!);
  src.start(t0);
  src.stop(t0 + dur + 0.1);
}

/* ------------------------------------------------------------------- SFX */

const SFX: Record<SfxName, () => void> = {
  // ball leaves the sling: short filtered-noise swish, pitching down
  throw: () => {
    noise({ dur: 0.22, vol: 0.5, filter: { type: 'bandpass', from: 2400, to: 500, q: 1.4 } });
  },
  // milk bottle topple: metallic clatter — noise burst + two detuned clanks
  bottle: () => {
    noise({ dur: 0.18, vol: 0.55, filter: { type: 'highpass', from: 1800 } });
    tone({ type: 'triangle', from: 1250, to: 700, dur: 0.16, vol: 0.28 });
    tone({ type: 'triangle', from: 880, to: 460, dur: 0.22, vol: 0.22, at: 0.03 });
  },
  // ticket punch: a snappy paper click-thunk
  punch: () => {
    noise({ dur: 0.07, vol: 0.6, filter: { type: 'highpass', from: 2500 } });
    tone({ type: 'square', from: 320, to: 180, dur: 0.09, vol: 0.3, at: 0.015 });
    tone({ type: 'sine', from: 1040, dur: 0.18, vol: 0.16, at: 0.03 });
  },
  // high-striker bell: struck brass — fundamental + inharmonic partials
  bell: () => {
    tone({ type: 'sine', from: 880, dur: 1.4, vol: 0.5 });
    tone({ type: 'sine', from: 1320, dur: 1.0, vol: 0.28 });
    tone({ type: 'sine', from: 1760 * 1.183, dur: 0.7, vol: 0.18 });
    noise({ dur: 0.05, vol: 0.35, filter: { type: 'highpass', from: 3000 } });
  },
  // meter whoosh / mallet swing
  whoosh: () => {
    noise({ dur: 0.3, vol: 0.4, filter: { type: 'bandpass', from: 500, to: 2800, q: 1.2 } });
  },
  // confetti pop
  pop: () => {
    noise({ dur: 0.09, vol: 0.55, filter: { type: 'bandpass', from: 1200, q: 0.7 } });
    tone({ type: 'sine', from: 420, to: 180, dur: 0.12, vol: 0.35 });
  },
  // generic UI click
  click: () => {
    tone({ type: 'sine', from: 660, to: 520, dur: 0.06, vol: 0.25 });
  },
};

export function playSfx(name: SfxName) {
  if (!ctx || !sfxBus || mutedFlag) return;
  const now = performance.now();
  const last = lastPlayed.get(name) ?? -Infinity;
  if (now - last < SFX_THROTTLE_MS) return; // bottle cascades etc.
  lastPlayed.set(name, now);
  SFX[name]();
}

/* -------------------------------------------------------------- ambience */

/**
 * Start the ambience bed (idempotent). Prefers a real recording at
 * /audio/ambience.mp3; otherwise synthesizes a soft night-fair bed: band-passed
 * wind noise with a slow breathing LFO + a faint airy shimmer.
 */
export function startAmbience() {
  if (!ctx || !ambienceBus || ambienceStarted) return;
  ambienceStarted = true;
  const c = ctx;
  const bus = ambienceBus;

  void fetch('/audio/ambience.mp3')
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('no ambience file'))))
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(bus);
      src.start();
    })
    .catch(() => {
      // generative fallback — wind bed
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(4);
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 240;
      f.Q.value = 0.45;
      const g = c.createGain();
      g.gain.value = 0.5;
      // slow breathing on the wind so it doesn't read as flat hiss
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 0.2;
      lfo.connect(lfoGain).connect(g.gain);
      // faint high shimmer (distant rides / chimes feel)
      const shimmer = c.createBufferSource();
      shimmer.buffer = noiseBuffer(4);
      shimmer.loop = true;
      const sf = c.createBiquadFilter();
      sf.type = 'bandpass';
      sf.frequency.value = 3200;
      sf.Q.value = 6;
      const sg = c.createGain();
      sg.gain.value = 0.035;
      const slfo = c.createOscillator();
      slfo.frequency.value = 0.043;
      const slfoGain = c.createGain();
      slfoGain.gain.value = 0.02;
      slfo.connect(slfoGain).connect(sg.gain);
      src.connect(f).connect(g).connect(bus);
      shimmer.connect(sf).connect(sg).connect(bus);
      src.start();
      shimmer.start();
      lfo.start();
      slfo.start();
    });
}

/** Test-only: tear the singleton down. */
export function __resetAudioForTests() {
  void ctx?.close().catch(() => undefined);
  ctx = null;
  master = null;
  duck = null;
  sfxBus = null;
  ambienceBus = null;
  ambienceStarted = false;
  mutedFlag = false;
  lastPlayed.clear();
}

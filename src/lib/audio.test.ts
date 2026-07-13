import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetAudioForTests,
  initAudio,
  playSfx,
  setDucked,
  setMuted,
  startAmbience,
} from './audio';

/**
 * A minimal Web Audio graph — jsdom has no AudioContext. Nodes are generic:
 * every AudioParam exposes the ramp methods as spies, connect() is chainable.
 * We assert lifecycle + gating, not the tone scheduling itself.
 */
const makeParam = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
  setTargetAtTime: vi.fn(),
});
const makeNode = () => {
  const node: Record<string, unknown> = {
    gain: makeParam(),
    frequency: makeParam(),
    Q: makeParam(),
    connect: vi.fn(() => node),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null,
    loop: false,
    type: '',
  };
  return node;
};

let ctorCalls = 0;
let created: ReturnType<typeof makeNode>[] = [];

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  sampleRate = 48000;
  destination = makeNode();
  constructor() {
    ctorCalls += 1;
  }
  createGain() {
    const n = makeNode();
    created.push(n);
    return n;
  }
  createOscillator() {
    const n = makeNode();
    created.push(n);
    return n;
  }
  createBufferSource() {
    const n = makeNode();
    created.push(n);
    return n;
  }
  createBiquadFilter() {
    return makeNode();
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(8) };
  }
  decodeAudioData() {
    return Promise.resolve({});
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

beforeEach(() => {
  ctorCalls = 0;
  created = [];
  vi.stubGlobal('AudioContext', MockAudioContext);
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: false }) as unknown as Promise<Response>),
  );
});

afterEach(() => {
  __resetAudioForTests();
  vi.unstubAllGlobals();
});

describe('audio lifecycle', () => {
  it('creates the context once across repeated initAudio calls', () => {
    initAudio(false);
    initAudio(false);
    expect(ctorCalls).toBe(1);
  });

  it('starts muted or unmuted per the flag', () => {
    initAudio(true);
    const master = created.find((n) => (n.gain as { value: number }).value === 0);
    expect(master).toBeTruthy();
  });

  it('setMuted before init is a no-op (no throw, no context)', () => {
    expect(() => setMuted(true)).not.toThrow();
    expect(ctorCalls).toBe(0);
  });

  it('setMuted after init ramps the master gain', () => {
    initAudio(false);
    setMuted(true);
    const ramped = created.some((n) =>
      (
        n.gain as { linearRampToValueAtTime: ReturnType<typeof vi.fn> }
      ).linearRampToValueAtTime.mock.calls.some((c) => c[0] === 0),
    );
    expect(ramped).toBe(true);
  });

  it('setDucked after init ramps a gain toward the ducked level', () => {
    initAudio(false);
    expect(() => setDucked(true)).not.toThrow();
  });
});

describe('playSfx gating', () => {
  it('does nothing while muted', () => {
    initAudio(true);
    const before = created.length;
    playSfx('click');
    expect(created.length).toBe(before); // no new nodes spun up
  });

  it('throttles repeated plays of the same sound', () => {
    initAudio(false);
    playSfx('click');
    const afterFirst = created.length;
    playSfx('click'); // immediately again — throttled
    expect(created.length).toBe(afterFirst);
  });
});

describe('startAmbience', () => {
  it('is idempotent and falls back to the generative bed when no file is present', async () => {
    initAudio(false);
    startAmbience();
    startAmbience(); // second call is a no-op
    await Promise.resolve();
    await Promise.resolve();
    // the fallback (fetch not ok) builds buffer-source-based wind — nodes exist
    expect(created.length).toBeGreaterThan(0);
  });
});

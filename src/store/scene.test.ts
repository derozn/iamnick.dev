import { afterEach, describe, expect, it } from 'vitest';

import { useSceneStore } from './scene';

const reset = () =>
  useSceneStore.setState({
    mode: 'travelling',
    activeStall: null,
    progress: 0,
    sections: {},
  });

describe('store/scene', () => {
  afterEach(reset);

  it('starts travelling at progress 0 with no sections', () => {
    const { mode, activeStall, progress, sections } = useSceneStore.getState();
    expect(mode).toBe('travelling');
    expect(activeStall).toBeNull();
    expect(progress).toBe(0);
    expect(sections).toEqual({});
  });

  it('setProgress updates progress', () => {
    useSceneStore.getState().setProgress(0.42);
    expect(useSceneStore.getState().progress).toBe(0.42);
  });

  it('setSections stores per-attraction bands', () => {
    const bands = { header: { start: 0, end: 0.2 }, contact: { start: 0.9, end: 1 } };
    useSceneStore.getState().setSections(bands);
    expect(useSceneStore.getState().sections).toEqual(bands);
  });

  it('stepIn enters playing mode and records the active stall', () => {
    useSceneStore.getState().stepIn('ball-toss');
    expect(useSceneStore.getState().mode).toBe('playing');
    expect(useSceneStore.getState().activeStall).toBe('ball-toss');
  });

  it('exit returns to travelling and clears the active stall', () => {
    useSceneStore.getState().stepIn('doodle-wall');
    useSceneStore.getState().exit();
    expect(useSceneStore.getState().mode).toBe('travelling');
    expect(useSceneStore.getState().activeStall).toBeNull();
  });

  it('loadProgress only moves forward; veilLive toggles', () => {
    useSceneStore.getState().setLoadProgress(0.4);
    useSceneStore.getState().setLoadProgress(0.2); // useProgress jitter must not regress
    expect(useSceneStore.getState().loadProgress).toBe(0.4);
    useSceneStore.getState().setLoadProgress(0.9);
    expect(useSceneStore.getState().loadProgress).toBe(0.9);
    useSceneStore.getState().setVeilLive(true);
    expect(useSceneStore.getState().veilLive).toBe(true);
    useSceneStore.setState({ loadProgress: 0, veilLive: false });
  });

  it('collectTicket appends once, persists, and fireBurst bumps the trigger', () => {
    useSceneStore.getState().collectTicket('ferris');
    useSceneStore.getState().collectTicket('ferris'); // idempotent
    useSceneStore.getState().collectTicket('bigtop');
    expect(useSceneStore.getState().ticketsFound).toEqual(['ferris', 'bigtop']);
    expect(JSON.parse(window.localStorage.getItem('iamnick:tickets')!)).toEqual([
      'ferris',
      'bigtop',
    ]);
    const seq0 = useSceneStore.getState().burst.seq;
    useSceneStore.getState().fireBurst([1, 2, 3]);
    expect(useSceneStore.getState().burst).toEqual({ seq: seq0 + 1, pos: [1, 2, 3] });
    useSceneStore.getState().celebrateTickets();
    expect(useSceneStore.getState().ticketsCelebrated).toBe(true);
    useSceneStore.getState().resetTickets();
    expect(useSceneStore.getState().ticketsFound).toEqual([]);
    expect(useSceneStore.getState().ticketsCelebrated).toBe(false);
    expect(window.localStorage.getItem('iamnick:tickets')).toBeNull();
  });

  it('toggleMuted flips and persists', () => {
    expect(useSceneStore.getState().muted).toBe(false);
    useSceneStore.getState().toggleMuted();
    expect(useSceneStore.getState().muted).toBe(true);
    expect(window.localStorage.getItem('iamnick:muted')).toBe('1');
    useSceneStore.getState().toggleMuted();
    expect(useSceneStore.getState().muted).toBe(false);
    expect(window.localStorage.getItem('iamnick:muted')).toBeNull();
  });

  it('starts with post-fx allowed; blockPostFx trips and persists the flag', () => {
    expect(useSceneStore.getState().postFxBlocked).toBe(false);
    useSceneStore.getState().blockPostFx();
    expect(useSceneStore.getState().postFxBlocked).toBe(true);
    expect(window.localStorage.getItem('iamnick:postfx-blocked')).toBe('1');
    window.localStorage.removeItem('iamnick:postfx-blocked');
    useSceneStore.setState({ postFxBlocked: false });
  });
});

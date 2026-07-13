import { afterEach, describe, expect, it } from 'vitest';

import { STRIKER_SWINGS, useSceneStore } from './scene';
import { meterValue, resultLabel } from '@/components/three/game/highStrikerConfig';

const reset = () =>
  useSceneStore.setState({
    mode: 'travelling',
    activeStall: null,
  });

describe('store/scene', () => {
  afterEach(reset);

  it('starts travelling with no active stall', () => {
    const { mode, activeStall } = useSceneStore.getState();
    expect(mode).toBe('travelling');
    expect(activeStall).toBeNull();
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
    useSceneStore.getState().setVeilDone(true);
    expect(useSceneStore.getState().veilDone).toBe(true);
    useSceneStore.setState({ loadProgress: 0, veilLive: false, veilDone: false });
  });

  it('striker: arm → strike → replay round-trips', () => {
    const s = () => useSceneStore.getState();
    expect(s().strikerPhase).toBe('intro');
    s().setStriker({ strikerPhase: 'armed', strikerArmedAt: 1000 });
    s().setStriker({
      strikerPhase: 'struck',
      strikerPower: 0.97,
      strikerAttemptsLeft: s().strikerAttemptsLeft - 1,
      strikerBest: 0.97,
    });
    expect(s().strikerAttemptsLeft).toBe(STRIKER_SWINGS - 1);
    expect(s().strikerBest).toBe(0.97);
    s().replayStriker();
    expect(s().strikerPhase).toBe('armed');
    expect(s().strikerAttemptsLeft).toBe(STRIKER_SWINGS);
    expect(s().strikerBest).toBe(0);
    expect(s().strikerRound).toBe(1);
    s().resetStriker();
    expect(s().strikerPhase).toBe('intro');
  });

  it('striker meter is a deterministic triangle wave with sensible labels', () => {
    expect(meterValue(0)).toBe(0);
    expect(meterValue(625)).toBeCloseTo(1); // half of METER_PERIOD (1.25s) = peak
    expect(meterValue(1250)).toBeCloseTo(0); // full period = back home
    expect(meterValue(312.5)).toBeCloseTo(0.5);
    expect(resultLabel(0.2)).toBe('Wet noodle');
    expect(resultLabel(0.5)).toBe('Fairly fair');
    expect(resultLabel(0.8)).toBe('Big-top strong');
    expect(resultLabel(0.97)).toBe('RING THAT BELL!');
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

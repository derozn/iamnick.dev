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
});

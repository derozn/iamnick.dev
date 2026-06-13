import { afterEach, describe, expect, it } from 'vitest';

import { useScrollStore } from './scroll';

const reset = () => useScrollStore.setState({ progress: 0, sections: {} });

describe('store/scroll', () => {
  afterEach(reset);

  it('starts at progress 0 with no sections', () => {
    const { progress, sections } = useScrollStore.getState();
    expect(progress).toBe(0);
    expect(sections).toEqual({});
  });

  it('setProgress updates progress', () => {
    useScrollStore.getState().setProgress(0.42);
    expect(useScrollStore.getState().progress).toBe(0.42);
  });

  it('setSections stores per-stop bands', () => {
    const bands = { hero: { start: 0, end: 0.2 }, contact: { start: 0.9, end: 1 } };
    useScrollStore.getState().setSections(bands);
    expect(useScrollStore.getState().sections).toEqual(bands);
  });
});

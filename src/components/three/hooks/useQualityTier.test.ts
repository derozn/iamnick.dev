import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setupMatchMedia } from '@test/helpers/matchMedia';

import { useQualityTier } from './useQualityTier';

describe('three/useQualityTier', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setupMatchMedia();
  });

  it("resolves to 'none' when the user prefers reduced motion", () => {
    setupMatchMedia({ width: 1440, reducedMotion: true });
    const { result } = renderHook(() => useQualityTier());
    expect(result.current).toBe('none');
  });

  it("resolves to 'low' on a small viewport", () => {
    setupMatchMedia({ width: 600 });
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 8 });
    const { result } = renderHook(() => useQualityTier());
    expect(result.current).toBe('low');
  });

  it("resolves to 'low' on weak hardware even at desktop width", () => {
    setupMatchMedia({ width: 1440 });
    vi.stubGlobal('navigator', { hardwareConcurrency: 4, deviceMemory: 4 });
    const { result } = renderHook(() => useQualityTier());
    expect(result.current).toBe('low');
  });

  it("resolves to 'high' on a wide viewport with capable hardware", () => {
    setupMatchMedia({ width: 1440 });
    vi.stubGlobal('navigator', { hardwareConcurrency: 12, deviceMemory: 8 });
    const { result } = renderHook(() => useQualityTier());
    expect(result.current).toBe('high');
  });
});

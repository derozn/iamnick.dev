import mediaQuery from 'css-mediaquery';
import { vi } from 'vitest';

interface MatchMediaOptions {
  width?: number;
  height?: number;
  reducedMotion?: boolean;
}

/**
 * Installs a `window.matchMedia` mock that answers width/height queries via
 * css-mediaquery and special-cases `prefers-reduced-motion`. Supports both the
 * modern (addEventListener) and legacy (addListener) listener APIs.
 */
export function setupMatchMedia({
  width = 1280,
  height = 800,
  reducedMotion = false,
}: MatchMediaOptions = {}) {
  const matches = (query: string): boolean => {
    if (query.includes('prefers-reduced-motion')) {
      return query.includes('reduce') ? reducedMotion : !reducedMotion;
    }
    return mediaQuery.match(query, { type: 'screen', width, height });
  };

  const matchMedia = vi.fn((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMedia,
  });

  return matchMedia;
}

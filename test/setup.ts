import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';

import { setupMatchMedia } from './helpers/matchMedia';

// jsdom ships neither of these; kept as a global safety net for motion/drei code.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(_cb: IntersectionObserverCallback) {}
}

class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
vi.stubGlobal('ResizeObserver', MockResizeObserver);

// Default desktop viewport; individual tests override via setupMatchMedia().
setupMatchMedia();

afterEach(() => {
  setupMatchMedia();
});

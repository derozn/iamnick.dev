import { vi } from 'vitest';

type Cb = IntersectionObserverCallback;

const observerMap = new Map<Element, Cb>();

/**
 * Installs a controllable IntersectionObserver on `global`; pair with
 * `mockIntersection` to drive callbacks. Call inside a test's beforeEach so it
 * overrides the inert global stub from setup.ts.
 */
export function installIntersectionObserver() {
  class ControllableIntersectionObserver {
    readonly thresholds: ReadonlyArray<number>;
    readonly root: Element | Document | null;
    readonly rootMargin: string;

    constructor(
      private readonly cb: Cb,
      options: IntersectionObserverInit = {},
    ) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold ?? 0];
      this.root = options.root ?? null;
      this.rootMargin = options.rootMargin ?? '';
    }

    observe = (element: Element) => observerMap.set(element, this.cb);
    unobserve = (element: Element) => observerMap.delete(element);
    disconnect = () => observerMap.clear();
    takeRecords = () => [];
  }

  vi.stubGlobal('IntersectionObserver', ControllableIntersectionObserver);
}

export function resetIntersectionObserver() {
  observerMap.clear();
}

/** Fire the observed element's callback with the given intersection state. */
export function mockIntersection(element: Element, isIntersecting: boolean) {
  const cb = observerMap.get(element);
  if (cb) {
    cb(
      [
        {
          isIntersecting,
          target: element,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  }
}

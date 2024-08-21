const observerMap = new Map();

const IntersectionObserver = jest.fn().mockImplementation((cb, options) => {
  return {
    thresholds: Array.isArray(options.threshold) ? options.threshold : [options.threshold],
    root: options.root,
    rootMargin: options.rootMargin,
    observe: jest.fn((element: Element) => {
      observerMap.set(element, cb);
    }),
    unobserve: jest.fn((element: Element) => {
      observerMap.delete(element);
    }),
    disconnect: jest.fn(),
  };
});

beforeAll(() => {
  Object.assign(global, { IntersectionObserver });
});

afterEach(() => {
  // @ts-ignore
  global.IntersectionObserver.mockClear();
  observerMap.clear();
});

afterAll(() => {
  // @ts-ignore
  global.IntersectionObserver.mockReset();
  Object.assign(global, { IntersectionObserver: undefined });
});

export function mockIntersection(element: Element, isIntersecting: boolean) {
  const cb = observerMap.get(element);
  if (cb) {
    cb([
      {
        isIntersecting,
        target: element,
        intersectionRatio: isIntersecting ? 1 : -1,
      },
    ]);
  }
}

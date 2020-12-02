import { useState, useEffect, useCallback } from 'react';
import { throttle } from 'throttle-debounce';

const windowEvents = new Set<Function>();
const handleResize = () => windowEvents.forEach((fn: Function) => fn());
const getSizes = () =>
  process.browser
    ? {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      }
    : {};

const useWindowSize = ({ throttleAmount = 100 } = {}) => {
  const [size, setSize] = useState(getSizes());

  const throttledResize = useCallback(
    throttle(throttleAmount, () => {
      setSize(getSizes());
    }),
    [setSize, throttleAmount],
  );

  useEffect(() => {
    if (process.browser) {
      if (!windowEvents.size) {
        window.addEventListener('resize', handleResize, true);
      }

      windowEvents.add(throttledResize);

      return () => {
        // @ts-ignore
        throttledResize?.cancel?.();

        windowEvents.delete(throttledResize);

        if (!windowEvents.size) {
          window.removeEventListener('resize', handleResize, true);
        }
      };
    }

    return undefined;
  }, [throttledResize]);

  return size;
};

export default useWindowSize;

import { useEffect } from 'react';

let rAFToken: number = 0;

const callbacks = new Set<Function>();
const invokeCallbacks = () => callbacks.forEach((fn) => fn());

const updateFrame = () => {
  invokeCallbacks();
  rAFToken = window.requestAnimationFrame(updateFrame);
};

const useFrame = (callback: Function) => {
  useEffect(() => {
    callbacks.add(callback);

    if (!rAFToken) updateFrame();

    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        window.cancelAnimationFrame(rAFToken);
        rAFToken = 0;
      }
    };
  }, [callback]);
};

export default useFrame;

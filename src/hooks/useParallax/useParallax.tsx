import { useRef, RefObject, useEffect } from 'react';

function useParallax<T extends HTMLElement>(): [RefObject<T>] {
  const ref = useRef<T>(null);

  useEffect(() => {
    const currentRef = ref.current;

    const handleScroll = () => {
      if (!currentRef) return;

      // const rect = currentRef.getBoundingClientRect();
      const scrollTop = window.scrollY;

      const offset = scrollTop / 2;

      currentRef.style.transform = `translate3d(0, -${offset}px, 0)`;
    };

    if (currentRef) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (currentRef) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [ref]);

  return [ref];
}

export default useParallax;

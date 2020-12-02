import { useState, useEffect, useRef, RefObject } from 'react';

// SORT THIS OUT
import 'intersection-observer';

type Props = {
  rootMargin?: string | undefined;
  persist?: boolean;
};

function useOnScreen<T extends HTMLElement>({ rootMargin = '0px', persist = false }: Props = {}): [
  RefObject<T>,
  boolean,
] {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  const ref = useRef<T>(null);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);

        if (persist && entry.isIntersecting && currentRef) observer.unobserve(currentRef);
      },
      {
        rootMargin,
      },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin, persist]);

  return [ref, isIntersecting];
}

export default useOnScreen;

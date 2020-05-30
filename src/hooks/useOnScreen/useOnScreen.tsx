import { useState, useEffect, useRef, RefObject } from 'react';

function useOnScreen<T extends HTMLElement>(
  rootMargin: string | undefined = '0px',
): [RefObject<T>, boolean] {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  const ref = useRef<T>(null);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
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
  }, [ref, rootMargin]);

  return [ref, isIntersecting];
}

export default useOnScreen;

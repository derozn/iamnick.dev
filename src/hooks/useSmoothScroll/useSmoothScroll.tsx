import { useCallback, useEffect, useRef } from 'react';
import useResize from '#hooks/useResize';
import useFrame from '#hooks/useFrame';

type Props = {
  enabled?: boolean;
};

const MathUtils = {
  // map number x from range [a, b] to [c, d]
  // @ts-ignore
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
  // linear interpolation
  // @ts-ignore
  lerp: (a, b, n) => (1 - n) * a + n * b,
};

/**
 *
 * @todo Add in the remove option. Add in item component to hook into the values so parallax components
 */
const useSmoothScroll = ({ enabled = true }: Props = {}) => {
  const rootAnchorRef = useRef<HTMLElement>(null);
  const rootScrollRef = useRef<HTMLElement>(null);

  const offsets = useRef({
    translationY: {
      // interpolated value
      previous: 0,
      // current value
      current: 0,
      // amount to interpolate
      ease: 0.1,
    },
  });

  const cachedStyles = useRef({
    top: '0',
    left: '0',
    display: 'block',
    width: '0',
    height: '0',
    overflow: 'hidden',
    position: 'relative',
  });

  const { innerWidth, innerHeight } = useResize();

  const getDocScroll = () => {
    return window.pageYOffset || document.documentElement.scrollTop;
  };

  const setSize = (scrollRef: HTMLElement) => {
    document.body.style.height = `${scrollRef.scrollHeight}px`;
  };

  const removeSize = () => {
    document.body.style.height = '';
  };

  const setLayout = (scrollRef: HTMLElement) => {
    scrollRef.style.transform = `translate3d(0,${-1 * offsets.current.translationY.previous}px,0)`;
  };

  const removeLayout = (scrollRef: HTMLElement) => {
    scrollRef.style.transform = '';
  };

  const resetOffsets = useCallback(() => {
    Object.values(offsets.current).forEach((offset) => {
      const pageYOffset = getDocScroll();

      offset.current = pageYOffset;
      offset.previous = pageYOffset;
    });
  }, []);

  const updateOffsets = () => {
    Object.values(offsets.current).forEach((offset) => {
      const pageYOffset = getDocScroll();

      offset.current = pageYOffset;
      offset.previous = MathUtils.lerp(offset.previous, offset.current, offset.ease);
    });
  };

  const setStyle = (anchorRef: HTMLElement) => {
    anchorRef.style.position = 'fixed';
    anchorRef.style.width = '100%';
    anchorRef.style.height = '100%';
    anchorRef.style.top = '0';
    anchorRef.style.left = '0';
    anchorRef.style.overflow = 'hidden';
  };

  const removeStyle = (anchorRef: HTMLElement) => {
    anchorRef.style.display = cachedStyles.current.display;
    anchorRef.style.position = cachedStyles.current.position;
    anchorRef.style.width = cachedStyles.current.width;
    anchorRef.style.height = cachedStyles.current.height;
    anchorRef.style.top = cachedStyles.current.top;
    anchorRef.style.left = cachedStyles.current.left;
    anchorRef.style.overflow = cachedStyles.current.overflow;
  };

  const cacheStyle = (anchorRef: HTMLElement) => {
    cachedStyles.current = {
      display: anchorRef.style.display,
      position: anchorRef.style.position,
      width: anchorRef.style.width,
      height: anchorRef.style.height,
      top: anchorRef.style.top,
      left: anchorRef.style.left,
      overflow: anchorRef.style.overflow,
    };
  };

  useEffect(() => {
    const anchorRef = rootAnchorRef?.current ?? document.querySelector('main');
    const scrollRef = rootScrollRef?.current;

    if (!enabled || !scrollRef || !anchorRef) return undefined;

    setSize(scrollRef);
    resetOffsets();
    setLayout(scrollRef);
    cacheStyle(anchorRef);
    setStyle(anchorRef);

    return () => {
      removeSize();
      removeLayout(scrollRef);
      removeStyle(anchorRef);
    };
  }, [rootAnchorRef, rootScrollRef, resetOffsets, enabled]);

  useEffect(() => {
    const scrollRef = rootScrollRef?.current;

    if (!enabled || !scrollRef) return;

    setSize(scrollRef);
    resetOffsets();
    setLayout(scrollRef);
  }, [innerWidth, innerHeight, resetOffsets, enabled]);

  const render = () => {
    const scrollRef = rootScrollRef?.current;

    if (!enabled || !scrollRef) return;

    updateOffsets();
    setLayout(scrollRef);
  };

  useFrame(render);

  return {
    anchorRef: rootAnchorRef,
    scrollRef: rootScrollRef,
  };
};

export default useSmoothScroll;

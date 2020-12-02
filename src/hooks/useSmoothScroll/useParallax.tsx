import { useEffect, useRef } from 'react';
import useResize from '#hooks/useResize';
import useFrame from '#hooks/useFrame';

type Options = {
  ease?: number;
  maxValue?: number;
};

const MathUtils = {
  // map number x from range [a, b] to [c, d]
  // @ts-ignore
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
  // linear interpolation
  // @ts-ignore
  lerp: (a, b, n) => (1 - n) * a + n * b,
};

const useParallax = (options: Options = {}) => {
  const anchorRef = useRef<HTMLElement>(null);
  const isVisible = useRef(false);
  const props = useRef({
    height: 0,
    top: 0,
  });
  const offsets = useRef({
    translationY: {
      // interpolated value
      previous: 0,
      // current value
      current: 0,
      // amount to interpolate
      ease: options.ease || 0.1,
      maxValue: options.maxValue || 100,
    },
  });

  const { innerWidth, innerHeight } = useResize();

  const getDocScroll = () => {
    return window.pageYOffset || document.documentElement.scrollTop;
  };

  const getSize = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect() || { height: 0, top: 0 };
    props.current = {
      height: rect.height,
      top: getDocScroll() + rect.top,
    };
  };

  const getOffsetValue = ({ maxValue }: { maxValue: number }): number => {
    const minValue = -1 * maxValue;
    return Math.max(
      Math.min(
        MathUtils.map(
          props.current.top - getDocScroll(),
          innerHeight,
          -1 * props.current.height,
          minValue,
          maxValue,
        ),
        maxValue,
      ),
      minValue,
    );
  };

  const updateOffsets = () => {
    Object.values(offsets.current).forEach((offset) => {
      const medium = getOffsetValue(offset);

      offset.current = medium;
      offset.previous = MathUtils.lerp(offset.previous, offset.current, offset.ease);
    });
  };

  const resetOffsets = () => {
    Object.values(offsets.current).forEach((offset) => {
      const medium = getOffsetValue(offset);

      offset.previous = medium;
      offset.current = medium;
    });
  };

  const updateLayout = (el: HTMLElement) => {
    el.style.transform = `translate3d(0,${offsets.current.translationY.previous}px,0)`;
  };

  const update = () => {
    if (!anchorRef.current) {
      return;
    }

    getSize(anchorRef.current);
    resetOffsets();
    updateLayout(anchorRef.current);
  };

  const render = () => {
    if (!anchorRef.current) {
      return;
    }

    updateOffsets();
    updateLayout(anchorRef.current);
  };

  useEffect(() => {
    if (options.maxValue == null) {
      return;
    }

    offsets.current.translationY.maxValue = options.maxValue;
  }, [options.maxValue]);

  useEffect(() => {
    const ref = anchorRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible.current = entry.intersectionRatio > 0;
      });
    });

    if (ref) observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [anchorRef, isVisible]);

  useEffect(update, [innerWidth, innerHeight]);
  useFrame(render);

  return { anchorRef };
};

export default useParallax;

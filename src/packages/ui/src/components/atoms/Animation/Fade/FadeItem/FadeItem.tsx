'use client';

import classnames, { Argument } from 'classnames';
import { motion, LayoutProps, HTMLMotionProps } from 'framer-motion';
import { forwardRef, PropsWithChildren, ReactHTML, useMemo } from 'react';

export interface IFadeItemProps {
  itemKey?: any;
  delay?: number;
  duration?: number;
  className?: Argument;
  layout?: LayoutProps['layout'];
  isActive?: boolean; // Allows for controlling the fade item instead
  as?: keyof ReactHTML;
}

export const FadeItem = forwardRef<
  HTMLSpanElement,
  PropsWithChildren<IFadeItemProps>
>(
  (
    {
      children,
      itemKey,
      className,
      delay,
      layout,
      isActive = true,
      duration = 0.25,
      as = 'span',
    },
    ref
  ) => {
    const MotionElement = useMemo(
      () => motion<HTMLMotionProps<typeof as>>(as),
      [as]
    );

    return (
      <MotionElement
        ref={ref}
        className={classnames(className, 'ui-w-[inherit] ui-h-[inherit]')}
        key={itemKey}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isActive ? 1 : 0,
        }}
        exit={{ opacity: 0, pointerEvents: 'none' }}
        transition={{ duration, delay }}
        layout={layout}
      >
        {children}
      </MotionElement>
    );
  }
);

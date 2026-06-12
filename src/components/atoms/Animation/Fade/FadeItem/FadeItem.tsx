'use client';

import { motion, type MotionProps } from 'motion/react';
import { forwardRef, PropsWithChildren } from 'react';

import { cn } from '@/lib/cn';

export interface IFadeItemProps {
  itemKey?: string | number;
  delay?: number;
  duration?: number;
  className?: string;
  layout?: MotionProps['layout'];
  isActive?: boolean; // Allows for controlling the fade item instead
}

export const FadeItem = forwardRef<HTMLSpanElement, PropsWithChildren<IFadeItemProps>>(
  ({ children, itemKey, className, delay, layout, isActive = true, duration = 0.25 }, ref) => {
    return (
      <motion.span
        ref={ref}
        className={cn('w-[inherit] h-[inherit]', className)}
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
      </motion.span>
    );
  },
);

FadeItem.displayName = 'FadeItem';

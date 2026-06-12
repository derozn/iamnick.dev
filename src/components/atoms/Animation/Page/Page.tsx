'use client';

import { motion, AnimatePresence, AnimatePresenceProps } from 'framer-motion';
import { FC, PropsWithChildren } from 'react';

export interface IPageAnimationProps {
  childKey: any;
  onExitComplete?: AnimatePresenceProps['onExitComplete'];
}

export const PageAnimation: FC<PropsWithChildren<IPageAnimationProps>> = ({
  children,
  childKey,
  onExitComplete,
}) => (
  <>
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <motion.div
        key={childKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.25 }}
        style={{ width: 'inherit' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </>
);

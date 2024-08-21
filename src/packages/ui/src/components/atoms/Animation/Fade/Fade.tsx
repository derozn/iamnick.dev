'use client';

import { AnimatePresence, AnimatePresenceProps } from 'framer-motion';
import { FC, PropsWithChildren, ReactElement, ReactNode } from 'react';

import { IFadeItemProps } from './FadeItem';

export interface IFadeAnimationProps {
  children?: ReactElement<IFadeItemProps> | ReactElement<IFadeItemProps>[] | ReactNode;
  mode?: AnimatePresenceProps['mode'];
  onExitComplete?: AnimatePresenceProps['onExitComplete'];
  initial?: boolean;
}

export const FadeAnimation: FC<PropsWithChildren<IFadeAnimationProps>> = ({
  children,
  mode,
  onExitComplete,
  initial = false,
}) => (
  <AnimatePresence initial={initial} mode={mode} onExitComplete={onExitComplete}>
    {children}
  </AnimatePresence>
);

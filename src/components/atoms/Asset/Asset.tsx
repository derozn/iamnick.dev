import { PropsWithChildren, FC } from 'react';

import { cn } from '@/lib/cn';

import { FadeAnimation, FadeItem } from '../Animation/Fade';

import { assetStyles, TAssetStyles } from './Asset.styles';

export interface IAssetProps extends TAssetStyles {
  className?: string;
  isLoaded?: boolean;
  showLoader?: boolean;
}

export const Asset: FC<PropsWithChildren<IAssetProps>> = ({
  aspect,
  children,
  className,
  rounded,
  size,
  isLoaded = true,
  hover,
  selected,
  showLoader = true,
  cursor,
}) => {
  const assetStyle = assetStyles({
    aspect,
    rounded,
    size,
    hover,
    selected,
    showLoader: showLoader && !isLoaded,
    cursor,
  });

  return (
    <div className={cn(assetStyle, className)}>
      {children}

      {showLoader && (
        <FadeAnimation mode="popLayout">
          {!isLoaded && (
            <FadeItem itemKey="skeleton" className="absolute top-0 left-0 w-full h-full" delay={0}>
              {/* Pulse placeholder — replaces react-loading-skeleton */}
              <div className="w-full h-full animate-pulse bg-current opacity-10 transform-gpu" />
            </FadeItem>
          )}
        </FadeAnimation>
      )}
    </div>
  );
};

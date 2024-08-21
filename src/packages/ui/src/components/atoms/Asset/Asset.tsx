import classnames, { Argument } from 'classnames';
import { PropsWithChildren, FC } from 'react';

import { Skeleton } from '@iamnick/ui/src/components/atoms/Loader/Skeleton';

import { FadeAnimation, FadeItem } from '../Animation/Fade';

import { assetStyles, TAssetStyles } from './Asset.styles';

export interface IAssetProps extends TAssetStyles {
  className?: Argument;
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
    <div className={classnames(assetStyle, className)}>
      {children}

      {showLoader && (
        <FadeAnimation mode="popLayout">
          {!isLoaded && (
            <FadeItem
              itemKey="skeleton"
              className="ui-absolute ui-top-0 ui-left-0 ui-w-full ui-h-full"
              delay={0}
            >
              <Skeleton
                containerClassName="ui-w-full ui-h-full ui-transform-gpu"
                height="100%"
                width="100%"
                className="ui-align-top"
                borderRadius={0}
              />
            </FadeItem>
          )}
        </FadeAnimation>
      )}
    </div>
  );
};

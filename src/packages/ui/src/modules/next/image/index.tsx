'use client';

import classnames, { Argument } from 'classnames';
import NextImage, { ImageProps } from 'next/image';
import { useState } from 'react';

import { Asset, IAssetProps } from '@iamnick/ui/src/components/atoms/Asset';

import { imageStyles, TImageStyles } from './image.styles';

export interface IImageProps
  extends Omit<ImageProps, 'className' | 'onLoad'>,
    IAssetProps,
    TImageStyles {
  className?: Argument;
}

export const Image = ({
  className,
  rounded,
  aspect,
  size,
  onError,
  fit,
  position,
  ...imageProps
}: IImageProps) => {
  const [loaded, setLoaded] = useState(false);

  const { base } = imageStyles({ fit, position });

  return (
    <Asset rounded={rounded} aspect={aspect} size={size} isLoaded={loaded}>
      <NextImage
        loading="lazy"
        {...imageProps}
        className={classnames(base(), className)}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </Asset>
  );
};

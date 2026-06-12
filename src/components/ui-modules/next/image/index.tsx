'use client';

import NextImage, { ImageProps } from 'next/image';
import { useState } from 'react';

import { Asset, IAssetProps } from '@/components/atoms/Asset';
import { cn } from '@/lib/cn';

import { imageStyles, TImageStyles } from './image.styles';

export interface IImageProps
  extends Omit<ImageProps, 'className' | 'onLoad'>, IAssetProps, TImageStyles {
  className?: string;
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

  return (
    <Asset rounded={rounded} aspect={aspect} size={size} isLoaded={loaded}>
      <NextImage
        loading="lazy"
        {...imageProps}
        className={cn(imageStyles({ fit, position }), className)}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </Asset>
  );
};

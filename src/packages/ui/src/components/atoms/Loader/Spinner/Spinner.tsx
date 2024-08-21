'use client';

import { Oval } from 'react-loader-spinner';

import { theme } from '@iamnick/config/src/theme';

export interface ISpinnerProps {
  color?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  width?: number | string;
  height?: number | string;
}

export const Spinner = ({
  color = theme.colors['snow-white'],
  secondaryColor = theme.colors['background-primary'],
  strokeWidth = 2,
  width = theme.spacing[14],
  height = theme.spacing[14],
}: ISpinnerProps) => {
  return (
    <Oval
      height={height}
      width={width}
      color={color}
      visible={true}
      secondaryColor={secondaryColor}
      strokeWidth={strokeWidth}
      strokeWidthSecondary={strokeWidth}
    />
  );
};

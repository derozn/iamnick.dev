/*
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
*/

export type Display = 'block' | 'inline';
export type Align = 'left' | 'center' | 'right' | 'justify';
export type Component = 'h1' | 'h2' | 'h3';
export type Color = 'primary' | 'secondary' | 'accent';

export type Props = {
  align?: Align;
  color?: Color;
  variant?: string;
  component?: Component;
  display?: Display;
};

export type TextProps = {
  variant?: string;
  textColor?: Color;
  textAlign?: Align;
  displayAs?: Display;
};

export type ComponentToVariantMapping = {
  h1: string;
  h2: string;
  h3: string;
  p: string;
  [key: string]: string;
};

export type Display = 'block' | 'inline';
export type Align = 'left' | 'center' | 'right' | 'justify';
export type Component = 'h1' | 'h2' | 'h3' | 'p';
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

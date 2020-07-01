type Loading = 'eager' | 'lazy';

type Source = {
  srcSet: string;
  type: string;
};

export type ImageProps = {
  src: string;
  alt: string;
  loading?: Loading;
  width?: string;
  height?: string;
};

export type Props = ImageProps & {
  source?: Source | Source[];
};

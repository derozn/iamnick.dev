import { cva, type VariantProps } from 'class-variance-authority';

export const assetStyles = cva('overflow-hidden relative', {
  variants: {
    aspect: {
      square: 'aspect-square',
      video: 'aspect-video',
      standard: 'aspect-standard',
      portrait: 'aspect-portrait',
      auto: 'aspect-auto',
      classic: 'aspect-classic',
      tall: 'aspect-tall',
      print: 'aspect-print',
      photo: 'aspect-photo',
      'large-portrait': 'aspect-large-portrait',
      tv: 'aspect-tv',
    },
    rounded: {
      xxs: 'rounded-2',
      xs: 'rounded-3',
      sm: 'rounded-4',
      md: 'rounded-5',
      lg: 'rounded-7',
    },
    size: {
      inline: 'w-max',
      fill: 'w-full h-full',
    },
    hover: {
      true: 'hover:after:img-overlay after:transition-colors',
    },
    selected: {
      true: 'border-2 border-border-primary',
    },
    showLoader: {
      true: 'bg-background-feedback-negative',
    },
    cursor: {
      pointer: 'cursor-pointer',
    },
  },
  defaultVariants: {
    aspect: 'auto',
    size: 'fill',
    hover: false,
    selected: false,
  },
});

export type TAssetStyles = VariantProps<typeof assetStyles>;

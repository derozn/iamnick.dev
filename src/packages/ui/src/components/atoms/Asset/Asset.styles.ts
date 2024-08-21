import { tv, VariantProps } from '@derozn/tailwind-variants';

import { twMergeConfig } from '@iamnick/ui/src/theme';

export const assetStyles = tv(
  {
    base: 'ui-overflow-hidden ui-relative',
    variants: {
      aspect: {
        square: 'ui-aspect-square',
        video: 'ui-aspect-video',
        standard: 'ui-aspect-standard',
        portrait: 'ui-aspect-portrait',
        auto: 'ui-aspect-auto',
        classic: 'ui-aspect-classic',
        tall: 'ui-aspect-tall',
        print: 'ui-aspect-print',
        photo: 'ui-aspect-photo',
        'large-portrait': 'ui-aspect-large-portrait',
        tv: 'ui-aspect-tv',
      },
      rounded: {
        xxs: 'ui-rounded-2',
        xs: 'ui-rounded-3',
        sm: 'ui-rounded-4',
        md: 'ui-rounded-5',
        lg: 'ui-rounded-7',
      },
      size: {
        inline: 'ui-w-max',
        fill: 'ui-w-full ui-h-full',
      },
      hover: {
        true: 'hover:after:ui-img-overlay after:ui-transition-colors',
      },
      selected: {
        true: 'ui-border-2 ui-border-border-primary',
      },
      showLoader: {
        true: 'ui-bg-background-feedback-negative',
      },
      cursor: {
        pointer: 'ui-cursor-pointer',
      },
    },

    defaultVariants: {
      aspect: 'auto',
      size: 'fill',
      hover: false,
      selected: false,
    },
  },
  {
    responsiveVariants: true,
    twMergeConfig,
  },
);

export type TAssetStyles = VariantProps<typeof assetStyles>;

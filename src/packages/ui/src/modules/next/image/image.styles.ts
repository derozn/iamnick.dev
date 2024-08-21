import { tv, VariantProps } from '@derozn/tailwind-variants';

import { twMergeConfig } from '@iamnick/ui/src/theme';

export const imageStyles = tv(
  {
    slots: {
      base: 'ui-w-full ui-h-full ui-block',
    },
    variants: {
      fit: {
        cover: {
          base: 'ui-object-cover',
        },
        contain: {
          base: 'ui-object-contain',
        },
      },
      position: {
        top: 'ui-object-top',
        center: 'ui-object-center',
        bottom: 'ui-object-bottom',
      },
    },
    defaultVariants: {
      fit: 'cover',
    },
  },
  {
    responsiveVariants: true,
    twMergeConfig,
  },
);

export type TImageStyles = VariantProps<typeof imageStyles>;

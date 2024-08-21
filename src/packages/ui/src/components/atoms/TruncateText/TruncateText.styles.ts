'use client';

import { tv } from '@derozn/tailwind-variants';

import { twMergeConfig } from '@iamnick/ui/src/theme';

export const truncateTextStyles = tv(
  {
    slots: {
      base: '',
    },
    variants: {
      lines: {
        1: {
          base: 'ui-line-clamp-1',
        },
        2: {
          base: 'ui-line-clamp-2',
        },
        3: {
          base: 'ui-line-clamp-3',
        },
      },
    },
    defaultVariants: {
      lines: 2,
    },
  },
  {
    responsiveVariants: true,
    twMergeConfig,
  },
);

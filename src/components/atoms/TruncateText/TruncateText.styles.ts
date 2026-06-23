import { cva, type VariantProps } from 'class-variance-authority';

export const truncateTextStyles = cva('', {
  variants: {
    lines: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
    },
  },
  defaultVariants: {
    lines: 2,
  },
});

export type TTruncateTextStyles = VariantProps<typeof truncateTextStyles>;

import { cva, type VariantProps } from 'class-variance-authority';

export const imageStyles = cva('w-full h-full block', {
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
    },
    position: {
      top: 'object-top',
      center: 'object-center',
      bottom: 'object-bottom',
    },
  },
  defaultVariants: {
    fit: 'cover',
  },
});

export type TImageStyles = VariantProps<typeof imageStyles>;

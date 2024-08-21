import localFont from 'next/font/local';

/**
 * @link https://github.com/vercel/next.js/discussions/43452
 */
export const montserratFont = localFont({
  src: [
    {
      path: '../../../assets/fonts/montserrat-v14-latin-regular.woff2',
      weight: '400',
    },
    {
      path: '../../../assets/fonts/montserrat-v14-latin-600.woff2',
      weight: '600',
    },
  ],
  variable: '--ui-expressive', // This is referenced from the tailwind tokens (tokens/output/tailwind)
});

export const openSansFont = localFont({
  src: '../../../assets/fonts/open-sans-v17-latin-regular.woff2',
  weight: '400',
  variable: '--ui-functional', // This is referenced from the tailwind tokens (tokens/output/tailwind)
});

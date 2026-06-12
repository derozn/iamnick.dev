import localFont from 'next/font/local';

/**
 * @link https://github.com/vercel/next.js/discussions/43452
 */
export const montserratFont = localFont({
  src: [
    {
      path: '../../../../assets/fonts/montserrat-v14-latin-regular.woff2',
      weight: '400',
    },
    {
      path: '../../../../assets/fonts/montserrat-v14-latin-600.woff2',
      weight: '600',
    },
  ],
  variable: '--font-montserrat',
});

export const openSansFont = localFont({
  src: '../../../../assets/fonts/open-sans-v17-latin-regular.woff2',
  weight: '400',
  variable: '--font-open-sans',
});

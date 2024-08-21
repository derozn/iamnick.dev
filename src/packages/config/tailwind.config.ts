import { Config } from 'tailwindcss';

import { host, ui } from './src/roots';
import { theme } from './src/theme';

export default {
  /**
   * @desc All paths to components that are to be used within a service i.e coruscant/DIY Screens.
   */
  content: [host, ui],
  theme,
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('@tailwindcss/typography'), require('@xpd/tailwind-3dtransforms')],
} as unknown as Config;

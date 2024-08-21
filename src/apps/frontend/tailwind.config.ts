import { withTV } from '@derozn/tailwind-variants/transformer';
import { Config } from 'tailwindcss';

import twConfig from '@iamnick/config/tailwind.config';

export default withTV({
  presets: [twConfig],
  corePlugins: {
    preflight: false,
  },
} as Config);

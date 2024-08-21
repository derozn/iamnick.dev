import { generateTypes } from '@derozn/tailwind-variants/dist/generator.js';
import deepmerge from 'deepmerge';
import defaultTheme from 'tailwindcss/defaultTheme';

import { theme } from '../theme/theme';

const screens = deepmerge(defaultTheme.screens, theme.extend?.screens);

generateTypes({ screens: screens as any });

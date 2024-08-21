import { Preview } from '@storybook/react';
import { ThemeProvider } from '@iamnick/ui/src/modules/theme/components';

import '@iamnick/config/tailwind-base.css';
import '@iamnick/ui/src/styles/storybook.css';

export const parameters = {
  layout: 'fullscreen',
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#fff',
        },
        {
          name: 'dark',
          value: '#c2c6c8',
        },
      ],
    },
  },
};

export default preview;

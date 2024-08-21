import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: [{ from: '../src/assets', to: '/' }],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
    {
      name: '@storybook/addon-styling',
      options: {},
    },
    {
      name: '@newhighsco/storybook-addon-transpile-modules',
      options: {
        transpileModules: ['@iamnick/config'],
      },
    },
  ],

  framework: '@storybook/nextjs',

  docs: {
    autodocs: true,
  },
};

export default config;

import type { Meta, StoryObj } from '@storybook/react';

import { Image } from './index';

const meta: Meta<typeof Image> = {
  component: Image,
  argTypes: {
    aspect: {
      control: 'select',
      options: ['square', 'video', 'standard', 'portrait', 'auto'],
      defaultValue: 'auto',
      table: {
        defaultValue: { summary: 'auto' },
      },
    },
  },
  args: {
    src: 'https://placehold.co/540x540',
    alt: 'test',
    width: 540,
    height: 540,
    rounded: 'lg',
    size: 'fill',
    aspect: 'square',
  },
};

export default meta;

type TStory = StoryObj<typeof Image>;

export const Default: TStory = {
  render: (args) => <Image {...args} />,
};

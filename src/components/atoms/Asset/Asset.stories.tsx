import type { Meta, StoryObj } from '@storybook/react';

import { Asset } from './Asset';

const meta: Meta<typeof Asset> = {
  component: Asset,
  args: {
    rounded: 'lg',
    size: 'inline',
  },
};

export default meta;

type TStory = StoryObj<typeof Asset>;

const Img = () => (
  <img
    className="ui-w-full ui-h-full ui-object-cover ui-block"
    src="https://placehold.co/540x540"
    width={540}
    height={540}
    alt="test"
  />
);

export const Auto: TStory = {
  render: (args) => (
    <Asset {...args}>
      <Img />
    </Asset>
  ),
};

export const Selected: TStory = {
  render: (args) => (
    <Asset {...args} selected={true}>
      <Img />
    </Asset>
  ),
};

export const Square: TStory = {
  render: (args) => (
    <Asset {...args} aspect="square">
      <Img />
    </Asset>
  ),
};

export const Portrait: TStory = {
  render: (args) => (
    <Asset {...args} aspect="portrait">
      <Img />
    </Asset>
  ),
};

export const Standard: TStory = {
  render: (args) => (
    <Asset {...args} aspect="standard">
      <Img />
    </Asset>
  ),
};

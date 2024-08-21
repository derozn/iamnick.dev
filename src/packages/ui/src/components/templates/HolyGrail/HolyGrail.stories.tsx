import type { Meta, StoryObj } from '@storybook/react';

import { HolyGrail } from './HolyGrail';

const meta: Meta<typeof HolyGrail> = {
  component: HolyGrail,
};

export default meta;

type TStory = StoryObj<typeof HolyGrail>;

export const Default: TStory = {
  render: () => (
    <div className="ui-min-h-screen">
      <HolyGrail
        header={
          <div className="ui-text-text-default ui-self-center ui-w-full ui-max-w-[400px] ui-p-6">
            hello
          </div>
        }
        footer={<footer>Footer</footer>}
      >
        <div className="ui-self-center ui-p-6">Welcome to IAMNICK</div>
      </HolyGrail>
    </div>
  ),
};

Default.parameters = {
  layout: 'fullscreen',
};

import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Container, Separator, SpacedTimelineItem } from './Timeline.style';

const Timeline: FunctionComponent<Props> = ({ items }) => {
  return (
    <Container>
      <Separator />
      {items.map((item, index) => {
        const reverse = index % 2 === 0;
        return <SpacedTimelineItem {...item} key={item.title} reverse={reverse} />;
      })}
    </Container>
  );
};

export default Timeline;

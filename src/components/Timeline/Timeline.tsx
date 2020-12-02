import React, { FunctionComponent } from 'react';
import dynamic from 'next/dynamic';
import { Props } from './types';
import { Container, Separator, SpacedTimelineItem } from './Timeline.style';

const Work = dynamic(() => import('#components/Interactive/Work'), { ssr: false });

const Timeline: FunctionComponent<Props> = ({ items }) => {
  return (
    <Container>
      <Separator />
      {items.map((item, index) => {
        const reverse = index % 2 === 0;
        return (
          <SpacedTimelineItem {...item} reverse={reverse} key={item.title}>
            <Work index={index} />
          </SpacedTimelineItem>
        );
      })}
    </Container>
  );
};

export default Timeline;

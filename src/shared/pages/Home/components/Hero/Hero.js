import React from 'react';
import BlockContentAnimation from '@shared/components/BlockContentAnimation';
import ProgressiveImage from '@shared/components/ProgressiveImage';
import * as Styles from './Hero.styles';

const HeroSection = () => (
  <Styles.Section>
    <ProgressiveImage
      alt="Some fancy hero background"
      src="/images/dark.jpg"
      placeholder="/thumbnail/dark.jpg"
      width={1155}
      height={770}
    />
    <Styles.Content>
      <BlockContentAnimation>
        <Styles.Title>i am nick</Styles.Title>
      </BlockContentAnimation>

      <BlockContentAnimation delay={0.2} css={Styles.contentSpacing}>
        <Styles.Subtitle>Front End Developer</Styles.Subtitle>
      </BlockContentAnimation>
    </Styles.Content>
  </Styles.Section>
);

export default HeroSection;

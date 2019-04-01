import React from 'react';
import BlockContentAnimation from '@shared/components/BlockContentAnimation';
import * as Styles from './Hero.styles';

const HeroSection = () => (
  <Styles.Section>
    <BlockContentAnimation>
      <Styles.Title>i am nick</Styles.Title>
    </BlockContentAnimation>

    <BlockContentAnimation css={Styles.contentSpacing}>
      <Styles.Subtitle>Front End Developer</Styles.Subtitle>
    </BlockContentAnimation>
  </Styles.Section>
);

export default HeroSection;

import React from 'react';
import BlockTextAnimation from '@shared/components/BlockTextAnimation';
import * as Styles from './Hero.styles';

const HeroSection = () => (
  <Styles.Section>
    <BlockTextAnimation>
      <Styles.Title>i am nick</Styles.Title>
    </BlockTextAnimation>

    <BlockTextAnimation css={Styles.contentSpacing}>
      <Styles.Subtitle>Front End Developer</Styles.Subtitle>
    </BlockTextAnimation>
  </Styles.Section>
);

export default HeroSection;

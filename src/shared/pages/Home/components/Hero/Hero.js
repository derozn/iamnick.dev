import React from 'react';
import BlockContentAnimation from '@shared/components/BlockContentAnimation';
import NoiseParticles from '@shared/components/NoiseParticles';
import * as Styles from './Hero.styles';

const HeroSection = () => (
  <Styles.Section>
    <Styles.BackgroundContainer>
      <NoiseParticles />
    </Styles.BackgroundContainer>
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

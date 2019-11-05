import React from 'react';
import BlockContentAnimation from '@shared/components/BlockContentAnimation';
import {
  Section,
  BackgroundContainer,
  Content,
  Title,
  Subtitle,
  contentSpacing,
} from './Hero.styles';

const HeroSection = () => (
  <Section>
    <BackgroundContainer />
    <Content>
      <BlockContentAnimation>
        <Title>i am nick</Title>
      </BlockContentAnimation>

      <BlockContentAnimation delay={0.2} css={contentSpacing}>
        <Subtitle>Front End Developer</Subtitle>
      </BlockContentAnimation>
    </Content>
  </Section>
);

export default HeroSection;

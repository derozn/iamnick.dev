import React from 'react';
import loadable from '@loadable/component';
import BlockContentAnimation from '@shared/components/BlockContentAnimation';
import {
  Section,
  BackgroundContainer,
  Content,
  Title,
  Subtitle,
  contentSpacing,
} from './Hero.styles';

const Particles = loadable(() => import('@shared/lib/Particles'));

const HeroSection = () => (
  <Section>
    <BackgroundContainer>
      <Particles />
    </BackgroundContainer>
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

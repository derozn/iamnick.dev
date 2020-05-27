import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'styled-components';

import useMedia from '#hooks/useMedia';
import Typography from '#components/Typography';
import Slide from '#components/Slide';

import { Header, CanvasWrapper, Content, Section } from './HomePage.style';

const Scene = dynamic(() => import('#components/Interactive/Scene'), { ssr: false });

const HomePage = () => {
  const { mediaQuery, palette } = useTheme();

  const showInteractiveScene = useMedia(mediaQuery.sm, false);

  return (
    <Header>
      <CanvasWrapper>{showInteractiveScene && <Scene />}</CanvasWrapper>
      <Content>
        <Section>
          <Slide backgroundColor={palette.primary.main}>
            <Typography component="h1" color="primary" align="center">
              <Typography color="accent">I</Typography> AM NICK
            </Typography>
          </Slide>
        </Section>

        <Section>
          <Slide backgroundColor={palette.primary.main} delay={0.3}>
            <Typography component="h2" variant="h3" color="primary" align="center">
              <Typography color="accent">Creative</Typography> Front End Developer
            </Typography>
          </Slide>
        </Section>
      </Content>
    </Header>
  );
};

export default HomePage;

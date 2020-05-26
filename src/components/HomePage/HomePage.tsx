import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'styled-components';

import useMedia from '#hooks/useMedia';
import Typography from '#components/Typography';
import { Header, CanvasWrapper, Section } from './HomePage.style';

const Scene = dynamic(() => import('#components/Interactive/Scene'), { ssr: false });

const HomePage = () => {
  const { mediaQuery } = useTheme();

  const showInteractiveScene = useMedia(mediaQuery.sm, false);

  return (
    <Header>
      <CanvasWrapper>{showInteractiveScene && <Scene />}</CanvasWrapper>
      <Section>
        <Typography component="h1" color="primary" align="center">
          <Typography color="accent">I</Typography> AM NICK
        </Typography>

        <Typography component="h2" variant="h3" color="primary" align="center">
          <Typography color="accent">Creative</Typography> Front End Developer
        </Typography>
      </Section>
    </Header>
  );
};

export default HomePage;

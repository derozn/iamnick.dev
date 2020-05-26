import React from 'react';

import Scene from '#components/Interactive/Scene';
import Typography from '#components/Typography';

import { Header, CanvasWrapper, Section } from './HomePage.style';

const HomePage = () => {
  return (
    <Header>
      <CanvasWrapper>
        <Scene />
      </CanvasWrapper>
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

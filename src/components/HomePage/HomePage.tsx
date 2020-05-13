import React from 'react';

import Scene from '#components/Interactive/Scene';

import { Props } from './types';
import { Container } from './HomePage.style';

const HomePage = (props: Props) => {
  return (
    <Container {...props}>
      <Scene />
    </Container>
  );
};

export default HomePage;

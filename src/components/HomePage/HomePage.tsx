import React from 'react';

import { Props } from './types';
import { Container } from './HomePage.style';

const HomePage = (props: Props) => {
  return <Container {...props}>Welcome!</Container>;
};

export default HomePage;

import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Container } from './Slide.style';

const Slide: FunctionComponent<Props> = ({ children, ...rest }) => {
  return (
    <Container {...rest}>
      <span>{children}</span>
    </Container>
  );
};

export default Slide;

import React, { useState, useEffect, FunctionComponent } from 'react';

import { Props } from './types';
import { Container } from './BlockReveal.style';

const BlockReveal: FunctionComponent<Props> = ({ children, show = true, ...rest }) => {
  const [entered, setEntered] = useState(show);

  useEffect(() => {
    if (!entered && show) setEntered(show);
  }, [entered, show]);

  return (
    <Container {...rest} entered={entered}>
      <span>{children}</span>
    </Container>
  );
};

export default BlockReveal;

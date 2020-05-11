import React from 'react';

import { Props } from './types';
import { Container } from './ErrorPage.style';

const ErrorPage = (props: Props) => {
  return <Container {...props}>Oops! Something went wrong...</Container>;
};

export default ErrorPage;

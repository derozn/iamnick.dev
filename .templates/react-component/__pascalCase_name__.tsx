import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Container } from './{{pascalCase name}}.style';

const {{pascalCase name}}: FunctionComponent<Props> = (props) => {
  return <Container {...props} />;
};

export default {{pascalCase name}};

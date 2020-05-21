import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Text } from './Typography.style';

const Typography: FunctionComponent<Props> = (props) => {
  const { children, variant, component } = props;
  const variantClass = variant ?? component ?? undefined;

  return (
    <Text as={component} variant={variantClass}>
      {children}
    </Text>
  );
};

export default Typography;

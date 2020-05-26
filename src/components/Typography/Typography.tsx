import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Text } from './Typography.style';

const Typography: FunctionComponent<Props> = (props) => {
  const { children, variant, component, color, align, display, ...rest } = props;
  const variantClass = variant ?? component;

  return (
    <Text
      as={component}
      variant={variantClass}
      textColor={color}
      textAlign={align}
      displayAs={display}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;

import React, { FunctionComponent } from 'react';

import { Props, ComponentToVariantMapping } from './types';
import { Text } from './Typography.style';

const componentToVariantMapping: ComponentToVariantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  p: 'body',
};

const Typography: FunctionComponent<Props> = (props) => {
  const { children, variant, component, color, align, display, ...rest } = props;

  const variantClass = variant || (component && componentToVariantMapping[component]);

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

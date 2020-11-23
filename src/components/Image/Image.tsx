import React, { FunctionComponent } from 'react';

import { Props } from './types';
import { Img } from './Image.style';

const Image: FunctionComponent<Props> = ({ source, ...imgProps }) => {
  return (
    <picture>
      {Array.isArray(source)
        ? source.map((sourceProps) => <source key={sourceProps.srcSet} {...sourceProps} />)
        : source && <source key={source.srcSet} {...source} />}
      <Img {...imgProps} />
    </picture>
  );
};

export default Image;

import styled from 'styled-components';

import { ImageProps } from './types';

export const Img = styled.img<ImageProps>`
  object-fit: cover;
  object-position: center;
  width: 100%;
  height: 100%;
`;

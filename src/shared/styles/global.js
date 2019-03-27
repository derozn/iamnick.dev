import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';
import base from './base';
import fonts from './fonts';

const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${base}
  ${fonts}
`;

export default GlobalStyle;

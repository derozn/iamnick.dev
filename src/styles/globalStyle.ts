import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

import { fonts } from './fonts';

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${fonts}

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    background: #070810;
  }

  body {
    font-size: 1.6rem;
  }
`;

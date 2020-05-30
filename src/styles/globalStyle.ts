import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

import { fonts } from './fonts';

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${fonts}

  :root { scrollbar-color: rgba(249,249,250,.4) rgba(20,20,25,.3); }

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

    &::-webkit-scrollbar, &::-webkit-scrollbar-track {
        overflow: hidden;
        background: #070810;
    }

    &::-webkit-scrollbar:horizontal {
        height: 24px
    }

    &::-webkit-scrollbar:vertical {
        width: 24px
    }

    &::-webkit-scrollbar-thumb {
        border: 10px solid #070810;
        -webkit-transition: background .25s;
        transition: background .25s;
        background: hsla(0,0%,100%,.25)
    }

    &::-webkit-scrollbar-thumb:vertical {
        border-top: none;
        border-bottom: none
    }

    &::-webkit-scrollbar-thumb:horizontal {
        border-left: none;
        border-right: none
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #d6d6d6;
    }
  }
`;

import { css } from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

const base = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
  }

  body {
    font-size: 1.6rem;
  }

  html,
  body {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: ${getThemeVariable('color', 'background')};
  }

  #app {
    position: relative;
    height: 100%;
  }

  canvas {
    display: block;
  }
`;

export default base;

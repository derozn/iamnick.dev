import { DefaultTheme } from 'styled-components';

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const mediaQuery = (Object.keys(breakpoints) as (keyof typeof breakpoints)[]).reduce(
  (acc, label) => {
    acc[label] = `@media (min-width: ${breakpoints[label]}px)`;

    return acc;
  },
  {} as { [key in keyof typeof breakpoints]: string },
);

const theme: DefaultTheme = {
  mediaQuery,
  sizing: {
    maxWidth: 1920,
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: `'Montserrat', sans-serif`,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: `'Montserrat', sans-serif`,
      fontWeight: 600,
      fontSize: '4.8rem',
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
      [mediaQuery.sm]: {
        fontSize: '6rem',
      },
      [mediaQuery.lg]: {
        fontSize: '7.2rem',
      },
    },
    h2: {
      fontFamily: `'Montserrat', sans-serif`,
      fontWeight: 600,
      fontSize: '3.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
      [mediaQuery.sm]: {
        fontSize: '4.8rem',
      },
      [mediaQuery.lg]: {
        fontSize: '6rem',
      },
    },
    h3: {
      fontFamily: `'Montserrat', sans-serif`,
      fontWeight: 400,
      fontSize: '2.8rem',
      lineHeight: 1.167,
      letterSpacing: '0em',
      [mediaQuery.lg]: {
        fontSize: '3rem',
      },
    },
    body: {
      fontFamily: `'Open Sans', arial, sans-serif`,
      fontWeight: 400,
      fontSize: '1.6rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
      [mediaQuery.md]: {
        fontSize: '1.8rem',
      },
    },
  },
  palette: {
    primary: {
      light: '#ffffff',
      main: '#d6d6d6',
    },
    text: {
      primary: '#d6d6d6',
      secondary: '#000000',
      accent: '#c00408',
    },
    background: {
      primary: '#070810',
    },
  },
};

export { theme };

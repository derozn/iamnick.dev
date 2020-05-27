import 'styled-components';
import { mediaQuery } from './theme';

type TypographyHeading = {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
};

declare module 'styled-components' {
  export interface DefaultTheme {
    mediaQuery: typeof mediaQuery;

    sizing: {
      maxWidth: number;
    };

    typography: {
      htmlFontSize: number;
      fontFamily: string;
      fontSize: number;
      fontWeightLight: number;
      fontWeightRegular: number;
      fontWeightMedium: number;
      fontWeightBold: number;
      h1: TypographyHeading;
      h2: TypographyHeading;
      h3: TypographyHeading;
    };

    palette: {
      primary: {
        light: string;
        main: string;
      };
      text: {
        primary: string;
        secondary: string;
        accent: string;
      };
      background: {
        primary: string;
      };
    };
  }
}

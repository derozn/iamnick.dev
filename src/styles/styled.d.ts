import 'styled-components';
import { mediaQuery } from './theme';

type TypographyText = {
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
      fontWeightLight: number;
      fontWeightRegular: number;
      fontWeightMedium: number;
      fontWeightBold: number;
      h1: TypographyText;
      h2: TypographyText;
      h3: TypographyText;
      body: TypographyText;
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

import * as variables from './variables';

export const fontFamily = {
  primary: `${variables.roboto}, ${variables.sansSerif}`,
  secondary: `${variables.openSans}, ${variables.sansSerif}`,
};

export const color = {
  background: variables.raisinBlack,
  text: variables.whiteSmoke,
};

export const breakpoints = {
  sm: variables.mobile,
  mdMin: variables.minTablet,
  md: variables.tablet,
  lgMin: variables.minLaptop,
  lg: variables.laptop,
  xl: variables.desktop,
};

export const fontSize = {
  heading: variables.heading,
  title: variables.title,
  subTitle: variables.subTitle,
  bodyText: variables.bodyText,
};

export const letterSpace = {
  heading: variables.headingLetterSpacing,
};

export const zIndex = variables.zIndex;

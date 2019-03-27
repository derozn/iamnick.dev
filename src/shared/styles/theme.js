import * as variables from './variables';

export const fontFamily = {
  primary: `${variables.roboto}, ${variables.sansSerif}`,
  secondary: `${variables.openSans}, ${variables.sansSerif}`,
};

export const color = {
  background: variables.darkGunMetal,
  backgroundSecondary: variables.gunMetal,
  text: variables.white,
  textSecondary: variables.platinum,
  success: variables.parisGreen,
  fail: variables.tractorRed,
  loader: variables.gunMetal,
  loaderAccent: variables.white,
  separator: variables.platinum,
  button: variables.carrotOrange,
  buttonActive: variables.tennesseeOrange,
};

export const breakpoints = {
  sm: variables.mobile,
  mdMin: variables.minTablet,
  md: variables.tablet,
  lgMin: variables.minLaptop,
  lg: variables.laptop,
  xl: variables.desktop,
};

export const zIndex = variables.zIndex;

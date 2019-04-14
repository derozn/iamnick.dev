const colorPalette = {
  black: '#000',
  white: '#fff',
  raisinBlack: '#262626',
  blackOlive: '#3f3f3f',
  whiteSmoke: '#f5f5f5',
  gainsboro: '#dcdcdc',
};

export const fontFamily = {
  primary: 'Roboto, sans-serif',
  secondary: 'Open Sans, sans-serif',
};

export const color = {
  background: colorPalette.raisinBlack,
  text: colorPalette.whiteSmoke,
  burgerMenu: colorPalette.whiteSmoke,
};

export const breakpoints = {
  mobile: {
    min: 0,
    max: 767,
  },
  minTablet: {
    min: 768,
  },
  tablet: {
    min: 768,
    max: 991,
  },
  minLaptop: {
    min: 992,
  },
  laptop: {
    min: 992,
    max: 1199,
  },
  desktop: {
    min: 1200,
  },
};

export const zIndex = ['header'].reduce((acc, name, index) => ({ ...acc, [name]: index + 1 }), {});

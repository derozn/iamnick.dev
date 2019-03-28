// Typography
export const openSans = 'Open Sans';
export const roboto = 'Roboto';
export const sansSerif = 'sans-serif';

export const heading = '7.2rem';
export const title = '4.5rem';
export const subTitle = '2.8rem';
export const bodyText = '1.4rem';

export const headingLetterSpacing = '1rem';

// Breakpoints
export const mobile = {
  min: 0,
  max: 767,
};

export const minTablet = {
  min: 768,
};

export const tablet = {
  min: 768,
  max: 991,
};

export const minLaptop = {
  min: 992,
};

export const laptop = {
  min: 992,
  max: 1199,
};

export const desktop = {
  min: 1200,
};

// Color Types
export const black = '#000';
export const white = '#fff';
export const raisinBlack = '#262626';
export const blackOlive = '#3f3f3f';
export const whiteSmoke = '#f5f5f5';
export const gainsboro = '#dcdcdc';

// Z-index
export const zIndex = ['header'].reduce((acc, name, index) => ({ ...acc, [name]: index + 1 }), {});

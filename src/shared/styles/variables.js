// Typography
export const openSans = 'Open Sans';
export const roboto = 'Roboto';
export const sansSerif = 'sans-serif';

export const title = '4.5rem';
export const subTitle = '2.8rem';
export const bodyText = '1.4rem';

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
export const carrotOrange = '#f58d1e';
export const tennesseeOrange = '#F47E00';
export const darkGunMetal = '#202731';
export const wenge = '#5F5C55';
export const gunMetal = '#272e38';
export const platinum = '#e6eae9';
export const sandyTaupe = '#A4791F';
export const parisGreen = '#53D379';
export const tractorRed = '#ff1133';
export const jellyBean = '#D75350';

// Z-index
export const zIndex = ['header'].reduce((acc, name, index) => ({ ...acc, [name]: index + 1 }), {});

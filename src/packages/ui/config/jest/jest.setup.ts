process.env = {
  ...process.env,
};

window.scrollTo = jest.fn();

global.ResizeObserver = require('resize-observer-polyfill');

export {};

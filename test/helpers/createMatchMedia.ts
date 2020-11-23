import mediaQuery, { MediaValues } from 'css-mediaquery';

export const createMatchMedia = (options: Partial<MediaValues>) => {
  const matchMedia = (query: string) => ({
    matches: mediaQuery.match(query, options),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  });

  Object.assign(window, { matchMedia });
};

export const removeMatchMedia = () => {
  Object.assign(window, { matchMedia: undefined });
};

beforeAll(() => {
  createMatchMedia({ width: window.innerWidth, height: window.innerHeight });
});

afterAll(() => {
  removeMatchMedia();
});

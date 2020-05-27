import mediaQuery from 'css-mediaquery';

export const createMatchMedia = (width: number) => {
  return (query: string) => ({
    matches: mediaQuery.match(query, { width }),
    addListener: () => {},
    removeListener: () => {},
  });
};

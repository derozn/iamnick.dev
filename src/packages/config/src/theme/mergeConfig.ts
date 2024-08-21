import { theme } from './theme';

const { extend, ...tokenTheme } = theme;

export interface ITwMergeConfig {
  prefix?: string;
}

export const createTwMergeConfig = ({ prefix }: ITwMergeConfig = {}) => ({
  prefix,
  cacheSize: 2000,
  theme: Object.fromEntries(
    Object.entries(tokenTheme).map(([key, value]) => [key, Object.keys(value)]),
  ),
  classGroups: {
    typography: Object.keys(tokenTheme.typography).map((val) => `prose-${val}`),
  },
});

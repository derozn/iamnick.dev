import deepmerge from 'deepmerge';

import { tokens } from '../tokens/output/tailwind/tokens';

/**
 * @description For tokens that can't be added as standard.
 *              Can add manual variables for tailwind theme.
 */
const patchedTokens = {
  extend: {
    screens: {},
  },
};

export const theme = deepmerge(tokens, patchedTokens);

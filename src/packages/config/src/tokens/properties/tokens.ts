import deepmerge from 'deepmerge';

import tokens from './variables.json';

/**
 * @description For any tokens that need manual overriding
 */
export default deepmerge(tokens, {});

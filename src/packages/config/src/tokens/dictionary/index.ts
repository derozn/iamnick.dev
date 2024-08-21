import StyleDictionaryUtils from 'style-dictionary-utils';

import { getConfig } from './getConfig';
import { tokens } from './getTokens';
import { makeTailwindConfig } from './presets/tailwind';

const config = getConfig(tokens);

/**
 * Transforms tokens to platform agnostic frameworks
 */
const styleConfig = StyleDictionaryUtils.extend(config);

/**
 * Transforms tokens for Tailwind specifically.
 */
const dictionary = styleConfig.extend(makeTailwindConfig({ tokens }));

dictionary.buildAllPlatforms();

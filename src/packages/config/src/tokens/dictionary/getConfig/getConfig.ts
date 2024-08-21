import { Config, DesignTokens } from 'style-dictionary';

import { rgbaToWebRgba } from './transforms/color';
import { pixel } from './transforms/size';
import { web, flattenTypography } from './transforms/typography';

export const sharedTransforms = {
  'color/rgbaToWebRgba': rgbaToWebRgba(),
};

/**
 * @description Each token will have an associated "type" defined.
 *              Depending on the type, it may need to be transformed.
 *              For example, the type "spacing" will have a number value i.e "2" however, to be used in application code
 *              it will need "px" added to it. These transform groups allow that to happen.
 */
export const jsTransforms = {
  ...sharedTransforms,
  'size/pixel': pixel(),
  'typography/web': web(),
};

export const cssTransforms = {
  ...sharedTransforms,
  'css/flatten-typography': flattenTypography(),
};

export const configTransforms = {
  ...jsTransforms,
  ...cssTransforms,
};

export const jsTransformKeys = Object.keys(jsTransforms);
export const cssTransformKeys = Object.keys(cssTransforms);
export const allTransformKeys = [...jsTransformKeys, ...cssTransformKeys];

export const getConfig = <Tokens extends object>(tokens: Tokens): Config => ({
  tokens: tokens as DesignTokens,
  transform: configTransforms,
  platforms: {
    ts: {
      transformGroup: 'js',
      transforms: ['name/cti/camel', ...jsTransformKeys],
      buildPath: './src/tokens/output/ts/',
      files: [
        {
          format: 'javascript/module',
          destination: '/module/tokens.js',
        },
        {
          format: 'typescript/module-declarations',
          destination: '/module/tokens.d.ts',
        },
        {
          format: 'javascript/es6',
          destination: '/es6/tokens.js',
        },
        {
          format: 'typescript/es6-declarations',
          destination: '/es6/tokens.d.ts',
        },
      ],
    },
    css: {
      transformGroup: 'css',
      transforms: ['name/cti/kebab', ...allTransformKeys],
      buildPath: './src/tokens/output/css/',
      files: [
        {
          format: 'css/variables',
          destination: 'tokens.css',
        },
      ],
    },
  },
});

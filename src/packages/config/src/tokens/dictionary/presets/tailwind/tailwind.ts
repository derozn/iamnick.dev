import { kebabCase, setWith } from 'lodash';
import type { Dictionary, TransformedToken } from 'style-dictionary/types';

import { jsTransformKeys } from '../../getConfig/getConfig';

import { tokenTypeToTailwindTheme } from './mapping';

interface ITailwindConfigProps<Tokens extends object> {
  tokens: Tokens;
}

/**
 * @desc To allow services i.e next.js to latch onto the font-family when using next/font
 * @link https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#with-tailwind-css
 */
const mapFontFamilyToIncludeCssVariable = (tokens: any) => {
  const fontFamily = Object.fromEntries(
    Object.entries(tokens.fontFamily).map(([key, value]) => [key, [value, `var(--ui-${key})`]]),
  );

  /**
   * @desc Converts the font family into a dictionary
   *       i.e give
   *  {
   *    "expressive": [
          "Clearface MT Std",
          "var(--ui-expressive)"
        ]
      }
      will transform it to:

      {
        "Clearface MT Std": ["Clearface MT Std", "var(--ui-expressive)"]
      }
   */
  const fontFamilyDict = Object.fromEntries(
    Object.values(fontFamily).map((value) => [value[0], value]),
  );

  const typography = Object.fromEntries(
    Object.entries(tokens.typography).map(([key, value]) => {
      const val = value as any;

      return [
        key,
        {
          ...val,
          css: {
            ...val.css,
            fontFamily: fontFamilyDict[val.css.fontFamily].join(','),
          },
        },
      ];
    }),
  );

  return {
    ...tokens,
    fontFamily,
    typography,
  };
};

/**
 * @description Tailwind requires fontsize to also include a lineheight associate.
 */
const mapLineHeightToFontSize = (tokens: any) => {
  const lineHeights = Object.values(tokens.lineHeight);

  return {
    ...tokens,
    fontSize: Object.fromEntries(
      Object.entries(tokens.fontSize).map(([key, value], index) => [
        key,
        [value, { lineHeight: lineHeights[index] }],
      ]),
    ),
  };
};

/**
 * @description Map top level keys to tailwind equivalent.
 *              i.e color => colors etc...
 * @link https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js
 */
const mapKeysToTailwindConfig = (acc: object, { value, path, type }: TransformedToken) => {
  const tokenPath = path.slice(1); // Remove the category from the path. i.e ['colour', 'brand', 'red'] will be ['brand', 'red']
  const tailwindThemeKey =
    tokenTypeToTailwindTheme[type as keyof typeof tokenTypeToTailwindTheme] ?? type; // Convert type (i.e colour => colors) to tailwind config key otherwise use the default.

  let pathKeys = [tailwindThemeKey, tokenPath.map(kebabCase).join('-')];

  /**
   * @desc If the type is "Typography" - append a "css" object at the end to make work with the @tailwindcss/typography plugin
   */
  if (tailwindThemeKey.includes('typography')) {
    pathKeys = [...pathKeys, 'css'];
  }

  return setWith(acc, pathKeys, value, Object);
};

export const makeTailwindConfig = <Tokens extends object>({
  tokens,
}: ITailwindConfigProps<Tokens>) => {
  return {
    tokens,
    format: {
      tailwind: ({ dictionary }: { dictionary: Dictionary }) => {
        const mappedTokens = dictionary.allTokens.reduce(
          (acc, token) => mapKeysToTailwindConfig(acc, token),
          {},
        );

        const theme = mapLineHeightToFontSize(mapFontFamilyToIncludeCssVariable(mappedTokens));

        return `export const tokens = ${JSON.stringify(theme, null, 2)}; \n`;
      },
    },
    platforms: {
      tailwind: {
        transforms: ['name/cti/camel', ...jsTransformKeys, 'color/rgbaToWebRgba'],
        buildPath: './src/tokens/output/tailwind/',
        files: [
          {
            format: 'tailwind',
            destination: '/tokens.ts',
          },
        ],
      },
    },
  };
};

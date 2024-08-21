import { Transform, TransformedToken } from 'style-dictionary';
import StyleDictionaryUtils from 'style-dictionary-utils';

export const flattenTypography = (): Transform => ({
  type: 'value',
  transitive: true,
  matcher: (token) => ['typography', 'composition'].includes(token.type),
  transformer: ({ value, name, type }) => {
    if (!value) {
      return;
    }

    const entries = Object.entries(value);

    const flattendedValue = entries.reduce(
      (acc, [key, v], index) =>
        `${acc ? `${acc}\n  ` : ''}--${name}-${StyleDictionaryUtils.transform[
          'name/cti/kebab'
        ].transformer({ path: [key] } as TransformedToken, {
          prefix: '',
        })}: ${v}${index + 1 === entries.length ? '' : ';'}`,
      `${name.includes(type) ? '' : `${type}-`}${name}-group;`,
    );

    return flattendedValue;
  },
});

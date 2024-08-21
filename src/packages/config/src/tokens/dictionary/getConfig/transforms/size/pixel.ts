import { Transform } from 'style-dictionary';

import { toPx } from '../shared/toPx';

export const pixel = (): Transform => ({
  type: 'value',
  transitive: true,
  matcher: (token) =>
    [
      'spacing',
      'paragraphSpacing',
      'fontSizes',
      'letterSpacing',
      'lineHeights',
      'borderRadius',
      'borderWidth',
    ].includes(token.type),
  transformer: (token) => toPx(token.value),
});

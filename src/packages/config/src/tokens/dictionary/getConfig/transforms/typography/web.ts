import { Transform } from 'style-dictionary';

import { toPx } from '../shared/toPx';

export const web = (): Transform => ({
  type: 'value',
  transitive: true,
  matcher: (token) => token.type === 'typography',
  transformer: ({ value }) => {
    const { fontSize, lineHeight, letterSpacing, paragraphSpacing, ...rest } = value;

    return {
      ...rest,
      fontSize: toPx(fontSize),
      lineHeight: toPx(lineHeight),
      letterSpacing: toPx(letterSpacing),
    };
  },
});

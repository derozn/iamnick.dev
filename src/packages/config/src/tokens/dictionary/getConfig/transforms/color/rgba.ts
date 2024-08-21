import hexRgb from 'hex-rgb';
import { Transform } from 'style-dictionary';

const HEX_CAPTURE_GROUP_REGEX = /(?<hex>#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3}))/g;

export const rgbaToWebRgba = (): Transform => ({
  type: 'value',
  transitive: true,
  matcher: (token) => token.type === 'color',
  transformer: ({ value }) => {
    if (!value.startsWith('rgba')) {
      return value;
    }

    const { hex } = HEX_CAPTURE_GROUP_REGEX.exec(value)?.groups ?? {};

    if (hex) {
      const rgbaArray = hexRgb(hex, { format: 'array' });
      return value.replace(hex, rgbaArray.slice(0, 3).join(',')).replace(' ', '');
    }

    return value;
  },
});

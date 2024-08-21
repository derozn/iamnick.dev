// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { transformTokens } from 'token-transformer';

import rawTokens from '../../properties/tokens';

type TRawTokens = typeof rawTokens;
type TRawTokenKeys = Partial<keyof TRawTokens>;

/**
 * @description The sets that have references that need resolving
 */
const setsToUse: string[] = rawTokens.$metadata.tokenSetOrder;

/**
 * @description Remove any sets from the final output. It's important to note that if they contain any references to other sets
 *              they need to be added to the `setsToUse` then excluded.
 */
const excludes: TRawTokenKeys[] = ['$metadata'];

const transformerOptions = {
  expandTypography: false,
  expandComposition: false,
  preserveRawValue: false,
  expandShadow: true,
  expandBorder: true,
  throwErrorWhenNotResolved: true,
  resolveReferences: true,
};

/**
 * @description Tokens parsed specifically for the "Tokens Studio for Figma plugin"
 */
export const tokens = transformTokens(rawTokens, setsToUse, excludes, transformerOptions);

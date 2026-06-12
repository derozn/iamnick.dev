import { VariantProps } from '@derozn/tailwind-variants';
import { FC, ReactNode } from 'react';

import { truncateTextStyles } from './TruncateText.styles';

export interface ITruncateText extends VariantProps<typeof truncateTextStyles> {
  children?: ReactNode;
}

export const TruncateText: FC<ITruncateText> = ({ children, lines }) => {
  const { base } = truncateTextStyles({ lines });

  return <span className={base()}>{children}</span>;
};

import { FC, ReactNode } from 'react';

import { truncateTextStyles, type TTruncateTextStyles } from './TruncateText.styles';

export interface ITruncateText extends TTruncateTextStyles {
  children?: ReactNode;
}

export const TruncateText: FC<ITruncateText> = ({ children, lines }) => {
  return <span className={truncateTextStyles({ lines })}>{children}</span>;
};

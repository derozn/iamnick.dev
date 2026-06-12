import classnames, { Argument } from 'classnames';
import { FC, ReactNode, PropsWithChildren } from 'react';

export interface IHolyGrailProps {
  header?: ReactNode;
  footer?: ReactNode;
  className?: Argument;
  contentClassName?: Argument;
  footerClassName?: Argument;
}

export const HolyGrail: FC<PropsWithChildren<IHolyGrailProps>> = ({
  children,
  header,
  footer,
  className,
  contentClassName,
  footerClassName,
}) => (
  <div className={classnames('ui-flex ui-min-h-screen ui-flex-col ui-relative', className)}>
    {header}
    <div className={classnames('ui-flex ui-flex-1 ui-justify-center ui-w-full', contentClassName)}>
      {children}
    </div>

    {footer && (
      <div className={classnames('ui-sticky ui-bottom-0 ui-w-full ui-z-50', footerClassName)}>
        {footer}
      </div>
    )}
  </div>
);

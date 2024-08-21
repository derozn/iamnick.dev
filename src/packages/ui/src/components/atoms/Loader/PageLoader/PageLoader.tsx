'use client';

import classnames, { Argument } from 'classnames';

import { theme } from '@iamnick/config/src/theme';

import { Spinner } from '@iamnick/ui/src/components/atoms/Loader/Spinner';

export interface IPageLoaderProps {
  className?: Argument;
}

export const PageLoader = ({ className }: IPageLoaderProps) => {
  return (
    <div
      className={classnames(
        'ui-w-full ui-h-full ui-absolute ui-top-0 ui-left-0 ui-flex ui-justify-center ui-items-center',
        className
      )}
    >
      <Spinner
        width={theme.spacing[19]}
        height={theme.spacing[19]}
      />
    </div>
  );
};

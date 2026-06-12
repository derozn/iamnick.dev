'use client';

import classnames, { Argument } from 'classnames';

import { theme } from '@/theme';

import { Spinner } from '@/components/atoms/Loader/Spinner';

export interface IPageLoaderProps {
  className?: Argument;
}

export const PageLoader = ({ className }: IPageLoaderProps) => {
  return (
    <div
      className={classnames(
        'ui-w-full ui-h-full ui-absolute ui-top-0 ui-left-0 ui-flex ui-justify-center ui-items-center',
        className,
      )}
    >
      <Spinner width={theme.spacing[12]} height={theme.spacing[12]} />
    </div>
  );
};

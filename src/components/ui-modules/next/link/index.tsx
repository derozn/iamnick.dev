import NextLink, { LinkProps } from 'next/link';
import { FC, PropsWithChildren } from 'react';

export type TLinkProps = PropsWithChildren<LinkProps>;

export const Link: FC<TLinkProps> = ({
  as,
  children,
  href,
  replace,
  scroll,
  shallow,
  passHref,
  ...rest
}) => (
  <NextLink
    as={as}
    href={href}
    passHref={passHref}
    replace={replace}
    scroll={scroll}
    shallow={shallow}
    {...rest}
  >
    {children}
  </NextLink>
);

import * as runtime from 'react/jsx-runtime';

import type { ComponentType } from 'react';

/**
 * Renders Velite's compiled MDX (function-body output, ADR-0008). The
 * `new Function` evaluation is the standard compiled-MDX pattern — noted in
 * ADR-0008 for any future CSP hardening. Server component: no MDX runtime or
 * highlighter ships to the client.
 */
const useMdxComponent = (
  code: string,
): ComponentType<{ components?: Record<string, ComponentType> }> => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MdxContentProps {
  code: string;
  components?: Record<string, ComponentType>;
}

export function MdxContent({ code, components }: MdxContentProps) {
  // Deliberate render-time construction: the component IS the content (compiled
  // per-Post at build), so it can never be hoisted to module scope. Server
  // component — there is no client state to reset.
  const Component = useMdxComponent(code);
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={components} />;
}

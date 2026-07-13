'use client';

import { useEffect } from 'react';

/** Anything holding GPU memory that three can release. */
interface Disposable {
  dispose(): void;
}

/**
 * Dispose a GPU resource (geometry, material, texture) when it changes or the
 * component unmounts — the leak that a plain `useMemo(() => new Geometry(), [])`
 * leaves behind. Keep creating the resource inline with `useMemo` and a literal
 * dep list (the repo's react-hooks rule requires that), then pass it here:
 *
 *     const geometry = useMemo(() => new PlaneGeometry(2, 2), []);
 *     useDisposeOnUnmount(geometry);
 */
export function useDisposeOnUnmount(resource: Disposable): void {
  useEffect(() => () => resource.dispose(), [resource]);
}

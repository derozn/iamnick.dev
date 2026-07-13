'use client';

import { useEffect, useRef } from 'react';

/**
 * Document `keydown` listener that stays subscribed across renders while always
 * calling the latest handler (the handler rides in a ref, so passing an inline
 * arrow doesn't re-add the listener every render). Pass `active = false` to
 * detach — used by the overlays so a closed panel doesn't eat keys.
 */
export function useKeyDown(handler: (e: KeyboardEvent) => void, active = true): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => handlerRef.current(e);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
}

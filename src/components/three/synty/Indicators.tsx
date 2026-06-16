'use client';

import { Html } from '@react-three/drei';

import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from './attractions';

/**
 * Indicators — a floating, clickable marker over each point of interest. Clicking
 * one focuses the iso camera on that structure (IsoControls flies in and opens its
 * content). Markers fade out while a structure is focused.
 */
export function Indicators() {
  const focus = useSceneStore((s) => s.focus);
  const focused = useSceneStore((s) => s.focusedAttraction);

  return (
    <>
      {ATTRACTIONS.map((a) => (
        <Html
          key={a.id}
          position={[a.position[0], a.position[1] + 3.4, a.position[2]]}
          center
          zIndexRange={[30, 0]}
          style={{
            transition: 'opacity 240ms ease',
            opacity: focused ? 0 : 1,
            pointerEvents: focused ? 'none' : 'auto',
          }}
        >
          <button
            type="button"
            className="iso-indicator"
            aria-label={`Visit ${a.title}`}
            onClick={() => focus(a.id)}
          >
            <span className="iso-indicator__dot" aria-hidden="true" />
            <span className="iso-indicator__label">{a.title}</span>
          </button>
        </Html>
      ))}
    </>
  );
}

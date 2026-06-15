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
            aria-label={`Visit ${a.title}`}
            onClick={() => focus(a.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px 6px 8px',
              borderRadius: 999,
              border: '1px solid rgba(197,2,1,0.55)',
              background: 'rgba(12,11,28,0.72)',
              backdropFilter: 'blur(6px)',
              color: '#ffe9e9',
              font: '600 13px/1 var(--font-expressive, sans-serif)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: '0 0 18px rgba(197,2,1,0.45)',
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: '#ff3b3b',
                boxShadow: '0 0 10px 2px #ff3b3b',
                animation: 'isoPulse 1.6s ease-in-out infinite',
              }}
            />
            {a.title}
          </button>
        </Html>
      ))}
    </>
  );
}

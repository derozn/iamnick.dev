import { Billboard, Center, Float, Text3D } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';

import { ACCENT } from '../midway.config';

type GroupProps = ThreeElements['group'];

/**
 * Attraction — a stop along the Midway: a grey-box placeholder structure (passed
 * as children) wrapped in a subtle Float, with an optional billboarded neon
 * Text3D sign in the accent colour (emissive, toneMapped off so Bloom catches
 * it). The carnival equivalent of the retired v1 `Island`.
 *
 * The sign is a decorative duplicate of the real DOM heading (ADR-0003) — the
 * canvas is `aria-hidden`, so it carries no content of its own.
 *
 * Placeholders stand in until the neutral Synty carnival GLBs are converted and
 * dressed in (FBX→GLB step). No per-frame work of its own — Float only animates
 * when the demand frameloop renders, which the camera rig / scroll driver gate.
 */
interface AttractionProps extends GroupProps {
  /** Neon sign text — a decorative duplicate of the DOM heading. */
  label?: string;
  labelY?: number;
  labelScale?: number;
  /** Stagger float phase so neighbouring attractions don't bob in sync. */
  floatSpeed?: number;
}

export function Attraction({
  label,
  labelY = 0.7,
  labelScale = 0.09,
  floatSpeed = 0.9,
  children,
  ...props
}: AttractionProps) {
  return (
    <group {...props}>
      <Float
        speed={floatSpeed}
        rotationIntensity={0.12}
        floatIntensity={0.25}
        floatingRange={[-0.03, 0.03]}
      >
        {children}
      </Float>

      {label && (
        <Billboard follow position={[0, labelY, 0]}>
          <Center>
            <Text3D font="/font/punk.json" scale={labelScale} letterSpacing={0.2} height={0.25}>
              {label}
              {/* ~1.1 keeps the glyph faces legible; bloom catches the >1 luminance */}
              <meshStandardMaterial
                color={ACCENT}
                emissive={ACCENT}
                emissiveIntensity={1.1}
                toneMapped={false}
              />
            </Text3D>
          </Center>
        </Billboard>
      )}
    </group>
  );
}

import { Billboard, Center, Clone, Float, Text3D, useGLTF } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';

import { ACCENT } from '../journey.config';

type GroupProps = ThreeElements['group'];

/**
 * IslandProp — a decoration GLB placed on an island platform.
 * All kit GLBs share the platform convention (RootNode → ×100 child), so the
 * default 0.1 outer scale keeps decorations proportional to the platforms.
 */
interface IslandPropProps extends GroupProps {
  url: string;
}

export function IslandProp({ url, scale = 0.1, ...props }: IslandPropProps) {
  const { scene } = useGLTF(url);
  return (
    <group scale={scale} {...props}>
      <Clone object={scene} />
    </group>
  );
}

/**
 * Island — generic floating island: platform cluster + decorations passed as
 * children, wrapped in a subtle drei Float, with an optional billboarded
 * Text3D label in the accent colour (emissive + toneMapped off so Bloom
 * catches it).
 *
 * No per-frame work of its own — Float only animates when the demand
 * frameloop renders, which the camera rig / scroll driver gate.
 */
interface IslandProps extends GroupProps {
  label?: string;
  labelY?: number;
  labelScale?: number;
  /** Stagger float phase so neighbouring islands don't bob in sync. */
  floatSpeed?: number;
}

export function Island({
  label,
  labelY = 0.55,
  labelScale = 0.1,
  floatSpeed = 0.9,
  children,
  ...props
}: IslandProps) {
  return (
    <group {...props}>
      <Float
        speed={floatSpeed}
        rotationIntensity={0.15}
        floatIntensity={0.3}
        floatingRange={[-0.04, 0.04]}
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

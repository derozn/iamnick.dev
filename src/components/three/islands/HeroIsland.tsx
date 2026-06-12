import { Billboard, Center, Float, MeshDistortMaterial, Text3D } from '@react-three/drei';
import { type ThreeElements } from '@react-three/fiber';

import { PlatformLarge, PlatformLong, PlatformSmall } from '../shared/Platforms';

type GroupProps = ThreeElements['group'];

/**
 * HeroIsland — faithful port of the legacy Interactive Hero World composition
 * (two-group platform arrangement + 'I AM NICK' Text3D billboard with
 * MeshDistortMaterial), without Stage/OrbitControls — the CameraRig owns the
 * camera now. Rotations/positions match the legacy scene; the billboard
 * follows the camera (legacy locked all axes because its camera was static).
 */
export function HeroIsland(props: GroupProps) {
  return (
    <group {...props}>
      <group rotation={[-Math.PI / 12, Math.PI / 8, 0]}>
        <group name="floating" position={[0, 0.3, -0.4]}>
          <Float
            speed={1}
            rotationIntensity={0.5}
            floatIntensity={0.5}
            floatingRange={[-0.05, 0.05]}
          >
            <PlatformLarge />
          </Float>
        </group>
        <group name="ground">
          <Float
            speed={0.8}
            rotationIntensity={0.4}
            floatIntensity={0.4}
            floatingRange={[-0.04, 0.04]}
          >
            <PlatformSmall reflector rotation={[0, Math.PI / 2, 0]} />
            <PlatformLarge position={[0.35, 0, 0]} />
            <PlatformLong position={[0.35, 0.2, -0.5]} rotation={[0, Math.PI / 2, 0]} />
          </Float>
        </group>
      </group>

      <Billboard follow position={[0, 0.15, 0.2]}>
        <Center>
          <Text3D
            font="/font/punk.json"
            scale={0.2}
            letterSpacing={0.2}
            rotation={[0, -0.2, 0]}
            renderOrder={999}
          >
            I AM NICK
            <MeshDistortMaterial
              distort={0.1}
              speed={1}
              depthTest={false}
              depthWrite={false}
              transparent={true}
            />
          </Text3D>
        </Center>
      </Billboard>
    </group>
  );
}

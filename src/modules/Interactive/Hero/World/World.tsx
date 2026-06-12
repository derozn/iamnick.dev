import { PlatformLarge, PlatformSmall, PlatformLong } from '@/modules/Interactive/Hero/Platforms';
import {
  OrbitControls,
  Stage,
  Float,
  Text3D,
  Center,
  Billboard,
  MeshDistortMaterial,
} from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { SpaceDust } from '../SpaceDust';

export const World = () => {
  return (
    <>
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} mipmapBlur luminanceSmoothing={0.0} intensity={0.7} />
      </EffectComposer>
      <Stage adjustCamera={true} shadows={false}>
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
              <PlatformSmall rotation={[0, Math.PI / 2, 0]} />
              <PlatformLarge position={[0.35, 0, 0]} />
              <PlatformLong position={[0.35, 0.2, -0.5]} rotation={[0, Math.PI / 2, 0]} />
            </Float>
          </group>
        </group>
      </Stage>

      <Billboard follow={true} lockX={true} lockY={true} lockZ={true}>
        <Center top>
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
      <OrbitControls
        makeDefault
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
        zoomSpeed={0.3}
      />
      <SpaceDust />
    </>
  );
};

import { PlatformLarge, PlatformSmall, PlatformLong } from '@/modules/Interactive/Platforms';
import {
  OrbitControls,
  BakeShadows,
  OrthographicCamera,
  Stage,
  Bounds,
  Float,
  Text3D,
  Center,
  Billboard,
  MeshDistortMaterial,
} from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { SpaceDust } from '../SpaceDust';
import { FlyingGunman } from '../Enemies/FlyingGunman';

export const World = () => {
  return (
    <>
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} mipmapBlur luminanceSmoothing={0.0} intensity={0.7} />
      </EffectComposer>
      <fog attach="fog" args={['black', 10, 70]} />
      <OrthographicCamera position={[10, 10, 10]} zoom={10} />
      <Bounds fit clip observe margin={0.35}>
        <Stage adjustCamera={false}>
          <group rotation={[0, -Math.PI / 6, 0]}>
            <group name="floating" position={[0, 0.3, -0.4]}>
              <Float
                speed={1}
                rotationIntensity={0.5}
                floatIntensity={0.5}
                floatingRange={[-0.05, 0.05]}
              >
                <PlatformLarge scale={0.1} />
              </Float>
            </group>
            <group name="ground">
              <Float
                speed={0.8}
                rotationIntensity={0.4}
                floatIntensity={0.4}
                floatingRange={[-0.04, 0.04]}
              >
                <PlatformSmall scale={0.1} rotation={[0, Math.PI / 2, 0]} />
                <PlatformLarge scale={0.1} position={[0.35, 0, 0]} />
                <PlatformLong scale={0.1} position={[0.35, 0, -0.5]} rotation={[0, Math.PI / 2, 0]}>
                  <FlyingGunman scale={0.1} position={[0, -2, 0]} />
                </PlatformLong>
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
              rotation={[0, 0, 0]}
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
      </Bounds>
      <BakeShadows />
      <OrbitControls
        makeDefault
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
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

import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { VignettePass } from './vignette';

extend({ EffectComposer, ShaderPass, RenderPass, VignettePass });

type Props = {
  backgroundColor: string;
};

const Effects = ({ backgroundColor }: Props) => {
  const composer = useRef<EffectComposer>(null);
  const { scene, gl, size, camera } = useThree();

  useEffect(() => composer.current?.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current?.render(), 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <vignettePass attachArray="passes" args={[backgroundColor]} />
    </effectComposer>
  );
};

export default Effects;

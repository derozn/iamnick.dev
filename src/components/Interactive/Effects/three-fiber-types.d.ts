/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, no-undef */

// Seems to be an error when using declare/namespace and unused vars when they're being used
import { ReactThreeFiber } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { VignettePass } from './vignette';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      vignettePass: ReactThreeFiber.Node<VignettePass, typeof VignettePass>;
      effectComposer: ReactThreeFiber.Node<VignettePass, typeof EffectComposer>;
      shaderPass: ReactThreeFiber.Node<VignettePass, typeof ShaderPass>;
      renderPass: ReactThreeFiber.Node<RenderPass, typeof RenderPass>;
    }
  }
}

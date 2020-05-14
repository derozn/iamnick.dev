import { extend } from 'react-three-fiber';
import { ShaderMaterial, Texture } from 'three';

import vertexShader from '../shaders/vert.glsl';
import fragmentShader from '../shaders/frag.glsl';

export class SkullMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: {
          type: 'f',
          value: 0,
        },
        renderOutline: {
          type: 'f',
          value: 0,
        },
        noiseTex: {
          type: 't',
          value: null,
        },
      },
    });
  }

  set noiseTex(value: Texture) {
    this.uniforms.noiseTex.value = value;
  }
}

extend({ SkullMaterial });

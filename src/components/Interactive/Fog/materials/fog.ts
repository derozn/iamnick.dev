import { extend } from 'react-three-fiber';
import { RawShaderMaterial, Texture, RepeatWrapping, AdditiveBlending } from 'three';

import vertexShader from '../shaders/vert.glsl';
import fragmentShader from '../shaders/frag.glsl';

export class FogMaterial extends RawShaderMaterial {
  constructor() {
    super({
      wireframe: false,
      depthWrite: false,
      transparent: true,
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      uniforms: {
        time: {
          type: 'f',
          value: 0.0,
        },
        fogTexture: {
          type: 't',
          value: null,
        },
      },
    });
  }

  set fogTexture(texture: Texture) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    this.uniforms.fogTexture.value = texture;
  }

  set time(value: number) {
    this.uniforms.time.value = value;
  }
}

extend({ FogMaterial });

import { RawShaderMaterial, Texture, RepeatWrapping, AdditiveBlending } from 'three';

import vertexShader from '../shaders/vert.glsl';
import fragmentShader from '../shaders/frag.glsl';

export class CloudsMaterial extends RawShaderMaterial {
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
        cloudTexture: {
          type: 't',
          value: null,
        },
      },
    });
  }

  set cloudTexture(texture: Texture) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    this.uniforms.cloudTexture.value = texture;
  }

  set time(value: number) {
    this.uniforms.time.value = value;
  }
}

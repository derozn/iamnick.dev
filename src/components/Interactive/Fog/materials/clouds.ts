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
          value: 0.0,
        },
        cloudTexture: {
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

  public update(delta: number) {
    this.uniforms.time.value += delta;
  }
}

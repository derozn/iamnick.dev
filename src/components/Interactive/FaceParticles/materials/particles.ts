import {
  RawShaderMaterial,
  Texture,
  RepeatWrapping,
  RGBFormat,
  Vector2,
  LinearFilter,
} from 'three';

import vertexShader from '../shaders/vert.glsl';
import fragmentShader from '../shaders/frag.glsl';

const addWrapModeToTexture = (texture: Texture) => {
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.format = RGBFormat;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
};

export class ParticlesMaterial extends RawShaderMaterial {
  constructor() {
    super({
      depthTest: false,
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        particleTexture: {
          type: 't',
          value: null,
        },
        particleTextureSize: {
          type: 'v2',
          value: new Vector2(0, 0),
        },
        time: {
          type: 'f',
          value: 0.0,
        },
        random: {
          type: 'f',
          value: 2.0,
        },
        depth: {
          type: 'f',
          value: 20.0,
        },
        size: {
          type: 'f',
          value: 1.5,
        },
      },
    });
  }

  set particleTexture(texture: Texture) {
    addWrapModeToTexture(texture);

    this.uniforms.particleTexture.value = texture;
    this.uniforms.particleTextureSize.value = new Vector2(
      texture.image.width,
      texture.image.height,
    );
  }

  public update(delta: number) {
    this.uniforms.time.value += delta;
  }
}

import {
  UniformsUtils,
  ShaderMaterial,
  OrthographicCamera,
  Scene,
  Mesh,
  PlaneBufferGeometry,
  WebGLRenderer,
  WebGLRenderTarget,
  IUniform,
  MathUtils,
  Color,
} from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';

import vertexShader from './vert.glsl';
import fragmentShader from './frag.glsl';

export class VignettePass extends Pass {
  uniforms: { [uniform: string]: IUniform };

  material: ShaderMaterial;

  camera: OrthographicCamera;

  scene: Scene;

  quad: Mesh;

  constructor(backgroundColor: string = '#000') {
    super();

    this.uniforms = UniformsUtils.clone({
      texture: {
        type: 't',
        value: null,
      },
      byp: {
        type: 'i',
        value: 0,
      },
      radius: {
        type: 'f',
        value: 0.0,
      },
      softness: {
        type: 'f',
        value: 0.12,
      },
      color: {
        type: 'v3',
        value: new Color(backgroundColor),
      },
    });

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.scene = new Scene();

    this.quad = new Mesh(new PlaneBufferGeometry(2, 2), this.material);
    this.quad.frustumCulled = false; // Prevent clipping

    this.scene.add(this.quad);
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
  ) {
    this.uniforms.texture.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }

  set visible(visible: boolean) {
    this.uniforms.byp.value = visible ? 0 : 1;
  }

  set radius(radius: number) {
    const radiusRange = MathUtils.clamp(radius, 0, 1);
    this.uniforms.radius.value = radiusRange;
  }

  set softness(softness: number) {
    const softnessRange = MathUtils.clamp(softness, 0, 1);
    this.uniforms.softness.value = softnessRange;
  }

  set color(color: number) {
    this.uniforms.color.value = new Color(color);
  }
}

import { InstancedBufferGeometry, BufferAttribute, Texture, InstancedBufferAttribute } from 'three';

export class Particles extends InstancedBufferGeometry {
  texture: Texture;

  totalPixelCount: number;

  visiblePixelCount: number;

  threshold: number;

  imageColors: Float32Array;

  constructor(texture: Texture) {
    super();

    this.texture = texture;
    this.totalPixelCount = 0;
    this.visiblePixelCount = 0;
    this.threshold = 34; // Color threshold for discarding pixels.
    this.imageColors = new Float32Array();
  }

  static getGeometryPositions() {
    const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);

    return positions;
  }

  static getGeometryUVs() {
    const uvs = new BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0, 0.0);
    uvs.setXYZ(3, 1.0, 1.0, 0.0);

    return uvs;
  }

  static getIndex() {
    return new BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1);
  }

  private generatePixelAttributes() {
    const indices = new Uint16Array(this.visiblePixelCount);
    const offsets = new Float32Array(this.visiblePixelCount * 3);
    const angles = new Float32Array(this.visiblePixelCount);
    const { width } = this.texture.image;

    let pixelIndex = 0;

    for (let i = 0; i < this.totalPixelCount; i += 1) {
      if (this.imageColors[i * 4] > this.threshold) {
        offsets[pixelIndex * 3] = i % width;
        offsets[pixelIndex * 3 + 1] = Math.floor(i / width);

        indices[pixelIndex] = i;

        angles[pixelIndex] = Math.random() * Math.PI;

        pixelIndex += 1;
      }
    }

    return [indices, offsets, angles];
  }

  private discardPixels() {
    const { image } = this.texture;
    const { width, height } = image;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = width;
    canvas.height = height;

    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0, width, height * -1);

    const { data } = ctx.getImageData(0, 0, width, height);

    this.imageColors = Float32Array.from(data);

    for (let i = 0; i < this.totalPixelCount; i += 1) {
      if (this.imageColors[i * 4] > this.threshold) this.visiblePixelCount += 1;
    }
  }

  public create() {
    const { image } = this.texture;
    const { width, height } = image;

    this.totalPixelCount = width * height;

    this.discardPixels();

    const [indices, offsets, angles] = this.generatePixelAttributes();

    this.setAttribute('position', Particles.getGeometryPositions());
    this.setAttribute('uv', Particles.getGeometryUVs());
    this.setIndex(Particles.getIndex());

    this.setAttribute('pindex', new InstancedBufferAttribute(indices, 1, false));
    this.setAttribute('offset', new InstancedBufferAttribute(offsets, 3, false));
    this.setAttribute('angle', new InstancedBufferAttribute(angles, 1, false));
  }
}

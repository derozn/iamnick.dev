import { InstancedBufferGeometry, PlaneBufferGeometry, InstancedBufferAttribute } from 'three';

export class Clouds extends InstancedBufferGeometry {
  amount: number;

  constructor(amount?: number) {
    super();

    this.amount = amount ?? 200; // Amount of clouds to make.
  }

  static getBaseGeometry() {
    return new PlaneBufferGeometry(1100, 1100, 20, 20);
  }

  create() {
    // Copy over geometry attributes to save re-writing them all out.
    this.copy(Clouds.getBaseGeometry());

    const instancePositions = new InstancedBufferAttribute(new Float32Array(this.amount * 3), 3);
    const delays = new InstancedBufferAttribute(new Float32Array(this.amount), 1);
    const rotations = new InstancedBufferAttribute(new Float32Array(this.amount), 1);

    for (let index = 0; index < this.amount; index += 1) {
      instancePositions.setXYZ(
        index,
        (Math.random() * 2 - 1) * 850,
        -500.0,
        (Math.random() * 2 - 1) * 300,
      );

      delays.setXYZ(index, Math.random(), 0, 0);

      rotations.setXYZ(index, Math.random() * 2 + 1, 0, 0);
    }

    this.setAttribute('instancePosition', instancePositions);
    this.setAttribute('delay', delays);
    this.setAttribute('rotate', rotations);
  }
}

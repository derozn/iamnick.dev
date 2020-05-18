import { useEffect } from 'react';
import { PlaneBufferGeometry, InstancedBufferAttribute } from 'three';

import { Props } from './types';

export const useCreateFogGeometry = ({ geometry, amount }: Props) => {
  useEffect(() => {
    if (!geometry) {
      return;
    }

    const baseGeometry = new PlaneBufferGeometry(1100, 1100, 20, 20);

    // Copy over the base Geometry to save writing it all out...
    geometry.copy(baseGeometry);

    const instancePositions = new InstancedBufferAttribute(new Float32Array(amount * 3), 3);
    const delays = new InstancedBufferAttribute(new Float32Array(amount), 1);
    const rotations = new InstancedBufferAttribute(new Float32Array(amount), 1);

    for (let index = 0; index < amount; index += 1) {
      instancePositions.setXYZ(
        index,
        (Math.random() * 2 - 1) * 850,
        0,
        (Math.random() * 2 - 1) * 300,
      );
      delays.setXYZ(index, Math.random(), 0, 0);
      rotations.setXYZ(index, Math.random() * 2 + 1, 0, 0);
    }

    geometry.setAttribute('instancePosition', instancePositions);
    geometry.setAttribute('delay', delays);
    geometry.setAttribute('rotate', rotations);
  }, [geometry, amount]);
};

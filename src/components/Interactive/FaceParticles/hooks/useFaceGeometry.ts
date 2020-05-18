import { useEffect } from 'react';
import { BufferAttribute, InstancedBufferAttribute } from 'three';

import { Props, GeneratePixelAttributes, DiscardPixels } from './types';

const getGeometryPositions = () => {
  const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
  positions.setXYZ(0, -0.5, 0.5, 0.0);
  positions.setXYZ(1, 0.5, 0.5, 0.0);
  positions.setXYZ(2, -0.5, -0.5, 0.0);
  positions.setXYZ(3, 0.5, -0.5, 0.0);

  return positions;
};

const getGeometryUVs = () => {
  const uvs = new BufferAttribute(new Float32Array(4 * 2), 2);
  uvs.setXYZ(0, 0.0, 0.0, 0.0);
  uvs.setXYZ(1, 1.0, 0.0, 0.0);
  uvs.setXYZ(2, 0.0, 1.0, 0.0);
  uvs.setXYZ(3, 1.0, 1.0, 0.0);

  return uvs;
};

const generatePixelAttributes: GeneratePixelAttributes = (
  totalPixelCount,
  visiblePixelCount,
  threshold,
  colors,
  width,
) => {
  const indices = new Uint16Array(visiblePixelCount);
  const offsets = new Float32Array(visiblePixelCount * 3);
  const angles = new Float32Array(visiblePixelCount);

  let pixelIndex = 0;

  for (let i = 0; i < totalPixelCount; i += 1) {
    if (colors[i * 4] > threshold) {
      offsets[pixelIndex * 3] = i % width;
      offsets[pixelIndex * 3 + 1] = Math.floor(i / width);

      indices[pixelIndex] = i;

      angles[pixelIndex] = Math.random() * Math.PI;

      pixelIndex += 1;
    }
  }

  return { indices, offsets, angles };
};

const discardPixels: DiscardPixels = (image, threshold, totalPixelCount, width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = width;
  canvas.height = height;

  ctx.scale(1, -1);
  ctx.drawImage(image, 0, 0, width, height * -1);

  const { data } = ctx.getImageData(0, 0, width, height);
  const colors = Float32Array.from(data);

  let visiblePixelCount = 0;

  for (let i = 0; i < totalPixelCount; i += 1) {
    if (colors[i * 4] > threshold) visiblePixelCount += 1;
  }

  return { visiblePixelCount, colors };
};

export const useFaceGeometry = ({ geometry: ref, texture }: Props) => {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const geometry = ref.current;

    const { image } = texture;
    const { width, height } = image;

    const totalPixelCount = width * height;
    const threshold = 34;

    const imageAttributes = discardPixels(image, threshold, totalPixelCount, width, height);
    const pixelAttributes = generatePixelAttributes(
      totalPixelCount,
      imageAttributes.visiblePixelCount,
      threshold,
      imageAttributes.colors,
      width,
    );

    geometry.setAttribute('position', getGeometryPositions());
    geometry.setAttribute('uv', getGeometryUVs());
    geometry.setIndex(new BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

    geometry.setAttribute(
      'pindex',
      new InstancedBufferAttribute(pixelAttributes.indices, 1, false),
    );
    geometry.setAttribute(
      'offset',
      new InstancedBufferAttribute(pixelAttributes.offsets, 3, false),
    );
    geometry.setAttribute('angle', new InstancedBufferAttribute(pixelAttributes.angles, 1, false));
  }, [ref, texture]);
};

import { InstancedBufferGeometry, Texture } from 'three';

export type Props = {
  geometry: {
    current?: InstancedBufferGeometry;
  };
  texture: Texture;
};

export type GeneratePixelAttributes = (
  totalPixelCount: number,
  visiblePixelCount: number,
  threshold: number,
  colors: Float32Array,
  width: number,
) => {
  indices: Uint16Array;
  offsets: Float32Array;
  angles: Float32Array;
};

export type DiscardPixels = (
  image: HTMLImageElement,
  threshold: number,
  totalPixelCount: number,
  width: number,
  height: number,
) => {
  visiblePixelCount: number;
  colors: Float32Array;
};

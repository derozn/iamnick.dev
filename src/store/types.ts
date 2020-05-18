import { Vector3, Color } from 'three';

export interface State {
  zoom: number;
  position: Vector3;
  background: {
    color: Color;
  };
  fog: {
    textureUrl: string;
  };
  face: {
    textureUrl: string;
  };
}

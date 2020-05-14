import { Vector3, Color } from 'three';

export interface State {
  zoom: number;
  position: Vector3;
  skull: {
    gltfUrl: string;
    textureUrl: string;
  };
  backgroundColor: Color;
}

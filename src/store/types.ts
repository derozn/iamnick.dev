import { Vector3 } from 'three';

export interface State {
  zoom: number;
  position: Vector3;
  skull: {
    gltfUrl: string;
    textureUrl: string;
  };
}

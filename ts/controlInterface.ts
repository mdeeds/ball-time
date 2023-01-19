import * as THREE from "three";

export interface ControlInterface {
  // Sets `out` to the change in position since last call
  getDelta(out: THREE.Vector3): void;
}
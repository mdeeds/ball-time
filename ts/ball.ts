import * as THREE from "three";

export class Ball extends THREE.Object3D {
  constructor() {
    super();
    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 4),
      new THREE.MeshBasicMaterial({ color: 'red' })
    );
    this.add(sphere);
  }
}
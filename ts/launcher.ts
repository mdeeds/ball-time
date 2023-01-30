import * as THREE from "three";

export class Launcher extends THREE.Object3D {

  private body: THREE.Mesh;
  constructor() {
    super();

    const height = 4.0;
    this.body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.1, height, 16, 3, false),
      new THREE.MeshBasicMaterial({ color: 'pink' })
    );
    this.body.geometry.translate(0, height / 2, 0);
    this.body.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0.5);
    this.add(this.body);
  }

  private yAxis = new THREE.Vector3(0, 1, 0);
  private q = new THREE.Quaternion();
  tick(dt: number) {
    this.q.setFromAxisAngle(this.yAxis, 0.5 * dt);
    this.body.quaternion.premultiply(this.q);
  }
}
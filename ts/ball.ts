import * as THREE from "three";

import Ammo from "ammojs-typed";
import { MeshMaker } from "./meshMaker";

export class Ball extends THREE.Object3D {
  private isFlying = false;
  private btBody: Ammo.btRigidBody;
  constructor(ammo: typeof Ammo, physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 4),
      new THREE.MeshBasicMaterial({ color: 'red' })
    );
    this.add(sphere);

    const shape = new ammo.btSphereShape(0.1);
    this.btBody = MeshMaker.makeBody(sphere, ammo, shape, 0.5);
    physicsWorld.addRigidBody(this.btBody);
  }

  update(target: THREE.Object3D) {
    const transform = new Ammo.btTransform();
    this.btBody.getMotionState().getWorldTransform(transform);
    const position = transform.getOrigin();
    const quaternion = transform.getRotation();
    // Convert the position and quaternion to THREE.js vectors
    const threePosition = new THREE.Vector3(position.x(), position.y(), position.z());
    const threeQuaternion = new THREE.Quaternion(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());

    const iso = new THREE.Matrix4();
    iso.compose(threePosition, threeQuaternion, new THREE.Vector3(1, 1, 1));
    this.updateMatrixWorld();
    iso.multiply(this.matrixWorld);
    // iso is now in World Space.

    const targetMatrix = new THREE.Matrix4();
    target.updateMatrixWorld();
    targetMatrix.copy(target.matrixWorld);
    targetMatrix.invert();

    iso.multiply(targetMatrix);
    iso.decompose(this.position, this.quaternion, this.scale);
  }

  release() {
    this.isFlying = true;
  }

  grab(target: THREE.Object3D) {
    // move this into `target`

    this.isFlying = false;
  }

}
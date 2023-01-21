import * as THREE from "three";

import Ammo from "ammojs-typed";
import { MeshMaker } from "./meshMaker";

export class Ball extends THREE.Object3D {
  private isFlying = false;
  private btBody: Ammo.btRigidBody;
  constructor(private ammo: typeof Ammo,
    private physicsWorld: Ammo.btDiscreteDynamicsWorld) {
    super();
    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 4),
      new THREE.MeshBasicMaterial({ color: 'red' })
    );
    this.add(sphere);

    const shape = new ammo.btSphereShape(0.1);
    shape.setMargin(0.05);
    sphere.position.y = 3;
    this.btBody = MeshMaker.makeBody(sphere, ammo, shape, 0.5);
  }

  private moveToTarget(
    source: THREE.Object3D,
    target: THREE.Object3D,
    threePosition: THREE.Vector3, threeQuaternion: THREE.Quaternion) {
    const iso = new THREE.Matrix4();
    iso.compose(threePosition, threeQuaternion, new THREE.Vector3(1, 1, 1));
    if (!!source) {
      source.updateMatrixWorld();
      iso.multiply(source.matrixWorld);
    }
    // iso is now in World Space.

    const targetMatrix = new THREE.Matrix4();
    target.updateMatrixWorld();
    targetMatrix.copy(target.matrixWorld);
    targetMatrix.invert();

    iso.multiply(targetMatrix);
    iso.decompose(this.position, this.quaternion, this.scale);
    if (target != this.parent) {
      target.add(this);
    }
  }

  update() {
    if (!this.isFlying) { return; }
    const transform = new this.ammo.btTransform()
    this.btBody.getMotionState().getWorldTransform(transform);
    const position = transform.getOrigin();
    const quaternion = transform.getRotation();
    // Convert the position and quaternion to THREE.js vectors
    const threePosition = new THREE.Vector3(position.x(), position.y(), position.z());
    const threeQuaternion = new THREE.Quaternion(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());

    this.moveToTarget(null, this.parent, threePosition, threeQuaternion);
  }

  release(into: THREE.Object3D) {
    this.isFlying = true;
    const worldPosition = new THREE.Vector3();
    worldPosition.copy(this.position);
    this.localToWorld(worldPosition);
    const worldQuaternion = new THREE.Quaternion();

    // TODO: This feels like it leaks.
    const transform = new this.ammo.btTransform(
      new this.ammo.btQuaternion(worldQuaternion.x, worldQuaternion.y, worldQuaternion.z, worldQuaternion.w),
      new this.ammo.btVector3(worldPosition.x, worldPosition.y, worldPosition.z)
    );
    this.btBody.getMotionState().setWorldTransform(transform);
    this.btBody.setActivationState(4);
    this.btBody.activate(true);

    {
      const transform2 = new this.ammo.btTransform()
      this.btBody.getMotionState().getWorldTransform(transform2);
    }
    this.moveToTarget(this.parent, into, this.position, this.quaternion);
    {
      const transform2 = new this.ammo.btTransform()
      this.btBody.getMotionState().getWorldTransform(transform2);
    }
    this.physicsWorld.addRigidBody(this.btBody);
  }

  grab(target: THREE.Object3D) {
    this.isFlying = false;
    this.moveToTarget(this.parent, target, this.position, this.quaternion);
    this.physicsWorld.removeRigidBody(this.btBody);
  }
}
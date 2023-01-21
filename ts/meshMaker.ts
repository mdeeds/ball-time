import * as THREE from "three";
import Ammo from "ammojs-typed";

export class MeshMaker {
  private static addGeometryToShape(geometry: THREE.BufferGeometry,
    transform: THREE.Matrix4,
    mesh: Ammo.btTriangleMesh, ammo: typeof Ammo) {
    let numInward = 0;
    let numOutward = 0;
    const positionAttribute = geometry.attributes.position;
    if (!geometry.index) {
      throw new Error("Must have index.");
    }
    const index = geometry.index;
    for (var i = 0; i < index.count / 3; i++) {
      const vertexAIndex = index.getX(i * 3);
      const vertexBIndex = index.getX(i * 3 + 1);
      const vertexCIndex = index.getX(i * 3 + 2);
      const a = new THREE.Vector3();
      a.fromBufferAttribute(positionAttribute, vertexAIndex);
      a.applyMatrix4(transform);
      const b = new THREE.Vector3();
      b.fromBufferAttribute(positionAttribute, vertexBIndex);
      b.applyMatrix4(transform);
      const c = new THREE.Vector3();
      c.fromBufferAttribute(positionAttribute, vertexCIndex);
      c.applyMatrix4(transform);
      mesh.addTriangle(
        new ammo.btVector3(a.x, a.y, a.z),
        new ammo.btVector3(b.x, b.y, b.z),
        new ammo.btVector3(c.x, c.y, c.z),
        false
      );
      b.sub(a);
      c.sub(a);
      b.cross(c);
      let direction = a.dot(b);
      if (direction > 0) {
        ++numOutward;
      } else {
        ++numInward;
      }
    }
    console.log(`inward: ${numInward}; outward: ${numOutward}`);
  }

  private static addToShapeFromObject(object: THREE.Object3D,
    mesh: Ammo.btTriangleMesh, ammo: typeof Ammo) {
    if (object instanceof THREE.Mesh) {
      object.updateMatrix();
      const matrix = new THREE.Matrix4();
      matrix.copy(object.matrix);
      let o = object.parent;
      while (o) {
        o.updateMatrix();
        matrix.premultiply(o.matrix);
        o = o.parent;
      }
      const geometry: THREE.BufferGeometry = object.geometry;
      MeshMaker.addGeometryToShape(geometry, matrix, mesh, ammo);
    }
    for (const c of object.children) {
      MeshMaker.addToShapeFromObject(c, mesh, ammo);
    }
  }

  private static createShapeFromObject(object: THREE.Object3D, ammo: typeof Ammo)
    : Ammo.btTriangleMesh {
    const mesh: Ammo.btTriangleMesh = new ammo.btTriangleMesh(true, true);
    this.addToShapeFromObject(object, mesh, ammo);
    return mesh;
  }

  public static makeStaticBody(
    object: THREE.Object3D, ammo: typeof Ammo) {
    const btMesh = MeshMaker.createShapeFromObject(object, ammo);
    // const volume = Assets.getVolumeOfObject(object);
    const shape =
      new ammo.btBvhTriangleMeshShape(btMesh, true, true);
    shape.setMargin(0.05);
    const body = MeshMaker.makeBody(object, ammo, shape, /*mass=*/0);
    return body;
  }

  public static makeBody(
    object: THREE.Object3D, ammo: typeof Ammo,
    shape: Ammo.btSphereShape | Ammo.btBvhTriangleMeshShape | Ammo.btBoxShape,
    mass: number): Ammo.btRigidBody {

    const btTx = new ammo.btTransform();
    const btQ = new ammo.btQuaternion(0, 0, 0, 0);
    const btV1 = new ammo.btVector3();

    btTx.setIdentity();
    btV1.setValue(
      object.position.x,
      object.position.y,
      object.position.z);
    btTx.setOrigin(btV1);
    btQ.setValue(
      object.quaternion.x,
      object.quaternion.y,
      object.quaternion.z,
      object.quaternion.w);
    btTx.setRotation(btQ);
    const motionState = new ammo.btDefaultMotionState(btTx);
    btV1.setValue(0, 0, 0);
    // shape.calculateLocalInertia(mass, btV1);
    const body = new ammo.btRigidBody(
      new ammo.btRigidBodyConstructionInfo(
        mass, motionState, shape, btV1));
    body.setActivationState(4);  // Disable deactivation
    body.activate(true);
    body.setFriction(0.3);
    body.setRestitution(0.1);
    if (mass == 0) {
      body.setCollisionFlags(body.getCollisionFlags() | 1);
    }
    return body;
  }
}
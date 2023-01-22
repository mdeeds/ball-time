import * as THREE from "three";
import Ammo from "ammojs-typed";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { MeshBasicMaterial } from "three";
import { Floor } from "./floor";
import { MeshMaker } from "./meshMaker";
import { UnionControls } from "./unionControls";
import { KeyControls } from "./keyControls";
import { Ball } from "./ball";
import { GripControls } from "./gripControls";

export class Game {

  // As is our convention, the universe is moved around the player, and the player is in world space:
  //
  // World (Scene)
  // +-- Player
  // | +-- Camera
  // +-- Universe

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene = new THREE.Scene();
  private universe = new THREE.Group();
  private tail = new THREE.Vector3();
  private player = new THREE.Group();
  private controls = new UnionControls();
  private ball: Ball;

  private physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(private ammo: typeof Ammo) {
    document.body.innerHTML = "";

    this.setUpPhysics();
    this.setUpCamera();
    this.setUpSky();
    this.setUpFloor();
    this.setUpBall();
    this.setUpRenderer();
    this.setUpControls();
  }

  private setUpPhysics() {
    // Physics configuration
    const collisionConfiguration =
      new this.ammo.btDefaultCollisionConfiguration();
    const dispatcher = new this.ammo.btCollisionDispatcher(
      collisionConfiguration);
    const broadphase = new this.ammo.btDbvtBroadphase();
    const solver = new this.ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new this.ammo.btDiscreteDynamicsWorld(
      dispatcher, broadphase,
      solver, collisionConfiguration);
    this.physicsWorld.setGravity(new this.ammo.btVector3(0, -9.8, 0));
  }

  private setUpCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, /*aspect=*/1.0, /*near=*/0.1,
      /*far=*/20000);
    this.camera.position.set(0, 1.7, 0);
    this.camera.lookAt(0, 1.7, -100);
    this.player.add(this.camera);
    this.scene.add(this.player);
    this.scene.add(this.universe);

    this.tail.set(0, 0, 1.0);
  }

  private setUpSky() {
    const texture = new THREE.TextureLoader().load('img/pwn-pano.png');
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(10000, 16, 8),
      new MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    this.scene.add(sky);
  }

  private setUpFloor() {
    const floor = new Floor();
    this.universe.add(floor);
    const floorBtBody = MeshMaker.makeStaticBody(floor, this.ammo);
    this.physicsWorld.addRigidBody(floorBtBody);
    this.rayCast();
  }

  private setUpBall() {
    this.ball = new Ball(this.ammo, this.physicsWorld);
    this.universe.add(this.ball);
    this.ball.position.set(0, 3, -3);
    this.ball.updateMatrixWorld(true);
    this.ball.release(this.universe);
  }

  private v = new THREE.Vector3();
  private rayCast() {
    this.camera.getWorldPosition(this.v);
    const start = new this.ammo.btVector3(this.v.x, this.v.y, this.v.z);
    const end = new this.ammo.btVector3(this.v.x, -10, this.v.z);

    const callback = new this.ammo.ClosestRayResultCallback(start, end);
    //RayCallback.m_collisionFilterMask = FILTER_CAMERA;
    this.physicsWorld.rayTest(start, end, callback);
    if (callback.hasHit()) {
      const intersection = callback.get_m_hitPointWorld();
      this.player.position.set(intersection.x(), intersection.y() - 1.0, intersection.z());
      // const normal = callback.get_m_hitNormalWorld();
      // intersection.op_sub(start);
      // console.log(`Distance to ground: ${intersection.length()}`);
      // console.log(`Normal: ${[normal.x(), normal.y(), normal.z()]}`);
    }
    else {
      // console.log('miss!');
    }
  }

  private setUpRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(1024, 1024);
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.renderer.xr.enabled = true;

    const clock = new THREE.Clock();
    let elapsedS = 0;
    let frameCount = 0;

    const delta = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    this.renderer.setAnimationLoop(() => {
      const deltaS = Math.min(clock.getDelta(), 0.1);
      if (deltaS > 0) {
        this.physicsWorld.stepSimulation(deltaS, 10);
      }
      this.ball.update();
      elapsedS += deltaS;
      ++frameCount;
      this.renderer.render(this.scene, this.camera);
      this.controls.getDelta(delta);
      delta.y = 0;
      // if (delta.length() > 0) {
      delta.applyQuaternion(this.player.quaternion);
      this.player.position.add(delta);

      // Calculate the new position of the tail
      this.tail.y = this.player.position.y;
      tmp.copy(this.player.position);
      tmp.sub(this.tail);
      tmp.setLength(tmp.length() - 1.0);
      this.tail.add(tmp);

      // "LookAt" a position in front of the player opposite the tail.
      tmp.copy(this.player.position);
      tmp.sub(this.tail);
      tmp.add(this.player.position);
      this.player.lookAt(tmp);
      this.rayCast();
      // } // if (delta.length() > 0)
    });
  }

  setUpControls() {
    this.controls.add(new KeyControls());
    const p = GripControls.make(this.renderer.xr, this.player);
    p.then((gripControls: GripControls) => {
      this.controls.add(gripControls);
    })
  }
}
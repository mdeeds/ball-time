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
  // + tail
  // +-- Universe

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene = new THREE.Scene();
  private universe = new THREE.Group();
  private tail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial({ color: 'brown' }));
  private antiTail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial({ color: 'black' }));
  private player = new THREE.Group();
  private controls = new UnionControls();
  private ball: Ball;

  private playerArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1.3, -1), 1.0);

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
    this.scene.add(this.playerArrow);
    this.scene.add(this.player);
    this.scene.add(this.tail);
    this.scene.add(this.antiTail);
    this.scene.add(this.universe);

    this.tail.position.set(0, 0, 1.0);
    this.antiTail.position.set(0, 0, -1.0);
  }

  private setUpSky() {
    const texture = new THREE.TextureLoader().load('img/city-pano.png');
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(10000, 32, 16),
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
      this.universe.position.y = -intersection.y() - 1.0;
      // const normal = callback.get_m_hitNormalWorld();
      // intersection.op_sub(start);
      // console.log(`Distance to ground: ${intersection.length()}`);
      // console.log(`Normal: ${[normal.x(), normal.y(), normal.z()]}`);
    }
    else {
      // console.log('miss!');
    }
  }

  private t0 = new THREE.Vector3();

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
      if (delta.length() > 0) {
        delta.applyQuaternion(this.player.quaternion);
        this.universe.position.sub(delta);
        this.t0.copy(delta);
        this.t0.normalize();
        this.playerArrow.setDirection(this.t0);

        // // Calculate the new position of the tail
        console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
        this.tail.position.sub(delta);
        this.tail.position.setLength(1.0);
        console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
        this.antiTail.position.copy(this.tail.position);
        this.antiTail.position.multiplyScalar(-1);

      } // if (delta.length() > 0)

      // // "LookAt" a position in front of the player opposite the tail.
      // tmp.copy(this.tail.position);
      // tmp.multiplyScalar(-1);
      this.player.lookAt(this.tail.position);
      // this.antiTail.position.copy(tmp);

      this.rayCast();
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
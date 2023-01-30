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
import { Launcher } from "./launcher";

export class Game {

  // As is our convention, the universe is moved around the player, and the player is in world space:
  //
  // World (Scene)
  // +-- Player
  // | +-- Camera
  // |   + Ball (when caught)
  // + tail
  // +-- Universe
  //   + Ball (when flying)
  //   + Launcher

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
  private floor: Floor;

  private physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(private ammo: typeof Ammo) {
    document.body.innerHTML = "";

    this.setUpPhysics();
    this.setUpCamera();
    this.setUpSky();
    this.setUpFloor();
    this.setUpBall();
    this.setUpLauncher();
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
    this.floor = new Floor();
    this.universe.add(this.floor);
    const floorBtBody = MeshMaker.makeStaticBody(this.floor, this.ammo);
    floorBtBody.setFriction(0.5);
    this.physicsWorld.addRigidBody(floorBtBody);
    this.rayCast();

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 0.0, 5.0, 64, 1, false),
      new THREE.MeshBasicMaterial({ color: 'green' })
    );
    pillar.position.set(0, 4, 0);
    this.universe.add(pillar);
  }

  private zero = new THREE.Vector3(0, 0, 0);
  private setUpBall() {
    this.ball = new Ball(this.ammo, this.physicsWorld);
    this.universe.add(this.ball);
    this.ball.position.set(0, 3, -3);
    this.ball.updateMatrixWorld(true);
    this.ball.release(this.universe, this.zero);
  }

  private launcher: Launcher;
  private setUpLauncher() {
    this.launcher = new Launcher();
    this.launcher.position.set(6.0, 0.0, -3.0);
    this.universe.add(this.launcher);
  }

  private v = new THREE.Vector3();
  private rayCast() {
    this.camera.getWorldPosition(this.v);
    this.v.sub(this.universe.position);
    const start = new this.ammo.btVector3(this.v.x, this.v.y, this.v.z);
    const end = new this.ammo.btVector3(this.v.x, -10, this.v.z);

    const callback = new this.ammo.ClosestRayResultCallback(start, end);
    //RayCallback.m_collisionFilterMask = FILTER_CAMERA;
    this.physicsWorld.rayTest(start, end, callback);
    if (callback.hasHit()) {
      const intersection = callback.get_m_hitPointWorld();
      this.universe.position.y = -intersection.y() + 1.0;
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
  private t1 = new THREE.Vector3();
  private nm = new THREE.Matrix3();

  private nextTimeS = 0;
  private launchTimeS = 0;
  private checkBall(currentTimeS: number) {
    if (currentTimeS < this.nextTimeS) {
      return;
    }
    this.camera.getWorldPosition(this.t0);
    if (this.ball.getIsFlying()) {
      this.ball.getWorldPosition(this.t1);
      this.t0.sub(this.t1);
      // console.log(`Range: ${this.t0.length()}, y=${this.t0.y}`);
      if (this.t0.length() < 0.8) {
        console.log(`Grabbed!`);
        this.ball.grab(this.camera);
        this.ball.position.set(0, -0.2, -0.4);
        this.nextTimeS = currentTimeS + 1.0;
      }
    } else {
      if (this.launchTimeS == 0) {
        this.launcher.getWorldPosition(this.t1);
        this.t0.sub(this.t1);
        this.t0.y = 0;
        if (this.t0.length() < 0.8) {
          console.log(`Dropped!`);
          this.ball.grab(this.launcher.getBody());
          this.ball.position.set(0, 4.5, 0);
          this.nextTimeS = currentTimeS + 1.0;
          this.launchTimeS = currentTimeS + 3.0;
        }
      } else if (currentTimeS >= this.launchTimeS) {
        this.launchTimeS = 0;
        this.t1.set(0, 5 + Math.random() * 2, 0);

        this.launcher.getBody().updateMatrixWorld();
        this.nm.getNormalMatrix(this.launcher.getBody().matrixWorld)
        this.t1.applyMatrix3(this.nm);
        this.ball.release(this.universe, this.t1);
      }
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
      this.launcher.tick(deltaS);
      this.ball.update();
      this.checkBall(elapsedS);
      this.ball.getWorldPosition(tmp);
      this.floor.setBallPosition(tmp);


      elapsedS += deltaS;
      ++frameCount;
      this.renderer.render(this.scene, this.camera);
      this.controls.getDelta(delta);
      delta.y = 0;
      if (delta.length() > 0) {
        delta.applyQuaternion(this.player.quaternion);
        this.universe.position.sub(delta);
        // // Calculate the new position of the tail
        // console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
        this.tail.position.sub(delta);
        this.tail.position.setLength(1.0);
        // console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
        this.antiTail.position.copy(this.tail.position);
        this.antiTail.position.multiplyScalar(-1);

      }

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
import * as THREE from "three";
import Ammo from "ammojs-typed";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { MeshBasicMaterial } from "three";
import { Floor } from "./floor";

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
  private player = new THREE.Group();

  private physicsWorld: Ammo.btDiscreteDynamicsWorld;

  constructor(private ammo: typeof Ammo) {
    document.body.innerHTML = "";

    this.setUpPhysics();
    this.setUpCamera();
    this.setUpSky();
    this.setUpFloor();
    this.setUpRenderer();
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
      75, window.innerWidth / window.innerHeight, /*near=*/0.1,
      /*far=*/20000);
    this.camera.position.set(0, 1.7, 0);
    this.camera.lookAt(0, 1.7, -100);
    this.player.add(this.camera);
    this.scene.add(this.player);
    this.scene.add(this.universe);
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
    this.universe.add(new Floor());
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

    this.renderer.setAnimationLoop(() => {
      const deltaS = Math.min(clock.getDelta(), 0.1);
      elapsedS += deltaS;
      ++frameCount;
      this.renderer.render(this.scene, this.camera);
    });
  }
}
import * as THREE from "three";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { RenderTexture } from "./renderTexture";
import { SkyTexture } from "./skyTexture";

export class SkyPainter {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene = new THREE.Scene();
  private universe = new THREE.Group();
  private player = new THREE.Group();

  constructor() {
    this.setUpCamera();
    this.setUpSky();
    this.setUpRenderer();
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
  }

  private setUpSky() {
    const texture = new THREE.TextureLoader().load('img/city-pano.png');
    // const renderTex = new RenderTexture();
    const sky = new THREE.Mesh(
      new THREE.IcosahedronGeometry(100, 3),
      new SkyTexture(texture));
    this.scene.add(sky);
  }

  private setUpRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // this.renderer.shadowMap.enabled = true;
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
      elapsedS += deltaS;
      ++frameCount;
      this.renderer.render(this.scene, this.camera);
    });
  }
}
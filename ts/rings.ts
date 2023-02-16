import * as THREE from "three";
import { RenderTexture } from "./renderTexture";

export class Rings {
  private rt: RenderTexture;

  constructor() {
    this.rt = new RenderTexture();
    this.init();
    this.animate();
  }

  private camera: THREE.PerspectiveCamera;
  private scene = new THREE.Scene();
  private sceneScreen = new THREE.Scene();

  private renderer = new THREE.WebGLRenderer();

  init() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 100;


    const materialScreen = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: this.rt.getTexture()
        }
      },
      vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`,
      fragmentShader: `
varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {

  gl_FragColor = texture2D( tDiffuse, vUv );

}`,
      depthWrite: false
    });

    const geometry = new THREE.BoxGeometry(200, 200, 200);
    geometry.rotateY(Math.PI / 2);
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xffffff, map: this.rt.getTexture(),
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material2);
    this.scene.add(mesh);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement);
    // document.addEventListener('mousemove', onDocumentMouseMove);
  }

  animate() {
    requestAnimationFrame(() => { this.animate() });
    this.render();
  }

  render() {
    const time = Date.now() * 0.0015;
    this.camera.position.x = 100 * Math.cos(time * 0.1);
    this.camera.position.y = 50 * Math.sin(time * 0.02);
    this.camera.position.z = 100 * Math.sin(time * 0.1);

    this.camera.lookAt(this.scene.position);

    // Render first scene into texture
    this.rt.updateTexture(this.renderer);

    // Render second scene to screen
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }
}
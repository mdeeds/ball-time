import * as THREE from "three";
import { RenderTexture } from "./renderTexture";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class Rings {
  private rt: RenderTexture;

  constructor() {
    this.rt = new RenderTexture();
    this.init();
    this.animate();
  }

  private camera: THREE.PerspectiveCamera;
  private scene = new THREE.Scene();

  private renderer = new THREE.WebGLRenderer();

  init() {
    this.camera = new THREE.PerspectiveCamera(30, 1.0, 1, 10000);
    this.camera.position.z = 100;


    const materialScreen = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: this.rt.getTexture()
        }
      },
      vertexShader: `
varying vec2 vUv;
varying vec3 vS3;
void main() {
  vUv = uv;
  vS3 = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
      fragmentShader: `
#define PI 3.1415927

varying vec2 vUv;
varying vec3 vS3;
uniform sampler2D tDiffuse;

vec2 UVfromTR(in vec2 tr) {
  float theta = tr.x;
  float rho = tr.y;
  if (rho > 0.0) {
    float lenUv = 1.0 - 2.0 * rho / PI;
    vec2 uv = vec2(cos(theta), sin(theta));
    uv = lenUv * uv;
    uv = uv / vec2(4.0, 2.0) + vec2(0.25, 0.5);
    return uv;
  } else {
    float lenUv = 1.0 + 2.0 * rho / PI;
    theta = PI - theta;
    vec2 uv = vec2(cos(theta), sin(theta));
    uv = lenUv * uv;
    uv = uv / vec2(4.0, 2.0) + vec2(0.75, 0.5);
    return uv;
  }
}

vec2 TRfromS3(in vec3 p) {
  vec2 tr = vec2(atan(p.z, p.x), asin(p.y));
  return tr;
}

void main() {
  vec2 uv = UVfromTR(TRfromS3(vS3));
  gl_FragColor = texture2D( tDiffuse, uv );
}`,
      depthWrite: true,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.IcosahedronGeometry(200, 3);
    geometry.rotateY(Math.PI / 2);
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xffffff, map: this.rt.getTexture(),
      side: THREE.DoubleSide
    });

    // const mesh = new THREE.Mesh(geometry, material2);
    const mesh = new THREE.Mesh(geometry, materialScreen);
    this.scene.add(mesh);

    this.renderer.setPixelRatio(1.0);
    this.renderer.setSize(1024, 1024);
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));

    // document.addEventListener('mousemove', onDocumentMouseMove);
  }

  animate() {
    requestAnimationFrame(() => { this.animate() });
    this.render();
  }

  render() {
    // const time = Date.now() * 0.005;
    // this.camera.position.x = 100 * Math.cos(time * 0.1);
    // this.camera.position.y = 50 * Math.sin(time * 0.02);
    // this.camera.position.z = 100 * Math.sin(time * 0.1);
    // this.camera.lookAt(this.scene.position);

    // Render first scene into texture
    this.rt.updateTexture(this.renderer);

    // Render second scene to screen
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }
}
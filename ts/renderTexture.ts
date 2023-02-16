import * as THREE from "three";

export class RenderTexture {
  private cameraRTT: THREE.OrthographicCamera;
  private sceneRTT = new THREE.Scene();
  private rtTexture: THREE.WebGLRenderTarget;
  private quad: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor() {
    this.init();
  }

  init() {

    this.cameraRTT =
      new THREE.OrthographicCamera(
        1 / - 2, 1 / 2,
        1 / 2, 1 / - 2,
        -10000, 10000);
    this.cameraRTT.position.z = 100;

    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();
    this.sceneRTT.add(light);

    light = new THREE.DirectionalLight(0xffaaaa, 1.5);
    light.position.set(0, 0, - 1).normalize();
    this.sceneRTT.add(light);

    this.rtTexture = new THREE.WebGLRenderTarget(
      4096, 2048);

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
varying vec3 vWorldPosition;
void main() {
  vWorldPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`,
      fragmentShader: `
varying vec3 vWorldPosition;

void main() {
  vec3 color = normalize(vWorldPosition) * 0.5 + 0.5;
  gl_FragColor = vec4(color, 1.0 );
}`
    });

    const plane = new THREE.PlaneGeometry(
      1, 1);
    this.quad = new THREE.Mesh(plane, this.material);
    this.quad.position.z = - 100;
    this.sceneRTT.add(this.quad);
  }

  public updateTexture(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this.rtTexture);
    renderer.clear();
    renderer.render(this.sceneRTT, this.cameraRTT);
  }

  getTexture(): THREE.Texture {
    return this.rtTexture.texture;
  }

}
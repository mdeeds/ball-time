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
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
      fragmentShader: `
#define PI 3.1415927

vec2 TRfromUV(in vec2 uv) {
  if (uv.x < 0.5) {
   uv = (uv - vec2(0.25, 0.5)) * vec2(4.0, 2.0);
   float rho = PI/2.0 * (1.0 - length(uv));
   return vec2(atan(uv.y, uv.x), rho);
  } else {
   uv = (uv - vec2(0.75, 0.5)) * vec2(4.0, 2.0);
   return vec2(PI - atan(uv.y, uv.x), -PI/2.0 * (1.0 - length(uv)));
  }
}

vec3 S3fromTR(in vec2 tr) {
  return vec3(
    cos(tr.y) * cos(tr.x),
    sin(tr.y),
    cos(tr.y) * sin(tr.x));
}

varying vec2 vUv;
void main() {
  vec3 s3 = S3fromTR(TRfromUV(vUv));
  vec3 color = normalize(s3) * 0.5 + 0.5;
  vec3 dip = sin(s3 * 200.0);
  float fdip = smoothstep(-2.0, 1.0, dip.x * dip.y * dip.z);
  gl_FragColor = vec4(color * fdip, 1.0 );
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
import * as THREE from "three";

export class Rings {

  private mouseX = 0;
  private mouseY = 0;

  private windowHalfX = window.innerWidth / 2;
  private windowHalfY = window.innerHeight / 2;

  private delta = 0.01;

  constructor() {
    this.init();
    this.animate();
  }

  private camera: THREE.PerspectiveCamera;
  private cameraRTT: THREE.OrthographicCamera;
  private scene = new THREE.Scene();
  private sceneRTT = new THREE.Scene();
  private sceneScreen = new THREE.Scene();


  private rtTexture: THREE.WebGLRenderTarget;
  private material: THREE.ShaderMaterial;
  private quad: THREE.Mesh;

  private zmesh1: THREE.Mesh;
  private zmesh2: THREE.Mesh;

  private renderer = new THREE.WebGLRenderer();

  init() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 100;

    this.cameraRTT = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000);
    this.cameraRTT.position.z = 100;

    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();
    this.sceneRTT.add(light);

    light = new THREE.DirectionalLight(0xffaaaa, 1.5);
    light.position.set(0, 0, - 1).normalize();
    this.sceneRTT.add(light);

    this.rtTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

    this.material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0.0 } },
      vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`,
      fragmentShader: `
varying vec2 vUv;
uniform float time;

void main() {

  float r = vUv.x;
  if( vUv.y < 0.5 ) r = 0.0;
  float g = vUv.y;
  if( vUv.x < 0.5 ) g = 0.0;

  gl_FragColor = vec4( r, g, time, 1.0 );

}`
    });

    const materialScreen = new THREE.ShaderMaterial({

      uniforms: { tDiffuse: { value: this.rtTexture.texture } },
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

    const plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

    this.quad = new THREE.Mesh(plane, this.material);
    this.quad.position.z = - 100;
    this.sceneRTT.add(this.quad);

    const torusGeometry = new THREE.TorusGeometry(100, 25, 15, 30);

    const mat1 = new THREE.MeshPhongMaterial({ color: 0x555555, specular: 0xffaa00, shininess: 5 });
    const mat2 = new THREE.MeshPhongMaterial({ color: 0x550000, specular: 0xff2200, shininess: 5 });

    this.zmesh1 = new THREE.Mesh(torusGeometry, mat1);
    this.zmesh1.position.set(0, 0, 100);
    this.zmesh1.scale.set(1.5, 1.5, 1.5);
    this.sceneRTT.add(this.zmesh1);

    this.zmesh2 = new THREE.Mesh(torusGeometry, mat2);
    this.zmesh2.position.set(0, 150, 100);
    this.zmesh2.scale.set(0.75, 0.75, 0.75);
    this.sceneRTT.add(this.zmesh2);

    this.quad = new THREE.Mesh(plane, materialScreen);
    this.quad.position.z = - 100;
    this.sceneScreen.add(this.quad);

    const n = 5,
      geometry = new THREE.SphereGeometry(10, 64, 32),
      material2 = new THREE.MeshBasicMaterial({
        color: 0xffffff, map: this.rtTexture.texture
      });

    for (let j = 0; j < n; j++) {

      for (let i = 0; i < n; i++) {

        const mesh = new THREE.Mesh(geometry, material2);

        mesh.position.x = (i - (n - 1) / 2) * 20;
        mesh.position.y = (j - (n - 1) / 2) * 20;
        mesh.position.z = 0;

        mesh.rotation.y = - Math.PI / 2;

        this.scene.add(mesh);
      }
    }

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement);
    // document.addEventListener('mousemove', onDocumentMouseMove);
  }

  private onDocumentMouseMove(event) {
    this.mouseX = (event.clientX - this.windowHalfX);
    this.mouseY = (event.clientY - this.windowHalfY);
  }

  animate() {
    requestAnimationFrame(() => { this.animate() });
    this.render();
  }

  render() {
    const time = Date.now() * 0.0015;
    this.camera.position.x += (this.mouseX - this.camera.position.x) * .05;
    this.camera.position.y += (- this.mouseY - this.camera.position.y) * .05;

    this.camera.lookAt(this.scene.position);

    if (this.zmesh1 && this.zmesh2) {

      this.zmesh1.rotation.y = - time;
      this.zmesh2.rotation.y = - time + Math.PI / 2;

    }

    if (this.material.uniforms['time'].value > 1 || this.material.uniforms['time'].value < 0) {
      this.delta *= - 1;
    }

    this.material.uniforms['time'].value += this.delta;


    // Render first scene into texture

    this.renderer.setRenderTarget(this.rtTexture);
    this.renderer.clear();
    this.renderer.render(this.sceneRTT, this.cameraRTT);

    // Render full screen quad with generated texture

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.sceneScreen, this.cameraRTT);

    // Render second scene to screen
    // (using first scene as regular texture)

    this.renderer.render(this.scene, this.camera);
  }
}
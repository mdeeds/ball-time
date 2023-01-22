import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export class Floor extends THREE.Mesh {
  constructor() {
    super(
      new THREE.PlaneGeometry(100, 100, 300, 300),
      Floor.makeShader()
    );
    this.geometry.rotateX(-Math.PI / 2);

    const vertices = this.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < vertices.count; ++i) {
      v.fromBufferAttribute(vertices, i);
      v.y = 3.0 * this.nnn(v.x * 0.1, v.z * 0.1);
      vertices.setXYZ(i, v.x, v.y, v.z);
    }
    this.geometry.computeVertexNormals();
    this.geometry = BufferGeometryUtils.mergeVertices(this.geometry, 0.01);
  }

  mmm(x: number, y: number): number {
    const a = 0.31;
    const b = 0.71;
    const c = 0.72;
    const d = 0.34;


    const mag = Math.sin(x + 1.3 * Math.sin(a * x) + 1.5 * Math.sin(b * y))
      * Math.sin(y + 1.3 * Math.sin(c * x) + 1.1 * Math.sin(d * y));
    return mag;
  }

  nnn(x: number, y: number): number {
    let z = 0.0;
    let m = 1.0;
    let o = 1.0;
    for (let i = 0; i < 7; ++i) {
      z = z + m * this.mmm((x + 112) * o, (y + 112) * o);
      m *= 0.4;
      o *= 1.9;
    }
    return z * 0.5;
  }


  static makeShader(): THREE.ShaderMaterial {
    const shader = new THREE.ShaderMaterial(
      {
        vertexShader: `
varying vec3 vNormal;
varying float viewDot;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec3 toCamera = cameraPosition - worldPosition.xyz;
  toCamera /= length(toCamera);
  viewDot = dot(normal, toCamera);
}
        `,
        fragmentShader: `
varying vec3 vNormal;
varying float viewDot;
void main() {
  float intensity = pow((clamp(vNormal.y, 0.0, 1.0)), 3.0);
  float directness = 0.5 + 0.5 * smoothstep(0.05, 0.15, viewDot);
  intensity *= directness;
  vec3 c = vec3(34.0/255.0, 139.0/255.0, 34.0/255.0);
  gl_FragColor = vec4(intensity * c, 1.0);
}  
        `
      }
    );
    return shader;
  }
}
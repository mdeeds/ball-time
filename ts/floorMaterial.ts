import * as THREE from "three";

export class FloorMaterial extends THREE.ShaderMaterial {
  private ballPosition: THREE.Vector3;
  constructor() {
    const ballPosition = new THREE.Vector3();
    super({
      uniforms: {
        ballPosition: { value: ballPosition }
      },
      vertexShader: `
varying vec3 vNormal;
varying float viewDot;
varying vec3 worldPosition;
varying float vYHeight;
uniform vec3 ballPosition;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wp /= wp.w;
  worldPosition = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec3 toCamera = cameraPosition - worldPosition;
  toCamera /= length(toCamera);
  viewDot = dot(normal, toCamera);
  vYHeight = ballPosition.y - worldPosition.y;
}
        `,
      fragmentShader: `
varying vec3 vNormal;
varying float viewDot;
varying vec3 worldPosition;
uniform vec3 ballPosition;
varying float vYHeight;
void main() {
  float intensity = pow((clamp(vNormal.y, 0.0, 1.0)), 3.0);
  float directness = 0.5 + 0.5 * smoothstep(0.05, 0.15, viewDot);
  intensity *= directness;

  // vec3 c = vec3(34.0/255.0, 139.0/255.0, 34.0/255.0);  // ForestGreen
  vec3 c = vec3(65.0/255.0, 105.0/255.0, 225.0/255.0);  // RoyalBlue

  intensity *= smoothstep(0.05, 0.15 + vYHeight * 0.5, 
    length(worldPosition.xz - ballPosition.xz));

  gl_FragColor = vec4(intensity * c, 1.0);
}  
        `
    });
    this.ballPosition = ballPosition;
  }

  setBallPosition(p: THREE.Vector3) {
    this.ballPosition.copy(p);
    this.uniformsNeedUpdate = true;
  }
}
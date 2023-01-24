import * as THREE from "three";

export class BallMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: `
varying vec3 vNormal;
//varying float viewDot;
void main() {
  // vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  // worldPosition /= worldPosition.w;
  // vec3 toCamera = normalize(cameraPosition - worldPosition.xyz);
  // viewDot = dot(normal, toCamera);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
}
        `,
      fragmentShader: `
varying vec3 vNormal;
//varying float viewDot;
void main() {
  float intensity = 0.5 + 0.5 * clamp(vNormal.y, 0.0, 1.0);
  // float directness = clamp(viewDot, 0.0, 1.0);
  // intensity *= directness;

  vec3 c = vec3(255.0/255.0, 105.0/255.0, 110.0/255.0);

  gl_FragColor = vec4(intensity * c, 1.0);
}  
        `
    }
    );
  }
}
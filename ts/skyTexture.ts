import * as THREE from "three";
import { Vector3, WebGLBufferRenderer } from "three";

export class SkyTexture extends THREE.ShaderMaterial {
  constructor(private tex: THREE.Texture) {
    super(
      {
        uniforms: {
          tex: { value: tex }
        },
        vertexShader: `
varying vec3 vWorldPosition;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wp /= wp.w;
  vWorldPosition = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
        `,
        fragmentShader: `
varying vec3 vWorldPosition;
uniform sampler2D tex;
void main() {
  vec3 color = normalize(vWorldPosition) * 0.5 + 0.5;
  vec3 sampled = texture2D(tex, color.rg * vec2(0.5, 1.0)).rgb;
  gl_FragColor = vec4(sampled, 1.0);
}  
        `,
        side: THREE.DoubleSide
      }
    );
  }


}
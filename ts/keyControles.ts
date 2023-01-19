import * as THREE from "three";

import { ControlInterface } from "./controlInterface";

export class KeyControls implements ControlInterface {
  private lastCallMs: number;
  private keysDown = new Set<string>();
  constructor() {
    this.lastCallMs = window.performance.now();
    document.body.addEventListener('keydown', (ev: KeyboardEvent) => { this.keysDown.add(ev.code); });
    document.body.addEventListener('keyup', (ev: KeyboardEvent) => { this.keysDown.delete(ev.code); });
  }

  getDelta(out: THREE.Vector3): void {
    const dt = window.performance.now() - this.lastCallMs;
    this.lastCallMs += dt;
    out.set(0, 0, 0);
    if (this.keysDown.has('KeyA')) {
      out.x -= 0.01 * dt;
    }
    if (this.keysDown.has('KeyD')) {
      out.x += 0.01 * dt;
    }
    if (this.keysDown.has('KeyW')) {
      out.z -= 0.01 * dt;
    }
    if (this.keysDown.has('KeyS')) {
      out.z += 0.01 * dt;
    }
  }
}

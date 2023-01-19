import * as THREE from "three";

import { ControlInterface } from "./controlInterface";

export class UnionControls implements ControlInterface {
  private controls: ControlInterface[] = [];
  constructor() {
  }
  add(control: ControlInterface) {
    this.controls.push(control);
  }

  private v = new THREE.Vector3();
  getDelta(out: THREE.Vector3): void {
    out.set(0, 0, 0);
    for (const c of this.controls) {
      c.getDelta(this.v);
      out.add(this.v);
    }
  }
}
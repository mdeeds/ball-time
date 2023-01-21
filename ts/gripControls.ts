import * as THREE from "three";
import { ControlInterface } from "./controlInterface";
import { RewardSound } from "./sfx/rewardSound";

export class GripControls implements ControlInterface {
  private last0 = new THREE.Vector3();
  private last1 = new THREE.Vector3();
  private constructor(session: XRSession,
    private g0: THREE.XRGripSpace, private g1: THREE.XRGripSpace) {
    this.last0.copy(g0.position);
    this.last1.copy(g1.position);
  }

  private static gripResolver(resolve: (g: GripControls) => void,
    xr: THREE.WebXRManager) {
    const session = xr.getSession();
    const g0 = xr.getControllerGrip(0);
    const g1 = xr.getControllerGrip(1);
    if (session && g0 && g1) {
      const s = new RewardSound();
      s.start();
      resolve(new GripControls(session, g0, g1));
    } else {
      setTimeout(() => {
        GripControls.gripResolver(resolve, xr);
      }, 500);
    }
  }

  static async make(xr: THREE.WebXRManager): Promise<GripControls> {
    return new Promise<GripControls>((resolve, reject) => {
      GripControls.gripResolver(resolve, xr);
    });
  }

  public getDelta(out: THREE.Vector3): void {
    if (this.g0.position.y < this.g1.position.y) {
      out.copy(this.g0.position);
      out.sub(this.last0);
    } else {
      out.copy(this.g1.position);
      out.sub(this.last1);
    }
    this.last0.copy(this.g0.position);
    this.last1.copy(this.g1.position);
  }
}
import * as THREE from "three";
import { ControlInterface } from "./controlInterface";
import { RewardSound } from "./sfx/rewardSound";

export class GripControls implements ControlInterface {
  private last0 = new THREE.Vector3();
  private last1 = new THREE.Vector3();
  private constructor(session: XRSession,
    private g0: THREE.XRGripSpace, private g1: THREE.XRGripSpace,
    playerGroup: THREE.Group) {
    this.last0.copy(g0.position);
    this.last1.copy(g1.position);
    playerGroup.add(g0);
    playerGroup.add(g1);
    g0.add(new THREE.AxesHelper(0.3));
    g1.add(new THREE.AxesHelper(0.3));
  }

  private static gripResolver(resolve: (g: GripControls) => void,
    xr: THREE.WebXRManager, playerGroup: THREE.Group) {
    const session = xr.getSession();
    const g0 = xr.getController(0);
    const g1 = xr.getController(1);
    if (session && g0 && g1) {
      const s = new RewardSound();
      s.start();
      resolve(new GripControls(session, g0, g1, playerGroup));
    } else {
      setTimeout(() => {
        GripControls.gripResolver(resolve, xr, playerGroup);
      }, 500);
    }
  }

  static async make(xr: THREE.WebXRManager, playerGroup: THREE.Group): Promise<GripControls> {
    return new Promise<GripControls>((resolve, reject) => {
      GripControls.gripResolver(resolve, xr, playerGroup);
    });
  }

  private t0 = new THREE.Vector3();
  private t1 = new THREE.Vector3();
  public getDelta(out: THREE.Vector3): void {
    this.t0.copy(this.g0.position);
    this.t1.copy(this.g1.position);
    if (this.t0.y < this.t1.y) {
      out.copy(this.t0);
      out.sub(this.last0);
    } else {
      out.copy(this.t1);
      out.sub(this.last1);
    }
    this.last0.copy(this.t0);
    this.last1.copy(this.t1);
  }
}
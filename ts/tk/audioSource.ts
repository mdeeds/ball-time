import { copyFileSync } from "fs";
import * as THREE from "three";

export class AudioSource extends THREE.Object3D {
  private leftEar = new THREE.Object3D();
  private rightEar = new THREE.Object3D();

  private leftIn: GainNode;
  private rightIn: GainNode;
  private delayLeft: DelayNode;
  private delayRight: DelayNode;
  private lowPassLeft: BiquadFilterNode;
  private lowPassRight: BiquadFilterNode;

  constructor(listener: THREE.Object3D,
    private audioCtx: AudioContext) {
    super();
    this.leftEar.position.set(-0.15, 0, 0);
    this.leftEar.rotateY(75 * Math.PI / 180);
    listener.add(this.leftEar);
    this.rightEar.position.set(0.15, 0, 0);
    this.rightEar.rotateY(-75 * Math.PI / 180);
    listener.add(this.rightEar);

    this.leftIn = this.audioCtx.createGain();
    this.rightIn = this.audioCtx.createGain();
    this.delayLeft = this.audioCtx.createDelay();
    this.delayRight = this.audioCtx.createDelay();
    this.lowPassLeft = this.audioCtx.createBiquadFilter();
    this.lowPassRight = this.audioCtx.createBiquadFilter();

    this.leftIn.connect(this.delayLeft);
    this.rightIn.connect(this.delayRight);
    this.delayLeft.connect(this.lowPassLeft);
    this.delayRight.connect(this.lowPassRight);

    const merger = this.audioCtx.createChannelMerger(2);
    this.lowPassLeft.connect(merger, 0, 0);
    this.lowPassRight.connect(merger, 0, 1);
    merger.connect(this.audioCtx.destination);

  }

  private l = new THREE.Vector3();
  private getDistance(o: THREE.Object3D) {
    o.getWorldPosition(this.l);
    this.l.sub(this.thisWorldPosition);
    return this.l.length();
  }

  private setDelayAndGain(o: THREE.Object3D, d: DelayNode,
    g: GainNode) {
    const len = this.getDistance(o);
    let delay = len / 343;  // 343 = speed of sound
    if (delay > 1.0) {
      console.log(`Delay: ${delay}; len: ${len}`);
      delay = 1.0;
    }
    const targetTime = this.audioCtx.currentTime + 0.01;
    d.delayTime.linearRampToValueAtTime(delay, targetTime);
    if (len < 2.0) {
      g.gain.linearRampToValueAtTime(1.0, targetTime);
    } else {
      g.gain.linearRampToValueAtTime(4.0 / (len * len), targetTime);
    }
  }

  private getCutoff(theta: number): number {
    // Form: r = a cos(t) + b
    // Max = a + b, min = b - a
    // Max = ln(20000), Min = ln(200)
    // => 2b = ln(20000) + ln(200)
    const b = 0.5 * (Math.log(20000) + Math.log(200));
    // => a = b - ln(200)
    const a = b - Math.log(200)
    const r = a * Math.cos(theta) + b;
    return Math.exp(r);
  }

  private oPosition = new THREE.Vector3();
  private setFilter(o: THREE.Object3D, f: BiquadFilterNode) {
    o.worldToLocal(this.thisWorldPosition);
    const angle = Math.atan2(this.oPosition.z, this.oPosition.x);
    // Need to make this an exponential change
    // Also need to handle front vs back of head.
    const cutoff = this.getCutoff(angle);
    f.frequency.linearRampToValueAtTime(cutoff, this.audioCtx.currentTime + 0.01);
  }

  private headForward = new THREE.Vector3(0, 0, -1);
  private getAngle(o: THREE.Object3D) {
    o.getWorldPosition(this.l);
    this.l.sub(this.thisWorldPosition);

    // Need to take into account the orientation of `o` which is the head.
    return this.l.angleTo(this.headForward);
  }

  private setChannel(ear: THREE.Object3D,
    delay: DelayNode, filter: BiquadFilterNode, gain: GainNode) {
    this.setDelayAndGain(ear, delay, gain);
    this.setFilter(ear, filter);
  }

  private thisWorldPosition = new THREE.Vector3();

  // Sets the delayLeft and delayRight to match the time it takes
  // sound to travel from the WorldPosition of `this` to the
  // `leftEar` and `rightEar`.  Also updates `lowPassLeft` and
  // `lowPassRight` to close when `this` is on the opposite side of
  // the head.
  public update() {
    this.getWorldPosition(this.thisWorldPosition);
    this.setChannel(this.leftEar, this.delayLeft, this.lowPassLeft, this.leftIn)
    this.setChannel(this.rightEar, this.delayRight, this.lowPassRight, this.rightIn)
  }

  public connect(input: AudioNode) {
    input.connect(this.leftIn);
    input.connect(this.rightIn);
  }
}
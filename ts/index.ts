import * as THREE from "three";
import Ammo from "ammojs-typed";
import { Game } from "./game";
import { RewardSound } from "./sfx/rewardSound";

const v = new THREE.Vector3(1, 2, 3);

console.log(JSON.stringify(v));

const make = async function (): Promise<typeof Ammo> {
  return new Promise<typeof Ammo>((resolve) => {
    Ammo().then((lib) => {
      resolve(lib);
    });
  })
}

const go = async function () {
  const ammo = await make();
  const game = new Game(ammo);

  const rewardSound = new RewardSound();
  rewardSound.start();
}

go();
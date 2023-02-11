import Ammo from "ammojs-typed";
import { Game } from "./game";

const make = async function (): Promise<typeof Ammo> {
  return new Promise<typeof Ammo>((resolve) => {
    Ammo().then((lib) => {
      resolve(lib);
    });
  })
}

const go = async function () {
  const ammo = await make();
  const game = new Game(ammo, new AudioContext());
}

document.body.onload = () => {
  const b = document.createElement('button');
  b.textContent = 'Go!';
  b.onclick = () => {
    go();
  }
  document.body.appendChild(b);
}


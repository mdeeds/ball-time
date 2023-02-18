import Ammo from "ammojs-typed";
import { Game } from "./game";
import { Rings } from "./rings";
import { SkyPainter } from "./sky-painter";

const make = async function (): Promise<typeof Ammo> {
  return new Promise<typeof Ammo>((resolve) => {
    Ammo().then((lib) => {
      resolve(lib);
    });
  })
}

const go = async function () {
  const ammo = await make();
  const url = new URL(document.URL);
  const stringVal = url.searchParams.get('m');
  if (stringVal == 'r') {
    new Rings();
  } else {
    const game = new Game(ammo, new AudioContext());
  }
}

document.body.onload = () => {
  const b = document.createElement('button');
  b.textContent = 'Go!';
  b.onclick = () => {
    go();
  }
  document.body.appendChild(b);
}


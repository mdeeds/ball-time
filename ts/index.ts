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
  const game = new Game(ammo);
}

go();
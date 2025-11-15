import { Weapon } from "./weapon.js";
export class TinyWeapon extends Weapon {
  constructor() {
    super(1000, 6, 1500, "./sounds/slowStrongShot.wav", "./sounds/shortReloadBasic.wav", "Basic Slow");
  }
}

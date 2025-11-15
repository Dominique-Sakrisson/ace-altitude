import { Weapon } from "./weapon";
export class BasicWeapon extends Weapon {
  constructor() {
    super(100, 15, 3000, "./sounds/567308__bigdino1995__plasmacannon.wav", "./sounds/longReloadBasic.wav", "Basic Rapid");
  }
}

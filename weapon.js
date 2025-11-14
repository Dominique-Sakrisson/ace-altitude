export class Weapon {
  constructor(attackSpeed, clipSize, reloadSpeed, shotSound, reloadSound, name) {
    this.attackSpeed = attackSpeed; //time in MS between attacks
    this.defaultClipSize = clipSize;
    this.clipSize = this.defaultClipSize;
    this.reloadSpeed = reloadSpeed;
    this.lastShot = 0;
    this.shotSound = shotSound;
    this.reloading = false;
    this.reloadSound = reloadSound;
    this.name = name;
  }
  reload() {
    this.clipSize = this.defaultClipSize;
  }
  handleReload() {
    this.setReloading(true);
    setTimeout(() => {
      this.setReloading(false);
      this.reload();
    }, this.reloadSpeed);
  }
  setLastShot(time) {
    if (this.clipSize <= 1) {
      this.clipSize--;
      this.handleReload();
      return;
    }
    this.lastShot = time;
    this.clipSize--;
  }

  setReloading(toggle) {
    if (typeof toggle !== "boolean") return;
    this.reloading = toggle;
  }
  reload() {
    this.clipSize = this.defaultClipSize;
  }
  shotCooldown(timeStamp) {
    if (!this.lastShot) {
      this.setLastShot(timeStamp);
      return true;
    } else if (timeStamp - this.lastShot <= this.attackSpeed) {
      return false;
    }
    if (this.reloading) {
      return false;
    }

    this.setLastShot(timeStamp);
    return true;
  }
}

import * as THREE from "three";
import { BasicWeapon } from "./src/weapons/basicWeapon";
import { TinyWeapon } from "./src/weapons/tinyWeapon";
import { Unarmed } from "./src/weapons/unarmed";
import { Boost } from "./enhancements/boost";
import { MapBuilder } from "./mapBuilder";
import * as dat from "lil-gui";

export class PlayerSetup {
  constructor(window, camera, socket) {
    this.socket = socket;
    this.id = this.socket.id;
    this.pointer = new THREE.Vector2();
    // this.raycaster = new THREE.Raycaster();
    this.window = window;
    this.lookSensitivity = Math.PI / 24;
    this.playerCamera = camera;
    this.playerCamera.raycaster = new THREE.Raycaster();
    this.activeBoost = false;
    this.boostSpeed = 0.5;
    this.boostDuration = 2.5;
    this.boostRestore = 10;
    this.playerCharacter = null;
    this.stats = {
      rollModifier: 1,
      baseRollSpeed: (Math.PI / 24) * this.rollModifier,
      width: 50,
      height: 100,
      boost: new Boost({
        activeBoost: this.activeBoost,
        boostSpeed: this.boostSpeed,
        boostDuration: this.boostDuration,
        boostRestore: this.boostRestore,
      }),
    };
    this.height = 100;
    this.size = 40;
    this.weapon = new TinyWeapon();

    this.weapon2 = new BasicWeapon();
    this.currentWeapon = this.playerShip ? this.weapon : new Unarmed();

    // this.boost = new Boost({
    //   activeBoost: this.activeBoost,
    //   boostSpeed: this.boostSpeed,
    //   boostDuration: this.boostDuration,
    //   boostRestore: this.boostRestore,
    // });
    this.speed = 1;
    this.currentSpeed = this.speed;
    this.lastShot = 0;
    this.attackSpeed = 100;
    this.defaultClipSize = 15;
    this.clipSize = 15;
    this.reloadSpeed = 3000;
    // this.isSlowed = this.currentSpeed < this.speed;
    // this.angle = 0;
    // this.color = "blue";
    // this.health = 100;
    // this.maxHealth = 100;
    // this.damage = 1;
    // this.damageStyle = "projectile";
    // this.defenseStyle = "projectile";
    // this.lives = 3;
    // this.lastHit = Date.now();
    // this.lastMarkHit = Date.now();
    // this.damaged = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.playerShip = {};
    this.velocity = new THREE.Vector3(0, 0, 0);

    // this.character = gameState.selectedShip;

    if (this.getActiveBoost()) {
      this.moveSpeed = this.getCurrentSpeed() + 1;
    } else {
      this.moveSpeed = this.getCurrentSpeed();
    }
    // this.applyPlayerBoost().boostSpeed;
    this.shipDirection = this.playerCamera.getWorldDirection(
      new THREE.Vector3(),
    );

    this.interact = false;
    this.centerVision = false;
    // this.window.addEventListener('mousemove', this.onMouseMove);
  }
  // reload() {
  //   this.clipSize = this.defaultClipSize;
  // }
  // handleReload() {
  //   this.setReloading(true);
  //   setTimeout(() => {
  //     this.setReloading(false);
  //     this.reload();
  //   }, this.reloadSpeed);
  // }
  // setLastShot(time) {
  //   if (this.clipSize <= 1) {
  //     this.clipSize--;
  //     this.handleReload();
  //     return;
  //   }
  //   this.lastShot = time;
  //   this.clipSize--;
  // }

  // setReloading(toggle) {
  //   if (typeof toggle !== "boolean") return;
  //   this.reloading = toggle;
  // }
  // reload() {
  //   this.clipSize = this.defaultClipSize;
  // }
  // shotCooldown(timeStamp) {
  //   if (!this.lastShot) {
  //     this.setLastShot(timeStamp);
  //     return true;
  //   } else if (timeStamp - this.lastShot <= this.attackSpeed) {
  //     return false;
  //   }
  //   if (this.reloading) {
  //     return false;
  //   }

  //   this.setLastShot(timeStamp);
  //   return true;
  // }
  swapWeapon() {
    console.log("hello");
    console.log(this.currentWeapon, "current");
    if (this.currentWeapon === this.weapon) {
      this.currentWeapon = this.weapon2;
      return;
    }
    if (this.currentWeapon === this.weapon2) {
      this.currentWeapon = this.weapon;
      return;
    }
  }
  orientNewShip(ship) {
    ship.object.parent.rotation.x = 0;
    ship.object.parent.rotation.y = 0;
    ship.object.parent.rotation.z = 0;
    return ship;
  }
  setPlayerShip(ship) {
    this.playerShip = {};
    console.log(ship);
    let newShip = this.orientNewShip(ship);
    this.playerShip = newShip;
    this.playerCamera.add(this.playerShip.object.parent);
    const { x, y, z } = this.playerCamera.getWorldPosition(new THREE.Vector3());

    // this.playerShip.object.parent.position.set(0, -8, -13); // position for unscaled
    this.playerShip.object.parent.position.set(0, -55, -83);

    this.playerShip.object.parent.rotation.x += 3.1;
    this.playerShip.object.parent.rotation.y = 0;
    this.playerShip.object.parent.rotation.z = 3.15;

    const group = new THREE.Group();
    group.add(this.playerCamera);

    this.playerShip.group = group;
    this.currentWeapon = this.weapon;

    this.weapon.handleReload();
  }

  setLookSensitivity(amount) {
    this.lookSensitivity = Math.PI / amount;
  }
  getLookSensitivity() {
    return this.lookSensitivity;
  }
  setPlayerCharacter(mesh) {
    this.playerCharacter = mesh;
  }
  setCurrentSpeed(speed) {
    this.currentSpeed = speed;
  }
  getCurrentSpeed() {
    return this.currentSpeed;
  }

  setMoveForward(toggle) {
    this.moveForward = toggle;
  }

  setMoveBackward(toggle) {
    this.moveBackward = toggle;
  }
  setMoveRight(toggle) {
    this.moveRight = toggle;
  }
  setMoveLeft(toggle) {
    this.moveLeft = toggle;
  }

  getMoveForward() {
    return this.moveForward;
  }
  getMoveBackward() {
    return this.moveBackward;
  }
  getMoveLeft() {
    return this.moveLeft;
  }
  getMoveRight() {
    return this.moveRight;
  }

  updateCharacterPos(character) {
    character.position = this.playerCamera.position;
    character.rotation = this.playerCamera.rotation;
    if (this.playerShip.keys) {
      this.playerShip.position = new THREE.Vector3(this.playerCamera.position);
      this.playerShip.rotation = this.playerCamera.rotation;
    }
  }

  operateMovement(deltaTime, time, mouseDirection) {
    const forwardDirection = mouseDirection.clone().setY(0).normalize(); // Direction of the mouse for forward movement
    const backwardDirection = forwardDirection.clone().negate(); // Opposite
    const shipDirection = this.playerCamera.getWorldDirection(forwardDirection);
    if (this.getMoveBackward()) {
      this.velocity.add(
        backwardDirection.multiplyScalar(this.moveSpeed * deltaTime),
      ); // Move opposite to the mouse direction
    }

    if (this.getMoveForward()) {
      if (!this.playerShip.position) {
        this.playerCamera.position.addScaledVector(
          shipDirection,
          this.moveSpeed,
        );
      }

      this.handleMoveForwardWithShip(shipDirection, time);
      const SEND_RATE = 20; // Hz
      this._lastSend ??= 0;

      console.log(this.playerShip, "local rotation");
      if (this.playerShip.group && this.socket.id && this.playerObject) {
        const position = this.playerObject.playerCamera.getWorldPosition(
          new THREE.Vector3(),
        );
        const now = performance.now();
        if (now - this._lastSend > 1000 / SEND_RATE) {
          this._lastSend = now;
          this.socket.emit("player movement", {
            id: this.socket.id,
            position,
            rotation: {
              x: this.playerShip.rotation.x,
              y: this.playerShip.rotation.y,
              z: this.playerShip.rotation.z,
            },
          });
        }
      }
    }
    if (this.getMoveBackward()) {
      if (!this.playerShip.position) {
        this.playerCamera.position.addScaledVector(
          shipDirection,
          -this.moveSpeed,
        );
      }
      this.handleMoveBackwardWithShip(shipDirection, time);
      const SEND_RATE = 20; // Hz
      this._lastSend ??= 0;
      if (this.playerShip.group && this.socket.id && this.playerObject) {
         const position = this.playerObject.playerCamera.getWorldPosition(
          new THREE.Vector3(),
        );
        const now = performance.now();
        if (now - this._lastSend > 1000 / SEND_RATE) {
        this.socket.emit("player movement", {
          id: this.socket.id,
          position,
          rotation: {
            x: this.playerShip.rotation.x,
            y: this.playerShip.rotation.y,
            z: this.playerShip.rotation.z,
          },
        });
      }
      }
    }

    // Strafe movement using the this.playerCamera's right vector
    const right = new THREE.Vector3();
    right.crossVectors(this.playerCamera.up, shipDirection).normalize();

    // if (this.getMoveLeft()) {
    //   if (!this.playerShip.position) {
    //     this.playerCamera.rotateZ(THREE.MathUtils.degToRad(time * 0.00003));
    //   } else {
    //     this.handleMoveLeftWithShip(shipDirection, time);
    //   }

    //   // this.playerCamera.rotateOnAxis(new THREE.Vector3(0, 1, 0), time * 0.000003); // Left yaw
    // }

    // if (this.getMoveRight()) {
    //   const clock = new THREE.Clock();
    //     const delta = clock.getDelta();
    //     const strafeSpeed = .01 * delta;
    //   if (!this.playerShip.position) {
    //     // this.playerCamera.rotateZ(THREE.MathUtils.degToRad(-time * 0.00003));
    //      this.playerShip.position.addScaledVector(right, strafeSpeed);
    //   } else {
    //     this.handleMoveRightWithShip(shipDirection, time);
    //   }
    //   // camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -time * 0.000003); // Right yaw
    // }
  }

  getPlayerPosition() {
    return this.playerCamera.position;
  }
  updatePlayerPosition() {
    const shipDirection = new THREE.Vector3();

    this.playerCamera.getWorldDirection(shipDirection);

    if (this.getMoveForward) {
      this.playerCamera.position.addScaledVector(
        shipDirection,
        this.boost ? this.getCurrentSpeed() + 50 : this.getCurrentSpeed(),
      );
    }
  }
  /**returns an object that is tracking the players boostSpeed, boostDuration, boostRestore attributes  */
  applyPlayerBoost() {
    return {
      boostSpeed: this.stats.boost.boostSpeed,
      boostDuration: this.stats.boost.boostDuration,
      boostRestore: this.stats.boost.boostRestore,
    };
  }
  /** used or in game upgrades or buffs that will enhance the  boost stats as players level them or use temporary powerups*/
  setActiveBoost(toggle) {
    this.activeBoost = toggle;
    if (toggle) {
      this.moveSpeed = this.speed + this.applyPlayerBoost().boostSpeed;
    } else {
      this.moveSpeed = this.speed;
    }
  }
  getActiveBoost() {
    return this.activeBoost;
  }
  getInteract() {
    return this.interact;
  }
  setInteract(toggle) {
    this.interact = toggle;
  }
  setCenterVision() {
    // this.playerCamera.rotation.x = 360 / this.playerCamera.rotation.x % 15;
    this.snapCameraXRotation(this.playerCamera);
    this.playerCamera.rotation.z = 0;
  }

  centerAim() {
    this.playerCamera.rotation.x = 0;
    this.playerCamera.rotation.y = 0;
  }
  onMouseMove = (event) => {
    this.pointer.x = (event.clientX / this.window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / this.window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.playerCamera);
    const intersects = this.raycaster.intersectObjects(
      this.setCenterVision.children,
    );
  };

  //modifier: positive float under 1.0
  setRollSpeedMod(modifier) {
    this.baseRollModifier *= modifier;
  }
  snapCameraXRotation(camera) {
    // Get rotation.x in radians
    let rotX = camera.rotation.x;

    // Convert to degrees for easier snapping
    let rotDeg = THREE.MathUtils.radToDeg(rotX);

    // Snap to nearest 15 degrees
    let snappedDeg = Math.round(rotDeg / 45) * 45;

    // Convert back to radians
    camera.rotation.x = THREE.MathUtils.degToRad(snappedDeg);
  }
  handleMoveForwardWithShip(shipDirection, time) {
    if (this.playerShip.position) {
      // this.playerShip.object.parent.position.addScaledVector(
      //   shipDirection,
      //   this.moveSpeed,
      // ) * -1;
      this.playerShip.group.position.addScaledVector(
        shipDirection,
        this.moveSpeed,
      ) * -1;
    }
  }
  handleMoveBackwardWithShip(shipDirection, time) {
    if (this.playerShip.position) {
      // this.playerShip.object.parent.position.addScaledVector(
      //   shipDirection,
      //   -this.moveSpeed,
      // );
      this.playerShip.group.position.addScaledVector(
        shipDirection,
        -this.moveSpeed,
      );
    }
  }
  // handleMoveLeftWithShip(shipDirection, time) {
  //   if (this.playerShip.position) {
  //     // this.playerShip.object.parent.rotateZ(THREE.MathUtils.degToRad(time * 1));
  //     this.playerShip.group.rotateZ(THREE.MathUtils.degToRad(time * 0.0001));
  //   }
  // }
  // handleMoveRightWithShip(shipDirection, time) {
  //   if (this.playerShip.position) {
  //     this.playerShip.group.rotateZ(THREE.MathUtils.degToRad(-time * 0.0001));
  //     // this.playerShip.object.parent.rotateZ(
  //     //   THREE.MathUtils.degToRad(-time * 1),
  //     // );
  //   }
  // }

  positionShipTool() {
    if (!this.playerShip || !this.playerShip.object) return;
    this.gui
      .add(this.playerShip.object.position, "x", -100, 100, 1)
      .onChange((value) => {
        this.playerShip.object.position.set(
          value,
          this.playerShip.object.position.y,
          this.playerShip.object.position.z,
        );
      });
  }
}

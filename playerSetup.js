import * as THREE from "three";
import { Boost } from "./enhancements/boost";
import { MapBuilder } from "./mapBuilder";
import * as dat from "lil-gui";

export class PlayerSetup {
  constructor(window, camera, socketId) {
    this.id = socketId;
    this.pointer = new THREE.Vector2();
    // this.raycaster = new THREE.Raycaster();
    this.window = window;
    this.lookSensitivity = Math.PI / 24;
    this.playerCamera = camera;
    this.playerCamera.raycaster = new THREE.Raycaster();
    this.activeBoost = false;
    this.boostSpeed = 25;
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

    // this.boost = new Boost({
    //   activeBoost: this.activeBoost,
    //   boostSpeed: this.boostSpeed,
    //   boostDuration: this.boostDuration,
    //   boostRestore: this.boostRestore,
    // });
    this.speed = 3;
    this.currentSpeed = this.speed;
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
  setPlayerShip(ship) {
    this.playerShip = {};
    this.playerShip = ship;
    this.playerCamera.add(this.playerShip.object.parent);
    this.playerShip.object.parent.position.set(this.playerCamera.position);
    this.playerShip.object.parent.position.set(0, -35, -40);
    this.playerShip.object.parent.rotation.x += 3.35;
    this.playerShip.object.parent.rotation.y = 0;
    this.playerShip.object.parent.rotation.z = 0;
   
    const group = new THREE.Group();
    group.add(this.playerCamera);
  
    this.playerShip.group = group;

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

  // movement(direction, moveOps) {
  //   const options = new Map();
  //   options.set("forward", (direction, speed) => {
  //     this.playerCamera.position.addScaledVector(direction, speed);
  //   });
  //   options.set("backward");
  //   options.set("left");
  //   options.set("right");
  //   options.get(direction)(moveOps.shipDirection, moveOps.moveSpeed);
  // }
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
    }
    if (this.getMoveBackward()) {
      if (!this.playerShip.position) {
        this.playerCamera.position.addScaledVector(
          shipDirection,
          -this.moveSpeed,
        );
      }
      this.handleMoveBackwardWithShip(shipDirection, time);
    }

    // Strafe movement using the this.playerCamera's right vector
    const right = new THREE.Vector3();
    right.crossVectors(this.playerCamera.up, shipDirection).normalize();

    if (this.getMoveLeft()) {
      if (!this.playerShip.position) {
        this.playerCamera.rotateZ(THREE.MathUtils.degToRad(time * 0.00003));
      } else {
        this.handleMoveLeftWithShip(shipDirection, time);
      }

      // this.playerCamera.rotateOnAxis(new THREE.Vector3(0, 1, 0), time * 0.000003); // Left yaw
    }
    if (this.getMoveRight()) {
      if (!this.playerShip.position) {
        this.playerCamera.rotateZ(THREE.MathUtils.degToRad(-time * 0.00003));
      } else {
        this.handleMoveRightWithShip(shipDirection, time);
      }
      // camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -time * 0.000003); // Right yaw
    }
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
  handleMoveLeftWithShip(shipDirection, time) {
    if (this.playerShip.position) {
      // this.playerShip.object.parent.rotateZ(THREE.MathUtils.degToRad(time * 1));
      this.playerShip.group.rotateZ(THREE.MathUtils.degToRad(time * 0.0001));
    }
  }
  handleMoveRightWithShip(shipDirection, time) {
    if (this.playerShip.position) {
      this.playerShip.group.rotateZ(THREE.MathUtils.degToRad(-time * 0.0001));
      // this.playerShip.object.parent.rotateZ(
      //   THREE.MathUtils.degToRad(-time * 1),
      // );
    }
  }

  // positionShipTool() {
  //   if (!this.playerShip || !this.playerShip.object) return;
  //   this.gui
  //     .add(this.playerShip.object.position, "x", -100, 100, 1)
  //     .onChange((value) => {
  //       this.playerShip.object.position.set(
  //         value,
  //         this.playerShip.object.position.y,
  //         this.playerShip.object.position.z,
  //       );
  //     });
  // }
}

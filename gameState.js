import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PlayerSetup } from "./playerSetup";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { FlyControls } from "three/addons/controls/FlyControls.js";
import { BloodParticleSystem } from "./src/bloodParticleSystem";
import { GlobeParticleSystem } from "./src/globeParticleSystem";
import menuData from "./src/ui/menuData";
import { MapBuilder } from "./mapBuilder";
import { InventorySystem } from "./src/inventorySystem";
import { morphObject, generateTerrain, createBullet } from "./objectHelper";
import { TargetingSystem } from "./src/targetingSystem";

//need to work in a level state to pass in
export class GameState {
  constructor({
    lookSensitivity,
    boost,
    // playerObject,
    window,
    camera,
    scene,
    canvas,
    renderer,
  }) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.controlsEnabled = false;
    this.reticleVisible = false;
    this.isPaused = false;
    this.gameHasStarted = false;
    this.optionsPage = false;
    this.newGame = false;
    this.activeMenu = this.readActiveMenu();
    this.lookSensitivity = 0.05;
    this.boost = false;
    this.window = window;
    this.scene = scene;
    this.interactionDistance = 500;
    this.shipClicked = null;
    this.shipSelection = null;
    this.interact = false;
    this.interacting = false;
    this.showInteract = false;
    this.playerObject = new PlayerSetup(window, camera);
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.center = false;
    this.bloodSystems = [];
    // this.globeSystems = [];
    this.globeSystems = null;
    this.hits = new Map();
    this.pendingOptionsChanges = {};
    this.OBJLoader = new OBJLoader();
    this.GLTFLoader = new GLTFLoader();
    this.MTLLoader = new MTLLoader();
    this.FontLoader = new FontLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.audioListener = new THREE.AudioListener();
    this.engineSound = new THREE.PositionalAudio(this.audioListener);
    this.playerObject.playerCamera.add(this.audioListener);
    this.TextureLoader = new THREE.TextureLoader();
    this.CTextureLoader = new THREE.CubeTextureLoader();
    this.CSSRenderer = new CSS3DRenderer();
    this.controls = new FlyControls(
      this.playerObject.playerCamera,
      renderer.domElement,
    );
    (this.activeShots = []), (this.mapBuilder = new MapBuilder(this));
    this.inventorySystem = new InventorySystem(3, 3);
    this.inventoryDisplay = false;
    this.inventory = [
      Array(3).fill(this.inventorySystem.itemLibrary.getItem(0)),
      Array(3).fill(this.inventorySystem.itemLibrary.getItem(0)),
      Array(3).fill(this.inventorySystem.itemLibrary.getItem(0)),
    ];
    this.updatedInventory = false;
    this.bulletSpeed = 35;
    this.selectAbleShips = [];
  }
  addSelectableShip(ship) {
    this.selectAbleShips.push(ship);
  }
  configureControls() {
    const DEFAULT_ROLLSPEED = 24;
    const moveSpeed = Math.PI / DEFAULT_ROLLSPEED;
    this.controls.movementSpeed = moveSpeed;
    //pass in negative amount to increase sensitivity
    console.log(this.playerObject.getLookSensitivity());
    // this.playerObject.setLookSensitivity(DEFAULT_ROLLSPEED - 10);
    // this.playerObject.setLookSensitivity( 0.05);
    this.controls.rollSpeed = this.playerObject.getLookSensitivity();
  }
  updateShots(time) {
    if (this.getControlsEnabled()) {
      this.activeShots.forEach((shot) => {
        shot.position.add(
          shot.userData.direction.clone().multiplyScalar(this.bulletSpeed),
        );
        shot.rotation.z = time;
        shot.rotation.x = time * Math.random() * 0.000036;
      });
    }
  }

  itemMouseOver(e) {
    const tooltip = document.createElement("div");
    tooltip.style.width = "100px";
    tooltip.style.height = "100px";
    tooltip.style.textAlign = "center";
    tooltip.style.zIndex = 1;
    tooltip.style.position = "fixed";
    tooltip.style.padding = "6px 10px";
    tooltip.style.background = "rgba(0,0,0,0.8)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "6px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.display = "none";
    document.body.appendChild(tooltip);

    const li = e.currentTarget; // the <li> hovered
    const itemData = li.libraryItem; // you attached this in buildInventory

    const parts = [];
    if (itemData?.name) parts.push(itemData.name);
    if (itemData?.category) parts.push(`Category: ${itemData.category}`);
    if (itemData?.stackAble != null)
      parts.push(`Stackable: ${itemData.stackAble ? "Yes" : "No"}`);

    // Join with newline
    // Set innerHTML with <br> for each line
    tooltip.innerHTML = parts.join("<br>");

    // tooltip.textContent = itemData?.name || "empty";

    tooltip.style.display = "block";

    // position tooltip near mouse
    tooltip.style.left = e.clientX + 50 + "px";
    tooltip.style.top = e.clientY + 50 + "px";

    // keep updating position while mouse moves
    li.onmousemove = (moveEvent) => {
      tooltip.style.left = moveEvent.clientX + 50 + "px";
      tooltip.style.top = moveEvent.clientY + "px";
    };

    li.onmouseout = () => {
      tooltip.style.display = "none";
    };
  }

  initHoverHandlers() {}
  reticleOff() {
    document.getElementById("reticle").style.display = "none";
  }
  reticleOn() {
    document.getElementById("reticle").style.position = "absolute";
    document.getElementById("reticle").style.display = "block";
  }
  initKeyHandlers() {
    this.canvas.addEventListener("click", () => {
      if (this.playerObject.playerCamera.position.x === undefined) return;
      if (this.getControlsEnabled()) {
        createBullet(
          this.playerObject.playerCamera,
          this.scene,
          this.activeShots,
        );
      }
    });
    this.canvas.addEventListener("mousedown", (event) => {
      if (event.button === 2) {
        // Right mouse button (0 = left, 1 = middle, 2 = right)
        this.center = true;
      }
    });
    this.canvas.addEventListener("mouseup", (event) => {
      if (event.button === 2) {
        // Right mouse button (0 = left, 1 = middle, 2 = right)
        this.center = false;
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (this.getIsPaused()) {
          this.setIsPaused(false);
          this.setOptionsPage(false);
          this.reticleOn();
        } else {
          this.setIsPaused(true);
          this.reticleOff();
        }

        return;
      }
    });

    window.addEventListener("keydown", (event) => {
      event.preventDefault();
      if (event.code === "ShiftLeft") {
        event.preventDefault();
        this.playerObject.setActiveBoost(true);
      }
    });
    window.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code === "ShiftLeft") {
        event.preventDefault();
        this.playerObject.setActiveBoost(false);
      }
      if (event.code === "KeyV") {
        event.preventDefault();
        this.playerObject.setInteract(false);
      }
    });
    // Resize the renderer and camera when the window is resized
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  buildInventory(localInventory) {
    const inventoryElement = document.getElementById("inventory");
    console.log({ localInventory });
    localInventory.map(() => {
      const item = document.createElement("li");
      const defaultItem = this.inventorySystem.itemLibrary.getItem(0);
      item.id = defaultItem.id;
      const img = document.createElement("img");
      if (defaultItem.src) {
        img.src = defaultItem.src;
        img.width = item.width || 128;
        img.height = item.height || 128;
        item.appendChild(img);
      }
      item.libraryItem = defaultItem;
      item.className = "slot";
      inventoryElement.appendChild(item);
      item.onmouseover = (e) => {
        this.itemMouseOver(e);
      };
    });
  }

  getControlsEnabled() {
    return this.controlsEnabled;
  }
  setEnableControls() {
    this.controlsEnabled = true;
  }
  setDisableControls() {
    this.controlsEnabled = false;
  }

  markOptionChanged(key, value) {
    this.pendingChanges[key] = value;
  }

  clearPendingChanges() {
    this.pendingChanges = {};
  }

  hasPendingChanges() {
    return Object.keys(this.pendingChanges).length > 0;
  }

  readActiveMenu() {
    if (this.optionsPage) return "optionsMenu";
    if (this.isPaused) return "pauseMenu";
    if (!this.gameHasStarted) return "mainMenu";
  }
  setActiveMenu() {
    const name = this.readActiveMenu();

    this.activeMenu = window[name];
  }
  isASCII(str) {
    // Regular expression to match only characters within the standard ASCII range (0x00-0x7F)
    return /^[\x00-\x7F]*$/.test(str);
  }

  //interacts with particles, on the globeSystems
  //particles will have an item linked to its data that will allow adding an item to the inventory
  checkParticleInteractions(camera) {
    const candidates = [];
    const particles = this.globeSystems?.particles;
    if (!this.globeSystems?.particles.length) return;
    //first verify there are particles in range
    for (const particle of particles) {
      const pos = new THREE.Vector3();
      particle.terrainGroup.getWorldPosition(pos);
      const dist = camera.position.distanceTo(pos);
      if (dist < this.interactionDistance) {
        candidates.push(particle.terrainGroup);
      }
    }
    // step 2: run raycaster against nearby candidates only
    //all candidates are within range
    if (candidates.length > 0) {
      const centerNDC = new THREE.Vector2(0, 0); // screen center

      const { raycaster } = this.playerObject.playerCamera;

      // raycaster.setFromCamera(centerNDC, camera);

      const intersects = raycaster.intersectObjects(candidates, true);

      //get the first closest intersection
      if (intersects.length > 0) {
        //will return the object with the category to search for
        const targetInteraction = intersects[0].object;
        if (this.interacting) {
          //get object with matching category from list,
          const item = this.inventorySystem.getItemByCategory(
            targetInteraction.parent.category,
          );
          let defaultPosX = 0;
          let defaultPosY = 0;
          let pass;
          if (item.id) {
            if (
              this.inventorySystem.canPlaceItem(
                item.id,
                defaultPosX,
                defaultPosY,
              )
            ) {
              pass = this.inventorySystem.addToInventory(
                item,
                1,
                defaultPosX,
                defaultPosY,
              );
            }
          }

          const inventory = this.inventorySystem.printInventory();
          this.scene.remove(targetInteraction.parent);
          this.inventory = inventory;
          this.updatedInventory = true;
          this.globeSystems.removeParticle(targetInteraction.parent.particleId);
        }
      }
    }
  }

  removeGroup = (group) => {
    // when removing a group
    if (!group.particle) {
      const globeSystem = new GlobeParticleSystem(
        this.scene,
        group,
        this.mapBuilder,
        "alphaStone",
      );

      this.globeSystems = globeSystem;
    }
    // this.globeSystems.push(globeSystem);
    // console.log(this.globeSystems, " globe systems");
    // for (let i = 0; i < 20; i++) {
    //   const heightTerrain = this.mapBuilder.buildGlobe(
    //     100 + Math.random() * group.children[0].geometry.parameters.radius / 20,
    //     1,
    //     1,
    //   );
    //   console.log({ group });
    //   heightTerrain.terrainGroup.position.x = (Math.random() - 0.5) * 3000;
    //   (heightTerrain.terrainGroup.position.y =
    //     heightTerrain.terrainGroup.position.y - Math.random() * 1600),
    //     (heightTerrain.terrainGroup.position.z =
    //       heightTerrain.terrainGroup.position.z - Math.random() * 1600),
    //     heightTerrain.terrainGroup.remove(heightTerrain.baseSphere);
    //   console.log(heightTerrain.terrainGroup);
    //   this.scene.add(heightTerrain.terrainGroup);
    //   // group.add(heightTerrain);
    // }
    // Dispose all children first
    group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    // Remove from its parent, not just scene
    if (group.parent) {
      group.parent.remove(group);
    }
    // let globePieces = [];
  };
  setupControls = () => {
    this.configureControls();
    this.canvas.addEventListener("mousemove", (event) => {
      const canvasWidth = this.canvas.clientWidth;
      const canvasHeight = this.canvas.clientHeight;
      // Normalize mouse position relative to the center of the canvas
      this.mouseX = (event.clientX / canvasWidth) * 2 - 1; // Range from -1 to 1 (horizontal)
      this.mouseY = -((event.clientY / canvasHeight) * 2 - 1); // Range from -1 to 1 (vertical)
    });
    this.window.addEventListener("mousemove", (event) => {
      const { raycaster } = this.playerObject.playerCamera;
      this.setSelectedObject(event);
      const inRange = this.selectedObject?.distance <= this.interactionDistance;
      this.showInteract = false;
      if (
        (inRange &&
          this.targetingSystem.intersects.length &&
          this.targetingSystem.intersects[0].object.parent.interactable) ||
        this.targetingSystem.intersects[0]?.object.parent.specialInteract
      ) {
        this.showInteract = true;
      }
    });

    this.window.addEventListener("click", (event) => {
      // this.setSelectedObject(event);
      console.log(this.targetingSystem);
      const { raycaster } = this.playerObject.playerCamera;
      // const mouse = new THREE.Vector2();
      const centerNDC = new THREE.Vector2(0, 0); // center of screen

      if (this.targetingSystem.intersects.length) {
        const colorAttr = this.selectedObject.object.geometry.attributes.color;
        // const geometry = this.selectedObject.object.geometry;

        //check if the object is within range of the weapon distance
        if (this.geometry.isBufferGeometry) {
          const interpolatedPoint = this.targetingSystem.determineHitMarker(
            this.geometry,
            this.baryCoords,
          );

          /*During this point is where logic should be to read properties of the object were interacting with, apply differnt types of markers based on material of objects being metal,stone,flesh, for now its red the default for flesh, likely this will be a property on the parent group of the object hit, children objects my one day get their own material so as to check first there and if null or falsey apply the material for the parent group*/

          const marker = this.establishHitMarker(interpolatedPoint);

          this.selectedObject.object.add(marker);

          // When you click: check what object is hit, do the checking for how many hitsm, make the change at 5 hits

          if (this.targetingSystem.intersects.length > 0) {
            const hit = this.selectedObject;
            const configParticlesFromObject = {};
            const blood = new BloodParticleSystem(
              this.scene,
              hit.point,
              hit.face.normal,
            );
            if (this.gameHasStarted) {
              const group = hit.object.parent;
              // console.log(group);

              // Increment count
              const prev = this.hits.get(group) || 0;
              const next = prev + 1;
              this.hits.set(group, next);

              // console.log(`Group ${group.uuid} has ${next} hits`);

              // Check if it reached 10
              if (next >= 5) {
                // console.log("🎯 Group reached 10 hits!", group);

                // Optional: trigger something (bleeding effect, removal, etc.)
                if (group.name === "earthSphere") {
                  console.log({ group });
                  this.removeGroup(group);
                  this.hits.delete(group);
                }

                // Optional: reset counter
                // hitCounts.set(group, 0);
              }

              this.bloodSystems.push(blood);
            }
          }
          //cleanup the markers that have been left on targets
          setTimeout(() => {
            this.selectedObject.object.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
          }, 200);
          // console.log("Triangle vertices:", a, b, c);
        }
      }
    });
    this.window.addEventListener("keydown", (event) => {
      const active = document.activeElement;
      const isInputFocused = active && active.tagName.toLowerCase() === "input";

      if (isInputFocused) {
        // Only intercept keys you want globally while input is focused
        // console.log(event);
        if (this.isASCII(event?.key)) {
          active.value = event.key; // use active, not event.target
          const confirmButton = document.getElementById("confirmButton");
          // console.log(confirmButton);
          confirmButton.classList.remove("undefined");
          confirmButton.classList.add("updates");
          this.markOptionChanged(active.id, event.key);
        }
        if (event.key === "Escape") {
          // console.log("Escape pressed, blur input");
          active.blur();
        }
        return; // Don't handle other keys while typing
      }

      if (event.code === "KeyW") {
        event.preventDefault();
        if (this.getIsPaused() || !this.getGameHasStarted()) return;
        this.playerObject.setMoveForward(true);
        // this.updatePlayerPosition();
      }
      if (event.code === "KeyA") {
        event.preventDefault();
        if (this.getIsPaused() || !this.getGameHasStarted()) return;

        this.playerObject.setMoveLeft(true);
      }
      if (event.code === "KeyS") {
        event.preventDefault();
        if (this.getIsPaused() || !this.getGameHasStarted()) return;
        this.playerObject.setMoveBackward(true);
      }
      if (event.code === "KeyD") {
        event.preventDefault();
        this.playerObject.setMoveRight(true);
      }
      if (event.code === "KeyV") {
        event.preventDefault();
        this.setSelectedObject(event);
        const inRange =
          this.selectedObject?.distance <= this.interactionDistance;

        if (inRange) {
          const state = !this.getInteracting();
          this.setInteracting(state);
          this.setInteract(state);
          console.log({ state });
          if (!state && this.selectedObject) {
            this.scene.remove(this.selectedObject);
          }
        }
      }
      if (event.code === "ShiftLeft") {
        event.preventDefault();
        this.setBoost(true);
        // this.playerObject.setBoost(this.boost);
      }
      if (event.code === "Tab") {
        event.preventDefault();
        this.inventoryDisplay = !this.inventoryDisplay;
      }
    });
    this.window.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code === "KeyW") {
        event.preventDefault();
        this.playerObject.setMoveForward(false);
      }
      if (event.code === "KeyS") {
        event.preventDefault();
        this.playerObject.setMoveBackward(false);
      }
      if (event.code === "KeyA") {
        event.preventDefault();
        this.playerObject.setMoveLeft(false);
      }
      if (event.code === "KeyD") {
        event.preventDefault();
        this.playerObject.setMoveRight(false);
      }
      if (event.code === "KeyV") {
        event.preventDefault();
        this.setInteracting(false);
        this.setInteract(false);
      }
      if (event.code === "KeyH") {
        event.preventDefault();
        if (this.getControlsEnabled()) {
          this.setDisableControls();
        } else {
          this.setEnableControls();
        }
      }
      if (event.code === "ShiftLeft") {
        event.preventDefault();
        this.setBoost(false);
      }
    });
  };
  // getMoveForward() {
  //   if (this.getIsPaused() || !this.getGameHasStarted()) return false;
  //   return this.moveForward;
  // }

  // getMoveBackward() {
  //   if (this.getIsPaused() || !this.getGameHasStarted()) return false;
  //   return this.moveBackward;
  // }

  // getMoveLeft() {
  //   if (this.getIsPaused() || !this.getGameHasStarted()) return false;
  //   return this.moveLeft;
  // }
  // setMoveLeft(toggle) {
  //   if (this.getIsPaused() || !this.getGameHasStarted()) return false;
  //   this.moveLeft = toggle;
  // }
  // getMoveRight() {
  //   if (this.getIsPaused() || !this.getGameHasStarted()) return false;
  //   return this.moveRight;
  // }
  // getLookSensitivity() {
  //   return this.lookSensitivity;
  // }
  // setLookSensitivity(number) {
  //   this.lookSensitivity = number;
  // }
  setBoost(toggle) {
    this.boost = toggle;
  }
  getInteract() {
    return this.interact;
  }
  setGameHasStarted(toggle) {
    this.gameHasStarted = toggle;
  }
  getGameHasStarted() {
    return this.gameHasStarted;
  }
  getIsPaused() {
    return this.isPaused;
  }
  setIsPaused(toggle) {
    this.isPaused = toggle;
  }
  togglePause() {
    if (!this.getGameHasStarted()) return; // likely change to a sort of go back a menu button
    const pauseMenu = document.getElementById("pauseMenu");
    this.displayMenu(pauseMenu);
  }
  displayMenu(menu) {
    if (!menu) return;
    menu.style.display = "block";
  }
  hideMenu(menu) {
    menu?.style?.display ? (menu.style.display = "none") : "";
  }
  getOptionsPage() {
    return this.optionsPage;
  }
  setOptionsPage(toggle) {
    this.optionsPage = toggle;
  }
  setShipSelection() {}
  getInteractionDistance() {
    return this.interactionDistance;
  }
  setInteract(toggle) {
    if (this.interact === toggle) {
      this.interact = !toggle;
    } else {
      this.interact = toggle;
    }
  }
  getShowInteract() {
    return this.showInteract;
  }
  getInteract() {
    return this.interact;
  }
  getInteracting() {
    return this.getInteract();
  }
  setInteracting(toggle) {
    if (!typeof toggle === "boolean") return;

    this.interacting = toggle;
    // this.playerObject.setInteract(toggle);
  }
  getControls() {
    return this.controls;
  }
  setControls(args) {
    const { enabled, movementSpeed, rollSpeed } = args;
    this.controls.enabled = enabled;
    this.controls.movementSpeed = movementSpeed;
    this.controls.rollSpeed = rollSpeed;
  }
  setSelectedObject(event) {
    const allObjects = [];

    this.scene.traverse((child) => {
      if (child.isGroup) {
        allObjects.push(child);
      }
    });
    let targetingSystem;

    if (allObjects.length) {
      this.targetingSystem = new TargetingSystem(
        this.playerObject.playerCamera,
        allObjects,
      );
    }

    if (this.targetingSystem.intersects.length) {
      const {
        target,
        baryCoords,
        targetGeometry: geometry,
      } = this.targetingSystem.getCurrentTarget();

      this.selectedObject = target; // store reference to first intersection ** removed for
      this.baryCoords = baryCoords;
      this.geometry = geometry;
      // now**
    } else {
      this.selectedObject = null;
    }
  }
  setShipGlow(shipGroup, glowing) {
    const color = glowing ? 0xffff00 : 0x000000;

    shipGroup.traverse((child) => {
      if (child.isMesh && child.material && "emissive" in child.material) {
        child.material.emissive.set(color);
        child.material.emissiveIntensity = glowing ? 50 : 1.0;
      }
    });
  }

  establishHitMarker(interpolatedPoint) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(5, 1, 1),
      new THREE.MeshPhongMaterial({
        // color: 0xff00000, // default flesh impact
        // color: 0x996600, // default metal impact
        color:
          this.selectedObject.object.parent.markerConfig.materialConfig.color ||
          0xc0c0c0, // base silver
        // shininess: 50,
        specular:
          this.selectedObject.object.parent.markerConfig.materialConfig
            .specular || 0xffffff, // bright highlights
        // specular: 0xaaaaaa,
        shininess:
          this.selectedObject.object.parent.markerConfig.materialConfig
            .shininess || 100, // higher for metal gloss
        // emissive: 0x072534,
        emissive:
          this.selectedObject.object.parent.markerConfig.materialConfig
            .emissive || 0x111111, // subtle glow if needed -- silver
      }),
    );

    marker.position.copy(interpolatedPoint);

    const parentScale = this.selectedObject.object.getWorldScale(
      new THREE.Vector3(),
    );

    marker.scale.set(1 / parentScale.x, 1 / parentScale.y, 1 / parentScale.z);
    return marker;
  }
}

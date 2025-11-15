"use strict";
import * as THREE from "three";
import "./style.css";
import WebGL from "three/addons/capabilities/WebGL.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { assembleBasicShip, updateGradient } from "./basicSpaceShip";
import { initGui } from "./src/ui/gui";
import { initStation } from "./station";
import { GameState } from "./gameState";
import { AutomationUtils } from "./automationUtils";
import { canvasSetup } from "./canvasUtils";
import { MapBuilder } from "./mapBuilder";
import { Lighting } from "./src/lighting.js";
import { menuInit } from "./src/ui/MenuBuilder";
import vertexShader from "./src/shaders/vertex.glsl?raw";
import fragmentShader from "./src/shaders/fragment.glsl?raw";
import { createMaterial, createTextForScene } from "./objectHelper";

// client/main.js
import { io } from "socket.io-client";
const socket = io("http://localhost:3000"); // your Node.js server

const WORLD_SCALE = 0.1;

if (WebGL.isWebGL2Available()) {
  const { canvas, renderer } = canvasSetup();

  const fov = 65;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 1;
  const far = 6000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.x = 0;
  camera.position.y = -850;
  camera.position.z = 500;
  const scene = new THREE.Scene();

  //make an initGameState() with all the options to set player controls, scene camera matrix, difficulty and level select etc
  const gameConfig = {
    window: window,
    camera,
    scene,
    canvas,
    renderer,
    socket,
  };

  //
  const gameState = new GameState({ ...gameConfig });

  const mapBuilder = new MapBuilder(gameState);

  const inventoryElement = document.getElementById("inventory");
  let localInventory = gameState.inventory;
  gameState.buildInventory(localInventory);

  console.log(gameState.playerObject.playerCamera);
  menuInit(gameState);

  gameState.setupControls(); //controls bound to 2 different classes
  gameState.controls.enabled = gameState.getControlsEnabled();

  //Loading scene, display main menu
  gameState.displayMenu(mainMenu); // accessing this from the mainMenu ID in the index.html
  if (gameState.getGameHasStarted()) {
    gameState.setupControls();
    gameState.setupEvents();
  }

  gameState.audioLoader.load("./sounds/rocketEngine.wav", (buffer) => {
    gameState.engineSound.setBuffer(buffer);
    gameState.engineSound.setVolume(0.05);
    gameState.engineSound.f;
    gameState.engineSound.setRefDistance(1000);
    gameState.engineSound.setLoop(true); // Set the gameState.engineSound to loop
    // Delay the play until the gameState.engineSound is ready
  });
  gameState.audioLoader.load(
    "./sounds/829895__akkaittou__musiclooptension3.wav",
    (buffer) => {
      gameState.backgroundMusic.setBuffer(buffer);
      gameState.backgroundMusic.setVolume(0.15);
      gameState.backgroundMusic.f;
      gameState.backgroundMusic.setRefDistance(1000);
      gameState.backgroundMusic.setLoop(true);
      gameState.backgroundMusic.play();
    },
  );
  gameState.audioLoader.load(
    gameState.playerObject.currentWeapon?.shotSound,
    (buffer) => {
      gameState.shootBasicGun.setBuffer(buffer);
      gameState.shootBasicGun.setVolume(0.15);
      gameState.shootBasicGun.f;
      gameState.shootBasicGun.setRefDistance(1000);
      gameState.shootBasicGun.setLoop(false);
    },
  );
  gameState.audioLoader.load(
    gameState.playerObject.currentWeapon.reloadSound
      ? gameState.playerObject.currentWeapon.reloadSound
      : gameState.playerObject.weapon.reloadSound,
    (buffer) => {
      gameState.reloadSound.setBuffer(buffer);
      gameState.reloadSound.setVolume(0.15);
      gameState.reloadSound.f;
      gameState.reloadSound.setRefDistance(1000);
      gameState.reloadSound.setLoop(false);
    },
  );
  gameState.playerObject.playerCamera.add(gameState.backgroundMusic);
  gameState.playerObject.playerCamera.add(gameState.shootBasicGun);
  gameState.playerObject.playerCamera.add(gameState.reloadSound);

  gameState.initKeyHandlers();

  const spaceShipGroup = assembleBasicShip("automation ship");
  const spaceShipGroup2 = assembleBasicShip("automation ship");
  spaceShipGroup.add(spaceShipGroup2);
  spaceShipGroup2.position.y += 300;
  spaceShipGroup2.position.x += 300;
  spaceShipGroup2.position.z -= 300;

  const spaceShipGroup3 = assembleBasicShip("automation ship");
  spaceShipGroup.add(spaceShipGroup3);
  spaceShipGroup3.position.y += 125;
  spaceShipGroup3.position.z -= 300;
  const spaceShipGroup4 = assembleBasicShip("automation ship");
  spaceShipGroup.add(spaceShipGroup4);
  spaceShipGroup4.position.y -= 125;
  spaceShipGroup4.position.z -= 300;
  const spaceShipGroup5 = assembleBasicShip("automation ship");
  spaceShipGroup.add(spaceShipGroup5);
  spaceShipGroup5.position.y -= 300;
  spaceShipGroup5.position.x -= 300;
  spaceShipGroup5.position.z -= 300;
  spaceShipGroup.add(gameState.engineSound);

  const secondShip = assembleBasicShip("target ship", {
    x: 0,
    y: -950,
    z: -150,
  });
  secondShip.rotation.x = 100;
  const thirdShip = assembleBasicShip("target ship", {
    x: -150,
    y: -950,
    z: 100,
  });
  thirdShip.rotation.x = -100;
  thirdShip.rotation.y = 100;
  
  const fourthShip = assembleBasicShip("target ship", {
    x: 150,
    y: -950,
    z: 100,
  });
  fourthShip.rotation.x = -100;
  fourthShip.rotation.y = -100;

  gameState.addSelectableShip(secondShip);
  gameState.addSelectableShip(thirdShip);
  gameState.addSelectableShip(fourthShip);

  const stationGroup = initStation({
    x: gameState.playerObject.playerCamera.position.x,
    y: gameState.playerObject.playerCamera.position.y - 1250,
    z: gameState.playerObject.playerCamera.position.z,
  });

  const shipPosition = new THREE.Vector3(spaceShipGroup.position);
  const SHIP_TARGET = new THREE.Vector3(0, 0, 0);

  // const targetObject = new THREE.Object3D();
  const toggles = { spaceShipGroup };
  // const toggles = { spaceShipGroup, directionalLight };

  const gui = initGui(toggles);

  gui.addFolder("player Controls");

  let guiAdd = false;

  renderer.domElement.style.margin = "0";
  renderer.domElement.style.padding = "0";
  renderer.domElement.style.display = "block"; // Ensure no unwanted spaces

  if (gameState.playerObject.playerShip.group) {
    // gameState.playerObject.playerShip.group.add(gameState.engineSound);
  }

  scene.add(spaceShipGroup);
  scene.add(secondShip);
  scene.add(thirdShip);
  scene.add(fourthShip);
  // scene.add(targetObject);

  scene.add(stationGroup);
  // scene.add(directionalLight);

  const rotatingObjects = [];
  const boxWidth = 2;
  const boxHeight = 1;
  const boxDepth = 3;

  const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

  function generateMetalWallTexture(width = 512, height = 512) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Base fill (steel gray)
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, width, height);

    // Add brushed streaks
    for (let y = 0; y < height; y++) {
      const alpha = Math.random() * 0.2;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Add vertical panel divisions
    ctx.strokeStyle = "rgba(40,40,40,0.8)";
    ctx.lineWidth = 4;
    for (let x = width / 4; x < width; x += width / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
  }

  scene.background = mapBuilder.buildSkybox();
  const flatTerrain = await mapBuilder.buildFlatTerrain(
    500,
    3,
    500,
    generateMetalWallTexture(),
  );
  const wall = await mapBuilder.buildFlatTerrain(
    1000,
    1000,
    3,
    generateMetalWallTexture(),
    100,
    100,
  );
  const heightTerrain = await mapBuilder.buildGlobe(2000, 64, 64);

  function position(object, cords) {
    const { x, y, z } = cords;
    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
  }

  const practiceGeometry = new THREE.IcosahedronGeometry(5, 5);
  const practiceMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
  });

  practiceMaterial.uniforms.uTime = { value: 0 };
  practiceMaterial.uniforms.uRadius = { value: 0.5 };

  const practice = new THREE.Mesh(practiceGeometry, practiceMaterial);
  scene.add(practice);

  position(practice, { x: 0, y: -800, z: -6520 });
  position(flatTerrain.groundMesh, { x: 0, y: -1150, z: 0 });
  position(wall.groundMesh, { x: 0, y: -800, z: -300 });

  // @TODO:
  // position(gameState.playerObject.playerCamera, { x: 0, y: -80, z: 50 });

  const color = new THREE.Color(0xffffff);
  const intensity = 5;
  const lightConfig = {
    color,
    intensity,
  };

  const topDownShipDisplay = new Lighting(scene, lightConfig);
  const bottomLeftShipDisplay = new Lighting(scene, lightConfig);

  topDownShipDisplay.addBasicLight(
    new THREE.Vector3(
      secondShip.position.x,
      secondShip.position.y + 2000,
      secondShip.position.z,
    ),
  );
  topDownShipDisplay.target = secondShip;
  bottomLeftShipDisplay.addBasicLight(
    new THREE.Vector3(
      secondShip.position.x,
      secondShip.position.y - 800,
      secondShip.position.z + 200,
    ),
  );
  // bottomLeftShipDisplay.target = secondShip;
  // gameState.gameHasStarted = true; //enabling to remove hte need to create new game

  position(heightTerrain.terrainGroup, { x: 0, y: 80, z: -3000 });
  gui
    .add(heightTerrain.terrainGroup.position, "x", -100000, 100000, 15)
    // .name("earth x")
    .onChange((value) => {
      position(heightTerrain.terrainGroup, {
        x: value,
        y: heightTerrain.terrainGroup.position.y,
        z: heightTerrain.terrainGroup.position.z,
      });
    });

  scene.add(heightTerrain.terrainGroup);
  scene.add(flatTerrain.groundMesh);
  scene.add(wall.groundMesh);
  // scene.add(wall2.groundMesh);
  // scene.add(wall3.groundMesh);
  // scene.add(wall4.groundMesh);

  //===============================================================
  let currentAmmo = [];
  const missileCount = 6; // Number of missiles you want
  const missileObjects = []; // Array to store missile instances

  // Load the material (.mtl) file first
gameState.GLTFLoader.load("/models/helmet/flightHelmet.gltf", (file) => {
  console.log(file.scene);
  const {scene: head} = file
  head.scale.set(250, 250, 250); // double
  head.position.y = -900;
  head.position.x = 300;
  head.position.z = 50;

  scene.add(file.scene)
});

  gameState.MTLLoader.load(
    "./models/missile/AIM120D.mtl",
    function (materials) {
      materials.preload(); // Preload the materials (including textures)

      // Once the materials are loaded, load the .obj file with those materials
      // const objLoader = new OBJLoader();
      gameState.OBJLoader.setMaterials(materials); // Apply materials
      gameState.OBJLoader.load(
        "./models/missile/AIM120D.obj",
        function (object) {
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load("models/missile/texture.png.png"); // Use your texture path here
          object.traverse((child) => {
            if (child.isMesh) {
              child.material.map = texture; // Apply texture to all mesh materials
              child.material.needsUpdate = true;
            }
          });

          // Loop to create multiple missiles
          for (let i = 0; i < missileCount; i++) {
            const missileClone = object.clone(); // Clone the missile object

            // Optional: Adjust the scale and position of each missile
            missileClone.scale.set(0.75, 1, 0.5); // Adjust to your liking
            missileClone.position.set(-20 + i * 6, 0, 50); // Distribute missiles along X-axis for example
            missileClone.rotation.x = Math.PI;
            missileClone.rotation.y = 0;
            missileClone.rotation.z = 0;
            // Add the missile to the scene
            spaceShipGroup.add(missileClone);

            // Optional: Add the missile to other arrays or groups
            currentAmmo.push({ ...missileClone, empty: false });
            // Add an axis grid or any other visual aid
            // makeAxisGrid(missileClone, "missileMesh");

            // Push missile to missileObjects array to track them
            missileObjects.push(missileClone);
          }
        },
      );
    },
  );

  const axes = new THREE.AxesHelper(100);
  // spaceShipGroup.add(axes);

  let fireMissle = false;
  let projectiles = [];

  //automated movements of the ship
  const spaceShipGroupAutomation = [
    new THREE.Vector3(0.0, 0.0, 0.0), // start
    // sidestep approach (far on +X side so straight line won't intersect sphere)
    new THREE.Vector3(3450.0, 80.0, -3000.0),
    // orbit points (12 around the sphere at radius R = 2300; center = (0,80,-3000))
    new THREE.Vector3(2300.0, 80.0, -3000.0),
    new THREE.Vector3(1991.858, 80.0, -1850.0),
    new THREE.Vector3(1150.0, 80.0, -1008.142),
    new THREE.Vector3(0.0, 80.0, -700.0),
    new THREE.Vector3(-1150.0, 80.0, -1008.142),
    new THREE.Vector3(-1991.858, 80.0, -1850.0),
    new THREE.Vector3(-2300.0, 80.0, -3000.0),
    new THREE.Vector3(-1991.858, 80.0, -4150.0),
    new THREE.Vector3(-1150.0, 80.0, -4991.858),
    new THREE.Vector3(0.0, 80.0, -5300.0),
    new THREE.Vector3(1150.0, 80.0, -4991.858),
    new THREE.Vector3(1991.858, 80.0, -4150.0),
    // return to approach offset and then home
    new THREE.Vector3(3450.0, 80.0, -3000.0),
    new THREE.Vector3(0.0, 0.0, 0.0),
  ];
  const curve = AutomationUtils.createAutomationMovement(
    spaceShipGroupAutomation,
  );

  /*TODO: move this fond loaded stuff to some thing already initialized on the gamestate class */

  const interactTextConfig = {
    phrase: "Point at a ship and confirm selection",
    x: gameState.playerObject.playerCamera.position.x - 200,
    y: gameState.playerObject.playerCamera.position.y - 600,
    z: gameState.playerObject.playerCamera.position.z,
    size: 20.0,
    depth: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.3,
    bevelSegments: 5,
  };
  const destroyPlanetTextConfig = {
    phrase: "Destroy That Planet!",
    x: gameState.playerObject.playerCamera.position.x,
    y: gameState.playerObject.playerCamera.position.y,
    z: gameState.playerObject.playerCamera.position.z,
    size: 50.0,
    depth: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.3,
    bevelSegments: 5,
  };

  scene.add(await createTextForScene(interactTextConfig));
  scene.add(await createTextForScene(destroyPlanetTextConfig));

  let mouseX = 0; // Mouse position on X axis
  let mouseY = 0; // Mouse position on Y axis

  let lastTime = 0; // Time reference to calculate momentum buildup
  let center = false;

  const mouseDirection = new THREE.Vector3(mouseX, 0, mouseY).normalize(); // Normalize direction

  const clock = new THREE.Clock(); // Create a clock for consistent timing
  //==========================================================================================
  // Lights
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  // ambientLight.position.set(0, 120, 0);
  // scene.add(ambientLight);

  let time = 0;

  // CSS3DRenderer
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);

  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = 0;
  document.body.appendChild(cssRenderer.domElement);

  // Create iframe element
  const iframe = document.createElement("iframe");
  iframe.src = "https://loopernet.netlify.app/"; // ⚠️ Must allow embedding via iframe (no X-Frame-Options)
  // iframe.src = "example.html"; // ⚠️ Must allow embedding via iframe (no X-Frame-Options)
  iframe.style.width = "800px";
  iframe.style.height = "600px";
  iframe.style.border = "0px";
  iframe.style.pointerEvents = "none";
  cssRenderer.domElement.style.pointerEvents = "none";

  //tiglytag
  // Wrap in CSS3DObject
  const cssObject = new CSS3DObject(iframe);
  cssObject.position.set(0, 2000, -1500);
  cssObject.rotation.y = Math.PI; // Optional: rotate to face you

  // ================================================================
  // Optional: add a plane mesh behind iframe to look like a TV bezel
  const cssPlaneGeometry = new THREE.BoxGeometry(815, 615, 1);
  const bezelMaterial = new THREE.MeshBasicMaterial({
    color: "#000000",
    depthTest: true,
    depthWrite: true,
  });

  const iframeGroup = new THREE.Group();
  const tvFrame = new THREE.Mesh(cssPlaneGeometry, bezelMaterial);
  tvFrame.position.copy(cssObject.position);
  tvFrame.position.z -= 1; // Push back slightly behind iframe
  iframeGroup.add(tvFrame);
  iframeGroup.specialInteract = true;
  iframeGroup.specialInteract = true;

  scene.add(iframeGroup);

  function startInteraction() {
    if (gameState.looper) {
      gameState.looper = false;
      scene.remove(cssObject);
      return;
    }
    if (gameState.selectedObject.object.uuid === tvFrame.uuid) {
      const { playerCamera } = gameState.playerObject;
      gameState.controls.enabled = false;
      gameState.looper = true;
      scene.add(cssObject);
      // handle what object the interaction is on by the return of getInteracting.target
      // Camera follows the iframe position
      playerCamera.lookAt(tvFrame.position);
      cssObject.position.z -= 2; // optional small motion
      playerCamera.position.x = cssObject.position.x;
      playerCamera.position.y = cssObject.position.y;
      playerCamera.position.z = cssObject.position.z - 400;
    }

    //this stuff needs to be implemented on a basis of what the actual object is
    // set initial camera position for viewing
    gameState.playerObject.playerCamera.position
      .copy(cssObject.position)
      .add(new THREE.Vector3(0, 0, -400));
    gameState.playerObject.playerCamera.lookAt(cssObject.position);
  }

  function endInteraction() {
    if (!gameState.getInteract() && !gameState.getInteracting()) {
      // scene.remove(cssObject);
    }
  }
  function showInventory() {
    const inventoryDiv = document.getElementById("inventoryDiv");
    const inventory = document.getElementById("inventory");

    if (gameState.inventoryDisplay) {
      inventoryDiv.style.position = "fixed";
      inventory.style.position = "fixed";
      inventoryDiv.style.display = "block";
    } else {
      inventory.style.display = "none";
      inventoryDiv.style.display = "none";
    }
  }
  function showTip() {
    toolTip.innerHTML = `Being in Orbit is tricky! \n
    
    \n
    Its easier to get around in a ship.

    Use the mouse to point at a ship you want until it turns gold!
 \n
    To stabilize your vision press "h" on your keyboard,

    
    Then click here to hop in!`;
    if (!gameState.playerObject.playerShip.position) {
      toolTip.style.display = "block";
    } else {
      toolTip.style.display = "none";
    }
    toolTip.style.background = "red";
    toolTip.onclick = (event) => {
      if (gameState.selectAbleShips.length && gameState.selectedShip)
        gameState.confirmSelectedShip();
    };
  }
  function updateGameState() {
    if (gameState.getGameHasStarted()) {
      showTip();
    }
    if (gameState.inventoryDisplay) {
      showInventory();
    } else {
      showInventory();
    }
    //arguments to toggle menu are the element to show, and the case in which the menu would be shown
    toggleMenu(
      document.getElementById("mainMenu"),
      !gameState.getGameHasStarted(),
    );
    toggleMenu(pauseMenu, gameState.getIsPaused());
    toggleMenu(optionsMenu, gameState.getOptionsPage());
    //possible to add the interact toolTip here as a menu
    toggleMenu(
      document.getElementById("hudInteract"),
      gameState.getShowInteract(),
    );
  }
  //recalls the status of a property from game state
  //this is called for each menu and it checks for that prop of gamestate to be true
  function toggleMenu(menu, show) {
    if (show) gameState.displayMenu(menu);
    else gameState.hideMenu(menu);
  }

  /*
    Repositions the objects in the scene based off the newly calculated points along the spline curve*/
  function updateProgrammedCharacters(character, name) {
    if (name === "spaceShipGroup") {
      character.position.set(shipPosition.x, shipPosition.y, shipPosition.z);
      character.lookAt(SHIP_TARGET);
    }
  }

  //applying the meta data to objects to update them in the frame
  /*
    This function is responsible for incrementing through points on the established spline curve which dictates the movement of objects its applied to, recalculated every frame
    */
  function calculateMovementAutomation(curve, shipSpeed, shipPosition) {
    const shipMovementVector = curve.getPointAt(shipSpeed, shipPosition);
    const shipDirectionOrientationVector = curve.getPointAt(
      (shipSpeed + 0.01) % 1,
      SHIP_TARGET,
    );
  }

  function calculateShipSpeed(time) {
    // move spaceship
    time *= 0.001; // convert time to seconds
    //because this is in the animation loop, each iteration will find a new point within the spline curve to adjust direction and orientation
    //updating the meta data for posiont and orientation
    const shipTime = time * 0.003;
    //affects how many points are calculated along the vector curve to set the position and orientation
    const shipSpeed = shipTime % 1;
    return shipSpeed;
  }

  function updateInventoryUI() {
    // Walk rows and cols
    gameState.inventory.forEach((row, rowIndex) => {
      row.forEach((slot, colIndex) => {
        //
        const item = document.createElement("li");
        item.className = "slot";
        //
        let localSlot = localInventory[rowIndex][colIndex];
        if (slot !== localSlot.name.toLowerCase()) {
          if (typeof slot !== "object") {
            const id = slot.split(":")[1];

            localSlot = gameState.inventorySystem.getItem(Number(id));

            const inventory = document.getElementById("inventory").children;

            // flatten the row/col into a single index
            const index = rowIndex * gameState.inventory[0].length + colIndex;

            const li = inventory[index];

            if (li.libraryItem.category === "none") {
              li.libraryItem = localSlot;

              if (localSlot.src) {
                const img = document.createElement("img");
                img.src = localSlot.src;
                img.width = localSlot.size?.w ? localSlot.size.w * 64 : 128;
                img.height = localSlot.size?.h ? localSlot.size.h * 64 : 128;
                li.appendChild(img);
              }
            }
          }
        }
        if (slot.id) {
          const id = slot.split(":")[1];
          // Get the actual item definition from the library
          // const format = slot.
          const libraryItem =
            gameState.inventorySystem.getItem(slot.id) ||
            gameState.inventorySystem.getItem(0); // fallback
          localInventory[rowIndex][colIndex] = libraryItem;

          item.id = `${rowIndex}-${colIndex}`;
          item.libraryItem = libraryItem;

          // Render the image
          if (libraryItem.src) {
            const img = document.createElement("img");
            img.src = libraryItem.src;
            img.width = libraryItem.size?.w ? libraryItem.size.w * 64 : 128;
            img.height = libraryItem.size?.h ? libraryItem.size.h * 64 : 128;
            item.appendChild(img);
          }
        }

        // Add interaction
        item.onmouseover = (e) => {
          gameState.itemMouseOver(e);
        };

        // inventoryElement.appendChild(item);
      });
    });
  }

  function isCssObject() {
    return gameState?.selectedObject?.object.parent.specialInteract || false;
  }

  //=============================================================================================
  //=============================================================================================
  //=============================================================================================
  //=============================================================================================
  //=============================================================================================
  let lastCheck = 0;

  let lastYaw = 0;
  const tempEuler = new THREE.Euler();

  // scene.children.forEach((child) => {
  //   console.log(child);
  //   child.position.multiplyScalar(WORLD_SCALE);
  //   child.scale?.multiplyScalar(WORLD_SCALE);
  // });

  function animate(time) {
    if (!guiAdd && gameState.playerObject.playerShip.object) {
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.rotation,
          "y",
          -100,
          100,
          0.005,
        )
        .name("rotate y")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.rotation.y = value;
        });
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.rotation,
          "x",
          -10,
          10,
          0.01,
        )
        .name("rotate x")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.rotation.x = value;
        });
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.rotation,
          "z",
          -100,
          100,
          0.01,
        )
        .name("rotate z")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.rotation.z = value;
        });
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.position,
          "y",
          -100,
          100,
          1,
        )
        .name("position y")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.position.y = value;
        });
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.position,
          "x",
          -100,
          100,
          1,
        )
        .name("position x")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.position.x = value;
        });
      gui
        .add(
          gameState.playerObject.playerShip.object.parent.position,
          "z",
          -360,
          360,
          1,
        )
        .name("position z")
        .onChange((value) => {
          gameState.playerObject.playerShip.object.parent.position.z = value;
        });
      guiAdd = true;
    }
    if (gameState.playerObject.playerShip) {
    }
    // gameState.getGameHasStarted();
    gameState.controls.enabled = gameState.getControlsEnabled();
    heightTerrain.groundMesh.rotation.y += 0.0001;
    heightTerrain.groundMesh.rotation.x += 0.0001;
    //==================================== checking is paused, responing with pause menu

    practice.rotation.x += 0.01;
    updateGameState();
    // updateProjectiles();

    gameState.updateAmmoCountHud();
    if (gameState.playerObject.currentWeapon.reloading) {
      // if(!gameState.reloadSound.isPlaying){
        gameState.displayReload(true);
      // }
    } else {
      gameState.reloadSound.stop();
      gameState.displayReload(false);
    }
    if (time - lastCheck > 40) {
      console.log(gameState.playerObject.clipSize);
      gameState.updateShots(time);
      if (gameState.playerObject.playerShip.object) {
        tempEuler.setFromQuaternion(gameState.playerObject.playerCamera);
        const currentYaw = tempEuler.y;
        const yawDelta = currentYaw - lastYaw;

        if (Math.abs(yawDelta) > 0.01) {
          if (yawDelta > 0) {
            console.log("Mouse moved right");
            gameState.playerObject.playerShip.group.rotation.y -=
              Math.abs(yawDelta); // rotate object accordingly
          } else {
            console.log("Mouse moved left");
            gameState.playerObject.playerShip.group.rotation.y +=
              Math.abs(yawDelta);
          }
        }

        lastYaw = currentYaw;
      }
    }
    if (gameState.updatedInventory) {
      // localInventory = gameState.inventory;

      updateInventoryUI();
    }

    if (time - lastCheck > 100) {
      gameState.selectAbleShips.forEach((ship) =>
        gameState.setShipGlow(ship, false),
      );
      if (gameState?.selectedObject?.object?.uuid) {
        if (
          gameState?.selectedObject.object.uuid ===
          gameState?.selectedObject.object.uuid
        ) {
          gameState.setShipGlow(gameState?.selectedObject.object.parent, true);

          // gameState.addHalo(gameState.selectedObject.object)   this is highly non performant, creates 1000s of meshes
        }
      }
      if (gameState.playerObject?.playerShip?.group?.position) {
        gameState.playerObject.updateCharacterPos(gameState.selectedShip);

        gameState.selectAbleShips.forEach((ship) =>
          gameState.setShipGlow(ship.object.parent, false),
        );
        gameState.setShipGlow(gameState?.selectedShip.object.parent, false);
      }

      // every 200ms
      gameState.checkParticleInteractions(gameState.playerObject.playerCamera);
      lastCheck = time;
    }

    if (gameState.inventoryDisplay) {
      inventoryElement.style.display = "block";
      inventoryElement.style.position = "fixed";
    }
    requestAnimationFrame(animate);
    //Reorients the camera on a level plane of (0,0)
    if (gameState.center) {
      //call function on playerObject that is a center function
      gameState.playerObject.centerAim();
      camera.rotation.x = 0;
      camera.rotation.z = 0;
      //reset local center state
      // center = false;
    }

    const delta = clock.getDelta();
    for (let i = gameState.bloodSystems.length - 1; i >= 0; i--) {
      if (!gameState.bloodSystems[i].update(delta)) {
        gameState.bloodSystems.splice(i, 1); // remove finished systems
      }
    }

    // / in your animation loop
    // const delta = clock.getDelta();
    for (let i = gameState.globeSystems?.length - 1; i >= 0; i--) {
      if (!gameState.globeSystems[i].update(delta)) {
        gameState.globeSystems.splice(i, 1);
      }
    }

    //move speed is 2 plus the number applied from the boost on playObject
    const moveSpeed =
      gameState.playerObject.getCurrentSpeed() +
      (gameState.playerObject.getActiveBoost() &&
        gameState.playerObject.applyPlayerBoost().boostSpeed);

    const shipDirection = new THREE.Vector3();
    camera.getWorldDirection(shipDirection);

    const deltaTime = time - lastTime;
    lastTime = time;

    //trying to move this into the player class, having no luck on the boost working with the movement, this the function call from the class
    if (deltaTime >= 50) {
    }
    gameState.playerObject.operateMovement(deltaTime, time, mouseDirection);

    calculateMovementAutomation(curve, calculateShipSpeed(time), shipPosition);
    updateProgrammedCharacters(spaceShipGroup, "spaceShipGroup");

    // Calculate the direction vector from shipPosition to SHIP_TARGET
    const direction = new THREE.Vector3()
      .subVectors(SHIP_TARGET, shipPosition)
      .normalize();
    const newDirection = new THREE.Vector3()
      .subVectors(SHIP_TARGET, shipPosition)
      .normalize();
    if (!direction.equals(newDirection)) {
      targetQuaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        newDirection,
      );
      spaceShipGroup.quaternion.slerp(targetQuaternion, 0.1);
    }

    updateGradient();

    // Update the controls for smooth camera movement
    // gameState.controls.update(gameState.getLookSensitivity()); // Small delta time for smoother movement
    //check each cell in the 3d array of inventory for values different in the same cells as local inventory

    if (gameState.inventory && gameState.inventory.length > 0) {
      updateInventoryUI();
    }

    if (gameState.getInteracting() && !gameState.wasInteracting) {
      if (gameState?.selectedObject?.object?.parent?.specialInteract) {
        startInteraction();
      } else if (isCssObject()) {
        endInteraction();
      }
    }
    gameState.wasInteracting = gameState.getInteracting();

    if (gameState.looper) {
      gameState.controls.enabled = false;
    } else {
      gameState.controls.update(gameState.playerObject.getLookSensitivity());
    }

    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }

  // Initiate function or other initializations here
  requestAnimationFrame(animate);
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  document.getElementById("container").appendChild(warning);
}

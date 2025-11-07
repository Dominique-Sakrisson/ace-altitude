"use strict";import * as THREE from "three";
import "./style.css";

const shipLoader = new THREE.TextureLoader();
const boxWidth = 2;
const boxHeight = 1;
const boxDepth = 3;
const shipTexture = shipLoader.load("/shipTexture.jpg");
const flameTexture = shipLoader.load("/fire.png");
const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

const canvas2 = document.createElement("canvas");
const ctx = canvas2.getContext("2d");
canvas2.width = 256;
canvas2.height = 256;

// Create a gradient from orange to red to white
const gradient = ctx.createLinearGradient(0, 0, canvas2.width, canvas2.height);
gradient.addColorStop(0, "orange");
gradient.addColorStop(0.5, "red");
gradient.addColorStop(1, "white");

// Apply the gradient to the canvas
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas2.width, canvas2.height);

// Create a texture from the canvas
const gradientTexture = new THREE.CanvasTexture(canvas2);

const canvas3 = document.createElement("canvas");
const ctx2 = canvas3.getContext("2d");
canvas3.width = 256;
canvas3.height = 256;

// Create a gradient from orange to red to white
const gradient2 = ctx2.createLinearGradient(
  0,
  0,
  canvas3.width,
  canvas3.height,
);
gradient2.addColorStop(0, "green");
gradient2.addColorStop(0.5, "red");
gradient2.addColorStop(1, "black");

// Apply the gradient to the canvas
ctx2.fillStyle = gradient2;
ctx2.fillRect(0, 0, canvas3.width, canvas3.height);

// Create a texture from the canvas
const gradientTexture2 = new THREE.CanvasTexture(canvas3);

let gradientShift = 0.01; // Starting position for red line
let shiftSpeed = 0.0003; // Speed of movement
// Function to update the gradient with flipped colors
export function updateGradient() {
  ctx.clearRect(0, 0, canvas2.width, canvas2.height);

  const gradient = ctx.createLinearGradient(
    0,
    0,
    canvas2.width,
    canvas2.height,
  );

  // Ensure gradientShift stays within bounds [0, 1]
  gradientShift = Math.max(0.65, Math.min(gradientShift, 1));

  // Flip the colors (red goes to 0, orange to 1, and white to 0)
  gradient.addColorStop(0, "white"); // Flipped white
  gradient.addColorStop(1 - gradientShift, "red"); // Flipped red
  gradient.addColorStop(1, "orange"); // Flipped orange

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas2.width, canvas2.height);

  gradientTexture.needsUpdate = true;

  // Reverse direction when boundaries are hit
  gradientShift += shiftSpeed;
  if (gradientShift >= 1 || gradientShift <= 0.65) {
    shiftSpeed *= -1;
  }
}

export function assembleBasicShip(name, spawnPosition = { x: 0, y: 0, z: 0 }) {
  const {x,y,z} = spawnPosition;
  const spaceShipGroup = new THREE.Group();
  spaceShipGroup.name = name;
  spaceShipGroup.castShadow = true;
  spaceShipGroup.receiveShadow = true;

  // const ground = makeBoxInstance(boxGeometry, "#964B00", 0, 0);
  const engineChamber = new THREE.Mesh(boxGeometry, material);
  //   const engineChamber = makeBoxInstance(boxGeometry, 0x00000, 0, 0);
  const engineChamber2 = new THREE.Mesh(boxGeometry, material);

  const engineMount = new THREE.Mesh(boxGeometry, material);
  const cargoHold = new THREE.Mesh(boxGeometry, material);

  const radius = 3.5;

  const height = 8;

  const radialSegments = 8;

  const coneGeometry = new THREE.ConeGeometry(radius, height, radialSegments);
  const engineThrustMat = new THREE.MeshPhongMaterial({
    map: gradientTexture,
  });
  const engineThrustMat2 = new THREE.MeshPhongMaterial({
    map: flameTexture,
  });
  // const noseConeMat = new THREE.MeshPhongMaterial("#964B00");
  const engineThrust = new THREE.Mesh(coneGeometry, engineThrustMat2);
  // scene.add(engineThrust);
  const engineThrust2 = new THREE.Mesh(coneGeometry, engineThrustMat);
  //   scene.add(engineThrust2);

  engineChamber.scale.set(5, 10, 3);
  engineChamber.position.set(-10, 10, 0);
  engineThrust.scale.set(1.45, 1, 1.4);
  engineThrust.position.set(-10, 10.05, -8.5);
  engineThrust.rotation.x = -1.55;

  engineChamber2.scale.set(5, 10, 3);
  engineChamber2.position.set(10, 10, 0);
  engineThrust2.scale.set(1.45, 1, 1.4);
  engineThrust2.position.set(10, 10.05, -8.5);
  engineThrust2.rotation.x = -1.55;

  engineMount.scale.set(5, 2, 9);
  engineMount.position.set(0, 10, 10);

  cargoHold.scale.set(25, 20, 20);
  cargoHold.position.set(0, 20, 40);

  const cockpitRadius = 20.0;

  const detail = 1;

  const cockpitMat = new THREE.MeshPhongMaterial({ map: shipTexture });
  // const cockpitMat = new THREE.MeshPhongMaterial("#964B00");
  const cockpitGeometry = new THREE.DodecahedronGeometry(cockpitRadius, detail);
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMat);

  cockpit.position.y = 25;
  cockpit.position.x = 20;
  cockpit.position.z = 65;

  const cockpit2 = new THREE.Mesh(cockpitGeometry, cockpitMat);

  cockpit2.position.y = 25;
  cockpit2.position.x = -20;
  cockpit2.position.z = 65;

  const mergedMeshes = [
    cargoHold,
    engineMount,
    engineChamber,
    engineChamber2,
    engineThrust,
    engineThrust2,
    cockpit,
    cockpit2,
  ];

  // Add all meshes to the group
  mergedMeshes.forEach((mesh) => {
    spaceShipGroup.add(mesh);
    mesh.updateMatrix();
  });

  spaceShipGroup.position.set(x,y,z)
  return spaceShipGroup;
}

export function positionBasicShip() {}

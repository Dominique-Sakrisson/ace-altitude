"use strict";

import * as THREE from "three";
import {
    CSS2DRenderer,
    CSS2DObject,
  } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./style.css";
//create a blue LineBasicMaterial
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
export function starStuff() {
  const stars = [];
  const orionMaterial = new THREE.LineBasicMaterial({
    color: 0x00aaff, // Bright blue
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });

  // Ursa Major - Warm yellow with dashed lines
  const ursaMajorMaterial = new THREE.LineDashedMaterial({
    color: 0xffff00, // Yellow
    linewidth: 1,
    dashSize: 0.2,
    gapSize: 0.1,
  });

  // Cassiopeia - Soft purple with slight glow
  const cassiopeiaMaterial = new THREE.LineBasicMaterial({
    color: 0xaa00ff, // Purple
    linewidth: 2,
    transparent: true,
    opacity: 0.9,
  });

  // Lyra - Vibrant red with bold lines
  const lyraMaterial = new THREE.LineBasicMaterial({
    color: 0xff3300, // Red-orange
    linewidth: 3,
    transparent: true,
    opacity: 1,
  });

  // Bonus - Adding stars for extra effect using PointsMaterial
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // White stars
    size: 0.1,
    transparent: true,
    opacity: 1,
  });
  const points = [];
  points.push(new THREE.Vector3(2, 0, 0));
  points.push(new THREE.Vector3(0, 2, 0));
  points.push(new THREE.Vector3(-1, 0, 0));

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);

  const orionPoints = [];
  orionPoints.push(new THREE.Vector3(0, 1.5, 0));
  orionPoints.push(new THREE.Vector3(-1.2, 0.8, 0.5));
  orionPoints.push(new THREE.Vector3(1.2, 0.8, -0.5));
  orionPoints.push(new THREE.Vector3(-0.8, 0, -1.2));
  orionPoints.push(new THREE.Vector3(0.8, 0, 1.2));
  orionPoints.push(new THREE.Vector3(0, -1.5, 0));

  const orionGeometry = new THREE.BufferGeometry().setFromPoints(orionPoints);
  const orion = new THREE.Line(orionGeometry, orionMaterial);

  const ursaMajorPoints = [];
  ursaMajorPoints.push(new THREE.Vector3(1.5, 0, 0));
  ursaMajorPoints.push(new THREE.Vector3(1.0, 1.0, 0.2));
  ursaMajorPoints.push(new THREE.Vector3(0.5, 1.8, -0.5));
  ursaMajorPoints.push(new THREE.Vector3(-0.5, 2.0, 0));
  ursaMajorPoints.push(new THREE.Vector3(-1.2, 1.5, 0.3));
  ursaMajorPoints.push(new THREE.Vector3(-1.5, 0.5, -0.2));
  ursaMajorPoints.push(new THREE.Vector3(-2.0, 0, 0));
  const ursaMajorGeometry = new THREE.BufferGeometry().setFromPoints(
    ursaMajorPoints,
  );
  const ursaMajor = new THREE.Line(ursaMajorGeometry, ursaMajorMaterial);

  const cassiopeiaPoints = [];
  cassiopeiaPoints.push(new THREE.Vector3(0, 2, 0));
  cassiopeiaPoints.push(new THREE.Vector3(-1, 1.5, -0.5));
  cassiopeiaPoints.push(new THREE.Vector3(0.5, 1, 0.5));
  cassiopeiaPoints.push(new THREE.Vector3(-0.8, 0.5, -1));
  cassiopeiaPoints.push(new THREE.Vector3(1.2, 0, 0));
  const cassiopeiaGeometry = new THREE.BufferGeometry().setFromPoints(
    cassiopeiaPoints,
  );

  const cassiopeia = new THREE.Line(cassiopeiaGeometry, cassiopeiaMaterial);
  // const cassiopeia = createObjWrapper(
  //   { cassiopeiaGeometry, cassiopeiaMaterial },
  //   { name: "cassiopeia" },
  // );
  // cassiopeia.position.y = Math.random(-50, 50);
  // cassiopeia.position.x = Math.random(-50, 50);
  labelMesh(cassiopeia);
  cassiopeia.position.y = Math.random(-500, 500);
  cassiopeia.position.x = Math.random(-500, 500);

  const lyraPoints = [];
  lyraPoints.push(new THREE.Vector3(0, 1, 0));
  lyraPoints.push(new THREE.Vector3(-0.5, 0.5, 0.5));
  lyraPoints.push(new THREE.Vector3(0.5, 0.5, -0.5));
  lyraPoints.push(new THREE.Vector3(0, 0, 1));
  lyraPoints.push(new THREE.Vector3(0, -1, 0));
  const lyraGeometry = new THREE.BufferGeometry().setFromPoints(lyraPoints);
  const lyra = new THREE.Line(lyraGeometry, lyraMaterial);
  lyra.position.y = Math.random(-500, 500);
  lyra.position.x = Math.random(-50, 50);


  cassiopeia.name = "Cassiopeia";
  line.name = "line";
  orion.name = "orion";
  ursaMajor.name = "ursa";
  lyra.name = "lyra";
  stars.push(line, orion, ursaMajor, cassiopeia, lyra);
  return stars;
}

export function labelMesh(meshObj) {
  // Create a 2D label using HTML
  const labelDiv = document.createElement("div");
  labelDiv.textContent = meshObj?.name;
  labelDiv.style.color = "white";
  labelDiv.style.fontSize = "20px";
  // Attach the label to the cube using CSS2DObject
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, 1, 0); // Position slightly above the cube

  meshObj.add(label);
}

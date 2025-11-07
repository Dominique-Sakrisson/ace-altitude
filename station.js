"use strict";import * as THREE from "three";

export function stationMaterialGen() {}

function generateLighting() {
  const lights = [];
  const color = 0xffffff;
  const intensity = 1;
  const directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(0, 100, 50).normalize();
  lights.push(directionalLight);
  return lights;
}
function generateCones() {
  const radius = 6;

  const height = 8;

  const radialSegments = 16;

  const cones = [];

  const texture = new THREE.TextureLoader().load("sand.jpg");

  const coneGeo = new THREE.ConeGeometry(radius, height, radialSegments).scale(
    50,
    50,
    50,
  );
  // const coneGeo2 = new THREE.ConeGeometry( radius, height, radialSegments ).scale(50,50,50);
  // Duplicate the geometry

  const coneGeo2 = coneGeo.clone();
  const materialSide = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
  const materialBottom = new THREE.MeshStandardMaterial({ map: texture });

  // Add a group for multi-material support
  coneGeo.groups = [];
  coneGeo2.groups = [];

  // Assign groups for the sides and bottom
  const numVertices = coneGeo.attributes.position.count;
  const index = coneGeo.index.array;

  // Identify bottom faces by normal
  for (let i = 0; i < index.length; i += 3) {
    const faceNormals = [index[i], index[i + 1], index[i + 2]].map((idx) => {
      return coneGeo.attributes.normal.array.slice(idx * 3, idx * 3 + 3);
    });

    // Bottom normals point straight down in Y
    if (faceNormals.every(([nx, ny, nz]) => ny === -1)) {
      coneGeo.addGroup(i, 3, 1); // Bottom group (uses material 1)
    } else {
      coneGeo.addGroup(i, 3, 0); // Side group (uses material 0)
    }
  }

  // Meshes with multiple materials
  const cone = new THREE.Mesh(coneGeo, [materialSide, materialBottom]);
  const cone2 = new THREE.Mesh(coneGeo2, [materialSide, materialBottom]);

  //   const cone = new THREE.Mesh(coneGeo, material);
  //   const cone2 = new THREE.Mesh(coneGeo2, material);
  cones.push(cone, cone2);

  if (cones[0].position) {
    cones[0].position.set(-1400, -600, -1500);
    cones[0].rotateZ(110);
  }

  if (cones[1].position) {
    cones[1].position.set(-1200, -575, -1500);
    cones[1].rotateZ(110);
  }

  return cones;
}
export function stationGeometryGen() {
  const stationObjects = [];
  generateCones().forEach((cone) => stationObjects.push(cone));

  return stationObjects;
}

export function stationMeshGen() {}

export function initStation(position) {
  const {x,y,z} = position;
  const group = new THREE.Group();
  const station = stationGeometryGen();
  //   const lights = generateLighting();
  station.forEach((obj) => group.add(obj));
  //   lights.forEach((obj) => group.add(obj));
group.position.set(x,y,z)
  return group;
}

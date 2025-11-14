import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

import { FontLoader } from "three/addons/loaders/FontLoader.js";

export function addObject(x, y, obj) {
  obj.position.x = sceneData.x * spread;
  obj.position.y = sceneData.y * spread;

  sceneData.scene.add(obj);
  objects.push(obj);
}

// Generate initial terrain for planetary objects
// Applies Perlin noise for lumpy terrain (INCREASED DISPLACEMENT)
export function generateTerrain(vertices, noise, sphere) {
  for (let i = 0; i < vertices.length; i += 3) {
    const v = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
    const noiseValue = noise.noise(v.x * 0.5, v.y * 0.5, v.z * 0.5);
    const displacement = noiseValue * 0.5; // Increased displacement
    v.normalize().multiplyScalar(2 + displacement);
    vertices[i] = v.x;
    vertices[i + 1] = v.y;
    vertices[i + 2] = v.z;
  }
  sphere.geometry.attributes.position.needsUpdate = true;
  sphere.geometry.computeVertexNormals(); // Ensure shading updates
}

// alters an objects vertices in an ballooning fashion
export function morphObject(time, vertices, noise, sphere) {
  time += 0.02;
  for (let i = 0; i < vertices.length; i += 3) {
    const v = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
    const noiseValue = noise.noise(
      v.x * 0.2 + time,
      v.y * 0.2 + time,
      v.z * 0.2 + time,
    );
    const displacement = noiseValue * 0.3; // Increased wavy effect
    v.normalize().multiplyScalar(2 + displacement);
    vertices[i] = v.x;
    vertices[i + 1] = v.y;
    vertices[i + 2] = v.z;
  }
  sphere.geometry.attributes.position.needsUpdate = true;
  sphere.geometry.computeVertexNormals();
}

/**
 * Responds to player click to create a bullet fired from weapon
 *
 * @param {object} camera - The technical player position
 * @param {object} scene - Current scene state
 * @param {array} shots - keeps track of the fired bullets
 *
 * @example
 * createBullet(camera, scene, shots)
 */
export function createBullet(camera, scene, shots, pos) {
  const length =5,
    width =5,
    depth =5;
  const textureLoader = new THREE.TextureLoader();

  const bullet = new THREE.SphereGeometry(length, width, depth);
  const flameTexture = textureLoader.load("./fire.png"); // Replace with your own texture link
  const flameMaterial = new THREE.ShaderMaterial({
    uniforms: {
      flameTexture: { value: flameTexture },
      time: { value: 0.0 },
      // rotationSpeed: { value: Math.random() * 0.05 }, // Random rotation speed for each bullet
    },
    vertexShader: `
          varying vec2 vUv;
          uniform float time;
          void main() {
              vUv = uv;
              vec3 pos = position;
              pos.z += sin(time + pos.x * 1.0) * 0.1;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.50);
          }
      `,
    fragmentShader: `
          uniform sampler2D flameTexture;
          varying vec2 vUv;
          void main() {
              vec4 texColor = texture2D(flameTexture, vUv);
              if (texColor.a < 0.1) discard; // Transparency
              gl_FragColor = texColor;
          }
      `,
    transparent: true,
  });

  // Create the shader material
  const muzzleFlashMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffffaa) }, // warm yellow-white
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv * 2.0 - 1.0; // Center UVs around 0
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      float r = length(vUv);
      float wave = sin(15.0 * r - uTime * 10.0) / (r * 20.0 + 0.1);
      float alpha = wave * smoothstep(0.6, 0.0, r); // fade at edges
      alpha *= smoothstep(0.25, 0.0, uTime); // fade over time
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // const flames = new THREE.SphereGeometry(length + 5, width + 5, depth + 5);
  const mesh = new THREE.Mesh(bullet, createMaterial());
  const flameMesh = new THREE.Mesh(bullet, flameMaterial);
  const projectileGroup = new THREE.Group();
  const worldPos = new THREE.Vector3();
  const worldDirection = new THREE.Vector3();
  camera.updateMatrixWorld(true);
  let bulletPosition;
  if (!pos.activeGroup) {
    camera.getWorldPosition(worldPos);
    camera.getWorldDirection(worldDirection); // Get the camera's forward vector for this frame
  } else {
    const groupCam = pos.activeGroup.children[0];
    bulletPosition = groupCam.getWorldPosition(worldDirection);
  }
  const distance = 20; // Distance from the camera for bullet spawn based on camera position in this frame
  if (!bulletPosition) {
    bulletPosition = camera
      ?.getWorldPosition(worldPos)
      .clone()
      .addScaledVector(worldDirection, distance);
  }

  const { x, y, z } = bulletPosition;
  console.log({ bulletPosition });

  projectileGroup.userData.direction = camera
    .getWorldDirection(worldDirection)
    .clone();
  projectileGroup.add(mesh);
  projectileGroup.add(flameMesh);
  if (pos.group) {
    projectileGroup.position.x = x;
    projectileGroup.position.y = y - 50;
    projectileGroup.position.z = z -250;
  } else {
    projectileGroup.position.x = x;
    projectileGroup.position.y = y;
    projectileGroup.position.z = z;
  }
  // pos.activeGroup.add(projectileGroup)
  spawnMuzzleFlash(bulletPosition, muzzleFlashMaterial, camera, scene);
  shots.push(projectileGroup);
  scene.add(projectileGroup);

  window.setTimeout(() => {
    scene.remove(projectileGroup);
  }, 3000);
  return projectileGroup;
}

export function createBulletFromData(scene, shots, pos) {
  const length = 5,
    width = 5,
    depth = 5;
  const textureLoader = new THREE.TextureLoader();

  const bullet = new THREE.SphereGeometry(length, width, depth);
  const flameTexture = textureLoader.load("./fire.png"); // Replace with your own texture link
  const flameMaterial = new THREE.ShaderMaterial({
    uniforms: {
      flameTexture: { value: flameTexture },
      time: { value: 0.0 },
      // rotationSpeed: { value: Math.random() * 0.05 }, // Random rotation speed for each bullet
    },
    vertexShader: `
          varying vec2 vUv;
          uniform float time;
          void main() {
              vUv = uv;
              vec3 pos = position;
              pos.z += sin(time + pos.x * 1.0) * 0.1;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.50);
          }
      `,
    fragmentShader: `
          uniform sampler2D flameTexture;
          varying vec2 vUv;
          void main() {
              vec4 texColor = texture2D(flameTexture, vUv);
              if (texColor.a < 0.1) discard; // Transparency
              gl_FragColor = texColor;
          }
      `,
    transparent: true,
  });

  // Create the shader material
  const muzzleFlashMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffffaa) }, // warm yellow-white
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv * 2.0 - 1.0; // Center UVs around 0
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      float r = length(vUv);
      float wave = sin(15.0 * r - uTime * 10.0) / (r * 20.0 + 0.1);
      float alpha = wave * smoothstep(0.6, 0.0, r); // fade at edges
      alpha *= smoothstep(0.25, 0.0, uTime); // fade over time
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // const flames = new THREE.SphereGeometry(length + 5, width + 5, depth + 5);
  const mesh = new THREE.Mesh(bullet, createMaterial());
  const flameMesh = new THREE.Mesh(bullet, flameMaterial);

  const projectileGroup = new THREE.Group();

  // Ensure cameraPos and cameraDir are THREE.Vector3
  const spawnPos = pos.cameraPos.clone();
  const dir = pos.cameraDir.clone().normalize();

  // Small offset so bullet spawns in front
  spawnPos.add(dir.clone().multiplyScalar(2));

  projectileGroup.position.copy(spawnPos);
  projectileGroup.userData.direction = dir.clone();

  projectileGroup.add(mesh);
  projectileGroup.add(flameMesh);

  // pos.activeGroup.add(projectileGroup)
  spawnMuzzleFlashFromData(spawnPos, muzzleFlashMaterial, scene);
  shots.push(projectileGroup);
  scene.add(projectileGroup);

  window.setTimeout(() => {
    scene.remove(projectileGroup);
  }, 3000);
  return projectileGroup;
}

//make this take in the string to add, and config for the geometry
//ideally make the values connected to the gui
//give the geometry and onclick for the editor moode to resize etc
export async function createTextForScene(config) {
  const font = await loadFont(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
  );
  const fontConfig = { ...config, font: font };

  const geometry = new TextGeometry(config.phrase, fontConfig);

  const mesh = new THREE.Mesh(geometry, createMaterial());
  mesh.position.set(config.x, config.y, config.z);
  return mesh;
}

// promisify font loading
function loadFont(url) {
  return new Promise((resolve, reject) => {
    const fontLoader = new FontLoader();
    fontLoader.load(url, resolve, undefined, reject);
  });
}

export function createMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    transparent: true, // Enable transparency
    opacity: 0.5, // Adjust opacity level (0 = fully transparent, 1 = fully opaque)
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = 0.5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}

function spawnMuzzleFlash(position, muzzleFlashMaterial, camera, scene) {
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const flash = new THREE.Mesh(geometry, muzzleFlashMaterial);
  flash.position.copy(position);
  flash.lookAt(camera.position); // face camera
  flash.renderOrder = 999;

  scene.add(flash);

  let startTime = performance.now();

  function update() {
    const elapsed = (performance.now() - startTime) / 1000;
    flash.material.uniforms.uTime.value = elapsed;

    if (elapsed < 0.25) {
      requestAnimationFrame(update);
    } else {
      scene.remove(flash);
      flash.geometry.dispose();
      flash.material.dispose();
    }
  }

  update();
}
function spawnMuzzleFlashFromData(position, muzzleFlashMaterial, scene) {
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const flash = new THREE.Mesh(geometry, muzzleFlashMaterial);
  flash.position.copy(position);
  // flash.lookAt(camera.position); // face camera
  flash.renderOrder = 999;

  scene.add(flash);

  let startTime = performance.now();

  function update() {
    const elapsed = (performance.now() - startTime) / 1000;
    flash.material.uniforms.uTime.value = elapsed;

    if (elapsed < 0.25) {
      requestAnimationFrame(update);
    } else {
      scene.remove(flash);
      flash.geometry.dispose();
      flash.material.dispose();
    }
  }

  update();
}

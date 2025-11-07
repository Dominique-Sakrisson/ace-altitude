import * as THREE from "three";
export function canvasSetup() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return { canvas, renderer };
}

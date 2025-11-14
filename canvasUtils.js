import * as THREE from "three";
export function canvasSetup() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
    
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);
  return { canvas, renderer };
}

export function addObject(x, y, z, obj) {
    obj.position.x = x;
    obj.position.y = y;
    obj.position.z = z;

    scene.add(obj);
    objects.push(obj);
  }

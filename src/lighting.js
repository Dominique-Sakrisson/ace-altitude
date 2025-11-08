import * as THREE from "three";export class Lighting {
  constructor(scene, config) {
    this.scene = scene;
    this.light = new THREE.DirectionalLight(config.color, config.intensity)
  }
  addBasicLight(pos) {
    /* My basic light is directional, white light  */
    // const color = new THREE.Color(0xffffff);
    // const intensity = 3;
    this.light.wireframe = true;
   
    // const light = new THREE.DirectionalLight(color, intensity);
    this.light.position.x = pos.x;
    this.light.position.y = pos.y;
    this.light.position.z = pos.z;
   
    // console.log(light);
    this.scene.add(this.light);
  }
}

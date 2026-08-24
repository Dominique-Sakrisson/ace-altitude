import * as THREE from "three";export class CharacterCamera {
  constructor() {
    this.fov = 90;
    this.aspect = window.innerWidth / window.innerHeight;
    this.near = 1;
    this.far = 10000;
    this.playerCamera = this.setPlayerCamera();
  }
  setRaycaster(camera) {
    camera.raycaster = new THREE.Raycaster();
    
    return camera;
  }
  setCameraSpawnPosition(camera) {
    camera.position.x = 0;
    camera.position.y = -850;
    camera.position.z = 500;
    return camera;
  }
  setPlayerCamera() {
    const camera = new THREE.PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far,
    );
    this.setCameraSpawnPosition(camera);
    return this.setRaycaster(camera);
    
    
  }
  getPlayerCamera() {
    if (!this.playerCamera) throw Error("no camera oh no");

    const checkCamera = this.verifyCamera(this.playerCamera);
    if(checkCamera){
        return this.playerCamera;

    }
  }
  verifyCamera() {
    if (!this.playerCamera.raycaster) {
      throw new Error("error building proper camera");
    } else {
      return true;
    }
  }
}

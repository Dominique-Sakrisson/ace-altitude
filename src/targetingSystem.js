import * as THREE from "three";
export class TargetingSystem {
  constructor(camera, objects) {
    this.camera = camera;
    this.raycaster = this.camera.raycaster;
    this.aimPoint = new THREE.Vector2(0, 0);
    this.targets = objects;
    this.intersects = this.syncAim();
    this.target = this.intersects[0];
  }

  /*sets the current target based off the raycaster */
  getCurrentTarget(currentTarget) {
    console.log({currentTarget});
    if (this.intersects.length) {
      if (this.intersects[0] === currentTarget) return;
      const target = this.intersects[0];
      console.log({ target });
      const baryCoords = target.barycoord;
      const targetGeometry = target.object.geometry;
      return { target, baryCoords, targetGeometry };
    } else {
      return false;
    }
  }
  /*gathers current camera positions and objects within range of the weapon.attackRange,  */
  syncAim() {
    this.camera.updateMatrixWorld();
    if (this.targets.length) {
      this.raycaster.setFromCamera(this.aimPoint, this.camera);
      return this.raycaster.intersectObjects(this.targets, true);
    }
  }
  /*gathers the verticies of the location the raycaster intersect happens in a local "to the object"  position */
  getTriangleOfHit(geometry) {
    let a, b, c;
    if (geometry.index) {
      // Indexed geometry
      const i = geometry.index.array;
      a = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        i[this.target.faceIndex * 3 + 0],
      );
      b = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        i[this.target.faceIndex * 3 + 1],
      );
      c = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        i[this.target.faceIndex * 3 + 2],
      );
    } else {
      // Non-indexed geometry
      a = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        this.target.faceIndex * 3 + 0,
      );
      b = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        this.target.faceIndex * 3 + 1,
      );
      c = new THREE.Vector3().fromBufferAttribute(
        geometry.attributes.position,
        this.target.faceIndex * 3 + 2,
      );
    }
    return { a, b, c };
  }
  determineHitMarker(geometry, baryCoords) {
    const { a, b, c } = this.getTriangleOfHit(geometry);
    return new THREE.Vector3()
      .addScaledVector(a, baryCoords.x)
      .addScaledVector(b, baryCoords.y)
      .addScaledVector(c, baryCoords.z);
  }
}

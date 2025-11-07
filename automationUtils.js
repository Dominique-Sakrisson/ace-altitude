import * as THREE from "three";
export class AutomationUtils {
  constructor(levelTile) {}

  static createAutomationMovement(vectors) {
    if (!vectors.length) return;
    return new THREE.CatmullRomCurve3(vectors);
  }
  static calculateMovementAutomation(curve, shipSpeed, shipPosition, shipTarget) {
      const shipMovementVector = curve.getPointAt(shipSpeed, shipPosition);
      const shipDirectionOrientationVector = curve.getPointAt(
        (shipSpeed + 0.01) % 1,
        shipTarget,
      );
    }
    static updateProgrammedCharacters(spaceShipGroup, shipPosition, shipTarget) {
      spaceShipGroup.position.set(
        shipPosition.x,
        shipPosition.y,
        shipPosition.z,
      );
      spaceShipGroup.lookAt(shipTarget);
    }
}

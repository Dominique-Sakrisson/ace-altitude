export class Boost {  
  activeBoost;
  boostSpeed;
  boostDuration;
  boostRestore;

  constructor({ activeBoost, boostSpeed, boostDuration, boostRestore }) {
    validate({ activeBoost, boostSpeed, boostDuration, boostRestore });
    this.activeBoost = activeBoost;
    this.boostSpeed = boostSpeed;
    this.boostDuration = boostDuration;
    this.boostRestore = boostRestore;

    function validate({
      activeBoost,
      boostSpeed,
      boostDuration,
      boostRestore,
    }) {
      if (typeof activeBoost !== "boolean") {
        throw new Error("activeBoost must be a boolean");
      }
      if (typeof boostSpeed !== "number") {
        throw new Error("boostSpeed must be an number");
      }
      if (typeof boostDuration !== "number") {
        throw new Error("boostDuration must be an number");
      }
      if (typeof boostRestore !== "number") {
        throw new Error("boostRestore must be an number");
      }
    }
  }
}

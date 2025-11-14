export class Validator {
  constructor() {}
  mouseMoveEvent(moveEvent) {
    if (
      typeof moveEvent.clientX !== "number" ||
      typeof moveEvent.clientY !== "number"
    ) {
      return false;
    } else {
      return true;
    }
  }

  clickEvent(clickEvent) {
    if (
      typeof clickEvent.pointerType !== "mouse" ||
      typeof clickEvent.clientX !== "number" ||
      typeof clickEvent.clientX !== "number"
    ) {
      return false;
    } else {
      return true;
    }
  }
  eventTimeStamp(time) {
    if (typeof time !== "number") {
      return false;
    }
    return true;
  }
}

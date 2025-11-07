import * as dat from "lil-gui";
export function initGui({spaceShipGroup, directionalLight: light}) {
  const gui = new dat.GUI();

  const spaceShipPositionGUIHelper = {
    x: spaceShipGroup.position.x,
    y: spaceShipGroup.position.y,
    z: spaceShipGroup.position.z,
  };

  gui
    .add(spaceShipPositionGUIHelper, "x", 0, 20, 0.5)
    .name("light intensity")
    .onChange((value) => {
      light.intensity = value;
    });

  gui
    .add(spaceShipPositionGUIHelper, "x", -100, 100, 0.1)
    .name("Ship X")
    .onChange((value) => {
      spaceShipGroup.position.x = value;
      // updateCameraPosition();
    });

  gui
    .add(spaceShipPositionGUIHelper, "y", -100, 100, 0.1)
    .name("Ship Y")
    .onChange((value) => {
      spaceShipGroup.position.y = value;
      // updateCameraPosition();
    });

  gui
    .add(spaceShipPositionGUIHelper, "z", -100, 100, 0.1)
    .name("Ship Z")
    .onChange((value) => {
      spaceShipGroup.position.z = value;
      // updateCameraPosition();
    });
  gui
    .add(spaceShipPositionGUIHelper, "z", -100, 100, 0.1)
    .name("Ship Z")
    .onChange((value) => {
      spaceShipGroup.position.z = value;
      // updateCameraPosition();
    });

  return gui;
}

function makeAxisGrid(node, label, units) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, "visible").name(label);
}

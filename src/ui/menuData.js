import { MenuActions } from "./menuActions";
export default {
  main: {
    title: "Main Menu",
    nodes: [
      {
        element: "div",
        id: "mainMenuOptionsContainer",
        parent: "mainMenu",
      },
      {
        element: "p",
        textContent: "New Game",
        parent: "mainMenuOptionsContainer",
        onClick: MenuActions.startGame,
      },
      {
        element: "p",
        textContent: "Load Game",
        parent: "mainMenuOptionsContainer",
      },
    ],
  },
  pause: {
    title: "Taking a Break",
    nodes: [
      {
        element: "p",
        textContent: "Resume",
        parent: "pauseMenu",
        onClick: MenuActions.resumeGame,
      },
      {
        element: "p",
        textContent: "Options",
        parent: "pauseMenu",
        onClick: MenuActions.showOptions,
      },
      { element: "p", textContent: "Quit", parent: "pauseMenu" },
    ],
  },
  options: {
    title: "Reconfigure Options",
    nodes: [
      { element: "p", textContent: "Back", parent: "pauseMenu" },
      {
        element: "div",
        textContent: "",
        parent: "optionsMenu",
        id: "controlsParent",
      },
      {
        element: "label",
        textContent: "Move Forward",
        parent: "controlsParent",
        // value: "w",
        id: "moveForwardLabel",
      },

      {
        element: "input",
        id: "moveForwardInput",
        parent: "moveForwardLabel",
        type: "text",
        value: "w",
        placeholder: "w",
        maxLength: 1,
      },
      {
        element: "p",
        id: "confirmButton",
        textContent: "Confirm Update",
        parent: "controlsParent",
        onClick: MenuActions.resumeGame,
      },
    ],
  },
  //for the controls of the hud telling us which key to press, this needs to be retrieved from the actual settings in the game state to dynamically update when users set new controls.
  hud: {
    title: "toggle X",
    nodes: [
      {
        element: "div",
        id: "reticle",
        textContent: ".",
        parent: "hud",
        className: "reticle",
      },
      {
        element: "div",
        id: "hudForward",
        textContent: "Forward: W",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudReverse",
        textContent: "Reverse: S",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudRotateR",
        textContent: "Rotate Right: E",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudRotateL",
        textContent: "Rotate Left: Q",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudBoost",
        textContent: "Boost: Left Shift",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudInteract",
        textContent: "Interact: V",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudLock",
        textContent: "Lock In Place: H",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudDist",
        textContent: "Distance: ",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudAmmo",
        textContent: "",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "div",
        id: "hudAmmoRound",
        textContent: "",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "img",
        id: "hudAmmoImg",
        textContent: "",
        src: "/ammo-icon-8.jpg",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "img",
        id: "hudUnarmed",
        textContent: "",
        src: "/fist.png",
        parent: "hud",
        className: "hudControls",
      },
      {
        element: "img",
        id: "hudUnarmed",
        textContent: "",
        src: "/public/fist.png",
        parent: "hud",
        className: "hudControls",
      },
    ],
  },
  // toolTip: {
  //   title: "",
  //   nodes: [
  //     {
  //       element: "div",
  //       textContent: "Confirm Selection",
  //       parent: "pauseMenu",
  //       onClick: MenuActions.makeSelection,
  //     },
  //   ],
  // },
};

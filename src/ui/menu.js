import { GameState } from "../../gameState";
import { MenuActions } from "./menuActions";
export class Menu {
  title;
  nodes; //  [{element, id, class, textContent, parent, onClick}, {element, textContent, parent, onClick}]
  gameState;
  constructor({ title, nodes, gameState }) {
    validateNode({ title, nodes });
    this.title = title;
    this.nodes = nodes;
    this.gameState = gameState;
    function validateNode({ title, nodes }) {
      if (typeof title !== "string") {
        throw new Error("title must be a string");
      }
      if (!Array.isArray(nodes)) {
        throw new Error("nodes must be an array");
      }
    }
  }
  /*Each node has a reference to a parent node. This parent node is populated in raw html in the index.html file. */
  buildMenu() {
    const title = document.createElement("p");
    title.textContent = this.title;

    const menuOptions = this.nodes.map((node) => {
      const element = document.createElement(node.element);

      element.id = node?.id;
      element.type = node?.type;
      element.className = node?.className;
      if (!element.className) {
        element.className = "";
      }
      element.textContent = node?.textContent;
      element.placeholder = node?.placeholder;
      element.value = node?.value;
      element.maxLength = node?.maxLength;
      element.style.whiteSpace = "pre-wrap";

      if (node.parent !== "hud") {
        element.style.fontSize = "1.5rem";
        element.style.padding = "10px 20px";
        element.style.background = "grey";
        element.style.color = "white";
        element.style.border = "2px solid white";
        element.style.borderRadius = "5px";
        element.style.textAlign = "center";
        element.style.cursor = "pointer";
        element.style.width = "40%";
        element.style.margin = "10px auto"; // Center the element horizontally
        element.style.transition = "background 0.3s ease, transform 0.2s ease"; // Smooth transition
        // }
      }
      if (node.parent === "hud") {
        element.style.pointerEvents = "none";
        element.style.userSelect = "none";
      }
      if (node.element === "input") {
        element.style.cursor = "text";

        element.addEventListener("input", (event) => {
          if (this.gameState?.controls) {
            this.gameState.controls.enabled = false; // disable three.js controls
            if (this.isASCII(event?.key)) {
              const confirmButton = document.getElementById("confirmButton");
              confirmButton.classList.remove("undefined");
              confirmButton.classList.add("updates");
            }
          }
        });
        element.addEventListener("focus", () => {
          if (this.gameState?.controls) {
            this.gameState.controls.enabled = false; // disable three.js controls
          }
        });

        element.addEventListener("blur", () => {
          if (this.gameState?.controls) {
            this.gameState.controls.enabled = true; // re-enable after typing
          }
        });
      }
      if (node.element === "label" && node.id && node.textContent) {
        element.htmlFor = "moveForwardInput";
      }
      element.onmouseenter = () => {
        if (node.parent !== "pauseMenu" || node.parent !== "controlsParent") {
          // element.style.background = "#444"; // Darker grey on hover
          element.style.transform = "scale(1.05)"; // Slightly enlarge on hover
        }
      };

      element.onmouseleave = () => {
        if (node.parent !== "pauseMenu" || node.parent !== "controlsParent") {
          element.style.transform = "scale(1)"; // Reset
        }
      };
      if (node.onclick) {
        element.onclick = node.onclick;
      }
      if (node.onClick) {
        const { isPaused, gameHasStarted, newGame } = this.gameState;
        element.addEventListener("click", () => {
          node.onClick(this.gameState);
        }); //options governing the state of managing active paused or not started games
      }
      document.getElementById(node.parent).appendChild(element);
    });

    return menuOptions;
  }
}

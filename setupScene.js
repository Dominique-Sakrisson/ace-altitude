"use strict";
import * as THREE from "three";
let mainMenu;
let pauseMenu;
let optionsMenu;
let loadsMenu;

export function setupScene() {
//   mainMenu.style.display = "block";
//   pauseMenu.style.display = "none";
//   optionsMenu.style.display = "none";
//   loadsMenu.style.display = "none";
  getMenuContext();
}

function getMenuContext() {
  mainMenu = document.getElementById("mainMenu");
  pauseMenu = document.getElementById("pauseMenu");
  optionsMenu = document.getElementById("optionsMenu");
  loadsMenu = document.getElementById("loadsMenu");
  mainMenu.style.display = "block";
  pauseMenu.style.display = "none";
  optionsMenu.style.display = "none";
  loadsMenu.style.display = "none";
}

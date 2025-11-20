export class MenuActions {
  static startGame(gameState) {
    const reticle = document.getElementById("reticle");
    if (reticle) {
      reticle.style.position = "absolute";
      reticle.style.display = "block";
    }
    gameState.setGameHasStarted(true);
    gameState.setIsPaused(false);
    gameState.setEnableControls();
  }
  static leaveTitle(gameState){
    gameState.setUserTitleMenu(false);
    document.getElementById("titleMenu").style.display = "none";
  }
  static resumeGame(gameState) {
    gameState.setIsPaused(false);
  }
  static pauseGame(gameState) {
    gameState.setIsPaused(true);
  }
  static showOptions(gameState) {
    gameState.setOptionsPage(true);
  }
  static trackOptionsUpdates() {}
  static makeSelection() {
    gameState.setShipSelection();
  }
}

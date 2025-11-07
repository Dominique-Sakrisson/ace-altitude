import { Menu } from "./menu";
import menuData from "./menuData";

export function menuInit(gameState) {
  const hud = new Menu({
    ...menuData.hud,
    gameState,
  });
  const mainMenuConfig = new Menu({
    ...menuData.main,
    gameState: gameState,
  });

  const pauseMenuConfig = new Menu({
    ...menuData.pause,
    gameState: gameState,
  });
  const optionsMenuConfig = new Menu({
    ...menuData.options,
    gameState: gameState,
  });
  hud.buildMenu();
  mainMenuConfig.buildMenu();
  pauseMenuConfig.buildMenu();
  optionsMenuConfig.buildMenu();
}

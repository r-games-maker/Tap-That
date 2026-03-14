import { createContext } from 'react';

// Shared context to tell the game when the menu is open
export const MenuContext = createContext({ 
  menuVisible: false, 
  levelsVisible: false 
});

// Shared levels data used by both the Home Screen and the Game Screen
export const LEVELS = Array.from({ length: 30 }, (_, i) => {
  const levelNum = i + 1;
  const grid = levelNum > 20 ? 5 : (levelNum > 10 ? 4 : 3);
  return {
    level: levelNum,
    gridSize: grid,
    target: 5 + (levelNum * 2),
    time: Math.max(10, 22 - Math.floor(levelNum / 2)),
    speed: Math.max(250, 1000 - (levelNum * 25))
  };
});
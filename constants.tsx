import { createContext } from 'react';

// Shared context to tell the game when the menu is open
export const MenuContext = createContext({ 
  menuVisible: false, 
  levelsVisible: false 
});

// Shared levels data used by both the Home Screen and the Game Screen
// constants.tsx
// constants.tsx
export const LEVELS = Array.from({ length: 50 }, (_, i) => {
  const levelNum = i + 1;
  const gridSize = levelNum < 12 ? 3 : (levelNum < 25 ? 4 : 5);
  const target = 5 + Math.floor(levelNum * 1.2);
  const time = levelNum <= 10 ? 20 : Math.max(12, 20 - Math.floor((levelNum - 10) / 3));

  let speed = 1000;
  for (let n = 1; n < levelNum; n++) {
    if (n < 10) speed *= 0.92;
    else speed *= 0.98;
  }

  const finalSpeed = Math.max(300, Math.floor(speed));

  return {
    level: levelNum,
    gridSize,
    target,
    time,
    speed: finalSpeed,
    // New: The mole stays for 40% longer than the spawn interval
    moleDuration: Math.floor(finalSpeed * 1.4) 
  };
});
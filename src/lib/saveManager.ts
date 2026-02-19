const SAVE_KEY = 'gemCascade_save_v1';

export interface SavedGame {
  level: number;
  activePowerUps: string[];
  highScore: number;
  lastPlayed: string;
}

export const saveGame = (level: number, activePowerUps: string[], highScore: number): void => {
  const saveData: SavedGame = {
    level,
    activePowerUps,
    highScore,
    lastPlayed: new Date().toISOString(),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
};

export const loadGame = (): SavedGame | null => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load save:', error);
  }
  return null;
};

export const clearSave = (): void => {
  localStorage.removeItem(SAVE_KEY);
};

export const hasSavedGame = (): boolean => {
  return localStorage.getItem(SAVE_KEY) !== null;
};
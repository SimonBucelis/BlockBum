export type CellColor =
  | 'red' | 'orange' | 'yellow' | 'green'
  | 'blue' | 'purple' | 'cyan' | 'pink' | null;

export type ObstacleType = 'rock' | 'ice' | 'cage' | null;

export type SpecialType = 'bomb' | null;

export type Cell = {
  color: CellColor;
  clearing?: boolean;
  obstacle: ObstacleType;
  obstacleHits?: number;
  special: SpecialType;
  hasGem?: boolean;
};

export type BlockShape = boolean[][];

export type GamePiece = {
  id: string;
  shape: BlockShape;
  color: CellColor;
  special?: SpecialType;
};

export type PowerUpType = 'bomb' | 'line_zap' | 'color_bomb' | 'rock_breaker';

export type PowerUp = {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
};

export type GemType = 'diamond' | 'ruby' | 'emerald';

export type Level = {
  number: number;
  gemsRequired: number;
  gemType: GemType;
  targetScore: number;
  rockCount: number;
  iceCount: number;
  cageCount: number;
};

export const BOARD_SIZE = 8;

export const generateLevel = (num: number): Level => {
  const gemType: GemType = num % 3 === 1 ? 'diamond' : num % 3 === 2 ? 'ruby' : 'emerald';
  const rockCount = Math.min(Math.floor(num / 2), 6);
  return {
    number: num,
    gemsRequired: rockCount, // Gems required = number of rocks that spawn (all rocks have gems)
    gemType,
    targetScore: 500 + (num - 1) * 800,
    rockCount,
    iceCount: 0,
    cageCount: Math.min(Math.floor((num - 2) / 4), 3),
  };
};

export const POWER_UPS: PowerUp[] = [
  { type: 'bomb', name: 'Bomb', description: 'One of your blocks gets a bomb — place it to explode 3×3 on line clear', icon: '💣' },
  { type: 'line_zap', name: 'Line Zap', description: 'One of your blocks gets a zap — place it to automatically clear the row(s)', icon: '⚡' },
  { type: 'color_bomb', name: 'Color Bomb', description: 'Clears all blocks of one color', icon: '🌈' },
  { type: 'rock_breaker', name: 'Rock Breaker', description: 'Destroys all rocks and collects their gems', icon: '🔨' },
];

export const PIECE_TEMPLATES: { shape: BlockShape; color: CellColor }[] = [
  { shape: [[true]], color: 'yellow' },
  { shape: [[true, true]], color: 'cyan' },
  { shape: [[true, true, true]], color: 'blue' },
  { shape: [[true, true, true, true]], color: 'green' },
  { shape: [[true], [true]], color: 'orange' },
  { shape: [[true], [true], [true]], color: 'red' },
  { shape: [[true], [true], [true], [true]], color: 'pink' },
  { shape: [[true, true], [true, true]], color: 'purple' },
  { shape: [[true, true, true], [true, true, true], [true, true, true]], color: 'red' },
  { shape: [[true, true, true], [true, true, true]], color: 'orange' },
  { shape: [[true, true], [true, true], [true, true]], color: 'green' },
  { shape: [[true, false], [true, false], [true, true]], color: 'blue' },
  { shape: [[false, true], [false, true], [true, true]], color: 'cyan' },
  { shape: [[true, true, true], [false, true, false]], color: 'pink' },
  { shape: [[false, true], [true, true], [true, false]], color: 'yellow' },
  { shape: [[true, false], [true, true], [false, true]], color: 'purple' },
];

export const MILESTONES = [5, 10, 15, 20, 25, 30, 50, 100];

export const createEmptyCell = (): Cell => ({
  color: null,
  obstacle: null,
  special: null,
});

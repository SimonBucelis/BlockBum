import { Cell, BOARD_SIZE, createEmptyCell, Level, CellColor, GamePiece } from './types';

export const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => createEmptyCell())
  );

export const placeObstacles = (board: Cell[][], level: Level): Cell[][] => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const emptyCells: { r: number; c: number }[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!newBoard[r][c].color && !newBoard[r][c].obstacle) {
        emptyCells.push({ r, c });
      }
    }
  }

  const shuffle = (arr: { r: number; c: number }[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  shuffle(emptyCells);
  let idx = 0;

  // Place rocks with gems
  for (let i = 0; i < level.rockCount && idx < emptyCells.length; i++, idx++) {
    const { r, c } = emptyCells[idx];
    newBoard[r][c] = { ...createEmptyCell(), obstacle: 'rock', hasGem: true, color: null };
  }

  // Place ice
  for (let i = 0; i < level.iceCount && idx < emptyCells.length; i++, idx++) {
    const { r, c } = emptyCells[idx];
    newBoard[r][c] = { ...createEmptyCell(), obstacle: 'ice', color: null };
  }

  // Place cages
  for (let i = 0; i < level.cageCount && idx < emptyCells.length; i++, idx++) {
    const { r, c } = emptyCells[idx];
    newBoard[r][c] = { ...createEmptyCell(), obstacle: 'cage', obstacleHits: 0, color: null };
  }

  return newBoard;
};

export const canPlacePiece = (
  piece: GamePiece,
  startRow: number,
  startCol: number,
  board: Cell[][]
): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const br = startRow + r;
      const bc = startCol + c;
      if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE) return false;
      const cell = board[br][bc];
      if (cell.color !== null) return false;
      if (cell.obstacle === 'rock') return false;
      if (cell.obstacle === 'cage' && (cell.obstacleHits ?? 0) < 2) return false;
    }
  }
  return true;
};

export const canAnyPieceBePlaced = (pieces: GamePiece[], board: Cell[][]): boolean => {
  for (const piece of pieces) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlacePiece(piece, r, c, board)) return true;
      }
    }
  }
  return false;
};

export type ClearResult = {
  newBoard: Cell[][];
  linesCleared: number;
  cellsCleared: { row: number; col: number }[];
  gemsCollected: number;
  rocksDestroyed: number;
};

export const checkAndClearLines = (currentBoard: Cell[][]): ClearResult => {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (currentBoard[r].every(cell => cell.color !== null || cell.obstacle === 'rock')) {
      // Allow rocks in line to count (they get destroyed)
      if (currentBoard[r].every(cell => cell.color !== null || cell.obstacle !== null)) {
        rowsToClear.push(r);
      }
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (currentBoard.every(row => row[c].color !== null || row[c].obstacle !== null)) {
      colsToClear.push(c);
    }
  }

  const cellsCleared: { row: number; col: number }[] = [];
  const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell })));
  let gemsCollected = 0;
  let rocksDestroyed = 0;

  const clearCell = (r: number, c: number) => {
    const cell = newBoard[r][c];
    if (cell.obstacle === 'rock') {
      if (cell.hasGem) gemsCollected++;
      rocksDestroyed++;
    }
    cellsCleared.push({ row: r, col: c });
    newBoard[r][c] = createEmptyCell();
  };

  const clearedSet = new Set<string>();

  for (const r of rowsToClear) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r}-${c}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearCell(r, c);
      }
    }
  }

  for (const c of colsToClear) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const key = `${r}-${c}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearCell(r, c);
      }
    }
  }

  // Handle ice: ice adjacent to cleared cells melts
  const iceToMelt: { r: number; c: number }[] = [];
  for (const { row, col } of cellsCleared) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (newBoard[nr][nc].obstacle === 'ice') {
          iceToMelt.push({ r: nr, c: nc });
        }
      }
    }
  }
  for (const { r, c } of iceToMelt) {
    newBoard[r][c] = createEmptyCell();
  }

  // Handle cages: cages adjacent to cleared cells get a hit
  for (const { row, col } of cellsCleared) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (newBoard[nr][nc].obstacle === 'cage') {
          newBoard[nr][nc].obstacleHits = (newBoard[nr][nc].obstacleHits ?? 0) + 1;
          if ((newBoard[nr][nc].obstacleHits ?? 0) >= 2) {
            newBoard[nr][nc] = createEmptyCell();
          }
        }
      }
    }
  }

  // Handle bombs in cleared cells
  const bombCells: { row: number; col: number }[] = [];
  for (const { row, col } of cellsCleared) {
    if (currentBoard[row][col].special === 'bomb') {
      bombCells.push({ row, col });
    }
  }

  for (const { row, col } of bombCells) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          const key = `${nr}-${nc}`;
          if (!clearedSet.has(key)) {
            clearedSet.add(key);
            if (newBoard[nr][nc].obstacle === 'rock' && newBoard[nr][nc].hasGem) {
              gemsCollected++;
            }
            if (newBoard[nr][nc].obstacle === 'rock') rocksDestroyed++;
            cellsCleared.push({ row: nr, col: nc });
            newBoard[nr][nc] = createEmptyCell();
          }
        }
      }
    }
  }

  return {
    newBoard,
    linesCleared: rowsToClear.length + colsToClear.length,
    cellsCleared,
    gemsCollected,
    rocksDestroyed,
  };
};

export const applyBombAt = (board: Cell[][], row: number, col: number): { newBoard: Cell[][]; gemsCollected: number } => {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  let gemsCollected = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (newBoard[nr][nc].obstacle === 'rock' && newBoard[nr][nc].hasGem) gemsCollected++;
        newBoard[nr][nc] = createEmptyCell();
      }
    }
  }
  return { newBoard, gemsCollected };
};

export const applyColorBomb = (board: Cell[][], targetColor: CellColor): { newBoard: Cell[][]; cleared: number } => {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  let cleared = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c].color === targetColor) {
        newBoard[r][c] = createEmptyCell();
        cleared++;
      }
    }
  }
  return { newBoard, cleared };
};

export const applyIceBreaker = (board: Cell[][]): Cell[][] => {
  return board.map(row => row.map(cell =>
    cell.obstacle === 'ice' ? createEmptyCell() : { ...cell }
  ));
};

export const applyRockBreaker = (board: Cell[][]): { newBoard: Cell[][]; gemsCollected: number } => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let gemsCollected = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c].obstacle === 'rock') {
        if (newBoard[r][c].hasGem) gemsCollected++;
        newBoard[r][c] = createEmptyCell();
      }
    }
  }
  return { newBoard, gemsCollected };
};

export const applyLineZap = (
  board: Cell[][],
  type: 'row' | 'col',
  index: number
): { newBoard: Cell[][]; cellsCleared: { row: number; col: number }[]; gemsCollected: number; rocksDestroyed: number } => {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cellsCleared: { row: number; col: number }[] = [];
  let gemsCollected = 0;
  let rocksDestroyed = 0;
  if (type === 'row') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = newBoard[index][c];
      if (cell.obstacle === 'rock') { rocksDestroyed++; if (cell.hasGem) gemsCollected++; }
      cellsCleared.push({ row: index, col: c });
      newBoard[index][c] = createEmptyCell();
    }
  } else {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const cell = newBoard[r][index];
      if (cell.obstacle === 'rock') { rocksDestroyed++; if (cell.hasGem) gemsCollected++; }
      cellsCleared.push({ row: r, col: index });
      newBoard[r][index] = createEmptyCell();
    }
  }
  return { newBoard, cellsCleared, gemsCollected, rocksDestroyed };
};

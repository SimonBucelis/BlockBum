import { useState, useCallback, useEffect } from 'react';
import { Cell, GamePiece, BOARD_SIZE, generateLevel, PowerUpType, POWER_UPS, PowerUp, CellColor } from './types';
import { createEmptyBoard, placeObstacles, canPlacePiece, canAnyPieceBePlaced, checkAndClearLines, applyRockBreaker, applyColorBomb, applyLineZap } from './boardUtils';
import { generatePieces } from './pieceGenerator';
import { saveGame, loadGame, hasSavedGame } from '@/lib/saveManager';

export type GamePhase = 'playing' | 'gameover' | 'levelcomplete' | 'picking';

export const useGameState = () => {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<Cell[][]>(() => {
    const b = createEmptyBoard();
    return placeObstacles(b, generateLevel(1));
  });
  const [availablePieces, setAvailablePieces] = useState<GamePiece[]>(() => generatePieces(3));
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [activePowerUps, setActivePowerUps] = useState<PowerUpType[]>([]);
  const [pickOptions, setPickOptions] = useState<PowerUp[]>([]);
  const [highlightCells, setHighlightCells] = useState<{ row: number; col: number }[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [showLoadScreen, setShowLoadScreen] = useState(false);
  const [bombPieceIndex, setBombPieceIndex] = useState<number | null>(null);
  const [zapPieceIndex, setZapPieceIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadGame();
    if (saved) setShowLoadScreen(true);
  }, []);

  useEffect(() => {
    if (score > 0) {
      saveGame(level, activePowerUps, Math.max(score, highScore));
    }
  }, [level, activePowerUps, score]);

  const currentLevel = generateLevel(level);

  const placePiece = useCallback(
    (pieceIndex: number, startRow: number, startCol: number) => {
      const piece = availablePieces[pieceIndex];
      if (!piece || !canPlacePiece(piece, startRow, startCol, board)) return false;

      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      const isBombPiece = bombPieceIndex === pieceIndex;
      let bombPlaced = false;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const isBombCell = isBombPiece && !bombPlaced;
            newBoard[startRow + r][startCol + c] = {
              ...newBoard[startRow + r][startCol + c],
              color: piece.color,
              special: isBombCell ? 'bomb' : (piece.special || null),
              obstacle: null,
            };
            if (isBombCell) bombPlaced = true;
          }
        }
      }
      if (isBombPiece) setBombPieceIndex(null);

      const result = checkAndClearLines(newBoard);
      const isZapPiece = zapPieceIndex === pieceIndex;
      let finalBoard = result.newBoard;
      let allCellsCleared = [...result.cellsCleared];
      let zapGemsCollected = 0;
      let zapRocksDestroyed = 0;
      
      // If zap piece, zap all rows that the piece occupies
      if (isZapPiece) {
        setZapPieceIndex(null);
        const rowsToZap = new Set<number>();
        for (let r = 0; r < piece.shape.length; r++) {
          for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
              rowsToZap.add(startRow + r);
            }
          }
        }
        // Apply zap to each row — now collects gems/rocks too
        for (const row of rowsToZap) {
          const zapRowResult = applyLineZap(finalBoard, 'row', row);
          finalBoard = zapRowResult.newBoard;
          allCellsCleared.push(...zapRowResult.cellsCleared);
          zapGemsCollected += zapRowResult.gemsCollected;
          zapRocksDestroyed += zapRowResult.rocksDestroyed;
        }
      }

      // Animate clearing
      if (allCellsCleared.length > 0) {
        const animBoard = newBoard.map(row => row.map(cell => ({ ...cell })));
        allCellsCleared.forEach(({ row, col }) => {
          if (animBoard[row][col].color) {
            animBoard[row][col] = { ...animBoard[row][col], clearing: true };
          }
        });
        setBoard(animBoard);
        setTimeout(() => setBoard(finalBoard), 350);
      } else {
        setBoard(finalBoard);
      }

      const blockCount = piece.shape.flat().filter(Boolean).length;
      const placementPoints = blockCount * 10;
      const newCombo = result.linesCleared > 0 ? combo + 1 : 0;
      const lineBonus = result.linesCleared * 100 * (1 + newCombo * 0.5);
      const rockBonus = (result.rocksDestroyed + zapRocksDestroyed) * 50;
      const gemBonus = (result.gemsCollected + zapGemsCollected) * 25;
      const zapBonus = isZapPiece ? allCellsCleared.length * 20 : 0;
      const totalPoints = Math.round(placementPoints + lineBonus + rockBonus + gemBonus + zapBonus);

      setScore(s => s + totalPoints);
      setCombo(newCombo);

      // Count gems from destroyed rocks — both from line clears AND zap
      const totalGems = result.gemsCollected + zapGemsCollected;
      if (totalGems > 0) setGems(g => g + totalGems);

      const newPieces = [...availablePieces];
      newPieces.splice(pieceIndex, 1);

      if (newPieces.length === 0) {
        const refilled = generatePieces(3, activePowerUps);
        setAvailablePieces(refilled);
        setTimeout(() => {
          if (!canAnyPieceBePlaced(refilled, finalBoard)) setPhase('gameover');
        }, 500);
      } else {
        setAvailablePieces(newPieces);
        setTimeout(() => {
          if (!canAnyPieceBePlaced(newPieces, finalBoard)) setPhase('gameover');
        }, 500);
      }

      setHighlightCells([]);
      setIsValid(false);
      return true;
    },
    [availablePieces, board, combo, activePowerUps, bombPieceIndex, zapPieceIndex]
  );

  const handleCellHover = useCallback(
    (pieceIndex: number | null, row: number, col: number) => {
      if (pieceIndex === null) { setHighlightCells([]); return; }
      const piece = availablePieces[pieceIndex];
      if (!piece) return;
      const cells: { row: number; col: number }[] = [];
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) cells.push({ row: row + r, col: col + c });
        }
      }
      setHighlightCells(cells);
      setIsValid(canPlacePiece(piece, row, col, board));
    },
    [availablePieces, board]
  );

  const handleBoardLeave = useCallback(() => {
    setHighlightCells([]);
    setIsValid(false);
  }, []);

  const usePowerUp = useCallback((type: PowerUpType) => {
    if (type === 'line_zap') {
      setActivePowerUps(prev => {
        const idx = prev.lastIndexOf('line_zap');
        if (idx === -1) return prev;
        const next = [...prev]; next.splice(idx, 1); return next;
      });
      // Mark first available piece as zap piece
      setZapPieceIndex(0);
    } else if (type === 'bomb') {
      setActivePowerUps(prev => {
        const idx = prev.lastIndexOf('bomb');
        if (idx === -1) return prev;
        const next = [...prev]; next.splice(idx, 1); return next;
      });
      setBombPieceIndex(0);
    } else if (type === 'rock_breaker') {
      const { newBoard, gemsCollected } = applyRockBreaker(board);
      setBoard(newBoard);
      if (gemsCollected > 0) setGems(g => g + gemsCollected);
      setScore(s => s + gemsCollected * 50);
      setActivePowerUps(prev => {
        const idx = prev.lastIndexOf('rock_breaker');
        if (idx === -1) return prev;
        const next = [...prev]; next.splice(idx, 1); return next;
      });
    } else if (type === 'color_bomb') {
      const colorCounts: Record<string, number> = {};
      board.forEach(row => row.forEach(cell => {
        if (cell.color) colorCounts[cell.color] = (colorCounts[cell.color] || 0) + 1;
      }));
      const topColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
      if (topColor) {
        const { newBoard, cleared } = applyColorBomb(board, topColor[0] as CellColor);
        setBoard(newBoard);
        setScore(s => s + cleared * 15);
      }
      setActivePowerUps(prev => {
        const idx = prev.lastIndexOf('color_bomb');
        if (idx === -1) return prev;
        const next = [...prev]; next.splice(idx, 1); return next;
      });
    }
  }, [board]);


  useEffect(() => {
    if (phase === 'playing' && score >= currentLevel.targetScore && gems >= currentLevel.gemsRequired) {
      setPhase('levelcomplete');
    }
  }, [score, gems, currentLevel.targetScore, currentLevel.gemsRequired, phase]);

  const advanceLevel = useCallback(() => {
    const shuffled = [...POWER_UPS].sort(() => Math.random() - 0.5);
    setPickOptions(shuffled.slice(0, 2));
    setPhase('picking');
  }, []);

  const pickPowerUp = useCallback((powerUp: PowerUp) => {
    setActivePowerUps(prev => [...prev, powerUp.type]);
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setGems(0);
    const levelData = generateLevel(nextLevel);
    const boardWithObstacles = placeObstacles(createEmptyBoard(), levelData);
    setBoard(boardWithObstacles);
    setAvailablePieces(generatePieces(3, [...activePowerUps, powerUp.type]));
    setCombo(0);
    setPhase('playing');
    setPickOptions([]);
    setBombPieceIndex(null);
    setZapPieceIndex(null);
  }, [level, activePowerUps]);

  const restartGame = useCallback(() => {
    const levelData = generateLevel(1);
    setBoard(placeObstacles(createEmptyBoard(), levelData));
    setAvailablePieces(generatePieces(3));
    setScore(0); setGems(0); setLevel(1); setCombo(0);
    setPhase('playing'); setActivePowerUps([]);
    setHighlightCells([]); setPickOptions([]);
    setBombPieceIndex(null); setZapPieceIndex(null);
  }, []);

  const loadSavedGame = useCallback(() => {
    const saved = loadGame();
    if (saved) {
      const levelData = generateLevel(saved.level);
      setBoard(placeObstacles(createEmptyBoard(), levelData));
      setAvailablePieces(generatePieces(3, saved.activePowerUps as PowerUpType[]));
      setScore(0); setGems(0); setLevel(saved.level); setCombo(0);
      setPhase('playing');
      setActivePowerUps(saved.activePowerUps as PowerUpType[]);
      setHighlightCells([]); setPickOptions([]);
      setHighScore(saved.highScore); setShowLoadScreen(false);
      setBombPieceIndex(null); setZapPieceIndex(null);
    }
  }, []);

  return {
    board, availablePieces, score, gems, level, combo, phase, currentLevel,
    highlightCells, isValid, activePowerUps, pickOptions,
    bombPieceIndex, zapPieceIndex,
    placePiece, handleCellHover, handleBoardLeave,
    usePowerUp,
    advanceLevel, pickPowerUp, restartGame, showLoadScreen, loadSavedGame,
  };
};

import { useGameState } from '@/game/useGameState';
import { canPlacePiece } from '@/game/boardUtils';
import { BOARD_SIZE } from '@/game/types';
import GameBoard from '@/components/game/GameBoard';
import PieceTray from '@/components/game/PieceTray';
import GameHeader from '@/components/game/GameHeader';
import GameOverlay from '@/components/game/GameOverlay';
import PowerUpPicker from '@/components/game/PowerUpPicker';
import DragGhost, {
  getFirstFilled,
  getFilledCenterX,
  BOARD_CELL_GAP,
  BOARD_PADDING,
  FINGER_GAP,
} from '@/components/game/DragGhost';
import LoadScreen from '@/components/game/LoadScreen';
import { hasSavedGame } from '@/lib/saveManager';
import { useState, useCallback, useRef, useEffect } from 'react';

const Index = () => {
  const game = useGameState();
  const boardRef = useRef<HTMLDivElement>(null);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [cellSize, setCellSize] = useState(40);

  // Top-left of the piece bounding box on the board grid (null = not over board)
  const [snapCell, setSnapCell] = useState<{ row: number; col: number } | null>(null);

  // ── Measure board cell size to match GameBoard's calculation ──────────────
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const padding = 32;
      const boardPadding = BOARD_PADDING * 2;
      const gaps = 7 * BOARD_CELL_GAP;
      const available = Math.min(vw - padding, 420) - boardPadding - gaps;
      setCellSize(Math.floor(available / 8));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Board hit-test ────────────────────────────────────────────────────────
  /**
   * Returns the board cell at a given screen coordinate,
   * OR null if the coordinate is outside the board.
   *
   * KEY: we probe FINGER_GAP pixels ABOVE the actual finger so the ghost
   * (whose bottom is FINGER_GAP above the finger) drives snapping, not the
   * raw touch point which is below the visible block.
   */
  const getCellAt = useCallback(
    (clientX: number, clientY: number, pieceIndex: number | null): { row: number; col: number } | null => {
      if (!boardRef.current) return null;
      const rect = boardRef.current.getBoundingClientRect();
      const cellWithGap = cellSize + BOARD_CELL_GAP;

      // Probe FINGER_GAP above finger (where the ghost block bottom is)
      const probeY = clientY - FINGER_GAP;

      // Probe at the ghost's top-left x: ghost left = clientX - filledCenterPx
      // so col-0 of the piece = clientX - filledCenterPx + half a cell
      let probeX = clientX;
      if (pieceIndex !== null) {
        const piece = game.availablePieces[pieceIndex];
        if (piece) {
          const centerX = getFilledCenterX(piece.shape);
          const filledCenterPx = centerX * cellWithGap + cellSize / 2;
          probeX = clientX - filledCenterPx + cellSize / 2;
        }
      }

      const x = probeX - rect.left - BOARD_PADDING;
      const y = probeY - rect.top  - BOARD_PADDING;
      const col = Math.floor(x / cellWithGap);
      const row = Math.floor(y / cellWithGap);
      if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) return null;
      return { row, col };
    },
    [cellSize, game.availablePieces]
  );

  /**
   * Convert "cell under ghost's firstFilled cell" → piece top-left bounding box.
   * placePiece / handleCellHover both expect the bounding-box top-left.
   */
  const toTopLeft = useCallback(
    (
      anchorCell: { row: number; col: number },
      pieceIndex: number
    ): { row: number; col: number } | null => {
      const piece = game.availablePieces[pieceIndex];
      if (!piece) return null;
      const ff = getFirstFilled(piece.shape);
      if (!ff) return null;
      return {
        row: anchorCell.row - ff.r,
        col: anchorCell.col - ff.c,
      };
    },
    [game.availablePieces]
  );

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (index: number, clientX: number, clientY: number) => {
      setDraggingIndex(index);
      setDragPos({ x: clientX, y: clientY });
      setSnapCell(null);
    },
    []
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (draggingIndex === null) return;
      setDragPos({ x: clientX, y: clientY });

      const anchor = getCellAt(clientX, clientY, draggingIndex);
      if (anchor) {
        const topLeft = toTopLeft(anchor, draggingIndex);
        if (topLeft) {
          setSnapCell(topLeft);
          game.handleCellHover(draggingIndex, topLeft.row, topLeft.col);
          return;
        }
      }
      setSnapCell(null);
      game.handleBoardLeave();
    },
    [draggingIndex, getCellAt, toTopLeft, game]
  );

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (draggingIndex === null) return;

      const anchor = getCellAt(clientX, clientY, draggingIndex);
      if (anchor) {
        const topLeft = toTopLeft(anchor, draggingIndex);
        if (topLeft) {
          const piece = game.availablePieces[draggingIndex];
          if (piece && canPlacePiece(piece, topLeft.row, topLeft.col, game.board)) {
            game.placePiece(draggingIndex, topLeft.row, topLeft.col);
          }
        }
      }

      game.handleBoardLeave();
      setDraggingIndex(null);
      setSnapCell(null);
    },
    [draggingIndex, getCellAt, toTopLeft, game]
  );

  // ── Global pointer events ─────────────────────────────────────────────────
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (draggingIndex === null) return;
      e.preventDefault();
      const t = e.touches[0];
      handleDragMove(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (draggingIndex === null) return;
      const t = e.changedTouches[0];
      handleDragEnd(t.clientX, t.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (draggingIndex === null) return;
      handleDragMove(e.clientX, e.clientY);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (draggingIndex === null) return;
      handleDragEnd(e.clientX, e.clientY);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingIndex, handleDragMove, handleDragEnd]);

  // ── Render ────────────────────────────────────────────────────────────────
  const draggingPiece =
    draggingIndex !== null ? game.availablePieces[draggingIndex] : null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-between p-4 select-none overflow-hidden max-w-md mx-auto">
      {game.showLoadScreen && (
        <LoadScreen
          onLoad={game.loadSavedGame}
          onNewGame={game.restartGame}
          hasSavedGame={hasSavedGame()}
        />
      )}

      <h1 className="text-2xl font-bold text-foreground tracking-tight">
        Block<span className="text-primary">Bum</span>
      </h1>

      <div className="w-full mt-2">
        <GameHeader
          score={game.score}
          gems={game.gems}
          level={game.level}
          combo={game.combo}
          currentLevel={game.currentLevel}
          activePowerUps={game.activePowerUps}
          onUsePowerUp={game.usePowerUp}
          bombPieceIndex={game.bombPieceIndex}
          zapPieceIndex={game.zapPieceIndex}
        />
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center my-2">
        <div className="relative">
          <GameBoard
            board={game.board}
            highlightCells={game.highlightCells}
            isValid={game.isValid}
            cellSize={cellSize}
            boardRef={boardRef}
          />
          {game.phase === 'gameover' && (
            <GameOverlay
              type="gameover"
              score={game.score}
              level={game.level}
              onRestart={game.restartGame}
            />
          )}
          {game.phase === 'levelcomplete' && (
            <GameOverlay
              type="levelcomplete"
              score={game.score}
              level={game.level}
              onRestart={game.restartGame}
              onNextLevel={game.advanceLevel}
            />
          )}
          {game.phase === 'picking' && (
            <PowerUpPicker
              options={game.pickOptions}
              onPick={game.pickPowerUp}
              level={game.level}
            />
          )}
        </div>
      </div>

      <div className="w-full pb-2">
        <p className="text-[10px] text-muted-foreground text-center mb-1">
          Drag a piece onto the board
        </p>
        <PieceTray
          pieces={game.availablePieces}
          onDragStart={handleDragStart}
          draggingIndex={draggingIndex}
          bombPieceIndex={game.bombPieceIndex}
          zapPieceIndex={game.zapPieceIndex}
        />
      </div>

      {draggingPiece && (
        <DragGhost
          piece={draggingPiece}
          fingerX={dragPos.x}
          fingerY={dragPos.y}
          cellSize={cellSize}
          isBombPiece={game.bombPieceIndex === draggingIndex}
          isZapPiece={game.zapPieceIndex === draggingIndex}
          snapCell={snapCell}
          boardRef={boardRef}
        />
      )}
    </div>
  );
};

export default Index;

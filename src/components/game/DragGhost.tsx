import { GamePiece } from '@/game/types';
import { cn } from '@/lib/utils';
import React from 'react';

// Must match GameBoard.tsx exactly
export const BOARD_CELL_GAP = 3;
export const BOARD_PADDING = 8;

// How far the block bottom floats above the finger (px)
export const FINGER_GAP = 180;

export const getFirstFilled = (shape: boolean[][]): { r: number; c: number } | null => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) return { r, c };
  return null;
};

/** Horizontal center of filled cells (in cell units from left of bounding box) */
export const getFilledCenterX = (shape: boolean[][]): number => {
  let sumC = 0, count = 0;
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) { sumC += c; count++; }
  return count > 0 ? sumC / count : (shape[0].length - 1) / 2;
};

type Props = {
  piece: GamePiece;
  fingerX: number;         // raw finger clientX
  fingerY: number;         // raw finger clientY
  cellSize: number;
  isBombPiece?: boolean;
  isZapPiece?: boolean;
  // top-left board cell of the piece bounding box — null when not over board
  snapCell: { row: number; col: number } | null;
  boardRef: React.RefObject<HTMLDivElement>;
};

const colorMap: Record<string, string> = {
  red: 'bg-block-red',     orange: 'bg-block-orange',
  yellow: 'bg-block-yellow', green: 'bg-block-green',
  blue: 'bg-block-blue',   purple: 'bg-block-purple',
  cyan: 'bg-block-cyan',   pink: 'bg-block-pink',
};

const DragGhost = ({
  piece, fingerX, fingerY, cellSize, isBombPiece, isZapPiece, snapCell, boardRef,
}: Props) => {
  const gap = BOARD_CELL_GAP;
  const cols = piece.shape[0].length;
  const rows = piece.shape.length;
  const cellWithGap = cellSize + gap;
  const totalW = cols * cellWithGap - gap;
  const totalH = rows * cellWithGap - gap;
  const firstFilled = getFirstFilled(piece.shape);

  // Horizontal pixel offset of the filled-cell mass center from bounding-box left
  const filledCenterX = getFilledCenterX(piece.shape);
  const filledCenterPx = filledCenterX * cellWithGap + cellSize / 2;

  let left: number;
  let top: number;

  if (snapCell && boardRef.current) {
    // Snap to exact board grid position
    const rect = boardRef.current.getBoundingClientRect();
    left = rect.left + BOARD_PADDING + snapCell.col * cellWithGap;
    top  = rect.top  + BOARD_PADDING + snapCell.row * cellWithGap;
  } else {
    // Free drag: center filled-cell mass on finger horizontally, bottom FINGER_GAP above finger
    left = fingerX - filledCenterPx;
    top  = fingerY - totalH - FINGER_GAP;
  }

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left, top }}
    >
      {/* Soft glow behind the block */}
      <div
        className="absolute inset-0 blur-[8px] opacity-30 scale-105"
        aria-hidden="true"
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: `${gap}px` }}
        >
          {piece.shape.map((row, ri) =>
            row.map((filled, ci) => (
              <div
                key={`glow-${ri}-${ci}`}
                className={cn('rounded-md', filled ? colorMap[piece.color!] : '')}
                style={{ width: cellSize, height: cellSize }}
              />
            ))
          )}
        </div>
      </div>

      {/* Ghost block — semi-transparent so board shows through */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: `${gap}px`,
          opacity: 0.72,
        }}
      >
        {piece.shape.map((row, ri) =>
          row.map((filled, ci) => {
            const isFirst = filled && firstFilled && ri === firstFilled.r && ci === firstFilled.c;
            return (
              <div
                key={`${ri}-${ci}`}
                className={cn(
                  'rounded-md relative',
                  filled ? `${colorMap[piece.color!]} block-shadow` : ''
                )}
                style={{ width: cellSize, height: cellSize }}
              >
                {isFirst && isBombPiece && (
                  <span className="text-sm flex items-center justify-center absolute inset-0">💣</span>
                )}
                {isFirst && isZapPiece && (
                  <span className="text-sm flex items-center justify-center absolute inset-0">⚡</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DragGhost;

import { GamePiece } from '@/game/types';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';

type Props = {
  pieces: GamePiece[];
  onDragStart: (index: number, clientX: number, clientY: number) => void;
  draggingIndex: number | null;
  bombPieceIndex?: number | null;
  zapPieceIndex?: number | null;
};

const colorMap: Record<string, string> = {
  red: 'bg-block-red', orange: 'bg-block-orange', yellow: 'bg-block-yellow',
  green: 'bg-block-green', blue: 'bg-block-blue', purple: 'bg-block-purple',
  cyan: 'bg-block-cyan', pink: 'bg-block-pink',
};

const getFirstFilled = (shape: boolean[][]) => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) return { r, c };
  return null;
};

const CELL_SIZE = 18;
const GAP = 2;

const PieceTray = ({ pieces, onDragStart, draggingIndex, bombPieceIndex, zapPieceIndex }: Props) => {
  const trayRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDragStart(index, touch.clientX, touch.clientY);
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(index, e.clientX, e.clientY);
  };

  return (
    <div ref={trayRef} className="flex gap-4 justify-center items-end px-2 py-3">
      {pieces.map((piece, index) => {
        const isDragging = draggingIndex === index;
        const hasBomb = bombPieceIndex === index;
        const hasZap = zapPieceIndex === index;
        const firstFilled = getFirstFilled(piece.shape);

        return (
          <div
            key={piece.id}
            onTouchStart={(e) => handleTouchStart(index, e)}
            onMouseDown={(e) => handleMouseDown(index, e)}
            style={{ visibility: isDragging ? 'hidden' : 'visible' }}
            className="p-2 rounded-xl border-2 border-border bg-card/80 cursor-grab active:cursor-grabbing select-none transition-transform active:scale-95"
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${piece.shape[0].length}, ${CELL_SIZE}px)`,
                gap: `${GAP}px`,
              }}
            >
              {piece.shape.map((row, ri) =>
                row.map((filled, ci) => {
                  const isFirst = filled && firstFilled && ri === firstFilled.r && ci === firstFilled.c;
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={cn('rounded-sm relative', filled ? `${colorMap[piece.color!]} block-shadow` : 'bg-transparent')}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    >
                      {isFirst && hasBomb && <span className="text-[10px] flex items-center justify-center absolute inset-0">💣</span>}
                      {isFirst && hasZap && <span className="text-[10px] flex items-center justify-center absolute inset-0">⚡</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PieceTray;

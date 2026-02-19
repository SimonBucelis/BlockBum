import { Cell } from '@/game/types';
import { cn } from '@/lib/utils';

type Props = {
  board: Cell[][];
  highlightCells: { row: number; col: number }[];
  isValid: boolean;
  cellSize: number;
  boardRef: React.RefObject<HTMLDivElement>;
};

const colorMap: Record<string, string> = {
  red: 'bg-block-red',
  orange: 'bg-block-orange',
  yellow: 'bg-block-yellow',
  green: 'bg-block-green',
  blue: 'bg-block-blue',
  purple: 'bg-block-purple',
  cyan: 'bg-block-cyan',
  pink: 'bg-block-pink',
};

const obstacleEmoji: Record<string, string> = {
  rock: '🪨',
  ice: '🧊',
  cage: '🔒',
};

const GameBoard = ({ board, highlightCells, isValid, cellSize, boardRef }: Props) => {
  const isHighlighted = (row: number, col: number) =>
    highlightCells.some(c => c.row === row && c.col === col);

  const gap = 3;

  return (
    <div
      ref={boardRef}
      className="game-board-bg rounded-2xl p-2 border border-border shadow-2xl mx-auto"
      style={{ touchAction: 'none' }}
    >
      <div
        className="grid grid-cols-8"
        style={{ gap: `${gap}px` }}
      >
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const highlighted = isHighlighted(ri, ci);
            const hasColor = cell.color !== null;
            const clearing = cell.clearing;
            const hasObstacle = cell.obstacle !== null;
            const hasSpecial = cell.special !== null;
            const hasGem = cell.hasGem;

            return (
              <div
                key={`${ri}-${ci}`}
                className={cn(
                  'rounded-md transition-all duration-150 flex items-center justify-center relative',
                  hasColor && !clearing && colorMap[cell.color!],
                  hasColor && !clearing && 'block-shadow',
                  clearing && 'animate-clear',
                  clearing && cell.color && colorMap[cell.color],
                  !hasColor && !highlighted && !hasObstacle && 'bg-game-cell',
                  hasObstacle && cell.obstacle === 'rock' && 'bg-muted/60 border border-muted-foreground/30',
                  hasObstacle && cell.obstacle === 'ice' && 'bg-block-cyan/20 border border-block-cyan/40',
                  hasObstacle && cell.obstacle === 'cage' && 'bg-muted/40 border-2 border-dashed border-muted-foreground/50',
                  highlighted && isValid && 'bg-game-cell-highlight/40 ring-2 ring-game-cell-highlight',
                  highlighted && !isValid && 'bg-game-cell-invalid/30 ring-2 ring-game-cell-invalid',
                )}
                style={{ width: cellSize, height: cellSize }}
              >
                {hasObstacle && (
                  <span className="text-xs select-none">
                    {obstacleEmoji[cell.obstacle!]}
                    {hasGem && <span className="absolute bottom-0 right-0 text-[10px] animate-pulse">⭐</span>}
                  </span>
                )}
                {hasSpecial && cell.special === 'bomb' && (
                  <span className="text-xs select-none">💣</span>
                )}
                {cell.obstacle === 'cage' && (
                  <span className="absolute top-0 right-0 text-[8px] text-muted-foreground">
                    {(cell.obstacleHits ?? 0)}/2
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;

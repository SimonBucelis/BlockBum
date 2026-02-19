import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  type: 'gameover' | 'levelcomplete';
  score: number;
  level: number;
  onRestart: () => void;
  onNextLevel?: () => void;
};

const GameOverlay = ({ type, score, level, onRestart, onNextLevel }: Props) => {
  const handleRestart = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRestart();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md rounded-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-2xl max-w-[280px] mx-4" onClick={(e) => e.stopPropagation()}>
        {type === 'levelcomplete' ? (
          <>
            <Trophy className="w-12 h-12 text-primary mx-auto mb-2 animate-gem-float" />
            <h2 className="text-xl font-bold text-foreground mb-1">Level {level} Clear!</h2>
            <p className="text-3xl font-bold text-primary score-glow mb-4 font-[Fredoka]">
              {score.toLocaleString()}
            </p>
            <div className="flex flex-col gap-2">
              {onNextLevel && (
                <Button type="button" onClick={onNextLevel} className="gap-2 w-full">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button type="button" variant="outline" onPointerDown={handleRestart} onClick={handleRestart} className="gap-2 w-full">
                <RotateCcw className="w-4 h-4" /> Restart
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground mb-1">Game Over</h2>
            <p className="text-xs text-muted-foreground mb-2">No moves left!</p>
            <p className="text-3xl font-bold text-primary score-glow mb-4 font-[Fredoka]">
              {score.toLocaleString()}
            </p>
            <Button type="button" onPointerDown={handleRestart} onClick={handleRestart} className="gap-2 w-full">
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GameOverlay;

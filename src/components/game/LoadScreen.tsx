import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PowerUp, POWER_UPS } from '@/game/types';
import { hasSavedGame } from '@/lib/saveManager';

type Props = {
  onLoad: () => void;
  onNewGame: () => void;
  hasSavedGame: boolean;
};

const powerUpEmoji: Record<string, string> = {
  bomb: '💣',
  line_zap: '⚡',
  color_bomb: '🌈',
  cage_key: '🔑',
};

const LoadScreen = ({ onLoad, onNewGame, hasSavedGame }: Props) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-[Fredoka] text-primary">
            BlockBum
          </CardTitle>
          <CardDescription className="text-center">
            Welcome back! Choose how to play
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasSavedGame && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80">Continue Your Progress</h3>
              <Button 
                onClick={onLoad}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
              >
                Continue Game
              </Button>
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">Start Fresh</h3>
            <Button 
              onClick={onNewGame}
              variant="outline"
              className="w-full h-12 border-primary/30 hover:bg-primary/10"
            >
              New Game
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground/80 mb-2">Power-ups Guide</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {POWER_UPS.map((pu: PowerUp) => (
                <div 
                  key={pu.type}
                  className="flex items-start gap-2 p-2 rounded bg-card/60 border border-border"
                >
                  <span className="text-lg">{pu.icon}</span>
                  <div>
                    <div className="font-medium text-foreground">{pu.name}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{pu.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadScreen;
import { Level, PowerUpType, POWER_UPS, PowerUp } from '@/game/types';
import { Diamond, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Props = {
  score: number;
  gems: number;
  level: number;
  combo: number;
  currentLevel: Level;
  activePowerUps: PowerUpType[];
  onUsePowerUp: (type: PowerUpType) => void;
  bombPieceIndex?: number | null;
  zapPieceIndex?: number | null;
};

const gemIconColors: Record<string, string> = {
  diamond: 'text-gem-diamond',
  ruby: 'text-gem-ruby',
  emerald: 'text-gem-emerald',
};

// Gradient backgrounds for each ability type
const abilityGradients: Record<string, string> = {
  line_zap: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  bomb: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
  color_bomb: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  rock_breaker: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

const abilityIcons: Record<string, string> = {
  line_zap: '⚡',
  bomb: '💣',
  color_bomb: '🌈',
  rock_breaker: '🔨',
};

const abilityLabels: Record<string, string> = {
  line_zap: 'Line Zap',
  bomb: 'Bomb',
  color_bomb: 'Color',
  rock_breaker: 'Breaker',
};

const GameHeader = ({
  score, gems, level, combo, currentLevel, activePowerUps,
  onUsePowerUp, bombPieceIndex, zapPieceIndex
}: Props) => {
  const [hoveredPowerUp, setHoveredPowerUp] = useState<PowerUp | null>(null);

  // Count stacks per type
  const stackCounts: Partial<Record<PowerUpType, number>> = {};
  for (const pu of activePowerUps) {
    stackCounts[pu] = (stackCounts[pu] || 0) + 1;
  }
  const uniqueTypes = [...new Set(activePowerUps)] as PowerUpType[];

  const getPowerUpInfo = (type: PowerUpType) => POWER_UPS.find(p => p.type === type);

  const isActive = (type: PowerUpType) =>
    (type === 'bomb' && bombPieceIndex !== null && bombPieceIndex !== undefined) ||
    (type === 'line_zap' && zapPieceIndex !== null && zapPieceIndex !== undefined);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Top bar: Level + Score */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-semibold text-muted-foreground">Lv.{level}</span>
        </div>
        <p className="text-2xl font-bold text-primary score-glow font-[Fredoka]">
          {score.toLocaleString()}
        </p>
      </div>

      {/* Score progress bar */}
      <div className="bg-card/60 rounded-xl p-2 border border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">
              {score.toLocaleString()}/{currentLevel.targetScore.toLocaleString()} EXP
            </span>
          </div>
          {combo > 0 && (
            <div className="flex items-center gap-0.5 bg-primary/20 px-1.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">x{combo + 1}</span>
            </div>
          )}
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (score / currentLevel.targetScore) * 100)}%`,
              background: 'var(--gradient-gold)',
            }}
          />
        </div>
      </div>

      {/* Gems progress bar */}
      <div className="bg-card/60 rounded-xl p-2 border border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Diamond className={`w-4 h-4 ${gemIconColors[currentLevel.gemType]} animate-gem-float`} />
            <span className="text-xs font-medium text-foreground">
              {gems}/{currentLevel.gemsRequired} Gems
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (gems / currentLevel.gemsRequired) * 100)}%`,
              background: 'var(--gradient-gold)',
            }}
          />
        </div>
      </div>

      {/* Ability buttons — square 60x60 with stack badges */}
      {uniqueTypes.length > 0 && (
        <div className="relative">
          <div className="flex gap-2 justify-center flex-wrap">
            {uniqueTypes.map(pu => {
              const info = getPowerUpInfo(pu);
              const count = stackCounts[pu] || 0;
              const active = isActive(pu);
              const gradient = abilityGradients[pu] || 'linear-gradient(135deg,#6b7280,#374151)';
              return (
                <div key={pu} className="relative">
                  <button
                    onClick={() => onUsePowerUp(pu)}
                    onMouseEnter={() => setHoveredPowerUp(info || null)}
                    onMouseLeave={() => setHoveredPowerUp(null)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 shrink-0 transition-all duration-150 select-none',
                      'active:scale-90 shadow-lg',
                      active && 'ring-2 ring-white ring-offset-1 ring-offset-background scale-105 brightness-110',
                    )}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      background: gradient,
                      border: active ? '2px solid white' : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: active
                        ? `0 0 16px 4px ${abilityGradients[pu]?.split(' ')[1] ?? '#fff'}55`
                        : '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span className="text-xl leading-none">{abilityIcons[pu]}</span>
                    <span className="text-[8px] font-bold text-white/90 leading-none tracking-wide uppercase">
                      {abilityLabels[pu]}
                    </span>
                  </button>

                  {/* Stack badge */}
                  {count > 0 && (
                    <div
                      className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[9px] font-black text-white shadow-md"
                      style={{
                        width: 18,
                        height: 18,
                        background: 'rgba(0,0,0,0.7)',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      x{count}
                    </div>
                  )}

                  {/* Active indicator pill */}
                  {active && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[8px] font-bold text-white bg-white/20 backdrop-blur whitespace-nowrap">
                      'Place the block!'
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {hoveredPowerUp && (
            <div className="absolute top-full left-0 mt-6 z-50 w-64 p-3 bg-card border border-primary/30 rounded-lg shadow-xl">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{abilityIcons[hoveredPowerUp.type]}</span>
                <div>
                  <div className="font-bold text-foreground text-sm">{hoveredPowerUp.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{hoveredPowerUp.description}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameHeader;

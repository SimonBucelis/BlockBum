import { PowerUp } from '@/game/types';

type Props = {
  options: PowerUp[];
  onPick: (powerUp: PowerUp) => void;
  level: number;
};

const PowerUpPicker = ({ options, onPick, level }: Props) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md rounded-2xl">
      <div className="flex flex-col items-center gap-4 px-4 max-w-[320px] w-full">
        <h2 className="text-lg font-bold text-foreground font-[Fredoka]">
          Level {level + 1} — Pick a Power-Up
        </h2>
        <p className="text-xs text-muted-foreground text-center">
          Choose one ability for the next level
        </p>
        <div className="flex flex-col gap-3 w-full">
          {options.map(option => (
            <button
              key={option.type}
              onClick={() => onPick(option)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card/80 
                         active:border-primary active:bg-primary/10 transition-all"
            >
              <span className="text-3xl">{option.icon}</span>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">{option.name}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PowerUpPicker;

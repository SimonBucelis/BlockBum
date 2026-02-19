import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Props = {
  onZap: (target: 'row' | 'col', index: number) => void;
  onCancel: () => void;
};

const LineZapPicker = ({ onZap, onCancel }: Props) => {
  const [zapTarget, setZapTarget] = useState<{ type: 'row' | 'col'; index: number } | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleZap = (type: 'row' | 'col', index: number) => {
    if (animating) return;
    setZapTarget({ type, index });
    setAnimating(true);
    setTimeout(() => {
      onZap(type, index);
      setAnimating(false);
    }, 400);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.78)' }}
        onClick={onCancel}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 p-4 w-full max-w-xs">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(2,132,199,0.3))', border: '1px solid rgba(6,182,212,0.5)' }}
        >
          <span className="text-xl">⚡</span>
          <div className="text-center">
            <p className="text-white font-black text-sm tracking-wide">LINE ZAP</p>
            <p className="text-cyan-300 text-[10px]">Tap a row or column to zap</p>
          </div>
          <span className="text-xl">⚡</span>
        </div>

        {/* Row buttons */}
        <div className="w-full">
          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1.5 text-center">
            ← Rows →
          </p>
          <div className="grid grid-cols-8 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <button
                key={`row-${i}`}
                onClick={() => handleZap('row', i - 1)}
                disabled={animating}
                className={cn(
                  'flex items-center justify-center font-black text-xs text-white transition-all duration-100',
                  'active:scale-90',
                  zapTarget?.type === 'row' && zapTarget?.index === i - 1
                    ? 'scale-110 brightness-150'
                    : 'hover:brightness-125'
                )}
                style={{
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  border: '1px solid rgba(103,232,249,0.4)',
                  boxShadow: '0 2px 8px rgba(6,182,212,0.4)',
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-px bg-cyan-500/20" />
          <span className="text-[9px] text-cyan-400 font-bold tracking-widest">OR</span>
          <div className="flex-1 h-px bg-cyan-500/20" />
        </div>

        {/* Col buttons */}
        <div className="w-full">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5 text-center">
            ↕ Columns ↕
          </p>
          <div className="grid grid-cols-8 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <button
                key={`col-${i}`}
                onClick={() => handleZap('col', i - 1)}
                disabled={animating}
                className={cn(
                  'flex items-center justify-center font-black text-xs text-white transition-all duration-100',
                  'active:scale-90',
                  zapTarget?.type === 'col' && zapTarget?.index === i - 1
                    ? 'scale-110 brightness-150'
                    : 'hover:brightness-125'
                )}
                style={{
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: '1px solid rgba(147,197,253,0.4)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-white/40 text-xs hover:text-white/70 transition-colors mt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LineZapPicker;

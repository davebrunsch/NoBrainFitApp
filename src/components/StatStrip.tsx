import React from 'react';
import { Brand } from '../lib/brand';

interface StatStripProps {
  kcal: number;
  trainedToday: boolean;
  streak: number;
  onClickKcal?: () => void;
  onClickWorkout?: () => void;
  onClickStreak?: () => void;
}

export const StatStrip: React.FC<StatStripProps> = ({
  kcal,
  trainedToday,
  streak,
  onClickKcal,
  onClickWorkout,
  onClickStreak,
}) => {
  const formatKcal = (val: number) => {
    return val.toLocaleString('fr-FR');
  };

  return (
    <div className="w-full bg-[#16161B] border border-white/7 rounded-[16px] flex overflow-hidden shadow-sm">
      {/* Kcal Cell */}
      <button
        type="button"
        onClick={onClickKcal}
        className="flex-1 px-4 py-3.5 text-left border-r border-white/7 hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="font-mono text-[17px] font-bold tracking-tight text-[#C4ED4A]"
          style={{ color: Brand.lume }}
        >
          {formatKcal(kcal)}
        </div>
        <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F] mt-0.5">
          kcal
        </div>
      </button>

      {/* Workout status */}
      <button
        type="button"
        onClick={onClickWorkout}
        className="flex-1 px-4 py-3.5 text-left border-r border-white/7 hover:bg-white/[0.02] transition-colors"
      >
        <div className="font-mono text-[17px] font-bold tracking-tight text-[#F2F2F4]">
          {trainedToday ? 'Fait' : 'Repos'}
        </div>
        <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F] mt-0.5">
          Séance
        </div>
      </button>

      {/* Streak */}
      <button
        type="button"
        onClick={onClickStreak}
        className="flex-1 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="font-mono text-[17px] font-bold tracking-tight text-[#F2F2F4]">
          J · {streak}
        </div>
        <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F] mt-0.5">
          Streak
        </div>
      </button>
    </div>
  );
};

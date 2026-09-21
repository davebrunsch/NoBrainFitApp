import React, { useState } from 'react';
import { WorkoutPlan } from '../types';
import { store } from '../lib/store';
import { ArrowLeft, Bookmark, BookmarkCheck, Play, Check, Dumbbell, Sparkles } from 'lucide-react';

interface TrainResultScreenProps {
  plan: WorkoutPlan;
  duration: string;
  location: string;
  onBack: () => void;
  onStartSession: (plan: WorkoutPlan) => void;
}

export const TrainResultScreen: React.FC<TrainResultScreenProps> = ({
  plan,
  duration,
  location,
  onBack,
  onStartSession,
}) => {
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);

  const toggleCheck = (index: number) => {
    const next = new Set(checkedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedIndices(next);
  };

  const handleSaveFavorite = () => {
    store.addSavedWorkout({
      title: plan.title,
      type: location,
      exercises: plan.exercises,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between pb-24">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleSaveFavorite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16161B] border border-white/10 text-[12px] font-mono font-bold text-[#86868F] hover:text-[#C4ED4A] hover:border-[#C4ED4A]/30 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={14} className="text-[#C4ED4A]" />
                <span className="text-[#C4ED4A]">Sauvegardé</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Favoris</span>
              </>
            )}
          </button>
        </div>

        {/* Plan Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C4ED4A]/10 text-[#C4ED4A] border border-[#C4ED4A]/25">
              Programme prêt
            </span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#86868F]">
              {duration} · {location}
            </span>
          </div>
          <h2 className="font-head text-[24px] font-bold text-[#F2F2F4] leading-tight">
            {plan.title}
          </h2>
          <p className="text-[13px] text-[#86868F] mt-1">
            {plan.exercises.length} exercices calibrés · Prêt à démarrer ?
          </p>
        </div>

        {/* Exercises List */}
        <div className="space-y-2.5">
          {plan.exercises.map((ex, i) => {
            const isDone = checkedIndices.has(i);
            return (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                className={`p-4 rounded-[16px] border flex items-center justify-between cursor-pointer select-none transition-all ${
                  isDone
                    ? 'bg-[#16161B]/60 border-white/5 opacity-60'
                    : 'bg-[#16161B] border-white/8 hover:border-white/18'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-[#C4ED4A] border-[#C4ED4A] text-black'
                        : 'bg-[#1C1C22] border-white/15 text-transparent'
                    }`}
                  >
                    <Check size={15} />
                  </div>
                  <div>
                    <div
                      className={`font-head text-[15px] font-bold transition-all ${
                        isDone ? 'line-through text-[#86868F]' : 'text-white'
                      }`}
                    >
                      {ex.name}
                    </div>
                    <div className="font-mono text-[11px] text-[#86868F] mt-0.5">
                      {ex.detail}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[11px] font-bold text-[#55555E]">
                  0{i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom action */}
      <div className="fixed bottom-6 left-0 right-0 max-w-lg mx-auto px-5 z-20">
        <button
          type="button"
          onClick={() => onStartSession(plan)}
          className="w-full py-4 px-6 rounded-[16px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-2xl"
        >
          <Play size={18} fill="#0B0B0F" />
          <span>Démarrer la séance guidée</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { WorkoutPlan } from '../types';
import { store } from '../lib/store';
import {
  X,
  Play,
  Pause,
  Award,
  FastForward,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ActiveWorkoutScreenProps {
  plan: WorkoutPlan;
  onFinish: () => void;
  onQuit: () => void;
}

// Synthesizer beep helper using Web Audio API
function playSoundCue(freq = 660, duration = 0.1, type: OscillatorType = 'sine') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext blocked or not supported
  }
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  plan,
  onFinish,
  onQuit,
}) => {
  const [prefs, setPrefs] = useState(store.getTrainingPrefs());
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Exercise & Set state
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSetsPerExercise = 3;

  // Active set custom tracking (Reps & Weight in kg)
  const [repsDone, setRepsDone] = useState(12);
  const [weightKg, setWeightKg] = useState(0);

  // Rest timer
  const [isResting, setIsResting] = useState(false);
  const [totalRestDuration, setTotalRestDuration] = useState(prefs.defaultRestSec);
  const [restSecondsLeft, setRestSecondsLeft] = useState(prefs.defaultRestSec);
  const [completedSetsCount, setCompletedSetsCount] = useState(0);

  // Completed workout modal state
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Track last beep second to avoid duplicate audio calls
  const lastBeepSecRef = useRef<number | null>(null);

  const toggleSound = () => {
    const updated = { ...prefs, sound: !prefs.sound };
    setPrefs(updated);
    store.setTrainingPrefs(updated);
  };

  // Total session clock
  useEffect(() => {
    if (isPaused || isCompleted) return;
    const interval = setInterval(() => {
      setTotalSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isCompleted]);

  // Rest countdown & audio cues
  useEffect(() => {
    if (!isResting || isPaused || isCompleted) return;

    if (restSecondsLeft <= 0) {
      if (prefs.sound) {
        playSoundCue(920, 0.28, 'triangle');
      }
      if (prefs.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setIsResting(false);
      lastBeepSecRef.current = null;
      return;
    }

    // Audio cue on 3, 2, 1 seconds
    if (prefs.sound && restSecondsLeft <= 3 && restSecondsLeft >= 1) {
      if (lastBeepSecRef.current !== restSecondsLeft) {
        lastBeepSecRef.current = restSecondsLeft;
        playSoundCue(650, 0.08, 'sine');
      }
    }

    const timer = setInterval(() => {
      setRestSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isResting, restSecondsLeft, isPaused, isCompleted, prefs.sound, prefs.vibrate]);

  const currentExercise = plan.exercises[exerciseIndex] || plan.exercises[0];
  const nextExercise =
    currentSet < totalSetsPerExercise
      ? currentExercise
      : plan.exercises[exerciseIndex + 1];

  const handleCompleteSet = () => {
    setCompletedSetsCount((c) => c + 1);

    if (currentSet < totalSetsPerExercise) {
      // Next set of same exercise
      setCurrentSet((s) => s + 1);
      setIsResting(true);
      setTotalRestDuration(prefs.defaultRestSec);
      setRestSecondsLeft(prefs.defaultRestSec);
      lastBeepSecRef.current = null;
    } else {
      // Done with this exercise
      if (exerciseIndex < plan.exercises.length - 1) {
        setExerciseIndex((i) => i + 1);
        setCurrentSet(1);
        setIsResting(true);
        setTotalRestDuration(prefs.defaultRestSec);
        setRestSecondsLeft(prefs.defaultRestSec);
        lastBeepSecRef.current = null;
      } else {
        // All exercises completed!
        finishWorkout();
      }
    }
  };

  const finishWorkout = () => {
    setIsCompleted(true);
    store.addWorkoutHistory({
      title: plan.title,
      type: 'Séance guidée',
      durationSec: totalSeconds,
      exercisesCount: plan.exercises.length,
      setsCompleted: completedSetsCount + 1,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rest progress calculation for circular SVG ring
  const restProgress = Math.max(0, Math.min(1, restSecondsLeft / (totalRestDuration || 1)));
  const ringRadius = 88;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference * (1 - restProgress);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-6 py-12 flex flex-col items-center justify-center text-center animate-fadeIn">
        <div className="w-22 h-22 rounded-full bg-[#C4ED4A]/10 border-2 border-[#C4ED4A] flex items-center justify-center text-[#C4ED4A] mb-6 shadow-[0_0_40px_rgba(196,237,74,0.25)]">
          <Award size={44} />
        </div>

        <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/25">
          Séance validée
        </span>
        <h2 className="font-head text-[32px] font-bold text-white mb-2 leading-tight">
          Excellente séance !
        </h2>
        <p className="text-[14px] text-[#86868F] mb-8 max-w-xs">
          Ton streak quotidien progresse et tes statistiques sont synchronisées.
        </p>

        {/* Stats card */}
        <div className="w-full bg-[#16161B] border border-white/10 rounded-[22px] p-6 grid grid-cols-3 gap-3 mb-8">
          <div>
            <div className="font-mono text-[22px] font-bold text-white">
              {formatTime(totalSeconds)}
            </div>
            <div className="text-[10px] font-mono text-[#86868F] uppercase mt-1">Durée</div>
          </div>
          <div>
            <div className="font-mono text-[22px] font-bold text-[#C4ED4A]">
              {plan.exercises.length}
            </div>
            <div className="text-[10px] font-mono text-[#86868F] uppercase mt-1">Exercices</div>
          </div>
          <div>
            <div className="font-mono text-[22px] font-bold text-white">
              {completedSetsCount}
            </div>
            <div className="text-[10px] font-mono text-[#86868F] uppercase mt-1">Séries</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="w-full py-4 px-6 rounded-[16px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[16px] hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-[#C4ED4A]/15"
        >
          Retourner à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-5 flex flex-col justify-between">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/7">
        <button
          type="button"
          onClick={() => setShowQuitConfirm(true)}
          className="w-9 h-9 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#86868F] hover:text-white transition-colors"
          title="Quitter la séance"
        >
          <X size={16} />
        </button>

        {/* Live session timer */}
        <div className="text-center">
          <div className="font-mono text-[20px] font-bold text-white tracking-tight">
            {formatTime(totalSeconds)}
          </div>
          <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#86868F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4ED4A] animate-pulse" />
            <span>En direct</span>
          </div>
        </div>

        {/* Controls: Sound & Pause */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              prefs.sound
                ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]/30 text-[#C4ED4A]'
                : 'bg-[#16161B] border-white/10 text-[#55555E]'
            }`}
            title={prefs.sound ? 'Son activé (bips de repos)' : 'Son coupé'}
          >
            {prefs.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isPaused
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-[#16161B] border-white/10 text-[#86868F] hover:text-white'
            }`}
            title={isPaused ? 'Reprendre la séance' : 'Mettre en pause'}
          >
            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
          </button>
        </div>
      </div>

      {/* Main workout arena */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {isResting ? (
          /* Rest mode with circular SVG countdown */
          <div className="text-center space-y-6 animate-fadeIn">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C4ED4A] px-3 py-1 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/20">
                Temps de repos
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* Background track circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={ringRadius}
                  stroke="#1F1F26"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={ringRadius}
                  stroke="#C4ED4A"
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Centered digits */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[56px] font-bold text-white leading-none tracking-tight">
                  {restSecondsLeft}
                </span>
                <span className="font-mono text-[12px] uppercase text-[#86868F] tracking-widest mt-1">
                  secondes
                </span>
              </div>
            </div>

            {/* Next up preview */}
            <div className="p-3.5 rounded-[16px] bg-[#16161B] border border-white/7 max-w-sm mx-auto text-left flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#86868F] font-bold">
                  À suivre
                </span>
                <div className="font-head text-[14px] font-bold text-white truncate">
                  {nextExercise?.name}
                </div>
                <div className="font-mono text-[11px] text-[#C4ED4A]">
                  Série {currentSet} / {totalSetsPerExercise} · {nextExercise?.detail}
                </div>
              </div>
              <ChevronRight size={16} className="text-[#55555E] flex-shrink-0" />
            </div>

            {/* Quick Rest Adjusters */}
            <div className="flex justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRestSecondsLeft((s) => Math.max(0, s - 15));
                }}
                className="py-2.5 px-3.5 rounded-[12px] bg-[#16161B] border border-white/10 text-[12px] font-mono font-bold text-[#86868F] hover:text-white hover:border-white/20 transition-all"
              >
                -15s
              </button>

              <button
                type="button"
                onClick={() => {
                  setTotalRestDuration((t) => t + 15);
                  setRestSecondsLeft((s) => s + 15);
                }}
                className="py-2.5 px-4 rounded-[12px] bg-[#16161B] border border-white/10 text-[12px] font-mono font-bold text-white hover:border-[#C4ED4A]/40 transition-all flex items-center gap-1"
              >
                <Plus size={13} />
                <span>+15s</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResting(false)}
                className="py-2.5 px-4 rounded-[12px] bg-[#C4ED4A] text-[#0B0B0F] text-[12px] font-head font-bold hover:bg-[#b5dc3f] flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#C4ED4A]/10"
              >
                <FastForward size={14} />
                <span>Prêt maintenant</span>
              </button>
            </div>
          </div>
        ) : (
          /* In-Set Stage (Active exercise mode) */
          <div className="space-y-4 animate-fadeIn">
            {/* Telemetry bar */}
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] font-bold text-[#86868F] uppercase tracking-wider">
                Exercice {exerciseIndex + 1} sur {plan.exercises.length}
              </span>
              <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/25">
                Série {currentSet} / {totalSetsPerExercise}
              </span>
            </div>

            {/* In-Set Primary Stage Card */}
            <div className="bg-[#16161B] border border-white/10 rounded-[24px] p-6 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4ED4A]/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="font-head text-[28px] sm:text-[32px] font-bold text-white mb-2 leading-tight">
                {currentExercise.name}
              </h3>

              {/* Target Reps/Duration Pill */}
              <div className="inline-flex items-center gap-2 font-mono text-[15px] font-bold text-[#C4ED4A] px-4 py-1.5 rounded-full bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 mb-4 shadow-[0_0_20px_rgba(196,237,74,0.12)]">
                <Dumbbell size={15} />
                <span>{currentExercise.detail}</span>
              </div>

              {/* Tactical cue */}
              <div className="flex items-center justify-center gap-2 text-[12.5px] text-[#9A9AA4] max-w-xs mx-auto">
                <Sparkles size={14} className="text-[#C4ED4A] flex-shrink-0" />
                <span>Contrôle la phase excentrique et expire à la poussée.</span>
              </div>

              {/* Sets dots indicator */}
              <div className="flex justify-center items-center gap-2.5 mt-5 pt-4 border-t border-white/6">
                {Array.from({ length: totalSetsPerExercise }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i + 1 < currentSet
                        ? 'w-7 bg-[#C4ED4A]'
                        : i + 1 === currentSet
                        ? 'w-9 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] ring-2 ring-white/20'
                        : 'w-2.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Performance logger: Quick Adjust for Reps & Weight */}
            <div className="bg-[#16161B]/80 border border-white/7 rounded-[18px] p-3.5 grid grid-cols-2 gap-3">
              {/* Reps selector */}
              <div className="p-2 rounded-[14px] bg-[#1C1C22] border border-white/6 text-center">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#86868F] block mb-1 font-bold">
                  Répétitions
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setRepsDone((r) => Math.max(1, r - 1))}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-[17px] font-bold text-white">
                    {repsDone}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRepsDone((r) => r + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Weight selector */}
              <div className="p-2 rounded-[14px] bg-[#1C1C22] border border-white/6 text-center">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#86868F] block mb-1 font-bold">
                  Charge (kg)
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => Math.max(0, w - 2.5))}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-[17px] font-bold text-white">
                    {weightKg > 0 ? `${weightKg}` : 'Poids de corps'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => w + 2.5)}
                    className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Next up subtle preview footer */}
            {exerciseIndex < plan.exercises.length - 1 && currentSet === totalSetsPerExercise && (
              <div className="text-center font-mono text-[11px] text-[#86868F]">
                Prochain exercice :{' '}
                <span className="text-white font-bold">
                  {plan.exercises[exerciseIndex + 1]?.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="space-y-2 pt-2">
        {!isResting && (
          <button
            type="button"
            onClick={handleCompleteSet}
            className="w-full py-4 px-6 rounded-[18px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-xl shadow-[#C4ED4A]/15"
          >
            <CheckCircle2 size={20} />
            <span>Valider la série {currentSet}</span>
          </button>
        )}

        <button
          type="button"
          onClick={finishWorkout}
          className="w-full py-2.5 text-center text-[12px] font-mono text-[#666672] hover:text-[#A0A0AA] transition-colors"
        >
          Terminer la séance prématurément
        </button>
      </div>

      {/* Quit confirmation modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-[#16161B] border border-white/12 rounded-[22px] p-6 text-center shadow-2xl">
            <h4 className="font-head text-[18px] font-bold text-white mb-2">
              Quitter la séance ?
            </h4>
            <p className="text-[13px] text-[#86868F] mb-6">
              La progression de cette séance en cours ne sera pas enregistrée dans ton historique.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 rounded-[14px] bg-white/5 border border-white/10 text-[13px] font-head font-bold text-white hover:bg-white/10"
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={onQuit}
                className="flex-1 py-3 rounded-[14px] bg-rose-500/15 border border-rose-500/30 text-[13px] font-head font-bold text-rose-400 hover:bg-rose-500/25"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


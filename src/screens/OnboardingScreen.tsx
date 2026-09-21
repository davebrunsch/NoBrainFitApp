import React, { useState } from 'react';
import {
  UserProfile,
  Sex,
  FitnessLevel,
  Lifestyle,
  Goal,
  Equipment,
} from '../types';
import {
  FITNESS_LEVELS,
  LIFESTYLES,
  GOALS,
  EQUIPMENTS,
} from '../lib/brand';
import {
  store,
  calculateBmi,
  calculateBmr,
  calculateTdee,
  calculateDailyCalorieTarget,
} from '../lib/store';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Activity,
  Zap,
  Award,
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onCancel,
}) => {
  const current = store.getUserProfile();
  const [draft, setDraft] = useState<UserProfile>(
    current.completed ? current : { ...current }
  );
  const [step, setStep] = useState(0);

  const totalSteps = 12; // 0..10 questions, 11 recap

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Complete profile
      store.setUserProfile({
        ...draft,
        completed: true,
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  // Calculations for step 11
  const bmi = calculateBmi(draft.heightCm, draft.weightKg);
  const bmr = calculateBmr(draft);
  const tdee = calculateTdee(draft);
  const dailyTarget = calculateDailyCalorieTarget(draft);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col justify-between max-w-lg mx-auto px-5 py-6 sm:py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <span className="font-mono text-[11px] font-bold text-[#C4ED4A] tracking-wider uppercase">
            Étape {step + 1} / {totalSteps}
          </span>
          <div className="w-36 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden mx-auto">
            <div
              className="h-full bg-[#C4ED4A] transition-all duration-300 rounded-full"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-10" />
      </div>

      {/* Question Content */}
      <div className="flex-1 flex flex-col justify-center py-6">
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Tu es…
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Pour calibrer ton métabolisme et tes séances.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft({ ...draft, sex: s })}
                  className={`p-6 rounded-[18px] border text-center transition-all ${
                    draft.sex === s
                      ? 'bg-[#C4ED4A]/10 border-[#C4ED4A] text-[#C4ED4A]'
                      : 'bg-[#16161B] border-white/8 text-[#F2F2F4] hover:border-white/20'
                  }`}
                >
                  <div className="font-head text-[20px] font-bold mb-1">
                    {s === 'male' ? 'Homme' : 'Femme'}
                  </div>
                  <span className="text-[12px] text-[#86868F]">Biologique</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Quel âge as-tu ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                On adapte l'intensité et la récupération.
              </p>
            </div>
            <div className="py-6">
              <div className="font-mono text-[48px] font-bold text-[#C4ED4A]">
                {draft.age} <span className="text-[20px] text-[#86868F]">ans</span>
              </div>
              <input
                type="range"
                min="14"
                max="85"
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
                className="w-full accent-[#C4ED4A] mt-6 cursor-pointer"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Ta taille ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Utilisée pour ton IMC et tes besoins caloriques.
              </p>
            </div>
            <div className="py-6">
              <div className="font-mono text-[48px] font-bold text-[#C4ED4A]">
                {draft.heightCm} <span className="text-[20px] text-[#86868F]">cm</span>
              </div>
              <input
                type="range"
                min="130"
                max="220"
                value={draft.heightCm}
                onChange={(e) =>
                  setDraft({ ...draft, heightCm: Number(e.target.value) })
                }
                className="w-full accent-[#C4ED4A] mt-6 cursor-pointer"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Ton poids actuel ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Tu pourras le mettre à jour à tout moment.
              </p>
            </div>
            <div className="py-6">
              <div className="font-mono text-[48px] font-bold text-[#C4ED4A]">
                {draft.weightKg} <span className="text-[20px] text-[#86868F]">kg</span>
              </div>
              <input
                type="range"
                min="35"
                max="180"
                step="0.5"
                value={draft.weightKg}
                onChange={(e) =>
                  setDraft({ ...draft, weightKg: Number(e.target.value) })
                }
                className="w-full accent-[#C4ED4A] mt-6 cursor-pointer"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Poids cible souhaité ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Optionnel · laisse à 0 si tu vises le maintien ou la performance.
              </p>
            </div>
            <div className="py-6">
              <div className="font-mono text-[48px] font-bold text-[#C4ED4A]">
                {draft.targetWeightKg > 0 ? `${draft.targetWeightKg} kg` : 'Pas fixé'}
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="1"
                value={draft.targetWeightKg}
                onChange={(e) =>
                  setDraft({ ...draft, targetWeightKg: Number(e.target.value) })
                }
                className="w-full accent-[#C4ED4A] mt-6 cursor-pointer"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Ton niveau d'entraînement ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Pour choisir les exercices adaptés.
              </p>
            </div>
            {FITNESS_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setDraft({ ...draft, level: lvl.id as FitnessLevel })}
                className={`w-full p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                  draft.level === lvl.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`font-head text-[16px] font-bold ${draft.level === lvl.id ? 'text-[#C4ED4A]' : 'text-white'}`}>
                    {lvl.label}
                  </div>
                  <div className="text-[12px] text-[#86868F] mt-0.5">
                    {lvl.sub}
                  </div>
                </div>
                {draft.level === lvl.id && (
                  <Check size={18} className="text-[#C4ED4A]" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Ton rythme au quotidien ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Calcule ton multiplicateur d'activité journalière.
              </p>
            </div>
            {LIFESTYLES.map((ls) => (
              <button
                key={ls.id}
                type="button"
                onClick={() => setDraft({ ...draft, lifestyle: ls.id as Lifestyle })}
                className={`w-full p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                  draft.lifestyle === ls.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`font-head text-[16px] font-bold ${draft.lifestyle === ls.id ? 'text-[#C4ED4A]' : 'text-white'}`}>
                    {ls.label}
                  </div>
                  <div className="text-[12px] text-[#86868F] mt-0.5">
                    {ls.sub}
                  </div>
                </div>
                {draft.lifestyle === ls.id && (
                  <Check size={18} className="text-[#C4ED4A]" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Ton objectif principal ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Ajuste le delta calorique (+/- kcal).
              </p>
            </div>
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setDraft({ ...draft, goal: g.id as Goal })}
                className={`w-full p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                  draft.goal === g.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`font-head text-[16px] font-bold ${draft.goal === g.id ? 'text-[#C4ED4A]' : 'text-white'}`}>
                    {g.label}
                  </div>
                  <div className="text-[12px] text-[#86868F] mt-0.5">
                    {g.sub}
                  </div>
                </div>
                {draft.goal === g.id && (
                  <Check size={18} className="text-[#C4ED4A]" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Séances par semaine ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Combien de fois prévois-tu de t'entraîner ?
              </p>
            </div>
            <div className="py-6">
              <div className="font-mono text-[48px] font-bold text-[#C4ED4A]">
                {draft.daysPerWeek}{' '}
                <span className="text-[20px] text-[#86868F]">
                  {draft.daysPerWeek > 1 ? 'jours / sem' : 'jour / sem'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={draft.daysPerWeek}
                onChange={(e) =>
                  setDraft({ ...draft, daysPerWeek: Number(e.target.value) })
                }
                className="w-full accent-[#C4ED4A] mt-6 cursor-pointer"
              />
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Matériel disponible ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Pour adapter la génération de tes entraînements.
              </p>
            </div>
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => setDraft({ ...draft, equipment: eq.id as Equipment })}
                className={`w-full p-4 rounded-[16px] border text-left flex items-center justify-between transition-all ${
                  draft.equipment === eq.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`font-head text-[16px] font-bold ${draft.equipment === eq.id ? 'text-[#C4ED4A]' : 'text-white'}`}>
                    {eq.label}
                  </div>
                  <div className="text-[12px] text-[#86868F] mt-0.5">
                    {eq.sub}
                  </div>
                </div>
                {draft.equipment === eq.id && (
                  <Check size={18} className="text-[#C4ED4A]" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 10 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Inscrit en salle de sport ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Pour te proposer des séances en salle quand tu es motivé.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, gymMember: true })}
                className={`p-6 rounded-[18px] border text-center transition-all ${
                  draft.gymMember
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A] text-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 text-[#F2F2F4] hover:border-white/20'
                }`}
              >
                <div className="font-head text-[20px] font-bold mb-1">Oui</div>
                <span className="text-[12px] text-[#86868F]">Abonné</span>
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, gymMember: false })}
                className={`p-6 rounded-[18px] border text-center transition-all ${
                  !draft.gymMember
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A] text-[#C4ED4A]'
                    : 'bg-[#16161B] border-white/8 text-[#F2F2F4] hover:border-white/20'
                }`}
              >
                <div className="font-head text-[20px] font-bold mb-1">Non</div>
                <span className="text-[12px] text-[#86868F]">À la maison</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 11: Recap / Bilan métabolique */}
        {step === 11 && (
          <div className="space-y-5">
            <div className="text-center">
              <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
                Bilan calibré
              </span>
              <h2 className="font-head text-[24px] font-bold text-[#F2F2F4] mt-0.5">
                Ton profil métabolique
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Voici tes chiffres personnalisés selon Mifflin-St Jeor.
              </p>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-4 rounded-[16px] bg-[#16161B] border border-white/8">
                <div className="flex items-center gap-2 text-[#86868F] mb-1">
                  <Activity size={15} />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    IMC
                  </span>
                </div>
                <div className="font-mono text-[22px] font-bold text-[#F2F2F4]">
                  {bmi}
                </div>
                <span className="text-[11px] text-[#86868F]">
                  {bmi < 18.5 ? 'Mince' : bmi < 25 ? 'Normal' : 'Surpoids léger'}
                </span>
              </div>

              <div className="p-4 rounded-[16px] bg-[#16161B] border border-white/8">
                <div className="flex items-center gap-2 text-[#86868F] mb-1">
                  <Flame size={15} className="text-orange-400" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    BMR (Repos)
                  </span>
                </div>
                <div className="font-mono text-[22px] font-bold text-[#F2F2F4]">
                  {bmr}
                </div>
                <span className="text-[11px] text-[#86868F]">kcal / jour</span>
              </div>

              <div className="p-4 rounded-[16px] bg-[#16161B] border border-white/8">
                <div className="flex items-center gap-2 text-[#86868F] mb-1">
                  <Zap size={15} className="text-yellow-400" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    TDEE (Maintien)
                  </span>
                </div>
                <div className="font-mono text-[22px] font-bold text-[#F2F2F4]">
                  {tdee}
                </div>
                <span className="text-[11px] text-[#86868F]">kcal / jour</span>
              </div>

              <div className="p-4 rounded-[16px] bg-[#C4ED4A]/10 border border-[#C4ED4A]/30">
                <div className="flex items-center gap-2 text-[#C4ED4A] mb-1">
                  <Award size={15} />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                    Cible Jour
                  </span>
                </div>
                <div className="font-mono text-[22px] font-bold text-[#C4ED4A]">
                  {dailyTarget}
                </div>
                <span className="text-[11px] text-[#C4ED4A]/80">kcal recommandés</span>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-[#16161B] border border-white/8 text-[13px] text-[#9A9AA4] space-y-1.5 leading-relaxed">
              <div className="flex justify-between">
                <span>Objectif :</span>
                <span className="text-white font-semibold">
                  {GOALS.find((g) => g.id === draft.goal)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rythme prévu :</span>
                <span className="text-white font-semibold">
                  {draft.daysPerWeek} séances / semaine
                </span>
              </div>
              <div className="flex justify-between">
                <span>Équipement :</span>
                <span className="text-white font-semibold">
                  {EQUIPMENTS.find((e) => e.id === draft.equipment)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-4 px-6 rounded-[14px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
        >
          <span>
            {step === totalSteps - 1
              ? 'Valider mon profil et commencer'
              : 'Continuer'}
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

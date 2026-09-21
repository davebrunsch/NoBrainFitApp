import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Target, Clock, Dumbbell } from 'lucide-react';
import { aiService } from '../services/aiService';
import { WorkoutPlan } from '../types';

interface RagTrainFlowScreenProps {
  onBack: () => void;
  onWorkoutGenerated: (plan: WorkoutPlan, duration: string, location: string) => void;
}

const GOAL_OPTIONS = [
  { id: 'Hypertrophie', label: 'Prise de muscle', sub: 'Volume musculaire & charges modérées' },
  { id: 'Force', label: 'Force pure', sub: 'Charges lourdes & longs repos' },
  { id: 'Perte de gras', label: 'Brûler des calories', sub: 'Densité élevée & circuits rythmés' },
  { id: 'Conditioning', label: 'Remise en forme', sub: 'Endurance, gainage & équilibre' },
];

const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '60 min'];

const EQUIPMENT_OPTIONS = [
  { id: 'Poids de corps', label: 'Poids de corps', sub: 'Sans matériel, calisthénie' },
  { id: 'Haltères', label: 'Haltères', sub: 'Haltères modulables à la maison' },
  { id: 'Machines', label: 'Machines guidées', sub: 'Salle ou parc d\'équipements' },
  { id: 'Salle complète', label: 'Salle complète', sub: 'Barres, racks, poulies et bancs' },
];

export const RagTrainFlowScreen: React.FC<RagTrainFlowScreenProps> = ({
  onBack,
  onWorkoutGenerated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('Hypertrophie');
  const [selectedDuration, setSelectedDuration] = useState<string>('30 min');
  const [loading, setLoading] = useState(false);

  const handleGoal = (goal: string) => {
    setSelectedGoal(goal);
    setStep(2);
  };

  const handleDuration = (dur: string) => {
    setSelectedDuration(dur);
    setStep(3);
  };

  const handleEquipment = async (eq: string) => {
    setLoading(true);
    try {
      const plan = await aiService.generateRagWorkout(selectedGoal, selectedDuration, eq);
      onWorkoutGenerated(plan, selectedDuration, eq);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#C4ED4A]" />
            <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
              Programme IA · Étape {step} / 3
            </span>
          </div>
          <div className="w-10" />
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <Target size={14} />
                <span>Objectif de la séance</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Que vises-tu aujourd'hui ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                L'algorithme calibrera le tempo et le nombre de répétitions.
              </p>
            </div>

            <div className="space-y-2.5">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGoal(g.label)}
                  className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div>
                    <div className="font-head text-[17px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                      {g.label}
                    </div>
                    <div className="text-[12px] text-[#86868F] mt-0.5">
                      {g.sub}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-[#55555E] group-hover:text-[#C4ED4A]">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Duration */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <Clock size={14} />
                <span>Format de temps</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Combien de minutes ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Objectif : <strong className="text-[#C4ED4A]">{selectedGoal}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDuration(dur)}
                  className="p-6 rounded-[18px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 text-center transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="font-mono text-[24px] font-bold text-white group-hover:text-[#C4ED4A]">
                    {dur}
                  </div>
                  <div className="text-[11px] text-[#86868F] mt-1">Chrono guidé</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Equipment */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <Dumbbell size={14} />
                <span>Matériel sous la main</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Quel équipement as-tu ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Génération finale du plan d'entraînement.
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 border-3 border-[#C4ED4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="font-head text-[17px] font-bold text-white">
                  Génération IA du programme…
                </div>
                <p className="text-[12px] text-[#86868F] mt-1">
                  Extraction des exercices et calcul des temps de repos
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => handleEquipment(eq.label)}
                    className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <div>
                      <div className="font-head text-[17px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                        {eq.label}
                      </div>
                      <div className="text-[12px] text-[#86868F] mt-0.5">
                        {eq.sub}
                      </div>
                    </div>
                    <Sparkles size={18} className="text-[#55555E] group-hover:text-[#C4ED4A]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 text-center">
        <p className="font-mono text-[11px] text-[#55555E]">
          Moteur RAG calibré selon la science du sport
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Sparkles, Dumbbell } from 'lucide-react';
import { aiService } from '../services/aiService';
import { WorkoutPlan } from '../types';

interface TrainFlowScreenProps {
  onBack: () => void;
  onWorkoutGenerated: (plan: WorkoutPlan, duration: string, location: string) => void;
  onOpenCustomGym?: () => void;
}

const DURATIONS = [
  { label: '15 min', sub: 'Express · Rapide & intense' },
  { label: '30 min', sub: 'Standard · Équilibré & efficace' },
  { label: '45 min', sub: 'Complet · Idéal pour progresser' },
  { label: '1h+', sub: 'Intense · Séance poussée' },
];

const LOCATIONS = [
  { label: 'Maison', sub: 'Sans matériel ou poids du corps' },
  { label: 'Salle', sub: 'Avec bancs, barres et machines' },
  { label: 'Dehors', sub: 'Parc, calisthénie ou rue' },
  { label: 'Cardio', sub: 'HIIT & fréquence cardiaque' },
];

export const TrainFlowScreen: React.FC<TrainFlowScreenProps> = ({
  onBack,
  onWorkoutGenerated,
  onOpenCustomGym,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDuration, setSelectedDuration] = useState<string>('30 min');
  const [loading, setLoading] = useState(false);

  const handleSelectDuration = (duration: string) => {
    setSelectedDuration(duration);
    setStep(2);
  };

  const handleSelectLocation = async (location: string) => {
    setLoading(true);
    try {
      const plan = await aiService.generateWorkout(selectedDuration, location);
      onWorkoutGenerated(plan, selectedDuration, location);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] max-w-lg mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="w-10 h-10 rounded-full bg-[#16161B] border border-white/10 flex items-center justify-center text-[#9A9AA4] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-mono text-[11px] font-bold text-[#C4ED4A] uppercase tracking-wider">
            Étape {step} / 2
          </span>
          <div className="w-10" />
        </div>

        {/* Step 1: Duration */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <Clock size={14} />
                <span>Temps disponible</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Combien de temps as-tu ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Choisis ta durée pour générer la séance sur-mesure.
              </p>
            </div>

            <div className="space-y-2.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => handleSelectDuration(d.label)}
                  className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div>
                    <div className="font-mono text-[18px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                      {d.label}
                    </div>
                    <div className="text-[12px] text-[#86868F] mt-0.5">
                      {d.sub}
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

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#86868F] font-mono text-[11px] uppercase tracking-wider font-bold mb-1">
                <MapPin size={14} />
                <span>Lieu d'entraînement</span>
              </div>
              <h2 className="font-head text-[26px] font-bold text-[#F2F2F4]">
                Où t'entraînes-tu ?
              </h2>
              <p className="text-[13px] text-[#86868F] mt-1">
                Durée sélectionnée : <strong className="text-[#C4ED4A]">{selectedDuration}</strong>
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 border-3 border-[#C4ED4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="font-head text-[17px] font-bold text-white">
                  Génération du programme IA…
                </div>
                <p className="text-[12px] text-[#86868F] mt-1">
                  Calibrage des exercices et des temps de repos
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => handleSelectLocation(loc.label)}
                    className="w-full p-4 rounded-[16px] bg-[#16161B] border border-white/8 hover:border-[#C4ED4A]/40 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <div>
                      <div className="font-head text-[17px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors">
                        {loc.label}
                      </div>
                      <div className="text-[12px] text-[#86868F] mt-0.5">
                        {loc.sub}
                      </div>
                    </div>
                    <Sparkles size={18} className="text-[#55555E] group-hover:text-[#C4ED4A]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dedicated custom gym training builder banner */}
        {onOpenCustomGym && !loading && (
          <div className="mt-6 pt-5 border-t border-white/6">
            <button
              type="button"
              onClick={onOpenCustomGym}
              className="w-full p-4 rounded-[16px] bg-[#16161B] border border-[#C4ED4A]/30 hover:border-[#C4ED4A]/60 hover:bg-[#C4ED4A]/5 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#C4ED4A]/10 border border-[#C4ED4A]/30 flex items-center justify-center text-[#C4ED4A]">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <div className="font-head text-[15px] font-bold text-white group-hover:text-[#C4ED4A] transition-colors flex items-center gap-1.5">
                    <span>Créer une séance salle sur-mesure</span>
                  </div>
                  <div className="text-[12px] text-[#86868F] mt-0.5">
                    Choisis tes machines, exercices, séries & repos
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#C4ED4A]">
                Atelier →
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="pt-6 text-center">
        <p className="font-mono text-[11px] text-[#55555E]">
          Séance générée sans blabla · direct et efficace
        </p>
      </div>
    </div>
  );
};

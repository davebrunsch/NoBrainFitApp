import React, { useState } from 'react';
import { NutritionProfile, NutritionGoal } from '../types';
import { store, calculateNutritionTargets } from '../lib/store';
import { X, Check } from 'lucide-react';

interface NutritionGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NutritionGoalModal: React.FC<NutritionGoalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const current = store.getNutritionProfile();
  const [goal, setGoal] = useState<NutritionGoal>(current.goal);
  const [weightKg, setWeightKg] = useState<number>(current.weightKg || 75);

  if (!isOpen) return null;

  const tempProfile: NutritionProfile = {
    goal,
    weightKg,
    isSet: true,
  };
  const targets = calculateNutritionTargets(tempProfile);

  const handleSave = () => {
    store.setNutritionProfile(tempProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#16161B] border border-white/12 rounded-[22px] p-6 shadow-2xl relative animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C4ED4A]">
              Configuration
            </span>
            <h3 className="font-head text-[20px] font-bold text-[#F2F2F4]">
              Objectif Nutrition
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#86868F] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Goal selector */}
        <div className="space-y-2 mb-5">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#86868F] font-bold">
            Objectif principal
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'lose', label: 'Perte', sub: '28 kcal/kg' },
              { id: 'maintain', label: 'Maintien', sub: '33 kcal/kg' },
              { id: 'gain', label: 'Prise', sub: '38 kcal/kg' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id as NutritionGoal)}
                className={`p-3 rounded-[12px] border text-center transition-all ${
                  goal === g.id
                    ? 'bg-[#C4ED4A]/10 border-[#C4ED4A] text-[#C4ED4A]'
                    : 'bg-[#1C1C22] border-white/8 text-[#F2F2F4] hover:border-white/20'
                }`}
              >
                <div className="font-head text-[14px] font-bold">{g.label}</div>
                <div className="text-[10px] text-[#86868F] mt-0.5">{g.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weight input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-mono text-[11px] uppercase tracking-wider text-[#86868F] font-bold">
              Poids de référence
            </label>
            <span className="font-mono text-[14px] font-bold text-[#C4ED4A]">
              {weightKg} kg
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="160"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full accent-[#C4ED4A] cursor-pointer"
          />
        </div>

        {/* Live Targets preview */}
        <div className="p-4 rounded-[14px] bg-[#1C1C22] border border-white/8 mb-6">
          <div className="text-[12px] text-[#86868F] font-mono uppercase font-bold tracking-wider mb-2">
            Cibles journalières calculées
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-mono text-[16px] font-bold text-[#C4ED4A]">
                {targets.kcal}
              </div>
              <div className="text-[10px] text-[#86868F] uppercase">kcal</div>
            </div>
            <div>
              <div className="font-mono text-[16px] font-bold text-white">
                {targets.proteinG}g
              </div>
              <div className="text-[10px] text-[#86868F] uppercase">Prot</div>
            </div>
            <div>
              <div className="font-mono text-[16px] font-bold text-white">
                {targets.carbsG}g
              </div>
              <div className="text-[10px] text-[#86868F] uppercase">Gluc</div>
            </div>
            <div>
              <div className="font-mono text-[16px] font-bold text-white">
                {targets.fatG}g
              </div>
              <div className="text-[10px] text-[#86868F] uppercase">Lip</div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-[14px] bg-[#C4ED4A] text-[#0B0B0F] font-head font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#b5dc3f] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Check size={18} />
          <span>Enregistrer les cibles</span>
        </button>
      </div>
    </div>
  );
};

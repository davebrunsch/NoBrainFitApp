import React, { useState } from 'react';
import { store } from '../lib/store';
import { aiService } from '../services/aiService';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (kcal: number, mealType: string) => void;
}

const MEAL_TYPES = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];

const PRESETS = [
  { name: 'Shaker de Whey (30g)', kcal: 120, protG: 24, carbsG: 2, fatG: 1 },
  { name: 'Omelette 3 œufs & pain', kcal: 420, protG: 26, carbsG: 28, fatG: 19 },
  { name: 'Poulet 150g + Riz 100g', kcal: 510, protG: 45, carbsG: 58, fatG: 7 },
  { name: 'Bowl Thon & Avocat', kcal: 460, protG: 38, carbsG: 22, fatG: 20 },
];

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const [mealType, setMealType] = useState('Déjeuner');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState<number | ''>('');
  const [proteinG, setProteinG] = useState<number | ''>('');
  const [carbsG, setCarbsG] = useState<number | ''>('');
  const [fatG, setFatG] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEstimate = async () => {
    if (!aiPrompt.trim()) return;
    setIsEstimating(true);
    setError(null);
    try {
      const result = await aiService.estimateFood(aiPrompt);
      setName(result.name);
      setKcal(result.kcal);
      setProteinG(result.proteinG);
      setCarbsG(result.carbsG);
      setFatG(result.fatG);
    } catch {
      setError('Erreur lors de l\'estimation.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setName(p.name);
    setKcal(p.kcal);
    setProteinG(p.protG);
    setCarbsG(p.carbsG);
    setFatG(p.fatG);
  };

  const handleSave = () => {
    if (!name.trim() || kcal === '') {
      setError('Précise au moins un nom et le total de calories.');
      return;
    }

    const savedKcal = Number(kcal) || 0;
    store.addFoodEntry({
      name: name.trim(),
      mealType,
      kcal: savedKcal,
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
    });

    if (onAdded) {
      onAdded(savedKcal, mealType);
    }

    // Reset and close
    setName('');
    setKcal('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setAiPrompt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-[#16161B] border border-white/12 rounded-[24px] p-6 shadow-2xl relative my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#C4ED4A]">
              Log en 2 clics
            </span>
            <h3 className="font-head text-[20px] font-bold text-[#F2F2F4]">
              Ajouter un repas
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

        {/* Meal Type Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(type)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                mealType === type
                  ? 'bg-[#C4ED4A] text-[#0B0B0F]'
                  : 'bg-[#1C1C22] text-[#86868F] border border-white/8 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* AI Estimation Box */}
        <div className="p-3.5 rounded-[16px] bg-[#1C1C22] border border-[#C4ED4A]/25 mb-4">
          <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C4ED4A] font-bold mb-2">
            <Sparkles size={13} />
            <span>Estimation IA instantanée</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEstimate()}
              placeholder="Ex : 200g poulet, 100g riz, 1 avocat…"
              className="flex-1 px-3 py-2 rounded-[10px] bg-[#16161B] border border-white/10 text-white placeholder-white/25 text-[13px] focus:border-[#C4ED4A] focus:outline-none"
            />
            <button
              type="button"
              disabled={isEstimating || !aiPrompt.trim()}
              onClick={handleEstimate}
              className="px-3 py-2 rounded-[10px] bg-[#C4ED4A] text-[#0B0B0F] font-bold text-[12px] hover:bg-[#b5dc3f] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
            >
              {isEstimating ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Estimer'
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <div className="text-[11px] text-[#86868F] font-mono uppercase font-bold tracking-wider mb-2">
            Rapide :
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-[8px] bg-white/5 border border-white/8 text-[11px] text-[#D8D8DE] hover:border-[#C4ED4A]/40 hover:text-[#C4ED4A] transition-all"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3 text-[12px] text-amber-400 bg-amber-500/10 p-2.5 rounded-[8px] border border-amber-500/20">
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold mb-1">
              Nom de l'aliment / plat
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Poulet grillé et riz basmati"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#1C1C22] border border-white/10 text-white placeholder-white/20 text-[14px] focus:border-[#C4ED4A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#C4ED4A] font-bold mb-1">
                Kcal
              </label>
              <input
                type="number"
                value={kcal}
                onChange={(e) => setKcal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-2.5 py-2 rounded-[10px] bg-[#1C1C22] border border-white/10 font-mono text-center text-white text-[14px] focus:border-[#C4ED4A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold mb-1">
                Prot (g)
              </label>
              <input
                type="number"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-2.5 py-2 rounded-[10px] bg-[#1C1C22] border border-white/10 font-mono text-center text-white text-[14px] focus:border-[#C4ED4A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold mb-1">
                Gluc (g)
              </label>
              <input
                type="number"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-2.5 py-2 rounded-[10px] bg-[#1C1C22] border border-white/10 font-mono text-center text-white text-[14px] focus:border-[#C4ED4A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#86868F] font-bold mb-1">
                Lip (g)
              </label>
              <input
                type="number"
                value={fatG}
                onChange={(e) => setFatG(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-2.5 py-2 rounded-[10px] bg-[#1C1C22] border border-white/10 font-mono text-center text-white text-[14px] focus:border-[#C4ED4A] focus:outline-none"
              />
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
          <span>Enregistrer dans mon journal</span>
        </button>
      </div>
    </div>
  );
};
